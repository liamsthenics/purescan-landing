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
