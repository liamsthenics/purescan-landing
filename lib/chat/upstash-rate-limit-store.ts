// Rate-limit counts in Upstash Redis (REST), shared by every serverless instance.
import { Redis } from "@upstash/redis";
import type { UpstashCredentials } from "./config.ts";
import type { RateLimitStore, WindowCount } from "./rate-limit.ts";

/** Redis TTL reply for a key that exists without an expiry. */
const NO_EXPIRY = -1;

export class UpstashRateLimitStore implements RateLimitStore {
  private readonly redis: Redis;

  constructor(credentials: UpstashCredentials) {
    this.redis = new Redis({ url: credentials.url, token: credentials.token });
  }

  /** One transaction: start the window if it's new, count this request, read the time left. */
  async increment(key: string, windowSeconds: number): Promise<WindowCount> {
    const [, count, ttlSeconds] = await this.redis
      .multi()
      .set(key, 0, { nx: true, ex: windowSeconds })
      .incr(key)
      .ttl(key)
      .exec<[unknown, number, number]>();
    return { count, resetInSeconds: ttlSeconds > 0 ? ttlSeconds : windowSeconds };
  }

  async decrement(key: string): Promise<void> {
    const [, ttlSeconds] = await this.redis.multi().decr(key).ttl(key).exec<[number, number]>();
    // The window ended just before the refund, so DECR created a key with no expiry: remove it.
    if (ttlSeconds === NO_EXPIRY) await this.redis.del(key);
  }
}
