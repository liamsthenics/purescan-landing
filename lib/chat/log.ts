// Operational logging for Ask PureScan. Only fixed event names and error class
// names are ever logged: never questions, answers, product data, transaction
// IDs or IP addresses.

export type ChatLogEvent =
  | "setup_failed"
  | "verification_unavailable"
  | "global_cap_reached"
  | "upstream_failed"
  | "upstream_stream_failed"
  | "unexpected_error"
  | "input_screened"
  | "answer_refused"
  | "refusal_limit_reached"
  | "refusal_not_recorded";

export type ChatLogger = (event: ChatLogEvent, error?: unknown) => void;

function errorName(error: unknown): string {
  return error instanceof Error ? error.name : "unknown";
}

export const consoleChatLogger: ChatLogger = (event, error) => {
  const suffix = error === undefined ? "" : ` (${errorName(error)})`;
  console.warn(`[ask-purescan] ${event}${suffix}`);
};
