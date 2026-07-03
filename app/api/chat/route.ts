import { NextResponse } from 'next/server';
import { verifyFirebaseIdToken } from '@/lib/firebaseAuth';
import { checkRateLimit } from '@/lib/rateLimit';

const LIMITS = {
    free: 1000,
    paid: 10000,
};

// Only this model is permitted; prevents clients from selecting more expensive
// models or injecting arbitrary values into the upstream URL.
const ALLOWED_MODEL = 'gemini-2.0-flash-lite';

export async function POST(request: Request) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ error: 'API Key not configured' }, { status: 500 });
    }

    // Authenticate: require a valid Firebase ID token. The user identity comes
    // from the verified token, NOT from a client-supplied header (which could be
    // spoofed to impersonate users or evade rate limits).
    const authHeader = request.headers.get('Authorization') ?? '';
    const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
    if (!idToken) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    let userId: string;
    try {
        const claims = await verifyFirebaseIdToken(idToken);
        userId = claims.uid;
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Invalid token';
        if (message.includes('not configured')) {
            return NextResponse.json({ error: 'Auth not configured' }, { status: 503 });
        }
        return NextResponse.json({ error: 'Invalid authentication' }, { status: 401 });
    }

    // Tier is used only to bucket rate limits. NOTE: it is still client-supplied
    // and therefore a hint, not an entitlement — authoritative premium status
    // comes from server-side subscription verification (see verify-subscription).
    const rawTier = request.headers.get('X-User-Tier') || 'free';
    const userTier: 'free' | 'paid' = rawTier.includes('premium') || rawTier === 'paid' ? 'paid' : 'free';

    // Rate limiting, keyed on the verified uid. Durable across cold starts when
    // Vercel KV is configured; in-memory sliding window otherwise.
    const limit = LIMITS[userTier] || LIMITS.free;
    const { allowed } = await checkRateLimit(userId, limit);
    if (!allowed) {
        return NextResponse.json(
            { error: `Daily limit reached (${limit} searches). Upgrade for more!` },
            { status: 429 }
        );
    }

    try {
        const body = await request.json();

        // Enforce the model whitelist; ignore any client-provided model value.
        const requestedModel = typeof body?.model === 'string' ? body.model : ALLOWED_MODEL;
        if (requestedModel !== ALLOWED_MODEL) {
            return NextResponse.json({ error: 'Unsupported model' }, { status: 400 });
        }
        const { model: _ignoredModel, ...upstreamBody } = body ?? {};

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${ALLOWED_MODEL}:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(upstreamBody),
            }
        );

        const data = await response.json();

        // Never forward upstream error payloads to clients — they leak provider
        // internals (key status, service names). Log server-side and return a
        // generic message instead.
        if (!response.ok) {
            console.error('Gemini upstream error:', response.status, JSON.stringify(data));
            const friendlyMessage =
                response.status === 429
                    ? 'The AI service is busy right now. Please try again in a moment.'
                    : 'The AI service is temporarily unavailable. Please try again later.';
            return NextResponse.json({ error: friendlyMessage }, { status: 502 });
        }

        return NextResponse.json(data, { status: 200 });
    } catch (error: unknown) {
        console.error('Gemini Proxy Error:', error);
        return NextResponse.json({ error: 'Failed to proxy request' }, { status: 500 });
    }
}
