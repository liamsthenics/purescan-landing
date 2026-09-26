// Turns the model's text stream into chat events. Text is held back by a few
// characters so the output guard can catch the out-of-scope sentinel, prompt
// leaks or code before any of it is shown. A refusal after some text has
// streamed replaces that text in the app (docs/chat-api.md).
import { OUTPUT_HOLDBACK_CHARACTERS, breaksOutputPolicy } from "./output-guard.ts";
import type { ChatStreamEvent } from "./sse.ts";

export const OUT_OF_SCOPE_SENTINEL = "[[OUT_OF_SCOPE]]";
export const OUT_OF_SCOPE_REFUSAL =
  "I can only help with questions about food, ingredients, nutrition and how PureScan scores products.";

export class EmptyAnswerError extends Error {
  constructor() {
    super("The model returned no text");
    this.name = "EmptyAnswerError";
  }
}

export function refusalEvents(remaining: number): ChatStreamEvent[] {
  return [
    { type: "refusal", text: OUT_OF_SCOPE_REFUSAL },
    { type: "done", remaining },
  ];
}

/**
 * Yields delta events (or a refusal) and then done. Returning early after a
 * refusal stops the upstream stream, so the rest isn't generated.
 */
export async function* answerEvents(
  textChunks: AsyncIterable<string>,
  remaining: number,
): AsyncGenerator<ChatStreamEvent> {
  let shown = "";
  let pending = "";
  for await (const chunk of textChunks) {
    pending += chunk;
    // Earlier text was already checked; a marker can only span the boundary.
    if (breaksOutputPolicy(shown.slice(-OUTPUT_HOLDBACK_CHARACTERS) + pending)) {
      yield* refusalEvents(remaining);
      return;
    }
    const releasable = pending.length - OUTPUT_HOLDBACK_CHARACTERS;
    if (releasable > 0) {
      const text = pending.slice(0, releasable);
      pending = pending.slice(releasable);
      shown += text;
      yield { type: "delta", text };
    }
  }
  if (!(shown + pending).trim()) throw new EmptyAnswerError();
  if (pending) yield { type: "delta", text: pending };
  yield { type: "done", remaining };
}
