// Registered App Attest keys in Upstash Redis, one hash per key. The writes are
// Lua scripts so each check-and-update is atomic across serverless instances.
import { Redis } from "@upstash/redis";
import type { UpstashCredentials } from "../environment.ts";
import type { AttestedKey, AttestedKeyStore } from "./attested-key-store.ts";
import { ATTEST_KEY_PREFIX } from "./config.ts";

const PUBLIC_KEY_FIELD = "publicKey";
const SIGN_COUNT_FIELD = "signCount";
const SCRIPT_SUCCEEDED = 1;

/**
 * KEYS[1] = key. HMGET through a script because the raw (non-deserialised)
 * client returns HGETALL as a flat array rather than an object.
 */
const READ_KEY_SCRIPT = `return redis.call('HMGET', KEYS[1], '${PUBLIC_KEY_FIELD}', '${SIGN_COUNT_FIELD}')`;

/** KEYS[1] = key; ARGV = public key, TTL seconds. Never overwrites an existing key. */
const SAVE_IF_ABSENT_SCRIPT = `
if redis.call('EXISTS', KEYS[1]) == 1 then return 0 end
redis.call('HSET', KEYS[1], '${PUBLIC_KEY_FIELD}', ARGV[1], '${SIGN_COUNT_FIELD}', '0')
redis.call('EXPIRE', KEYS[1], tonumber(ARGV[2]))
return 1`;

/** KEYS[1] = key; ARGV = new sign count, TTL seconds. Raises the counter only if it grows. */
const ADVANCE_SIGN_COUNT_SCRIPT = `
local current = redis.call('HGET', KEYS[1], '${SIGN_COUNT_FIELD}')
if not current then return 0 end
if tonumber(ARGV[1]) <= tonumber(current) then return 0 end
redis.call('HSET', KEYS[1], '${SIGN_COUNT_FIELD}', ARGV[1])
redis.call('EXPIRE', KEYS[1], tonumber(ARGV[2]))
return 1`;

export class UpstashAttestedKeyStore implements AttestedKeyStore {
  private readonly redis: Redis;
  private readonly ttlSeconds: number;

  constructor(credentials: UpstashCredentials, ttlSeconds: number) {
    this.redis = new Redis({ url: credentials.url, token: credentials.token, automaticDeserialization: false });
    this.ttlSeconds = ttlSeconds;
  }

  async find(keyIdHash: string): Promise<AttestedKey | null> {
    const [publicKeyPem, storedSignCount] = await this.redis.eval<[], [string | null, string | null]>(
      READ_KEY_SCRIPT,
      [storageKey(keyIdHash)],
      [],
    );
    const signCount = Number(storedSignCount);
    if (!publicKeyPem || storedSignCount === null || !Number.isSafeInteger(signCount)) return null;
    return { publicKeyPem, signCount };
  }

  async saveIfAbsent(keyIdHash: string, publicKeyPem: string): Promise<void> {
    await this.redis.eval(SAVE_IF_ABSENT_SCRIPT, [storageKey(keyIdHash)], [publicKeyPem, String(this.ttlSeconds)]);
  }

  async advanceSignCount(keyIdHash: string, signCount: number): Promise<boolean> {
    const result = await this.redis.eval<string[], number>(
      ADVANCE_SIGN_COUNT_SCRIPT,
      [storageKey(keyIdHash)],
      [String(signCount), String(this.ttlSeconds)],
    );
    return Number(result) === SCRIPT_SUCCEEDED;
  }
}

function storageKey(keyIdHash: string): string {
  return `${ATTEST_KEY_PREFIX}:key:${keyIdHash}`;
}
