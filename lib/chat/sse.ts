// The Ask PureScan stream: one JSON object per `data:` line (docs/chat-api.md).

export type ChatStreamEvent =
  | { type: "delta"; text: string }
  | { type: "refusal"; text: string }
  | { type: "done"; remaining: number };

/** JSON.stringify escapes newlines, so each event is always a single data line. */
export function formatSseEvent(event: ChatStreamEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

export const SSE_HEADERS: Readonly<Record<string, string>> = {
  "Content-Type": "text/event-stream; charset=utf-8",
  "Cache-Control": "no-store, no-transform",
  "X-Accel-Buffering": "no",
};
