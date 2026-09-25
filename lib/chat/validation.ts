// Request validation for POST /api/chat (limits from docs/chat-api.md).
import { z } from "zod";
import { REQUEST_LIMITS } from "./config.ts";
import { characterCount, sanitiseMultilineText, sanitiseSingleLineText } from "./sanitise.ts";

const SCORE_MIN = 0;
const SCORE_MAX = 100;
const NOVA_MIN = 1;
const NOVA_MAX = 4;
const NUTRIENT_AMOUNT_MAX = 10_000;
const SCORE_LIMIT_PATTERN = /^[A-Za-z]{1,60}$/;

function textWithin(maxCharacters: number, sanitise: (text: string) => string) {
  return z
    .string()
    .transform(sanitise)
    .refine((text) => characterCount(text) <= maxCharacters);
}

const singleLine = (maxCharacters: number) => textWithin(maxCharacters, sanitiseSingleLineText);
const multiline = (maxCharacters: number) => textWithin(maxCharacters, sanitiseMultilineText);

const componentScore = z.number().min(SCORE_MIN).max(SCORE_MAX).nullish();

const findingSchema = z.object({
  code: singleLine(REQUEST_LIMITS.codeMaxCharacters).nullish(),
  name: singleLine(REQUEST_LIMITS.shortTextMaxCharacters),
  tier: z.enum(["high", "moderate", "low", "none"]),
  reasons: z.array(singleLine(REQUEST_LIMITS.reasonMaxCharacters)).max(REQUEST_LIMITS.maxReasonsPerFinding).nullish(),
});

const nutrientSchema = z.object({
  nutrient: singleLine(REQUEST_LIMITS.shortTextMaxCharacters),
  amount: z.number().min(0).max(NUTRIENT_AMOUNT_MAX).nullish(),
  band: z.enum(["low", "medium", "high"]).nullish(),
});

const productSchema = z.object({
  barcode: singleLine(REQUEST_LIMITS.barcodeMaxCharacters).nullish(),
  name: singleLine(REQUEST_LIMITS.shortTextMaxCharacters).nullish(),
  brand: singleLine(REQUEST_LIMITS.shortTextMaxCharacters).nullish(),
  quantity: singleLine(REQUEST_LIMITS.shortTextMaxCharacters).nullish(),
  score: z.number().int().min(SCORE_MIN).max(SCORE_MAX).nullish(),
  verdict: z.enum(["great", "okay", "poor", "bad"]).nullish(),
  scoreLimit: z.string().regex(SCORE_LIMIT_PATTERN).nullish(),
  components: z
    .object({ ingredients: componentScore, nutrition: componentScore, processing: componentScore })
    .nullish(),
  processing: z.number().int().min(NOVA_MIN).max(NOVA_MAX).nullish(),
  ingredientsText: multiline(REQUEST_LIMITS.ingredientsTextMaxCharacters).nullish(),
  findings: z.array(findingSchema).max(REQUEST_LIMITS.maxFindings).nullish(),
  nutrients: z.array(nutrientSchema).max(REQUEST_LIMITS.maxNutrients).nullish(),
  isBeverage: z.boolean().nullish(),
});

const MESSAGE_LIMITS = {
  user: REQUEST_LIMITS.userMessageMaxCharacters,
  assistant: REQUEST_LIMITS.assistantMessageMaxCharacters,
} as const;

const messageSchema = z
  .object({
    role: z.enum(["user", "assistant"]),
    content: z.string().transform(sanitiseMultilineText),
  })
  .refine(
    (message) => message.content.length > 0 && characterCount(message.content) <= MESSAGE_LIMITS[message.role],
  );

type ChatMessageInput = z.infer<typeof messageSchema>;

/** Roles alternate and the conversation ends with the person's question. */
function isWellFormedConversation(messages: readonly ChatMessageInput[]): boolean {
  const alternates = messages.every((message, index) => index === 0 || message.role !== messages[index - 1].role);
  return alternates && messages[messages.length - 1]?.role === "user";
}

export const chatRequestSchema = z.object({
  messages: z.array(messageSchema).min(1).max(REQUEST_LIMITS.maxMessages).refine(isWellFormedConversation),
  product: productSchema.nullish(),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;
export type ChatMessage = ChatRequest["messages"][number];
export type ChatProduct = NonNullable<ChatRequest["product"]>;

/** The validated, cleaned request, or null if it breaks any limit. */
export function parseChatRequest(body: unknown): ChatRequest | null {
  const result = chatRequestSchema.safeParse(body);
  return result.success ? result.data : null;
}
