// Streams answers from Google's Gemini API.
import { GoogleGenAI, ThinkingLevel, type Content } from "@google/genai";
import type { AnswerRequest, AnswerStreamer, ModelMessage } from "./answer-streamer.ts";
import { CHAT_MAX_OUTPUT_TOKENS, CHAT_TEMPERATURE, UPSTREAM_TIMEOUT_MS } from "./config.ts";

/** Gemini calls the assistant "model". */
export function toGeminiContents(messages: readonly ModelMessage[]): Content[] {
  return messages.map(({ role, content }) => ({
    role: role === "assistant" ? "model" : "user",
    parts: [{ text: content }],
  }));
}

export class GeminiAnswerStreamer implements AnswerStreamer {
  private readonly client: GoogleGenAI;
  private readonly model: string;

  constructor(apiKey: string, model: string) {
    this.client = new GoogleGenAI({ apiKey, httpOptions: { timeout: UPSTREAM_TIMEOUT_MS } });
    this.model = model;
  }

  async *streamAnswer({ system, messages, signal }: AnswerRequest): AsyncGenerator<string> {
    const controller = new AbortController();
    const forwardAbort = () => controller.abort();
    if (signal?.aborted) controller.abort();
    signal?.addEventListener("abort", forwardAbort, { once: true });
    let isFinished = false;
    try {
      const stream = await this.client.models.generateContentStream({
        model: this.model,
        contents: toGeminiContents(messages),
        config: {
          systemInstruction: system,
          temperature: CHAT_TEMPERATURE,
          maxOutputTokens: CHAT_MAX_OUTPUT_TOKENS,
          // Short factual answers: minimal thinking keeps them fast, cheap and
          // leaves the whole output budget for the answer itself.
          thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
          abortSignal: controller.signal,
        },
      });
      for await (const chunk of stream) {
        const text = chunk.text;
        if (text) yield text;
      }
      isFinished = true;
    } finally {
      signal?.removeEventListener("abort", forwardAbort);
      // The consumer stopped early (a refusal, or the app disconnected): stop generating.
      if (!isFinished) controller.abort();
    }
  }
}
