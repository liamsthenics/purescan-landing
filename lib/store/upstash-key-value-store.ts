// Key-value storage in Upstash Redis (REST), shared by every serverless instance.
import { Redis } from "@upstash/redis";
import type { UpstashCredentials } from "../environment.ts";
import type { KeyValueStore } from "./key-value-store.ts";

export class UpstashKeyValueStore implements KeyValueStore {
  private readonly redis: Redis;

  constructor(credentials: UpstashCredentials) {
    // Values are stored and returned as the exact strings given; the caller does its own (validated) parsing.
    this.redis = new Redis({ url: credentials.url, token: credentials.token, automaticDeserialization: false });
  }

  async get(key: string): Promise<string | null> {
    return this.redis.get<string>(key);
  }

  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    await this.redis.set(key, value, { ex: ttlSeconds });
  }

  async getAndDelete(key: string): Promise<string | null> {
    return this.redis.getdel<string>(key);
  }
}
