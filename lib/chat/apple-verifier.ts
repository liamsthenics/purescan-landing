// Verifies the StoreKit 2 transaction JWS sent in X-PureScan-Transaction with
// Apple's App Store Server Library: Production first, then Sandbox when Apple
// reports an environment mismatch (TestFlight and App Review use Sandbox).
import {
  Environment,
  SignedDataVerifier,
  VerificationException,
  VerificationStatus,
} from "@apple/app-store-server-library";
import { APPLE_APP } from "./config.ts";
import {
  evaluateEntitlement,
  notEntitled,
  type EntitlementResult,
  type PremiumVerifier,
  type TransactionClaims,
} from "./entitlement.ts";

/** A signed transaction with its certificate chain is a few KB; anything far larger isn't one. */
const MAX_SIGNED_TRANSACTION_LENGTH = 16 * 1024;
const COMPACT_JWS_PATTERN = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;
/** Check certificate revocation with Apple (OCSP). The library caches verified chains. */
const ENABLE_ONLINE_CHECKS = true;

export interface TransactionDecoder {
  verifyAndDecodeTransaction(signedTransaction: string): Promise<TransactionClaims>;
}

type DecodeOutcome =
  | { kind: "verified"; claims: TransactionClaims }
  | { kind: "wrong_environment" }
  | { kind: "retryable" }
  | { kind: "invalid" };

async function decodeWith(decoder: TransactionDecoder, signedTransaction: string): Promise<DecodeOutcome> {
  try {
    return { kind: "verified", claims: await decoder.verifyAndDecodeTransaction(signedTransaction) };
  } catch (error) {
    if (!(error instanceof VerificationException)) return { kind: "invalid" };
    if (error.status === VerificationStatus.INVALID_ENVIRONMENT) return { kind: "wrong_environment" };
    if (error.status === VerificationStatus.RETRYABLE_VERIFICATION_FAILURE) return { kind: "retryable" };
    return { kind: "invalid" };
  }
}

export interface AppleTransactionVerifierOptions {
  production: TransactionDecoder;
  sandbox: TransactionDecoder;
  now?: () => number;
}

export class AppleTransactionVerifier implements PremiumVerifier {
  private readonly production: TransactionDecoder;
  private readonly sandbox: TransactionDecoder;
  private readonly now: () => number;

  constructor(options: AppleTransactionVerifierOptions) {
    this.production = options.production;
    this.sandbox = options.sandbox;
    this.now = options.now ?? Date.now;
  }

  async verify(signedTransaction: string | null): Promise<EntitlementResult> {
    if (!signedTransaction) return notEntitled("missing");
    if (signedTransaction.length > MAX_SIGNED_TRANSACTION_LENGTH || !COMPACT_JWS_PATTERN.test(signedTransaction)) {
      return notEntitled("malformed");
    }
    const outcome = await this.decode(signedTransaction);
    if (outcome.kind === "retryable") return notEntitled("verification_unavailable");
    if (outcome.kind !== "verified") return notEntitled("invalid_signature");
    return evaluateEntitlement(outcome.claims, this.now());
  }

  private async decode(signedTransaction: string): Promise<DecodeOutcome> {
    const production = await decodeWith(this.production, signedTransaction);
    if (production.kind !== "wrong_environment") return production;
    return decodeWith(this.sandbox, signedTransaction);
  }
}

/** The real verifier, trusting only Apple's bundled root certificates. */
export function createAppleTransactionVerifier(appleRootCertificates: Buffer[]): AppleTransactionVerifier {
  const verifierFor = (environment: Environment) =>
    new SignedDataVerifier(
      appleRootCertificates,
      ENABLE_ONLINE_CHECKS,
      environment,
      APPLE_APP.bundleId,
      APPLE_APP.appAppleId,
    );
  return new AppleTransactionVerifier({
    production: verifierFor(Environment.PRODUCTION),
    sandbox: verifierFor(Environment.SANDBOX),
  });
}
