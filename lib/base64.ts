// Strict base64 decoding. Node's Buffer.from(text, "base64") silently skips
// invalid characters, so input from clients is checked against the alphabet first.

const STANDARD_BASE64 = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
const BASE64_GROUP_CHARACTERS = 4;
const BASE64_GROUP_BYTES = 3;

/** The longest base64 text (with padding) that can decode to at most maxBytes. */
export function maxBase64Length(maxBytes: number): number {
  return Math.ceil(maxBytes / BASE64_GROUP_BYTES) * BASE64_GROUP_CHARACTERS;
}

/** Decodes standard, padded base64 with no whitespace; null if the text isn't exactly that. */
export function decodeStrictBase64(text: string): Buffer | null {
  return text.length > 0 && STANDARD_BASE64.test(text) ? Buffer.from(text, "base64") : null;
}
