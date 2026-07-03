// Rate limiting that survives serverless cold starts.
//
// Primary: Vercel KV (Upstash Redis) via its REST API — durable across
// instances and cold starts. Called with built-in fetch, so no extra npm
// dependency is required.
//
// Fallback: an in-memory sliding window, used when KV is not configured or the
// KV call fails. This is per-instance (resets on cold start) but still bounds
// abuse within a warm instance.
//
// Required environment variables for the durable path (provided automatically
// when a Vercel KV store is linked):
//   KV_REST_API_URL
//   KV_REST_API_TOKEN

const DEFAULT_WINDOW_SECONDS = 24 * 60 * 60; // 24 hours

// Fallback store: userId -> request timestamps (ms) within the window.
const memoryWindows = new Map<string, number[]>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
}

function kvConfigured(): boolean {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

async function kvCommand(path: string): Promise<number | null> {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;

  try {
    const response = await fetch(`${url}/${path}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!response.ok) return null;
    const data = (await response.json()) as { result?: number };
    return typeof data.result === 'number' ? data.result : null;
  } catch {
    return null;
  }
}

/** Durable fixed-window counter using Redis INCR + EXPIRE. */
async function kvCheck(userId: string, limit: number, windowSeconds: number): Promise<RateLimitResult | null> {
  const key = `ratelimit:${userId}`;
  const count = await kvCommand(`incr/${encodeURIComponent(key)}`);
  if (count === null) {
    return null; // KV unavailable — caller falls back to memory.
  }
  // Set the expiry only when the window first opens.
  if (count === 1) {
    await kvCommand(`expire/${encodeURIComponent(key)}/${windowSeconds}`);
  }
  return { allowed: count <= limit, remaining: Math.max(0, limit - count) };
}

/** In-memory sliding window fallback. */
function memoryCheck(userId: string, limit: number, windowSeconds: number): RateLimitResult {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const timestamps = (memoryWindows.get(userId) ?? []).filter((t) => now - t < windowMs);

  const allowed = timestamps.length < limit;
  if (allowed) {
    timestamps.push(now);
  }

  if (timestamps.length === 0) {
    memoryWindows.delete(userId);
  } else {
    memoryWindows.set(userId, timestamps);
  }

  return { allowed, remaining: Math.max(0, limit - timestamps.length) };
}

/**
 * Record a request and report whether it is within the limit for the window.
 * Uses Vercel KV when configured, otherwise an in-memory sliding window.
 */
export async function checkRateLimit(
  userId: string,
  limit: number,
  windowSeconds: number = DEFAULT_WINDOW_SECONDS
): Promise<RateLimitResult> {
  if (kvConfigured()) {
    const result = await kvCheck(userId, limit, windowSeconds);
    if (result) return result;
  }
  return memoryCheck(userId, limit, windowSeconds);
}
