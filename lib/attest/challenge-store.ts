// One-time App Attest challenges: random, short-lived and consumed atomically,
// so an attestation can't be replayed with an old or reused challenge.
import { randomBytes } from "node:crypto";
import type { KeyValueStore } from "../store/key-value-store.ts";
import { ATTEST_KEY_PREFIX, CHALLENGE_RANDOM_BYTES, CHALLENGE_TTL_SECONDS } from "./config.ts";

/** 32 bytes as unpadded base64url is exactly 43 characters. */
export const CHALLENGE_PATTERN = /^[A-Za-z0-9_-]{43}$/;
const ISSUED_MARKER = "1";

export type RandomBytesSource = (size: number) => Buffer;

export class AttestChallengeStore {
  private readonly store: KeyValueStore;
  private readonly generateRandomBytes: RandomBytesSource;

  constructor(store: KeyValueStore, generateRandomBytes: RandomBytesSource = randomBytes) {
    this.store = store;
    this.generateRandomBytes = generateRandomBytes;
  }

  async issue(): Promise<string> {
    const challenge = this.generateRandomBytes(CHALLENGE_RANDOM_BYTES).toString("base64url");
    await this.store.set(challengeKey(challenge), ISSUED_MARKER, CHALLENGE_TTL_SECONDS);
    return challenge;
  }

  /** True only the first time an unexpired, issued challenge is presented. */
  async consume(challenge: string): Promise<boolean> {
    if (!CHALLENGE_PATTERN.test(challenge)) return false;
    return (await this.store.getAndDelete(challengeKey(challenge))) !== null;
  }
}

function challengeKey(challenge: string): string {
  return `${ATTEST_KEY_PREFIX}:challenge:${challenge}`;
}
