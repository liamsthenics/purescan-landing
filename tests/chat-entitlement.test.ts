import { test } from "node:test";
import assert from "node:assert/strict";
import { VerificationException, VerificationStatus } from "@apple/app-store-server-library";
import { loadAppleRootCertificates } from "../lib/chat/apple-root-certificates.ts";
import {
  AppleTransactionVerifier,
  createAppleTransactionVerifier,
  type TransactionDecoder,
} from "../lib/chat/apple-verifier.ts";
import { evaluateEntitlement, type TransactionClaims } from "../lib/chat/entitlement.ts";

const NOW_MS = Date.UTC(2026, 8, 26, 12, 0, 0);
const DAY_MS = 86_400_000;
const FAKE_JWS = "eyJhbGciOiJFUzI1NiJ9.eyJ0ZXN0Ijp0cnVlfQ.c2lnbmF0dXJl";

const ACTIVE_YEARLY: TransactionClaims = {
  bundleId: "com.purescan.app",
  productId: "com.purescan.app.premium.yearly",
  originalTransactionId: "2000000123456789",
  expiresDate: NOW_MS + 30 * DAY_MS,
};

test("an active monthly or yearly Premium subscription is entitled", () => {
  assert.deepEqual(evaluateEntitlement(ACTIVE_YEARLY, NOW_MS), {
    isEntitled: true,
    originalTransactionId: "2000000123456789",
  });
  const monthly = { ...ACTIVE_YEARLY, productId: "com.purescan.app.premium.monthly" };
  assert.equal(evaluateEntitlement(monthly, NOW_MS).isEntitled, true);
});

test("expired, revoked, other products and other apps are refused", () => {
  const failureOf = (claims: TransactionClaims) => {
    const result = evaluateEntitlement(claims, NOW_MS);
    return result.isEntitled ? null : result.failure;
  };
  assert.equal(failureOf({ ...ACTIVE_YEARLY, expiresDate: NOW_MS - 1 }), "expired");
  assert.equal(failureOf({ ...ACTIVE_YEARLY, expiresDate: undefined }), "expired");
  assert.equal(failureOf({ ...ACTIVE_YEARLY, revocationDate: NOW_MS - DAY_MS }), "revoked");
  assert.equal(failureOf({ ...ACTIVE_YEARLY, productId: "com.purescan.app.tip" }), "wrong_product");
  assert.equal(failureOf({ ...ACTIVE_YEARLY, bundleId: "com.example.other" }), "wrong_app");
  assert.equal(failureOf({ ...ACTIVE_YEARLY, originalTransactionId: undefined }), "missing_transaction_id");
});

interface RecordingDecoder extends TransactionDecoder {
  calls: number;
}

function decoder(behaviour: () => TransactionClaims): RecordingDecoder {
  const recording: RecordingDecoder = {
    calls: 0,
    async verifyAndDecodeTransaction() {
      recording.calls += 1;
      return behaviour();
    },
  };
  return recording;
}

const fails = (status: VerificationStatus) => () => {
  throw new VerificationException(status);
};

function verifier(production: TransactionDecoder, sandbox: TransactionDecoder) {
  return new AppleTransactionVerifier({ production, sandbox, now: () => NOW_MS });
}

test("a missing or malformed header is refused before any verification", async () => {
  const production = decoder(() => ACTIVE_YEARLY);
  const check = verifier(production, decoder(() => ACTIVE_YEARLY));
  assert.deepEqual(await check.verify(null), { isEntitled: false, failure: "missing" });
  assert.deepEqual(await check.verify("not a jws"), { isEntitled: false, failure: "malformed" });
  assert.deepEqual(await check.verify(`${"a".repeat(20_000)}.b.c`), { isEntitled: false, failure: "malformed" });
  assert.equal(production.calls, 0);
});

test("uses Production, and Sandbox only when Apple reports the other environment", async () => {
  const sandbox = decoder(() => ACTIVE_YEARLY);
  const productionHit = verifier(decoder(() => ACTIVE_YEARLY), sandbox);
  assert.equal((await productionHit.verify(FAKE_JWS)).isEntitled, true);
  assert.equal(sandbox.calls, 0);

  const sandboxHit = verifier(decoder(fails(VerificationStatus.INVALID_ENVIRONMENT)), sandbox);
  assert.equal((await sandboxHit.verify(FAKE_JWS)).isEntitled, true);
  assert.equal(sandbox.calls, 1);
});

test("a bad signature is refused without trying Sandbox", async () => {
  const sandbox = decoder(() => ACTIVE_YEARLY);
  const check = verifier(decoder(fails(VerificationStatus.VERIFICATION_FAILURE)), sandbox);
  assert.deepEqual(await check.verify(FAKE_JWS), { isEntitled: false, failure: "invalid_signature" });
  assert.equal(sandbox.calls, 0);

  const unexpected = verifier(decoder(() => {
    throw new Error("boom");
  }), sandbox);
  assert.deepEqual(await unexpected.verify(FAKE_JWS), { isEntitled: false, failure: "invalid_signature" });
});

test("a retryable Apple failure is reported as unavailable, not as not-Premium", async () => {
  const check = verifier(decoder(fails(VerificationStatus.RETRYABLE_VERIFICATION_FAILURE)), decoder(() => ACTIVE_YEARLY));
  assert.deepEqual(await check.verify(FAKE_JWS), { isEntitled: false, failure: "verification_unavailable" });
});

test("a verified but expired transaction is still refused", async () => {
  const expired = { ...ACTIVE_YEARLY, expiresDate: NOW_MS - DAY_MS };
  const check = verifier(decoder(() => expired), decoder(() => expired));
  assert.deepEqual(await check.verify(FAKE_JWS), { isEntitled: false, failure: "expired" });
});

test("the real verifier loads Apple's bundled roots and rejects a forged transaction", async () => {
  const certificates = loadAppleRootCertificates();
  assert.equal(certificates.length, 3);
  const result = await createAppleTransactionVerifier(certificates).verify(FAKE_JWS);
  assert.deepEqual(result, { isEntitled: false, failure: "invalid_signature" });
});
