// Streams answers from Anthropic's Messages API.
import Anthropic from "@anthropic-ai/sdk";
import type { AnswerRequest, AnswerStreamer } from "./answer-streamer.ts";
import {
  CHAT_MAX_OUTPUT_TOKENS,
  CHAT_MODEL,
  CHAT_TEMPERATURE,
  UPSTREAM_MAX_RETRIES,
  UPSTREAM_TIMEOUT_MS,
} from "./config.ts";

export class AnthropicAnswerStreamer implements AnswerStreamer {
  private readonly client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey, timeout: UPSTREAM_TIMEOUT_MS, maxRetries: UPSTREAM_MAX_RETRIES });
  }

  async *streamAnswer({ system, messages, signal }: AnswerRequest): AsyncGenerator<string> {
    const stream = this.client.messages.stream(
      {
        model: CHAT_MODEL,
        max_tokens: CHAT_MAX_OUTPUT_TOKENS,
        temperature: CHAT_TEMPERATURE,
        system,
        messages,
      },
      { signal },
    );
    let isFinished = false;
    try {
      for await (const event of stream) {
        if (event.type === "content_block_delta" && event.delta.type === "text_delta") yield event.delta.text;
      }
      isFinished = true;
    } finally {
      // The consumer stopped early (a refusal, or the app disconnected): stop generating.
      if (!isFinished) stream.abort();
    }
  }
}
