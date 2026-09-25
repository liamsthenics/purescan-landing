import { test } from "node:test";
import assert from "node:assert/strict";
import {
  EmptyAnswerError,
  OUT_OF_SCOPE_REFUSAL,
  OUT_OF_SCOPE_SENTINEL,
  answerEvents,
} from "../lib/chat/answer-events.ts";
import { formatSseEvent, type ChatStreamEvent } from "../lib/chat/sse.ts";

interface FakeUpstream {
  chunks: AsyncGenerator<string>;
  /** How many chunks the consumer pulled. */
  pulled: () => number;
  wasStopped: () => boolean;
}

function upstream(chunks: readonly string[]): FakeUpstream {
  let pulled = 0;
  let wasStopped = false;
  async function* generate() {
    let finished = false;
    try {
      for (const chunk of chunks) {
        pulled += 1;
        yield chunk;
      }
      finished = true;
    } finally {
      wasStopped = !finished;
    }
  }
  return { chunks: generate(), pulled: () => pulled, wasStopped: () => wasStopped };
}

async function collect(events: AsyncIterable<ChatStreamEvent>): Promise<ChatStreamEvent[]> {
  const collected: ChatStreamEvent[] = [];
  for await (const event of events) collected.push(event);
  return collected;
}

test("SSE events are single JSON data lines", () => {
  assert.equal(formatSseEvent({ type: "delta", text: "E150d is a caramel colour" }), 'data: {"type":"delta","text":"E150d is a caramel colour"}\n\n');
  assert.equal(formatSseEvent({ type: "done", remaining: 27 }), 'data: {"type":"done","remaining":27}\n\n');
  assert.equal(formatSseEvent({ type: "delta", text: "line one\nline two" }), 'data: {"type":"delta","text":"line one\\nline two"}\n\n');
});

test("holds back the first 20 characters, then streams the rest as it comes", async () => {
  const events = await collect(
    answerEvents(upstream(["E150d is a ", "caramel colour ", "made with ", "ammonia."]).chunks, 27),
  );
  assert.deepEqual(events, [
    { type: "delta", text: "E150d is a caramel colour " },
    { type: "delta", text: "made with " },
    { type: "delta", text: "ammonia." },
    { type: "done", remaining: 27 },
  ]);
});

test("replaces the out-of-scope sentinel with the canned refusal and stops the model", async () => {
  const model = upstream(["[[OUT_", "OF_SCOPE", "]]", " and then some leaked text", " more"]);
  const events = await collect(answerEvents(model.chunks, 5));
  assert.deepEqual(events, [
    { type: "refusal", text: OUT_OF_SCOPE_REFUSAL },
    { type: "done", remaining: 5 },
  ]);
  assert.ok(model.wasStopped());
  assert.ok(model.pulled() < 5);
});

test("keeps holding back while leading whitespace could still become the sentinel", async () => {
  const events = await collect(answerEvents(upstream(["            [[OUT_OF_SCOPE", "]]"]).chunks, 2));
  assert.deepEqual(events, [
    { type: "refusal", text: OUT_OF_SCOPE_REFUSAL },
    { type: "done", remaining: 2 },
  ]);
});

test("a stray sentinel later in an answer isn't shown", async () => {
  const events = await collect(
    answerEvents(upstream(["E150d is a caramel colour. ", "[[OUT_OF_SCOPE]]", "More."]).chunks, 2),
  );
  assert.deepEqual(events, [
    { type: "delta", text: "E150d is a caramel colour. " },
    { type: "delta", text: "More." },
    { type: "done", remaining: 2 },
  ]);
});

test("detects a sentinel-only answer shorter than the buffer", async () => {
  const events = await collect(answerEvents(upstream([` ${OUT_OF_SCOPE_SENTINEL}`]).chunks, 1));
  assert.deepEqual(events, [
    { type: "refusal", text: OUT_OF_SCOPE_REFUSAL },
    { type: "done", remaining: 1 },
  ]);
});

test("short answers are still sent", async () => {
  const events = await collect(answerEvents(upstream(["Yes, it is."]).chunks, 3));
  assert.deepEqual(events, [
    { type: "delta", text: "Yes, it is." },
    { type: "done", remaining: 3 },
  ]);
});

test("an empty answer is an error, not a blank reply", async () => {
  await assert.rejects(collect(answerEvents(upstream(["", "  "]).chunks, 3)), EmptyAnswerError);
});
