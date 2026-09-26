import { test } from "node:test";
import assert from "node:assert/strict";
import { RATE_LIMITS } from "../lib/chat/config.ts";
import { ChatRateLimiter, InMemoryRateLimitStore, type TransactionDecision } from "../lib/chat/rate-limit.ts";

const MINUTE_MS = 60_000;
const DAY_MS = 86_400_000;

function fakeClock(startMs = Date.UTC(2026, 8, 26, 9, 0, 0)) {
  let nowMs = startMs;
  return { now: () => nowMs, advance: (ms: number) => (nowMs += ms) };
}

function limiter(globalDailyLimit: number = RATE_LIMITS.defaultGlobalDailyLimit) {
  const clock = fakeClock();
  const store = new InMemoryRateLimitStore(clock.now);
  return { clock, limits: new ChatRateLimiter({ store, globalDailyLimit, now: clock.now }) };
}

async function repeat<T>(times: number, action: () => Promise<T>): Promise<T[]> {
  const results: T[] = [];
  for (let index = 0; index < times; index += 1) results.push(await action());
  return results;
}

test("in-memory windows count up and reset after they expire", async () => {
  const clock = fakeClock();
  const store = new InMemoryRateLimitStore(clock.now);
  assert.deepEqual(await store.increment("k", 60), { count: 1, resetInSeconds: 60 });
  clock.advance(15_000);
  assert.deepEqual(await store.increment("k", 60), { count: 2, resetInSeconds: 45 });
  clock.advance(45_000);
  assert.deepEqual(await store.increment("k", 60), { count: 1, resetInSeconds: 60 });
});

test("allows 8 questions a minute per subscriber, then asks them to wait", async () => {
  const { clock, limits } = limiter();
  const allowed = await repeat(RATE_LIMITS.perTransactionPerMinute, () => limits.checkTransaction("tx"));
  assert.ok(allowed.every((decision) => decision.outcome === "allowed"));

  clock.advance(20_000);
  assert.deepEqual(await limits.checkTransaction("tx"), { outcome: "rate_limited", retryAfterSeconds: 40 });
  assert.equal((await limits.checkTransaction("other-tx")).outcome, "allowed");

  clock.advance(MINUTE_MS);
  assert.equal((await limits.checkTransaction("tx")).outcome, "allowed");
});

test("allows 40 a day per subscriber and reports what's left", async () => {
  const { clock, limits } = limiter();
  const first = await limits.checkTransaction("tx");
  assert.deepEqual(first, { outcome: "allowed", remainingToday: RATE_LIMITS.perTransactionPerDay - 1 });

  let last: TransactionDecision = first;
  for (let asked = 1; asked < RATE_LIMITS.perTransactionPerDay; asked += 1) {
    clock.advance(MINUTE_MS);
    last = await limits.checkTransaction("tx");
  }
  assert.deepEqual(last, { outcome: "allowed", remainingToday: 0 });

  clock.advance(MINUTE_MS);
  const refused = await limits.checkTransaction("tx");
  assert.equal(refused.outcome, "rate_limited");

  clock.advance(DAY_MS);
  assert.equal((await limits.checkTransaction("tx")).outcome, "allowed");
});

test("a request refused by the minute limit doesn't use the day's allowance", async () => {
  const { clock, limits } = limiter();
  await repeat(RATE_LIMITS.perTransactionPerMinute + 5, () => limits.checkTransaction("tx"));
  clock.advance(MINUTE_MS);
  const next = await limits.checkTransaction("tx");
  assert.deepEqual(next, {
    outcome: "allowed",
    remainingToday: RATE_LIMITS.perTransactionPerDay - RATE_LIMITS.perTransactionPerMinute - 1,
  });
});

test("refunds give back the day's question and the global count", async () => {
  const { limits } = limiter(1);
  assert.deepEqual(await limits.checkTransaction("tx"), { outcome: "allowed", remainingToday: 39 });
  await limits.refundTransaction("tx");
  assert.deepEqual(await limits.checkTransaction("tx"), { outcome: "allowed", remainingToday: 39 });
});

test("hitting the global cap doesn't use up a subscriber's day", async () => {
  const { clock, limits } = limiter(1);
  await limits.checkTransaction("a");
  assert.deepEqual(await limits.checkTransaction("b"), { outcome: "capacity_reached" });
  // 09:00 → 00:00 the next UTC day: a fresh global count, while b's own 24-hour window is still open.
  clock.advance(15 * 60 * MINUTE_MS);
  assert.deepEqual(await limits.checkTransaction("b"), { outcome: "allowed", remainingToday: 39 });
});

test("a flood of new keys can't evict the daily and global windows", async () => {
  const clock = fakeClock();
  const store = new InMemoryRateLimitStore(clock.now);
  await store.increment("daily", 86_400);
  for (let index = 0; index < 10_050; index += 1) await store.increment(`ip-${index}`, 3_600);
  assert.equal((await store.increment("daily", 86_400)).count, 2);
});

test("allows 60 requests an hour per IP", async () => {
  const { limits } = limiter();
  const allowed = await repeat(RATE_LIMITS.perIpPerHour, () => limits.checkClient("ip"));
  assert.ok(allowed.every((decision) => decision.isAllowed));
  const refused = await limits.checkClient("ip");
  assert.deepEqual(refused, { isAllowed: false, retryAfterSeconds: 3_600 });
  assert.ok((await limits.checkClient("another-ip")).isAllowed);
});

test("the global daily cap switches chat off for everyone until the next UTC day", async () => {
  const { clock, limits } = limiter(2);
  assert.equal((await limits.checkTransaction("a")).outcome, "allowed");
  assert.equal((await limits.checkTransaction("b")).outcome, "allowed");
  assert.deepEqual(await limits.checkTransaction("c"), { outcome: "capacity_reached" });
  clock.advance(DAY_MS);
  assert.equal((await limits.checkTransaction("c")).outcome, "allowed");
});

test("refusals are counted per subscriber and pause chat once the daily limit is reached", async () => {
  const limiter = new ChatRateLimiter({ store: new InMemoryRateLimitStore(), globalDailyLimit: 100 });
  for (let index = 0; index < RATE_LIMITS.maxRefusalsPerDay - 1; index += 1) await limiter.recordRefusal("tx-a");
  assert.deepEqual(await limiter.checkRefusals("tx-a"), { isAllowed: true });
  await limiter.recordRefusal("tx-a");
  const decision = await limiter.checkRefusals("tx-a");
  assert.equal(decision.isAllowed, false);
  assert.deepEqual(await limiter.checkRefusals("tx-b"), { isAllowed: true }, "other subscribers are unaffected");
});
