// Turns the model's text stream into chat events. The system prompt tells the
// model to reply exactly OUT_OF_SCOPE_SENTINEL for out-of-scope questions, so
// the first characters are held back until we know whether it did.
import type { ChatStreamEvent } from "./sse.ts";

export const OUT_OF_SCOPE_SENTINEL = "[[OUT_OF_SCOPE]]";
/** Enough characters to see the whole sentinel, plus a little leading whitespace. */
export const SENTINEL_BUFFER_CHARACTERS = 20;
export const OUT_OF_SCOPE_REFUSAL =
  "I can only help with questions about food, ingredients, nutrition and how PureScan scores products.";

export class EmptyAnswerError extends Error {
  constructor() {
    super("The model returned no text");
    this.name = "EmptyAnswerError";
  }
}

function containsSentinel(text: string): boolean {
  return text.includes(OUT_OF_SCOPE_SENTINEL);
}

/** True while the text could still turn out to be the sentinel ("  [[OUT_OF_SC…"). */
function couldBecomeSentinel(text: string): boolean {
  const trimmed = text.trimStart();
  return trimmed.length < OUT_OF_SCOPE_SENTINEL.length && OUT_OF_SCOPE_SENTINEL.startsWith(trimmed);
}

/** A stray sentinel later in an answer is removed rather than shown. */
function withoutSentinel(text: string): string {
  return text.split(OUT_OF_SCOPE_SENTINEL).join("");
}

/**
 * Yields delta events (or a single refusal) and then done. Returning early
 * after a refusal stops the upstream stream, so the rest isn't generated.
 */
export async function* answerEvents(
  textChunks: AsyncIterable<string>,
  remaining: number,
): AsyncGenerator<ChatStreamEvent> {
  const done: ChatStreamEvent = { type: "done", remaining };
  const refusal: ChatStreamEvent = { type: "refusal", text: OUT_OF_SCOPE_REFUSAL };
  let heldBack = "";
  let isPassingThrough = false;

  for await (const chunk of textChunks) {
    if (isPassingThrough) {
      const text = withoutSentinel(chunk);
      if (text) yield { type: "delta", text };
      continue;
    }
    heldBack += chunk;
    if (heldBack.length < SENTINEL_BUFFER_CHARACTERS || couldBecomeSentinel(heldBack)) continue;
    if (containsSentinel(heldBack)) {
      yield refusal;
      yield done;
      return;
    }
    isPassingThrough = true;
    yield { type: "delta", text: heldBack };
  }

  if (!isPassingThrough) {
    if (containsSentinel(heldBack)) yield refusal;
    else if (heldBack.trim()) yield { type: "delta", text: heldBack };
    else throw new EmptyAnswerError();
  }
  yield done;
}
