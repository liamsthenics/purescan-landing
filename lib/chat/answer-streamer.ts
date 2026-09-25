// What the chat handler needs from a language model: streamed answer text.

export interface ModelMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AnswerRequest {
  system: string;
  messages: ModelMessage[];
  /** Aborted when the app disconnects, so the upstream call stops too. */
  signal?: AbortSignal;
}

export interface AnswerStreamer {
  streamAnswer(request: AnswerRequest): AsyncIterable<string>;
}
