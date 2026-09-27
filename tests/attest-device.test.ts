import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import {
  createAppAttestVerifier,
  type AppAttestVerifier,
  type AssertionEvidence,
  type AttestationEvidence,
} from "../lib/attest/app-attest-verifier.ts";
import { InMemoryAttestedKeyStore } from "../lib/attest/attested-key-store.ts";
import { AttestChallengeStore, CHALLENGE_PATTERN } from "../lib/attest/challenge-store.ts";
import { ATTESTED_KEY_TTL_SECONDS, CHALLENGE_TTL_SECONDS } from "../lib/attest/config.ts";
import { AppAttestDeviceAttestor, keyIdHash } from "../lib/attest/device-attestor.ts";
import { InMemoryKeyValueStore } from "../lib/store/key-value-store.ts";
import { KEY_ID } from "./label-test-support.ts";

const SECOND_MS = 1_000;
const PUBLIC_KEY = "-----BEGIN PUBLIC KEY-----\nfake\n-----END PUBLIC KEY-----\n";
const ATTESTATION = Buffer.from("attestation object").toString("base64");
const ASSERTION = Buffer.from("assertion object").toString("base64");
const PAYLOAD = new TextEncoder().encode('{"barcode":"5000000000000"}');

function fakeClock(startMs = Date.UTC(2026, 8, 27, 9, 0, 0)) {
  let nowMs = startMs;
  return { now: () => nowMs, advance: (ms: number) => (nowMs += ms) };
}

class FakeVerifier implements AppAttestVerifier {
  attestations: AttestationEvidence[] = [];
  assertions: AssertionEvidence[] = [];
  isAttestationValid = true;
  /** The counter inside the next assertion. */
  nextSignCount = 1;

  verifyAttestation(evidence: AttestationEvidence): { publicKeyPem: string } {
    this.attestations.push(evidence);
    if (!this.isAttestationValid) throw new Error("invalid attestation");
    return { publicKeyPem: PUBLIC_KEY };
  }

  /** Mirrors the library: a counter that doesn't grow is rejected. */
  verifyAssertion(evidence: AssertionEvidence): { signCount: number } {
    this.assertions.push(evidence);
    if (this.nextSignCount <= evidence.previousSignCount) throw new Error("invalid signCount");
    return { signCount: this.nextSignCount };
  }
}

function attestorHarness() {
  const clock = fakeClock();
  const challenges = new AttestChallengeStore(new InMemoryKeyValueStore(clock.now));
  const keys = new InMemoryAttestedKeyStore(ATTESTED_KEY_TTL_SECONDS, clock.now);
  const verifier = new FakeVerifier();
  const attestor = new AppAttestDeviceAttestor({ challenges, keys, verifier });
  return { clock, challenges, keys, verifier, attestor };
}

test("challenges are 32 random bytes as base64url and expire after 300 s", async () => {
  const { attestor, challenges, clock } = attestorHarness();
  const issued = await attestor.issueChallenge();
  assert.match(issued.challenge, CHALLENGE_PATTERN);
  assert.equal(Buffer.from(issued.challenge, "base64url").length, 32);
  assert.equal(issued.expiresInSeconds, CHALLENGE_TTL_SECONDS);
  assert.notEqual((await attestor.issueChallenge()).challenge, issued.challenge);

  clock.advance(CHALLENGE_TTL_SECONDS * SECOND_MS);
  assert.equal(await challenges.consume(issued.challenge), false);
});

test("a challenge can be consumed only once, and unknown ones never", async () => {
  const { challenges } = attestorHarness();
  const challenge = await challenges.issue();
  assert.equal(await challenges.consume(challenge), true);
  assert.equal(await challenges.consume(challenge), false);
  assert.equal(await challenges.consume("A".repeat(43)), false);
  assert.equal(await challenges.consume("not a challenge"), false);
});

test("registration verifies the attestation for the challenge and stores the key with count 0", async () => {
  const { attestor, keys, verifier } = attestorHarness();
  const { challenge } = await attestor.issueChallenge();
  assert.equal(await attestor.register({ keyId: KEY_ID, challenge, attestation: ATTESTATION }), true);
  assert.equal(verifier.attestations[0]?.challenge, challenge);
  assert.equal(verifier.attestations[0]?.keyId, KEY_ID);
  assert.deepEqual(await keys.find(keyIdHash(KEY_ID)), { publicKeyPem: PUBLIC_KEY, signCount: 0 });
});

test("registration fails for a reused challenge, an invalid attestation or a malformed key id", async () => {
  const { attestor, verifier, keys } = attestorHarness();
  const { challenge } = await attestor.issueChallenge();
  verifier.isAttestationValid = false;
  assert.equal(await attestor.register({ keyId: KEY_ID, challenge, attestation: ATTESTATION }), false);

  verifier.isAttestationValid = true;
  assert.equal(await attestor.register({ keyId: KEY_ID, challenge, attestation: ATTESTATION }), false, "challenge already used");

  const fresh = await attestor.issueChallenge();
  assert.equal(await attestor.register({ keyId: "short", challenge: fresh.challenge, attestation: ATTESTATION }), false);
  assert.equal(await attestor.register({ keyId: KEY_ID, challenge: fresh.challenge, attestation: "%%%" }), false);
  assert.equal(await keys.find(keyIdHash(KEY_ID)), null);
});

