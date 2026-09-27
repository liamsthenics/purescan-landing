// HTTP helpers for the API routes: error responses, body size limit and client IP.

export type ChatErrorCode = "invalid_request" | "premium_required" | "rate_limited" | "unavailable";

const ERROR_STATUS: Record<ChatErrorCode, number> = {
  invalid_request: 400,
  premium_required: 401,
  rate_limited: 429,
  unavailable: 503,
};

/** User-facing and deliberately generic: nothing about internals. */
export const ERROR_MESSAGES: Record<ChatErrorCode, string> = {
  invalid_request: "That question couldn’t be sent. Please check it and try again.",
  premium_required: "Ask PureScan is part of PureScan Premium.",
  rate_limited: "You’ve asked a lot of questions. Please try again in a little while.",
  unavailable: "Ask PureScan isn’t available right now. Please try again later.",
};

export interface ErrorDetails {
  status: number;
  code: string;
  message: string;
  retryAfterSeconds?: number;
}

/** `{"error": code, "message": ...}`, never cached, with Retry-After when given. Shared by every API route. */
export function jsonErrorResponse({ status, code, message, retryAfterSeconds }: ErrorDetails): Response {
  const headers: Record<string, string> = { "Cache-Control": "no-store" };
  if (retryAfterSeconds !== undefined) headers["Retry-After"] = String(retryAfterSeconds);
  const body = {
    error: code,
    message,
    ...(retryAfterSeconds !== undefined ? { retryAfter: retryAfterSeconds } : {}),
  };
  return Response.json(body, { status, headers });
}

export function errorResponse(code: ChatErrorCode, retryAfterSeconds?: number): Response {
  return jsonErrorResponse({ status: ERROR_STATUS[code], code, message: ERROR_MESSAGES[code], retryAfterSeconds });
}

function concatenate(chunks: readonly Uint8Array[], totalBytes: number): Uint8Array {
  const joined = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    joined.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return joined;
}

/**
 * Reads the raw body bytes, or returns null when it is missing or larger than
 * maxBytes (checked while reading, not just from Content-Length).
 */
export async function readBodyBytesWithLimit(request: Request, maxBytes: number): Promise<Uint8Array | null> {
  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) return null;
  if (!request.body) return null;

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    totalBytes += value.byteLength;
    if (totalBytes > maxBytes) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  return concatenate(chunks, totalBytes);
}

/** Strict UTF-8 decoding: null for invalid byte sequences. */
export function decodeUtf8(bytes: Uint8Array): string | null {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return null;
  }
}

/**
 * Reads the body as UTF-8, or returns null when it is missing, larger than
 * maxBytes (checked while reading, not just from Content-Length) or not valid UTF-8.
 */
export async function readBodyWithLimit(request: Request, maxBytes: number): Promise<string | null> {
  const bytes = await readBodyBytesWithLimit(request, maxBytes);
  return bytes === null ? null : decodeUtf8(bytes);
}

export const UNKNOWN_CLIENT_IP = "unknown";
const MAX_IP_LENGTH = 45;
const IP_CHARACTERS = /^[0-9A-Fa-f:.]+$/;

/**
 * The caller's IP. On Vercel, x-forwarded-for is set by the platform (a
 * client-supplied value is overwritten), so its first entry can be trusted.
 */
export function clientIpAddress(headers: Headers): string {
  const candidate = headers.get("x-forwarded-for")?.split(",")[0]?.trim() || headers.get("x-real-ip")?.trim() || "";
  return candidate.length <= MAX_IP_LENGTH && IP_CHARACTERS.test(candidate) ? candidate : UNKNOWN_CLIENT_IP;
}
