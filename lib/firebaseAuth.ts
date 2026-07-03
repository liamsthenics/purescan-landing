import crypto from 'crypto';

// Dependency-free verification of Firebase Authentication ID tokens.
//
// Firebase ID tokens are RS256 JWTs signed by Google. We verify them against
// Google's public x509 certificates (no firebase-admin / service account key
// needed — only the project id). This is well-suited to serverless deploys.
//
// Required environment variable:
//   FIREBASE_PROJECT_ID - the Firebase project id (e.g. purescan-ios)

const CERT_URL =
  'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';

interface CertCache {
  certs: Record<string, string>;
  expiresAt: number;
}

let certCache: CertCache | null = null;

interface FirebaseTokenClaims {
  uid: string;
  email?: string;
}

interface DecodedHeader {
  alg?: string;
  kid?: string;
}

interface DecodedPayload {
  iss?: string;
  aud?: string;
  exp?: number;
  iat?: number;
  sub?: string;
  email?: string;
}

function base64urlToBuffer(input: string): Buffer {
  return Buffer.from(input, 'base64url');
}

function decodeSegment<T>(segment: string): T | null {
  try {
    return JSON.parse(base64urlToBuffer(segment).toString('utf8')) as T;
  } catch {
    return null;
  }
}

/** Fetch and cache Google's signing certificates, honoring Cache-Control. */
async function getCerts(): Promise<Record<string, string>> {
  if (certCache && certCache.expiresAt > Date.now()) {
    return certCache.certs;
  }

  const response = await fetch(CERT_URL);
  if (!response.ok) {
    throw new Error('Failed to fetch Google signing certificates');
  }

  const certs = (await response.json()) as Record<string, string>;

  // Respect max-age so we are not refetching on every request.
  const cacheControl = response.headers.get('cache-control') ?? '';
  const maxAgeMatch = cacheControl.match(/max-age=(\d+)/);
  const maxAgeSeconds = maxAgeMatch ? parseInt(maxAgeMatch[1], 10) : 3600;
  certCache = { certs, expiresAt: Date.now() + maxAgeSeconds * 1000 };

  return certs;
}

/**
 * Verify a Firebase ID token and return its claims, or throw if invalid.
 * Validates the RS256 signature against Google's certs and checks the
 * issuer, audience, and expiry against the configured project.
 */
export async function verifyFirebaseIdToken(token: string): Promise<FirebaseTokenClaims> {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  if (!projectId) {
    throw new Error('FIREBASE_PROJECT_ID is not configured');
  }

  const segments = token.split('.');
  if (segments.length !== 3) {
    throw new Error('Malformed token');
  }

  const header = decodeSegment<DecodedHeader>(segments[0]);
  const payload = decodeSegment<DecodedPayload>(segments[1]);
  if (!header || !payload) {
    throw new Error('Malformed token');
  }

  if (header.alg !== 'RS256' || !header.kid) {
    throw new Error('Unexpected token algorithm');
  }

  // Claim checks (Firebase ID token spec).
  const now = Math.floor(Date.now() / 1000);
  if (!payload.sub) {
    throw new Error('Missing subject');
  }
  if (payload.aud !== projectId) {
    throw new Error('Invalid audience');
  }
  if (payload.iss !== `https://securetoken.google.com/${projectId}`) {
    throw new Error('Invalid issuer');
  }
  if (!payload.exp || payload.exp <= now) {
    throw new Error('Token expired');
  }
  if (!payload.iat || payload.iat > now + 300) {
    throw new Error('Invalid issued-at');
  }

  // Signature verification against the matching Google certificate.
  const certs = await getCerts();
  const cert = certs[header.kid];
  if (!cert) {
    throw new Error('Unknown signing key');
  }

  const publicKey = crypto.createPublicKey(cert);
  const verifier = crypto.createVerify('RSA-SHA256');
  verifier.update(`${segments[0]}.${segments[1]}`);
  verifier.end();

  const signatureValid = verifier.verify(publicKey, base64urlToBuffer(segments[2]));
  if (!signatureValid) {
    throw new Error('Invalid signature');
  }

  return { uid: payload.sub, email: payload.email };
}