async function registeredAttestor() {
  const harness = attestorHarness();
  const { challenge } = await harness.attestor.issueChallenge();
  assert.equal(await harness.attestor.register({ keyId: KEY_ID, challenge, attestation: ATTESTATION }), true);
  return harness;
}

test("a valid assertion identifies the device and raises the stored counter", async () => {
  const { attestor, keys, verifier } = await registeredAttestor();
  const outcome = await attestor.verifyRequest({ keyId: KEY_ID, assertion: ASSERTION, payload: PAYLOAD });
  assert.deepEqual(outcome, { isValid: true, deviceId: keyIdHash(KEY_ID) });
  assert.deepEqual(verifier.assertions[0]?.payload, PAYLOAD);
  assert.equal(verifier.assertions[0]?.publicKeyPem, PUBLIC_KEY);
  assert.equal((await keys.find(keyIdHash(KEY_ID)))?.signCount, 1);
});

test("a replayed assertion (same sign count) is refused", async () => {
  const { attestor, verifier } = await registeredAttestor();
  verifier.nextSignCount = 5;
  assert.equal((await attestor.verifyRequest({ keyId: KEY_ID, assertion: ASSERTION, payload: PAYLOAD })).isValid, true);
  assert.equal((await attestor.verifyRequest({ keyId: KEY_ID, assertion: ASSERTION, payload: PAYLOAD })).isValid, false);
  verifier.nextSignCount = 4;
  assert.equal((await attestor.verifyRequest({ keyId: KEY_ID, assertion: ASSERTION, payload: PAYLOAD })).isValid, false);
  verifier.nextSignCount = 6;
  assert.equal((await attestor.verifyRequest({ keyId: KEY_ID, assertion: ASSERTION, payload: PAYLOAD })).isValid, true);
});

test("the stored counter is advanced atomically: a stale concurrent update loses", async () => {
  const keys = new InMemoryAttestedKeyStore(ATTESTED_KEY_TTL_SECONDS);
  await keys.saveIfAbsent("key", PUBLIC_KEY);
  assert.equal(await keys.advanceSignCount("key", 3), true);
  assert.equal(await keys.advanceSignCount("key", 3), false);
  assert.equal(await keys.advanceSignCount("key", 2), false);
  assert.equal(await keys.advanceSignCount("unknown", 9), false);
});

test("re-registering a key never resets its counter", async () => {
  const keys = new InMemoryAttestedKeyStore(ATTESTED_KEY_TTL_SECONDS);
  await keys.saveIfAbsent("key", PUBLIC_KEY);
  await keys.advanceSignCount("key", 7);
  await keys.saveIfAbsent("key", "-----BEGIN PUBLIC KEY-----\nother\n-----END PUBLIC KEY-----\n");
  assert.deepEqual(await keys.find("key"), { publicKeyPem: PUBLIC_KEY, signCount: 7 });
});

test("unknown keys, missing headers and malformed assertions are invalid", async () => {
  const { attestor, verifier } = await registeredAttestor();
  const otherKey = "B".repeat(43) + "=";
  assert.equal((await attestor.verifyRequest({ keyId: otherKey, assertion: ASSERTION, payload: PAYLOAD })).isValid, false);
  assert.equal((await attestor.verifyRequest({ keyId: null, assertion: ASSERTION, payload: PAYLOAD })).isValid, false);
  assert.equal((await attestor.verifyRequest({ keyId: KEY_ID, assertion: null, payload: PAYLOAD })).isValid, false);
  assert.equal((await attestor.verifyRequest({ keyId: KEY_ID, assertion: "not base64!", payload: PAYLOAD })).isValid, false);
  assert.equal(verifier.assertions.length, 0);
});

test("unused keys expire, so the app attests a new one", async () => {
  const { attestor, clock } = await registeredAttestor();
  clock.advance(ATTESTED_KEY_TTL_SECONDS * SECOND_MS);
  assert.equal((await attestor.verifyRequest({ keyId: KEY_ID, assertion: ASSERTION, payload: PAYLOAD })).isValid, false);
});

// Genuine Apple evidence from node-app-attest's own fixtures, made for a different app.
const require = createRequire(import.meta.url);
const libraryRoot = require.resolve("node-app-attest").replace(/src[/\\]index\.js$/, "");
const otherAppAttestation = JSON.parse(readFileSync(`${libraryRoot}test/fixtures/attestation-production.json`, "utf8"));

test("the real verifier rejects a genuine attestation made for another app", () => {
  const verifier = createAppAttestVerifier({ allowDevelopmentEnvironment: true });
  assert.throws(() =>
    verifier.verifyAttestation({
      keyId: otherAppAttestation.keyId,
      challenge: Buffer.from(otherAppAttestation.challenge, "base64").toString("utf8"),
      attestation: Buffer.from(otherAppAttestation.attestation, "base64"),
    }),
    // The certificate chain, nonce and key id all check out; only the App ID (rpId) differs.
    /appId does not match/,
  );
});

test("the real verifier rejects garbage evidence", () => {
  const verifier = createAppAttestVerifier({ allowDevelopmentEnvironment: false });
  assert.throws(() => verifier.verifyAttestation({ keyId: KEY_ID, challenge: "c", attestation: Buffer.from("junk") }));
  assert.throws(() =>
    verifier.verifyAssertion({ assertion: Buffer.from("junk"), payload: PAYLOAD, publicKeyPem: PUBLIC_KEY, previousSignCount: 0 }),
  );
});
