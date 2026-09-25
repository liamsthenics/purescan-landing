// POST /api/chat ("Ask PureScan"), implementing docs/chat-api.md. Every
// dependency is injected so the whole flow can be tested without a network.
import { findENumbers, referencedAdditives, type AdditiveLookup } from "./additive-reference.ts";
import { answerEvents } from "./answer-events.ts";
import type { AnswerStreamer, ModelMessage } from "./answer-streamer.ts";
import { MAX_REQUEST_BODY_BYTES, type ChatConfig } from "./config.ts";
import type { EntitlementFailure, PremiumVerifier } from "./entitlement.ts";
import type { IdentifierHasher } from "./hashing.ts";
import { clientIpAddress, errorResponse, readBodyWithLimit } from "./http.ts";
import { consoleChatLogger, type ChatLogger } from "./log.ts";
import type { ChatRateLimits } from "./rate-limit.ts";
import { SSE_HEADERS, formatSseEvent, type ChatStreamEvent } from "./sse.ts";
import { buildSystemPrompt } from "./system-prompt.ts";
import { parseChatRequest, type ChatMessage, type ChatRequest } from "./validation.ts";

export const TRANSACTION_HEADER = "x-purescan-transaction";

export type ChatHandler = (request: Request) => Promise<Response>;

export interface ChatHandlerDependencies {
  premiumVerifier: PremiumVerifier;
  rateLimits: ChatRateLimits;
  answerStreamer: AnswerStreamer;
  lookupAdditive: AdditiveLookup;
  hashIdentifier: IdentifierHasher;
  logger?: ChatLogger;
}

interface ChatContext extends ChatHandlerDependencies {
  logger: ChatLogger;
}

/** The kill switch: builds the real handler only when chat is enabled. */
export function selectChatHandler(config: Pick<ChatConfig, "enabled">, buildEnabledHandler: () => ChatHandler): ChatHandler {
  return config.enabled ? buildEnabledHandler() : async () => errorResponse("unavailable");
}

export function createChatHandler(dependencies: ChatHandlerDependencies): ChatHandler {
  const context: ChatContext = { ...dependencies, logger: dependencies.logger ?? consoleChatLogger };
  return async (request) => {
    try {
      return await handleChat(request, context);
    } catch (error) {
      context.logger("unexpected_error", error);
      return errorResponse("unavailable");
    }
  };
}

async function handleChat(request: Request, context: ChatContext): Promise<Response> {
  const client = await context.rateLimits.checkClient(context.hashIdentifier(clientIpAddress(request.headers)));
  if (!client.isAllowed) return errorResponse("rate_limited", client.retryAfterSeconds);

  const chatRequest = await readChatRequest(request);
  if (!chatRequest) return errorResponse("invalid_request");

  const entitlement = await context.premiumVerifier.verify(request.headers.get(TRANSACTION_HEADER));
  if (!entitlement.isEntitled) return entitlementFailureResponse(entitlement.failure, context.logger);

  const transactionHash = context.hashIdentifier(entitlement.originalTransactionId);
  const decision = await context.rateLimits.checkTransaction(transactionHash);
  if (decision.outcome === "rate_limited") return errorResponse("rate_limited", decision.retryAfterSeconds);
  if (decision.outcome === "capacity_reached") {
    context.logger("global_cap_reached");
    return errorResponse("unavailable");
  }
  return streamAnswer(request, chatRequest, { transactionHash, remainingToday: decision.remainingToday }, context);
}

async function readChatRequest(request: Request): Promise<ChatRequest | null> {
  const body = await readBodyWithLimit(request, MAX_REQUEST_BODY_BYTES);
  if (body === null) return null;
  try {
    return parseChatRequest(JSON.parse(body));
  } catch {
    return null;
  }
}

function entitlementFailureResponse(failure: EntitlementFailure, logger: ChatLogger): Response {
  if (failure !== "verification_unavailable") return errorResponse("premium_required");
  logger("verification_unavailable");
  return errorResponse("unavailable");
}

/** Leading assistant turns (such as a greeting) are dropped: the model needs a user turn first. */
export function toModelMessages(messages: readonly ChatMessage[]): ModelMessage[] {
  const firstUserIndex = messages.findIndex((message) => message.role === "user");
  return messages.slice(firstUserIndex).map(({ role, content }) => ({ role, content }));
}

/** E-numbers the person has asked about (newest question first), then those flagged on the product. */
function mentionedENumbers(chatRequest: ChatRequest): string[] {
  const questionsNewestFirst = chatRequest.messages
    .filter((message) => message.role === "user")
    .map((message) => message.content)
    .reverse();
  const findingCodes = (chatRequest.product?.findings ?? []).map((finding) => finding.code ?? "");
  return findENumbers([...questionsNewestFirst, ...findingCodes]);
}

interface Allowance {
  transactionHash: string;
  remainingToday: number;
}

async function streamAnswer(
  request: Request,
  chatRequest: ChatRequest,
  { transactionHash, remainingToday }: Allowance,
  context: ChatContext,
): Promise<Response> {
  const system = buildSystemPrompt({
    product: chatRequest.product ?? null,
    referenceAdditives: referencedAdditives(mentionedENumbers(chatRequest), context.lookupAdditive),
  });
  const textChunks = context.answerStreamer.streamAnswer({
    system,
    messages: toModelMessages(chatRequest.messages),
    signal: request.signal,
  });
  const events = answerEvents(textChunks, remainingToday);

  // Wait for the first event so an upstream failure can still be a 503, before any headers are sent.
  let first: IteratorResult<ChatStreamEvent>;
  try {
    first = await events.next();
  } catch (error) {
    context.logger("upstream_failed", error);
    // Nothing was answered, so the question doesn't count against the day.
    await context.rateLimits.refundTransaction(transactionHash);
    return errorResponse("unavailable");
  }
  if (first.done) return errorResponse("unavailable");
  return new Response(eventStream(first.value, events, request.signal, context.logger), { headers: SSE_HEADERS });
}

function eventStream(
  first: ChatStreamEvent,
  rest: AsyncGenerator<ChatStreamEvent>,
  signal: AbortSignal,
  logger: ChatLogger,
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const encode = (event: ChatStreamEvent) => encoder.encode(formatSseEvent(event));
  return new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(encode(first));
    },
    async pull(controller) {
      try {
        const next = await rest.next();
        if (next.done) controller.close();
        else controller.enqueue(encode(next.value));
      } catch (error) {
        // Headers are already sent, so the stream ends without a `done` event,
        // which the app treats as a failed answer.
        if (!signal.aborted) logger("upstream_stream_failed", error);
        controller.close();
      }
    },
    async cancel() {
      await rest.return(undefined);
    },
  });
}
