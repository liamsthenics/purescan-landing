// Fixed-window rate limits for Ask PureScan. Keys hold only SHA-256 hashes and
// expire with their window, so nothing identifying is kept beyond a day.
import { RATE_LIMITS } from "./config.ts";

export const SECONDS_PER_MINUTE = 60;
export const SECONDS_PER_HOUR = 3_600;
export const SECONDS_PER_DAY = 86_400;
const MILLISECONDS_PER_SECOND = 1_000;
const KEY_PREFIX = "purescan:chat";

export interface WindowCount {
  /** Requests in the current window, including this one. */
  count: number;
  /** Seconds until the window resets. */
  resetInSeconds: number;
}

/** Counts requests per key in a fixed window that starts with the first request. */
export interface RateLimitStore {
  increment(key: string, windowSeconds: number): Promise<WindowCount>;
  /** Gives back one request counted in the current window (no-op if the window has ended). */
  decrement(key: string): Promise<void>;
  /** The current window's count without adding to it, or null if there is no open window. */
  peek(key: string): Promise<WindowCount | null>;
}

interface StoredWindow {
  count: number;
  expiresAtMs: number;
  windowSeconds: number;
}

/** Stops the in-memory store growing without bound under a flood of new keys. */
const MAX_TRACKED_WINDOWS = 10_000;

/**
 * Per-instance counts for local development, or when Upstash isn't configured.
 * On serverless hosting each instance counts separately, so limits are looser.
 */
export class InMemoryRateLimitStore implements RateLimitStore {
  private readonly windows = new Map<string, StoredWindow>();
  private readonly now: () => number;

  constructor(now: () => number = Date.now) {
    this.now = now;
  }

  async increment(key: string, windowSeconds: number): Promise<WindowCount> {
    const nowMs = this.now();
    const current = this.windows.get(key);
    const window =
      current && current.expiresAtMs > nowMs
        ? current
        : { count: 0, expiresAtMs: nowMs + windowSeconds * MILLISECONDS_PER_SECOND, windowSeconds };
    window.count += 1;
    this.windows.set(key, window);
    this.evictWhenFull(nowMs);
    return { count: window.count, resetInSeconds: Math.ceil((window.expiresAtMs - nowMs) / MILLISECONDS_PER_SECOND) };
  }

  async peek(key: string): Promise<WindowCount | null> {
    const nowMs = this.now();
    const window = this.windows.get(key);
    if (!window || window.expiresAtMs <= nowMs) return null;
    return { count: window.count, resetInSeconds: Math.ceil((window.expiresAtMs - nowMs) / MILLISECONDS_PER_SECOND) };
  }

  async decrement(key: string): Promise<void> {
    const window = this.windows.get(key);
    if (window && window.expiresAtMs > this.now()) window.count = Math.max(0, window.count - 1);
  }

  /**
   * Drops expired windows first, then the oldest short (hourly or shorter)
   * windows, so a flood of new IPs can't reset the daily and global caps.
   * Daily windows go last, only if the map is still full.
   */
  private evictWhenFull(nowMs: number): void {
    if (this.windows.size <= MAX_TRACKED_WINDOWS) return;
    this.deleteWhere((window) => window.expiresAtMs <= nowMs);
    this.deleteWhere((window) => window.windowSeconds <= SECONDS_PER_HOUR);
    this.deleteWhere(() => true);
  }

  /** Deletes matching windows, oldest first (Map keeps insertion order), until under the limit. */
  private deleteWhere(shouldDelete: (window: StoredWindow) => boolean): void {
    for (const [key, window] of this.windows) {
      if (this.windows.size <= MAX_TRACKED_WINDOWS) return;
      if (shouldDelete(window)) this.windows.delete(key);
    }
  }
}

export type ClientDecision = { isAllowed: true } | { isAllowed: false; retryAfterSeconds: number };

export type TransactionDecision =
  | { outcome: "allowed"; remainingToday: number }
  | { outcome: "rate_limited"; retryAfterSeconds: number }
  | { outcome: "capacity_reached" };

