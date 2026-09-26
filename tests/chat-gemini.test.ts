import assert from "node:assert/strict";
import test from "node:test";
import { toGeminiContents } from "../lib/chat/gemini-answer-streamer.ts";

test("maps the conversation to Gemini roles, keeping order and text", () => {
  const contents = toGeminiContents([
    { role: "user", content: "What is E150d?" },
    { role: "assistant", content: "A caramel colour." },
    { role: "user", content: "Why is it flagged?" },
  ]);
  assert.deepEqual(contents.map((content) => content.role), ["user", "model", "user"]);
  assert.deepEqual(contents.map((content) => content.parts?.[0]?.text), ["What is E150d?", "A caramel colour.", "Why is it flagged?"]);
});

test("Google's content filters are switched on for every harm category", async () => {
  const { SAFETY_SETTINGS } = await import("../lib/chat/gemini-answer-streamer.ts");
  assert.equal(SAFETY_SETTINGS.length, 4);
  assert.ok(SAFETY_SETTINGS.every((setting) => setting.threshold !== "BLOCK_NONE" && setting.threshold !== "OFF"));
});

test("a blocked question or answer is recognised", async () => {
  const { isBlocked } = await import("../lib/chat/gemini-answer-streamer.ts");
  assert.equal(isBlocked({ promptFeedback: { blockReason: "SAFETY" } } as never), true);
  assert.equal(isBlocked({ candidates: [{ finishReason: "PROHIBITED_CONTENT" }] } as never), true);
  assert.equal(isBlocked({ candidates: [{ finishReason: "STOP" }] } as never), false);
});
