// Error and success responses for the label and attestation routes.
import { jsonErrorResponse } from "../chat/http.ts";

export type LabelErrorCode =
  | "invalid_request"
  | "attestation_required"
  | "not_found"
  | "unreadable"
  | "rate_limited"
  | "unavailable";

const ERROR_STATUS: Record<LabelErrorCode, number> = {
  invalid_request: 400,
  attestation_required: 401,
  not_found: 404,
  unreadable: 422,
  rate_limited: 429,
  unavailable: 503,
};

/** User-facing and deliberately generic: nothing about internals. */
export const LABEL_ERROR_MESSAGES: Record<LabelErrorCode, string> = {
  invalid_request: "That request couldn’t be read. Please check it and try again.",
  attestation_required: "This device couldn’t be verified. Please try again.",
  not_found: "There’s no saved label reading for this product yet.",
  unreadable: "We couldn’t read a food label in that photo. Please try a clearer photo of the label.",
  rate_limited: "Too many requests. Please try again in a little while.",
  unavailable: "Label reading isn’t available right now. Please try again later.",
};

export function labelErrorResponse(code: LabelErrorCode, retryAfterSeconds?: number): Response {
  return jsonErrorResponse({
    status: ERROR_STATUS[code],
    code,
    message: LABEL_ERROR_MESSAGES[code],
    retryAfterSeconds,
  });
}

const NO_STORE_HEADERS = { "Cache-Control": "no-store" } as const;
const NO_CONTENT_STATUS = 204;

export function jsonResponse(body: unknown): Response {
  return Response.json(body, { headers: NO_STORE_HEADERS });
}

export function noContentResponse(): Response {
  return new Response(null, { status: NO_CONTENT_STATUS, headers: NO_STORE_HEADERS });
}
