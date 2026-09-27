// Registered App Attest keys, stored by SHA-256 of the key id with the public
// key and the highest assertion counter seen so far.

const MILLISECONDS_PER_SECOND = 1_000;
const MAX_IN_MEMORY_KEYS = 10_000;

export interface AttestedKey {
  publicKeyPem: string;
  signCount: number;
}

export interface AttestedKeyStore {
  find(keyIdHash: string): Promise<AttestedKey | null>;
  /**
   * Saves a newly attested key with sign count 0. An already registered key is
   * left untouched, so its counter can never be reset to allow a replay.
   */
  saveIfAbsent(keyIdHash: string, publicKeyPem: string): Promise<void>;
  /**
   * Atomically raises the stored counter and extends the key's life. False when
   * the key is unknown or signCount isn't higher than the stored one, so two
   * concurrent requests with the same assertion can't both succeed.
   */
  advanceSignCount(keyIdHash: string, signCount: number): Promise<boolean>;
}

interface StoredKey extends AttestedKey {
  expiresAtMs: number;
}

/** Per-process storage for local development only (production requires Upstash). */
export class InMemoryAttestedKeyStore implements AttestedKeyStore {
  private readonly keys = new Map<string, StoredKey>();
  private readonly ttlSeconds: number;
  private readonly now: () => number;

  constructor(ttlSeconds: number, now: () => number = Date.now) {
    this.ttlSeconds = ttlSeconds;
    this.now = now;
  }

  async find(keyIdHash: string): Promise<AttestedKey | null> {
    const key = this.liveKey(keyIdHash);
    return key ? { publicKeyPem: key.publicKeyPem, signCount: key.signCount } : null;
  }

  async saveIfAbsent(keyIdHash: string, publicKeyPem: string): Promise<void> {
    if (this.liveKey(keyIdHash)) return;
    this.keys.set(keyIdHash, { publicKeyPem, signCount: 0, expiresAtMs: this.expiry() });
    this.evictWhenFull();
  }

  async advanceSignCount(keyIdHash: string, signCount: number): Promise<boolean> {
    const key = this.liveKey(keyIdHash);
    if (!key || signCount <= key.signCount) return false;
    key.signCount = signCount;
    key.expiresAtMs = this.expiry();
    return true;
  }

  private expiry(): number {
    return this.now() + this.ttlSeconds * MILLISECONDS_PER_SECOND;
  }

  private liveKey(keyIdHash: string): StoredKey | null {
    const key = this.keys.get(keyIdHash);
    if (!key) return null;
    if (key.expiresAtMs > this.now()) return key;
    this.keys.delete(keyIdHash);
    return null;
  }

  private evictWhenFull(): void {
    for (const keyIdHash of this.keys.keys()) {
      if (this.keys.size <= MAX_IN_MEMORY_KEYS) return;
      this.keys.delete(keyIdHash);
    }
  }
}
