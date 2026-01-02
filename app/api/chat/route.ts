import { NextResponse } from 'next/server';

// In-memory rate limiting (Resets on server restart)
// For production, use Redis or a database.
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

const LIMITS = {
    free: 5,
    paid: 20,
};

const RESET_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

export async function POST(request: Request) {
    const userId = request.headers.get('X-User-ID');
    const userTier = (request.headers.get('X-User-Tier') || 'free') as 'free' | 'paid';
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return NextResponse.json({ error: 'API Key not configured' }, { status: 500 });
    }

    if (!userId) {
        return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Rate Limiting Logic
    const now = Date.now();
    let userRecord = rateLimitMap.get(userId);

    if (!userRecord || now - userRecord.lastReset > RESET_INTERVAL) {
        userRecord = { count: 0, lastReset: now };
    }

    const limit = LIMITS[userTier] || LIMITS.free;

    if (userRecord.count >= limit) {
        return NextResponse.json(
            { error: `Daily limit reached (${limit} searches). Upgrade for more!` },
            { status: 429 }
        );
    }

    // Increment usage
    userRecord.count += 1;
    rateLimitMap.set(userId, userRecord);

    try {
        const body = await request.json();
        const model = body.model || 'gemini-2.0-flash-lite';

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            }
        );

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error: unknown) {
        console.error('Gemini Proxy Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to proxy request';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
