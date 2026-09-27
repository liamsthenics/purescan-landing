// Label photo-fill settings (POST /api/label and friends). The contract is docs/label-api.md.
import { DEFAULT_CHAT_MODEL } from "../chat/config.ts";
import {
  isSwitchedOff,
  isSwitchedOn,
  nonEmpty,
  positiveInteger,
  readUpstashCredentials,
  type Environment,
  type UpstashCredentials,
} from "../environment.ts";

/** Label reading is short, structured extraction: the same fast, low-cost model as chat by default. */
export const DEFAULT_LABEL_MODEL = DEFAULT_CHAT_MODEL;
/** Room for a 3,000-character ingredient list (about 1,000 tokens) plus the nutrition fields. */
export const LABEL_MAX_OUTPUT_TOKENS = 2_048;
/** Deterministic transcription, not creative writing. */
export const LABEL_TEMPERATURE = 0;
/** One upstream attempt must fit in the route's maxDuration with the photo uploads after it. */
export const LABEL_UPSTREAM_TIMEOUT_MS = 25_000;

const BYTES_PER_KILOBYTE = 1_024;
const BYTES_PER_MEGABYTE = BYTES_PER_KILOBYTE * BYTES_PER_KILOBYTE;
const PHOTO_MAX_MEGABYTES = 1.2;
/** Two maximum-size photos are about 3.3 MB once base64-encoded; Vercel caps request bodies at 4.5 MB. */
const REQUEST_BODY_MAX_MEGABYTES = 4;
const ATTEST_BODY_MAX_KILOBYTES = 32;

export const MAX_LABEL_REQUEST_BODY_BYTES = REQUEST_BODY_MAX_MEGABYTES * BYTES_PER_MEGABYTE;
/** An attestation object (certificates plus receipt) is a few kilobytes; this leaves generous room. */
export const MAX_ATTEST_REQUEST_BODY_BYTES = ATTEST_BODY_MAX_KILOBYTES * BYTES_PER_KILOBYTE;

export const PHOTO_LIMITS = {
  minPhotos: 1,
  maxPhotos: 2,
  maxDecodedBytes: Math.floor(PHOTO_MAX_MEGABYTES * BYTES_PER_MEGABYTE),
} as const;

export const READING_LIMITS = {
  ingredientsTextMaxCharacters: 3_000,
  gramsMax: 100,
  energyKcalMax: 900,
  energyKilojoulesMax: 3_800,
} as const;

const SECONDS_PER_DAY = 86_400;
const READING_RETENTION_DAYS = 365;
export const READING_TTL_SECONDS = READING_RETENTION_DAYS * SECONDS_PER_DAY;
export const LABEL_KEY_PREFIX = "purescan:label";
export const READING_KEY_PREFIX = `${LABEL_KEY_PREFIX}:v1`;

export const RATE_LIMITS = {
  lookupsPerIpPerHour: 300,
  readsPerIpPerHour: 20,
  readsPerDevicePerDay: 10,
  defaultGlobalDailyLimit: 500,
  challengesPerIpPerHour: 30,
  registrationsPerIpPerHour: 30,
} as const;

export interface OpenFoodFactsCredentials {
  userId: string;
  password: string;
}

export interface LabelConfig {
  isProduction: boolean;
  /**
   * Somewhere to keep readings, keys and counts: Upstash, or process memory
   * outside production. Every label route needs it.
   */
  isStoreAvailable: boolean;
  /** The kill switch for photo reads: key set, LABEL_ENABLED not off, and a store available. */
  photoReadsEnabled: boolean;
  geminiApiKey: string | null;
  /** Gemini model code (GEMINI_LABEL_MODEL). */
  model: string;
  globalDailyLimit: number;
  /** Always true in production; LABEL_REQUIRE_APP_ATTEST=false is honoured only for local testing. */
  requireAppAttest: boolean;
  allowDevelopmentAttestations: boolean;
  upstash: UpstashCredentials | null;
  /** Key for hashing identifiers (CHAT_HASH_SECRET, shared with chat). Required with Upstash. */
  hashSecret: string | null;
  /** Set only when OFF_CONTRIBUTION_ENABLED=true and both credentials are present. */
  openFoodFacts: OpenFoodFactsCredentials | null;
}

const PRODUCTION = "production";

function readOpenFoodFactsCredentials(environment: Environment): OpenFoodFactsCredentials | null {
  const userId = nonEmpty(environment.OFF_USER_ID);
  const password = nonEmpty(environment.OFF_PASSWORD);
  if (!isSwitchedOn(environment.OFF_CONTRIBUTION_ENABLED) || !userId || !password) return null;
  return { userId, password };
}

export function readLabelConfig(environment: Environment): LabelConfig {
  const isProduction = environment.NODE_ENV === PRODUCTION;
  const upstash = readUpstashCredentials(environment);
  const isStoreAvailable = upstash !== null || !isProduction;
  const geminiApiKey = nonEmpty(environment.GEMINI_LABEL_API_KEY);
  return {
    isProduction,
    isStoreAvailable,
    photoReadsEnabled: geminiApiKey !== null && !isSwitchedOff(environment.LABEL_ENABLED) && isStoreAvailable,
    geminiApiKey,
    model: nonEmpty(environment.GEMINI_LABEL_MODEL) ?? DEFAULT_LABEL_MODEL,
    globalDailyLimit: positiveInteger(environment.LABEL_GLOBAL_DAILY_LIMIT, RATE_LIMITS.defaultGlobalDailyLimit),
    requireAppAttest: isProduction || !isSwitchedOff(environment.LABEL_REQUIRE_APP_ATTEST),
    allowDevelopmentAttestations: isSwitchedOn(environment.APP_ATTEST_ALLOW_DEVELOPMENT),
    upstash,
    hashSecret: nonEmpty(environment.CHAT_HASH_SECRET),
    openFoodFacts: readOpenFoodFactsCredentials(environment),
  };
}
