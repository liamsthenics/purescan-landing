import { NextResponse } from 'next/server';
import { verifyTransaction } from '@/lib/appStoreServer';

// Server-side subscription verification.
//
// The client sends a StoreKit transaction id; the server independently confirms
// the subscription status with Apple's App Store Server API. This removes the
// client's ability to self-report its tier (previously trusted blindly).
//
// NOTE: once Firebase Admin is wired up (see the proxy auth work), this route
// should also (1) verify the caller's Firebase ID token and (2) persist the
// verified status to that user's Firestore document, so the rest of the backend
// can trust it without re-querying Apple.
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const transactionId = body?.transactionId;

    if (!transactionId || typeof transactionId !== 'string') {
      return NextResponse.json({ error: 'transactionId is required' }, { status: 400 });
    }

    const result = await verifyTransaction(transactionId);
    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Verification failed';
    console.error('verify-subscription error:', message);
    // 503 when the server is missing Apple credentials; 500 for other failures.
    const status = message.includes('not configured') ? 503 : 500;
    return NextResponse.json({ error: 'Subscription verification failed' }, { status });
  }
}
