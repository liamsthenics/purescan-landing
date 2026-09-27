// Apple App Attest cryptography, via node-app-attest: the attestation's
// certificate chain up to Apple's App Attest root, the challenge nonce, the
// App ID (rpId) hash and key id; and each assertion's signature, App ID and counter.
import { verifyAssertion, verifyAttestation } from "node-app-attest";
import { APP_BUNDLE_ID, APPLE_TEAM_ID } from "./config.ts";

export interface AttestationEvidence {
  /** Base64 key id from DCAppAttestService.generateKey. */
  keyId: string;
  /** The challenge string; the app hashed its UTF-8 bytes as clientDataHash. */
  challenge: string;
  attestation: Buffer;
}

export interface AssertionEvidence {
  assertion: Buffer;
  /** The exact bytes the app signed (the raw request body). */
  payload: Uint8Array;
  publicKeyPem: string;
  previousSignCount: number;
}

/** Each method throws when Apple's evidence doesn't check out. */
export interface AppAttestVerifier {
  verifyAttestation(evidence: AttestationEvidence): { publicKeyPem: string };
  verifyAssertion(evidence: AssertionEvidence): { signCount: number };
}

export interface AppAttestVerifierOptions {
  /** Accept attestations from development builds (APP_ATTEST_ALLOW_DEVELOPMENT). */
  allowDevelopmentEnvironment: boolean;
}

export class InvalidAttestationError extends Error {
  name = "InvalidAttestationError";
}

export function createAppAttestVerifier({ allowDevelopmentEnvironment }: AppAttestVerifierOptions): AppAttestVerifier {
  const appIdentity = { bundleIdentifier: APP_BUNDLE_ID, teamIdentifier: APPLE_TEAM_ID };
  return {
    verifyAttestation({ keyId, challenge, attestation }) {
      const result: unknown = verifyAttestation({ ...appIdentity, keyId, challenge, attestation, allowDevelopmentEnvironment });
      const publicKeyPem = (result as { publicKey?: unknown } | null)?.publicKey;
      if (typeof publicKeyPem !== "string") throw new InvalidAttestationError("no public key");
      return { publicKeyPem };
    },
    verifyAssertion({ assertion, payload, publicKeyPem, previousSignCount }) {
      const result: unknown = verifyAssertion({
        ...appIdentity,
        assertion,
        payload: Buffer.from(payload),
        publicKey: publicKeyPem,
        signCount: previousSignCount,
      });
      const signCount = (result as { signCount?: unknown } | null)?.signCount;
      if (typeof signCount !== "number" || !Number.isSafeInteger(signCount)) {
        throw new InvalidAttestationError("no sign count");
      }
      return { signCount };
    },
  };
}