/** The daily key for the global cap, e.g. "2026-09-26" (UTC). */
export function utcDay(nowMs: number): string {
  return new Date(nowMs).toISOString().slice(0, 10);
}

/** What the chat handler needs from the rate limiter. */
export interface ChatRateLimits {
  checkClient(ipHash: string): Promise<ClientDecision>;
  checkTransaction(transactionHash: string): Promise<TransactionDecision>;
  /** Gives back an allowed question that couldn't be answered (the upstream failed). */
  refundTransaction(transactionHash: string): Promise<void>;
  /** Someone who keeps asking out-of-scope questions is paused until the day resets. */
  checkRefusals(transactionHash: string): Promise<ClientDecision>;
  recordRefusal(transactionHash: string): Promise<void>;
}

export interface ChatRateLimiterOptions {
  store: RateLimitStore;
  globalDailyLimit: number;
  now?: () => number;
}

export class ChatRateLimiter implements ChatRateLimits {
  private readonly store: RateLimitStore;
  private readonly globalDailyLimit: number;
  private readonly now: () => number;

  constructor(options: ChatRateLimiterOptions) {
    this.store = options.store;
    this.globalDailyLimit = options.globalDailyLimit;
    this.now = options.now ?? Date.now;
  }

  /** Per-IP limit, checked before any expensive work. Pass a hash of the IP. */
  async checkClient(ipHash: string): Promise<ClientDecision> {
    const hour = await this.store.increment(`${KEY_PREFIX}:ip:hour:${ipHash}`, SECONDS_PER_HOUR);
    return hour.count > RATE_LIMITS.perIpPerHour
      ? { isAllowed: false, retryAfterSeconds: hour.resetInSeconds }
      : { isAllowed: true };
  }

  /**
   * Per-subscriber limits, then the global daily cap. Pass a hash of the
   * original transaction ID. A request refused by the minute limit doesn't
   * use up any of the day's allowance.
   */
  async checkTransaction(transactionHash: string): Promise<TransactionDecision> {
    const minute = await this.store.increment(`${KEY_PREFIX}:tx:minute:${transactionHash}`, SECONDS_PER_MINUTE);
    if (minute.count > RATE_LIMITS.perTransactionPerMinute) {
      return { outcome: "rate_limited", retryAfterSeconds: minute.resetInSeconds };
    }
    const dayKey = this.dayKey(transactionHash);
    const day = await this.store.increment(dayKey, SECONDS_PER_DAY);
    if (day.count > RATE_LIMITS.perTransactionPerDay) {
      return { outcome: "rate_limited", retryAfterSeconds: day.resetInSeconds };
    }
    const global = await this.store.increment(this.globalKey(), SECONDS_PER_DAY);
    if (global.count > this.globalDailyLimit) {
      // Nobody is being answered, so this doesn't count against the subscriber's day.
      await this.store.decrement(dayKey);
      return { outcome: "capacity_reached" };
    }
    return { outcome: "allowed", remainingToday: RATE_LIMITS.perTransactionPerDay - day.count };
  }

  async refundTransaction(transactionHash: string): Promise<void> {
    await Promise.all([this.store.decrement(this.dayKey(transactionHash)), this.store.decrement(this.globalKey())]);
  }

  async checkRefusals(transactionHash: string): Promise<ClientDecision> {
    const refusals = await this.store.peek(this.refusalKey(transactionHash));
    return refusals && refusals.count >= RATE_LIMITS.maxRefusalsPerDay
      ? { isAllowed: false, retryAfterSeconds: refusals.resetInSeconds }
      : { isAllowed: true };
  }

  async recordRefusal(transactionHash: string): Promise<void> {
    await this.store.increment(this.refusalKey(transactionHash), SECONDS_PER_DAY);
  }

  private refusalKey(transactionHash: string): string {
    return `${KEY_PREFIX}:tx:refusals:${transactionHash}`;
  }

  private dayKey(transactionHash: string): string {
    return `${KEY_PREFIX}:tx:day:${transactionHash}`;
  }

  private globalKey(): string {
    return `${KEY_PREFIX}:global:${utcDay(this.now())}`;
  }
}
