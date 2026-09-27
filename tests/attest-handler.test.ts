import { test } from "node:test";
import assert from "node:assert/strict";
import { createIdentifierHasher } from "../lib/chat/hashing.ts";
import { InMemoryRateLimitStore } from "../lib/chat/rate-limit.ts";
import { createAttestChallengeHandler, createAttestRegisterHandler } from "../lib/label/attest-handler.ts";
import { RATE_LIMITS } from "../lib/label/config.ts";
import { LabelRateLimiter } from "../lib/label/rate-limit.ts";
import { FakeAttestor, KEY_ID, type LoggedEvent } from "./label-test-support.ts";

function handlers() {
  const attestor = new FakeAttestor();
  const logged: LoggedEvent[] = [];
  const dependencies = {
    deviceAttestor: attestor,
    rateLimits: new LabelRateLimiter({ store: new InMemoryRateLimitStore(), globalDailyLimit: 1 }),
    hashIdentifier: createIdentifierHasher("test-secret"),
    logger: (event: LoggedEvent["event"], error?: unknown) => logged.push({ event, error }),
  };
  return {
    attestor,
    logged,
    challenge: createAttestChallengeHandler(dependencies),
    register: createAttestRegisterHandler(dependencies),
  };
}

function post(path: string, body?: unknown, ip = "203.0.113.7"): Request {
  return new Request(`https://www.purescan.io${path}`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": ip },
    body: body === undefined ? undefined : typeof body === "string" ? body : JSON.stringify(body),
  });
}

const REGISTRATION = { keyId: KEY_ID, challenge: "c".repeat(43), attestation: Buffer.from("attestation").toString("base64") };

test("POST /api/attest/challenge returns a challenge and its lifetime", async () => {
  const { challenge } = handlers();
  const response = await challenge(post("/api/attest/challenge"));
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.deepEqual(await response.json(), { challenge: "c".repeat(43), expiresIn: 300 });
});

test("challenges are limited to 30 an hour per IP", async () => {
  const { challenge } = handlers();
  for (let index = 0; index < RATE_LIMITS.challengesPerIpPerHour; index += 1) await challenge(post("/api/attest/challenge"));
  const refused = await challenge(post("/api/attest/challenge"));
  assert.equal(refused.status, 429);
  assert.equal((await refused.json()).error, "rate_limited");
  assert.ok(Number(refused.headers.get("retry-after")) > 0);
  assert.equal((await challenge(post("/api/attest/challenge", undefined, "203.0.113.8"))).status, 200);
});

test("POST /api/attest/register answers 204 for a valid attestation", async () => {
  const { register, attestor } = handlers();
  const response = await register(post("/api/attest/register", REGISTRATION));
  assert.equal(response.status, 204);
  assert.deepEqual(attestor.registrations, [REGISTRATION]);
});

test("an invalid registration gets 400 invalid_request", async () => {
  const { register, attestor } = handlers();
  attestor.isRegistrationValid = false;
  const refused = await register(post("/api/attest/register", REGISTRATION));
  assert.equal(refused.status, 400);
  assert.equal((await refused.json()).error, "invalid_request");

  for (const body of ["{oops", { keyId: KEY_ID }, { ...REGISTRATION, attestation: 42 }, { ...REGISTRATION, keyId: "" }]) {
    assert.equal((await register(post("/api/attest/register", body))).status, 400);
  }
  assert.equal(attestor.registrations.length, 1, "malformed bodies never reach the attestor");
});

test("a storage failure is a generic 503", async () => {
  const { register, attestor, logged } = handlers();
  attestor.register = async () => {
    throw new Error("store down");
  };
  const response = await register(post("/api/attest/register", REGISTRATION));
  assert.equal(response.status, 503);
  assert.doesNotMatch(await response.text(), /store down/);
  assert.deepEqual(logged.map((entry) => entry.event), ["unexpected_error"]);
});
