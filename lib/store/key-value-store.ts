// A small string key-value store with expiry, used for App Attest challenges
// and saved label readings.

const MILLISECONDS_PER_SECOND = 1_000;
/** Stops the in-memory store growing without bound under a flood of new keys. */
const MAX_IN_MEMORY_ENTRIES = 10_000;

export interface KeyValueStore {
  get(key: string): Promise<string | null>;
  /** Stores the value, replacing any existing one; it expires after ttlSeconds. */
  set(key: string, value: string, ttlSeconds: number): Promise<void>;
  /** Reads and removes the value in one atomic step, so only one caller can ever get it. */
  getAndDelete(key: string): Promise<string | null>;
}

interface StoredValue {
  value: string;
  expiresAtMs: number;
}

/**
 * Per-process storage for local development only: on serverless hosting each
 * instance has its own copy, so production requires Upstash.
 */
export class InMemoryKeyValueStore implements KeyValueStore {
  private readonly entries = new Map<string, StoredValue>();
  private readonly now: () => number;

  constructor(now: () => number = Date.now) {
    this.now = now;
  }

  async get(key: string): Promise<string | null> {
    return this.liveEntry(key)?.value ?? null;
  }

  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    this.entries.delete(key);
    this.entries.set(key, { value, expiresAtMs: this.now() + ttlSeconds * MILLISECONDS_PER_SECOND });
    this.evictWhenFull();
  }

  async getAndDelete(key: string): Promise<string | null> {
    const entry = this.liveEntry(key);
    this.entries.delete(key);
    return entry?.value ?? null;
  }

  private liveEntry(key: string): StoredValue | null {
    const entry = this.entries.get(key);
    if (!entry) return null;
    if (entry.expiresAtMs > this.now()) return entry;
    this.entries.delete(key);
    return null;
  }

  /** Map keeps insertion order, so the first entries are the oldest. */
  private evictWhenFull(): void {
    for (const key of this.entries.keys()) {
      if (this.entries.size <= MAX_IN_MEMORY_ENTRIES) return;
      this.entries.delete(key);
    }
  }
}
