// Ask PureScan (POST /api/chat) settings. The contract is docs/chat-api.md.
import {
  isSwitchedOff,
  nonEmpty,
  positiveInteger,
  readUpstashCredentials,
  type Environment,
  type UpstashCredentials,
} from "../environment.ts";
import { APP_STORE_ID } from "../site.ts";

export type { UpstashCredentials } from "../environment.ts";

/** The fastest, lowest-cost stable Gemini model; override with GEMINI_MODEL. */
export const DEFAULT_CHAT_MODEL = "gemini-3.5-flash-lite";
export const CHAT_MAX_OUTPUT_TOKENS = 600;
export const CHAT_TEMPERATURE = 0.3;
/** Upstream timeout: a streamed 600-token answer must fit in the route's maxDuration (60 s). */
export const UPSTREAM_TIMEOUT_MS = 30_000;

export const MAX_REQUEST_BODY_BYTES = 32 * 1024;

export const REQUEST_LIMITS = {
  maxMessages: 12,
  userMessageMaxCharacters: 500,
  assistantMessageMaxCharacters: 2_000,
  ingredientsTextMaxCharacters: 2_000,
  maxFindings: 30,
  maxReasonsPerFinding: 5,
  reasonMaxCharacters: 300,
  maxNutrients: 12,
  shortTextMaxCharacters: 200,
  barcodeMaxCharacters: 32,
  codeMaxCharacters: 16,
} as const;

export const RATE_LIMITS = {
  perTransactionPerMinute: 8,
  perTransactionPerDay: 40,
  perIpPerHour: 60,
  defaultGlobalDailyLimit: 3_000,
  /** Refused questions a subscriber can ask before chat pauses for them until tomorrow. */
  maxRefusalsPerDay: 8,
} as const;

export const APPLE_APP = {
  bundleId: "com.purescan.app",
  appAppleId: Number(APP_STORE_ID),
  premiumProductIds: ["com.purescan.app.premium.monthly", "com.purescan.app.premium.yearly"],
} as const;

export interface ChatConfig {
  /** The kill switch: false when CHAT_ENABLED is off or there is no API key. */
  enabled: boolean;
  geminiApiKey: string | null;
  /** Gemini model code (GEMINI_MODEL), e.g. "gemini-3.5-flash-lite". */
  model: string;
  globalDailyLimit: number;
  upstash: UpstashCredentials | null;
  /** Key for hashing identifiers in rate-limit keys (CHAT_HASH_SECRET). Required with Upstash. */
  hashSecret: string | null;
}

/**
 * Reads the chat settings from the environment. Chat is on only when a
 * Gemini key is set, and CHAT_ENABLED=false turns it off regardless.
 */
export function readChatConfig(environment: Environment): ChatConfig {
  const geminiApiKey = nonEmpty(environment.GEMINI_API_KEY);
  return {
    enabled: geminiApiKey !== null && !isSwitchedOff(environment.CHAT_ENABLED),
    geminiApiKey,
    model: nonEmpty(environment.GEMINI_MODEL) ?? DEFAULT_CHAT_MODEL,
    globalDailyLimit: positiveInteger(environment.CHAT_GLOBAL_DAILY_LIMIT, RATE_LIMITS.defaultGlobalDailyLimit),
    upstash: readUpstashCredentials(environment),
    hashSecret: nonEmpty(environment.CHAT_HASH_SECRET),
  };
}
