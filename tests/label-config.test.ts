import { test } from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_CHAT_MODEL } from "../lib/chat/config.ts";
import { DEFAULT_LABEL_MODEL, RATE_LIMITS, readLabelConfig } from "../lib/label/config.ts";

const UPSTASH = { UPSTASH_REDIS_REST_URL: "https://example.upstash.io", UPSTASH_REDIS_REST_TOKEN: "token" };
const PRODUCTION_READY = { NODE_ENV: "production", GEMINI_LABEL_API_KEY: "key", ...UPSTASH };

test("production photo reads need the label key and Upstash", () => {
  assert.equal(readLabelConfig(PRODUCTION_READY).photoReadsEnabled, true);
  assert.equal(readLabelConfig({ ...PRODUCTION_READY, GEMINI_LABEL_API_KEY: " " }).photoReadsEnabled, false);

  const withoutUpstash = readLabelConfig({ NODE_ENV: "production", GEMINI_LABEL_API_KEY: "key" });
  assert.equal(withoutUpstash.photoReadsEnabled, false);
  assert.equal(withoutUpstash.isStoreAvailable, false);
});

test("the chat key doesn't enable label reads", () => {
  assert.equal(readLabelConfig({ NODE_ENV: "production", GEMINI_API_KEY: "chat-key", ...UPSTASH }).photoReadsEnabled, false);
});

test("local development may use the in-memory store", () => {
  const config = readLabelConfig({ NODE_ENV: "development", GEMINI_LABEL_API_KEY: "key" });
  assert.equal(config.isStoreAvailable, true);
  assert.equal(config.photoReadsEnabled, true);
  assert.equal(readLabelConfig({ GEMINI_LABEL_API_KEY: "key" }).photoReadsEnabled, true);
});

test("LABEL_ENABLED turns photo reads off", () => {
  for (const value of ["false", "0", "off", "no", "FALSE"]) {
    const config = readLabelConfig({ ...PRODUCTION_READY, LABEL_ENABLED: value });
    assert.equal(config.photoReadsEnabled, false, value);
    assert.equal(config.isStoreAvailable, true, "saved readings are still served");
  }
  assert.equal(readLabelConfig({ ...PRODUCTION_READY, LABEL_ENABLED: "true" }).photoReadsEnabled, true);
});

test("production can't switch off App Attest", () => {
  assert.equal(readLabelConfig({ ...PRODUCTION_READY, LABEL_REQUIRE_APP_ATTEST: "false" }).requireAppAttest, true);
  assert.equal(readLabelConfig({ NODE_ENV: "development", LABEL_REQUIRE_APP_ATTEST: "false" }).requireAppAttest, false);
  assert.equal(readLabelConfig({ NODE_ENV: "development" }).requireAppAttest, true);
});

test("development attestations are accepted only when explicitly allowed", () => {
  assert.equal(readLabelConfig(PRODUCTION_READY).allowDevelopmentAttestations, false);
  assert.equal(readLabelConfig({ ...PRODUCTION_READY, APP_ATTEST_ALLOW_DEVELOPMENT: "true" }).allowDevelopmentAttestations, true);
});

test("model and global limit have defaults and overrides", () => {
  assert.equal(DEFAULT_LABEL_MODEL, DEFAULT_CHAT_MODEL);
  const defaults = readLabelConfig(PRODUCTION_READY);
  assert.equal(defaults.model, DEFAULT_CHAT_MODEL);
  assert.equal(defaults.globalDailyLimit, RATE_LIMITS.defaultGlobalDailyLimit);

  const overridden = readLabelConfig({ ...PRODUCTION_READY, GEMINI_LABEL_MODEL: "gemini-x", LABEL_GLOBAL_DAILY_LIMIT: "50" });
  assert.equal(overridden.model, "gemini-x");
  assert.equal(overridden.globalDailyLimit, 50);
  assert.equal(readLabelConfig({ ...PRODUCTION_READY, LABEL_GLOBAL_DAILY_LIMIT: "-3" }).globalDailyLimit, 500);
});

test("Open Food Facts contribution needs the switch and both credentials", () => {
  const credentials = { OFF_USER_ID: "purescan-app", OFF_PASSWORD: "secret" };
  assert.deepEqual(readLabelConfig({ ...PRODUCTION_READY, ...credentials, OFF_CONTRIBUTION_ENABLED: "true" }).openFoodFacts, {
    userId: "purescan-app",
    password: "secret",
  });
  assert.equal(readLabelConfig({ ...PRODUCTION_READY, ...credentials }).openFoodFacts, null);
  assert.equal(
    readLabelConfig({ ...PRODUCTION_READY, OFF_USER_ID: "purescan-app", OFF_CONTRIBUTION_ENABLED: "true" }).openFoodFacts,
    null,
  );
});
