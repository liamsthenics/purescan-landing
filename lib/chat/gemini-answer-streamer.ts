// Streams answers from Google's Gemini API.
import {
  FinishReason,
  GoogleGenAI,
  HarmBlockThreshold,
  HarmCategory,
  ThinkingLevel,
  type Content,
  type GenerateContentResponse,
  type SafetySetting,
} from "@google/genai";
import { OUT_OF_SCOPE_SENTINEL } from "./answer-events.ts";
import type { AnswerRequest, AnswerStreamer, ModelMessage } from "./answer-streamer.ts";
import { CHAT_MAX_OUTPUT_TOKENS, CHAT_TEMPERATURE, UPSTREAM_TIMEOUT_MS } from "./config.ts";

/**
 * Google's own content filters, on top of the prompt's scope rules. Dangerous
 * content is only blocked at medium: questions like "is sodium nitrite
 * harmful?" are legitimate.
 */
export const SAFETY_SETTINGS: SafetySetting[] = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

const BLOCKED_FINISH_REASONS: ReadonlySet<FinishReason | undefined> = new Set([
  FinishReason.SAFETY,
  FinishReason.BLOCKLIST,
  FinishReason.PROHIBITED_CONTENT,
  FinishReason.SPII,
  FinishReason.RECITATION,
]);

/** Whether Google blocked the question or the answer. */
export function isBlocked(chunk: GenerateContentResponse): boolean {
  return Boolean(chunk.promptFeedback?.blockReason) || BLOCKED_FINISH_REASONS.has(chunk.candidates?.[0]?.finishReason);
}

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
          safetySettings: SAFETY_SETTINGS,
          abortSignal: controller.signal,
        },
      });
      for await (const chunk of stream) {
        if (isBlocked(chunk)) {
          // Handled like any other out-of-scope question: the standard refusal.
          yield OUT_OF_SCOPE_SENTINEL;
          break;
        }
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
