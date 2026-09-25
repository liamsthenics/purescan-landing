// Whether a verified StoreKit transaction grants PureScan Premium right now.
import { APPLE_APP } from "./config.ts";

/** The fields of Apple's decoded transaction payload that decide access. */
export interface TransactionClaims {
  bundleId?: string;
  productId?: string;
  originalTransactionId?: string;
  expiresDate?: number;
  revocationDate?: number;
}

export type EntitlementFailure =
  | "missing"
  | "malformed"
  | "invalid_signature"
  | "wrong_app"
  | "wrong_product"
  | "expired"
  | "revoked"
  | "missing_transaction_id"
  /** Apple's certificate checks couldn't be completed (a network problem), so try again later. */
  | "verification_unavailable";

export type EntitlementResult =
  | { isEntitled: true; originalTransactionId: string }
  | { isEntitled: false; failure: EntitlementFailure };

export interface PremiumVerifier {
  verify(signedTransaction: string | null): Promise<EntitlementResult>;
}

const PREMIUM_PRODUCT_IDS: ReadonlySet<string> = new Set(APPLE_APP.premiumProductIds);

export function notEntitled(failure: EntitlementFailure): EntitlementResult {
  return { isEntitled: false, failure };
}

/** Checks a transaction whose signature has already been verified. */
export function evaluateEntitlement(claims: TransactionClaims, nowMs: number): EntitlementResult {
  if (claims.bundleId !== APPLE_APP.bundleId) return notEntitled("wrong_app");
  if (!claims.productId || !PREMIUM_PRODUCT_IDS.has(claims.productId)) return notEntitled("wrong_product");
  if (claims.revocationDate !== undefined) return notEntitled("revoked");
  if (claims.expiresDate === undefined || claims.expiresDate <= nowMs) return notEntitled("expired");
  if (!claims.originalTransactionId) return notEntitled("missing_transaction_id");
  return { isEntitled: true, originalTransactionId: claims.originalTransactionId };
}
