// Proves requests come from a genuine copy of PureScan on a real device
// (docs/label-api.md, "Device attestation"). Handlers depend only on the
// DeviceAttestor interface so they can be tested with a fake.
import { createHash } from "node:crypto";
import { decodeStrictBase64 } from "../base64.ts";
import type { AttestedKeyStore } from "./attested-key-store.ts";
import type { AttestChallengeStore } from "./challenge-store.ts";
import { CHALLENGE_TTL_SECONDS } from "./config.ts";
import type { AppAttestVerifier } from "./app-attest-verifier.ts";

/** A key id is base64 of a SHA-256 hash: 43 characters and one "=". */
export const KEY_ID_PATTERN = /^[A-Za-z0-9+/]{43}=$/;

export interface IssuedChallenge {
  challenge: string;
  expiresInSeconds: number;
}

export interface DeviceRegistration {
  keyId: string;
  challenge: string;
  /** Base64 attestation object. */
  attestation: string;
}

export interface SignedRequest {
  keyId: string | null;
  /** Base64 assertion. */
  assertion: string | null;
  /** The raw request body the assertion signs. */
  payload: Uint8Array;
}

/** deviceId is an opaque, stable identifier for the attested key (SHA-256 of its id). */
export type AssertionOutcome = { isValid: true; deviceId: string } | { isValid: false };

export interface DeviceAttestor {
  issueChallenge(): Promise<IssuedChallenge>;
  /** Consumes the challenge and stores the attested key. False for any invalid registration. */
  register(registration: DeviceRegistration): Promise<boolean>;
  verifyRequest(request: SignedRequest): Promise<AssertionOutcome>;
}

export interface AppAttestDeviceAttestorOptions {
  challenges: AttestChallengeStore;
  keys: AttestedKeyStore;
  verifier: AppAttestVerifier;
}

const INVALID: AssertionOutcome = { isValid: false };

export function keyIdHash(keyId: string): string {
  return createHash("sha256").update(keyId, "utf8").digest("hex");
}

/**
 * Store failures are not caught here: they propagate so the caller answers
 * 503 rather than wrongly telling the app its key is invalid.
 */
export class AppAttestDeviceAttestor implements DeviceAttestor {
  private readonly challenges: AttestChallengeStore;
  private readonly keys: AttestedKeyStore;
  private readonly verifier: AppAttestVerifier;

  constructor(options: AppAttestDeviceAttestorOptions) {
    this.challenges = options.challenges;
    this.keys = options.keys;
    this.verifier = options.verifier;
  }

  async issueChallenge(): Promise<IssuedChallenge> {
    return { challenge: await this.challenges.issue(), expiresInSeconds: CHALLENGE_TTL_SECONDS };
  }

  async register({ keyId, challenge, attestation }: DeviceRegistration): Promise<boolean> {
    const attestationBytes = decodeStrictBase64(attestation);
    if (!KEY_ID_PATTERN.test(keyId) || attestationBytes === null) return false;
    // Consumed before verifying, so a challenge is single-use whatever the outcome.
    if (!(await this.challenges.consume(challenge))) return false;

    let publicKeyPem: string;
    try {
      ({ publicKeyPem } = this.verifier.verifyAttestation({ keyId, challenge, attestation: attestationBytes }));
    } catch {
      return false;
    }
    await this.keys.saveIfAbsent(keyIdHash(keyId), publicKeyPem);
    return true;
  }

  async verifyRequest({ keyId, assertion, payload }: SignedRequest): Promise<AssertionOutcome> {
    if (keyId === null || assertion === null || !KEY_ID_PATTERN.test(keyId)) return INVALID;
    const assertionBytes = decodeStrictBase64(assertion);
    if (assertionBytes === null) return INVALID;

    const deviceId = keyIdHash(keyId);
    const storedKey = await this.keys.find(deviceId);
    if (!storedKey) return INVALID;

    let signCount: number;
    try {
      ({ signCount } = this.verifier.verifyAssertion({
        assertion: assertionBytes,
        payload,
        publicKeyPem: storedKey.publicKeyPem,
        previousSignCount: storedKey.signCount,
      }));
    } catch {
      return INVALID;
    }
    // The verifier already required a higher count; this makes the check atomic with the update.
    if (!(await this.keys.advanceSignCount(deviceId, signCount))) return INVALID;
    return { isValid: true, deviceId };
  }
}
