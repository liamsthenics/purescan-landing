import { createHmac, randomBytes } from "node:crypto";

/** Turns a transaction ID or IP address into an opaque rate-limit key. */
export type IdentifierHasher = (identifier: string) => string;

const GENERATED_SECRET_BYTES = 32;

/**
 * One-way keyed hash (HMAC-SHA256, hex). The secret stops anyone who can read
 * the rate-limit store from recovering IPs or transaction IDs by hashing
 * every possible value.
 */
export function createIdentifierHasher(secret: string): IdentifierHasher {
  return (identifier) => createHmac("sha256", secret).update(identifier, "utf8").digest("hex");
}

/** A secret for this process only: fine for in-memory limits, which are per instance anyway. */
export function generateHashSecret(): string {
  return randomBytes(GENERATED_SECRET_BYTES).toString("hex");
}
