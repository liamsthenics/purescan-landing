import crypto from 'crypto';

// Minimal App Store Server API client for verifying subscription status with
// Apple, using only Node's built-in crypto (no external dependency). This makes
// the server — not the client — the source of truth for a user's entitlement.
//
// Required environment variables (see .env.example):
//   APP_STORE_ISSUER_ID   - Issuer ID from App Store Connect (Users and Access > Keys)
//   APP_STORE_KEY_ID      - Key ID of the in-app purchase API key
//   APP_STORE_PRIVATE_KEY - Contents of the .p8 private key (PEM, newlines may be \n-escaped)
//   APP_STORE_BUNDLE_ID   - The app's bundle identifier (e.g. com.purescan.app)

const APPLE_PRODUCTION = 'https://api.storekit.itunes.apple.com';
const APPLE_SANDBOX = 'https://api.storekit-sandbox.itunes.apple.com';

// Apple subscription status codes returned in lastTransactions[].status
const STATUS_ACTIVE = 1;
const STATUS_GRACE_PERIOD = 4;

// Apple error code for a transaction id that does not exist in the queried
// environment (typically a sandbox transaction queried against production).
const ERROR_TRANSACTION_ID_NOT_FOUND = 4040010;

export interface VerifiedSubscription {
  isActive: boolean;
  productId: string | null;
  expiresDate: number | null; // epoch milliseconds
  status: number | null; // Apple status: 1 active, 2 expired, 3 retry, 4 grace, 5 revoked
  environment: 'Production' | 'Sandbox';
}

interface AppStoreCredentials {
  issuerId: string;
  keyId: string;
  privateKey: string;
  bundleId: string;
}

interface SignedTransactionInfo {
  productId?: string;
  expiresDate?: number;
  bundleId?: string;
}

function getCredentials(): AppStoreCredentials | null {
  const issuerId = process.env.APP_STORE_ISSUER_ID;
  const keyId = process.env.APP_STORE_KEY_ID;
  const privateKey = process.env.APP_STORE_PRIVATE_KEY;
  const bundleId = process.env.APP_STORE_BUNDLE_ID;

  if (!issuerId || !keyId || !privateKey || !bundleId) {
    return null;
  }

  return {
    issuerId,
    keyId,
    // Allow the private key to be stored with escaped newlines in env vars.
    privateKey: privateKey.replace(/\\n/g, '\n'),
    bundleId,
  };
}

function base64url(input: Buffer | string): string {
  return Buffer.from(input).toString('base64url');
}

/**
 * Generate an ES256-signed JWT for App Store Server API authorization.
 * `dsaEncoding: 'ieee-p1363'` produces the raw R||S signature JOSE requires
 * (Node's default DER encoding would be rejected by Apple).
 */
function generateToken(credentials: AppStoreCredentials): string {
  const header = { alg: 'ES256', kid: credentials.keyId, typ: 'JWT' };
  const issuedAt = Math.floor(Date.now() / 1000);
  const payload = {
    iss: credentials.issuerId,
    iat: issuedAt,
    exp: issuedAt + 60 * 15, // 15 minutes (Apple allows up to 20)
    aud: 'appstoreconnect-v1',
    bid: credentials.bundleId,
  };

  const signingInput = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(payload))}`;
  const privateKeyObject = crypto.createPrivateKey(credentials.privateKey);
  const signature = crypto.sign('sha256', Buffer.from(signingInput), {
    key: privateKeyObject,
    dsaEncoding: 'ieee-p1363',
  });

  return `${signingInput}.${base64url(signature)}`;
}

/** Decode the payload segment of a JWS without verifying the signature chain. */
function decodeJWSPayload<T>(jws: string | undefined): T | null {
  if (!jws) return null;
  const segments = jws.split('.');
  if (segments.length !== 3) return null;
  try {
    return JSON.parse(Buffer.from(segments[1], 'base64url').toString('utf8')) as T;
  } catch {
    return null;
  }
}

function statusUrl(baseUrl: string, transactionId: string): string {
  return `${baseUrl}/inApps/v1/subscriptions/${encodeURIComponent(transactionId)}`;
}

/**
 * Verify a StoreKit transaction id against Apple and return a normalized
 * subscription status. Tries production first, then sandbox if the transaction
 * is not found there.
 *
 * @throws if credentials are not configured or Apple returns an error.
 */
export async function verifyTransaction(transactionId: string): Promise<VerifiedSubscription> {
  const credentials = getCredentials();
  if (!credentials) {
    throw new Error('App Store Server API credentials are not configured');
  }

  const token = generateToken(credentials);

  let environment: 'Production' | 'Sandbox' = 'Production';
  let response = await fetch(statusUrl(APPLE_PRODUCTION, transactionId), {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (response.status === 404) {
    const errorBody = await response.clone().json().catch(() => null);
    if (errorBody?.errorCode === ERROR_TRANSACTION_ID_NOT_FOUND) {
      environment = 'Sandbox';
      response = await fetch(statusUrl(APPLE_SANDBOX, transactionId), {
        headers: { Authorization: `Bearer ${token}` },
      });
    }
  }

  if (!response.ok) {
    throw new Error(`App Store Server API error: ${response.status}`);
  }

  const data = await response.json();
  const groups: Array<{ lastTransactions?: Array<{ status?: number; signedTransactionInfo?: string }> }> =
    data?.data ?? [];

  for (const group of groups) {
    for (const last of group.lastTransactions ?? []) {
      const info = decodeJWSPayload<SignedTransactionInfo>(last.signedTransactionInfo);
      const status = typeof last.status === 'number' ? last.status : null;
      const expiresDate = info?.expiresDate ?? null;
      const notExpired = expiresDate == null ? true : expiresDate > Date.now();
      const isActive = (status === STATUS_ACTIVE || status === STATUS_GRACE_PERIOD) && notExpired;

      return {
        isActive,
        productId: info?.productId ?? null,
        expiresDate,
        status,
        environment,
      };
    }
  }

  return { isActive: false, productId: null, expiresDate: null, status: null, environment };
}
