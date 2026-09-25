// Ask PureScan (POST /api/chat) settings. The contract is docs/chat-api.md.
import { APP_STORE_ID } from "../site.ts";

export const CHAT_MODEL = "claude-haiku-4-5-20251001";
export const CHAT_MAX_OUTPUT_TOKENS = 600;
export const CHAT_TEMPERATURE = 0.3;
/**
 * Upstream timeout per attempt, and how many times the SDK retries. Two
 * attempts plus a streamed 600-token answer must fit in the route's maxDuration (60 s).
 */
export const UPSTREAM_TIMEOUT_MS = 20_000;
export const UPSTREAM_MAX_RETRIES = 1;

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
} as const;

export const APPLE_APP = {
  bundleId: "com.purescan.app",
  appAppleId: Number(APP_STORE_ID),
  premiumProductIds: ["com.purescan.app.premium.monthly", "com.purescan.app.premium.yearly"],
} as const;

export interface UpstashCredentials {
  url: string;
  token: string;
}

export interface ChatConfig {
  /** The kill switch: false when CHAT_ENABLED is off or there is no API key. */
  enabled: boolean;
  anthropicApiKey: string | null;
  globalDailyLimit: number;
  upstash: UpstashCredentials | null;
  /** Key for hashing identifiers in rate-limit keys (CHAT_HASH_SECRET). Required with Upstash. */
  hashSecret: string | null;
}

type Environment = Readonly<Record<string, string | undefined>>;

const DISABLED_VALUES: ReadonlySet<string> = new Set(["false", "0", "off", "no"]);

function nonEmpty(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function positiveInteger(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

/**
 * Reads the chat settings from the environment. Chat is on only when an
 * Anthropic key is set, and CHAT_ENABLED=false turns it off regardless.
 */
export function readChatConfig(environment: Environment): ChatConfig {
  const anthropicApiKey = nonEmpty(environment.ANTHROPIC_API_KEY);
  const switchValue = nonEmpty(environment.CHAT_ENABLED)?.toLowerCase();
  const isSwitchedOff = switchValue !== undefined && DISABLED_VALUES.has(switchValue);
  const upstashUrl = nonEmpty(environment.UPSTASH_REDIS_REST_URL);
  const upstashToken = nonEmpty(environment.UPSTASH_REDIS_REST_TOKEN);
  return {
    enabled: anthropicApiKey !== null && !isSwitchedOff,
    anthropicApiKey,
    globalDailyLimit: positiveInteger(environment.CHAT_GLOBAL_DAILY_LIMIT, RATE_LIMITS.defaultGlobalDailyLimit),
    upstash: upstashUrl && upstashToken ? { url: upstashUrl, token: upstashToken } : null,
    hashSecret: nonEmpty(environment.CHAT_HASH_SECRET),
  };
}
