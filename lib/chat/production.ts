// Wires the chat handler to its real services. Next.js only: it reads the
// additive knowledge base through the "@/" alias.
import { getAllAdditives } from "@/lib/additives";
import { createAdditiveLookup } from "./additive-reference.ts";
import { loadAppleRootCertificates } from "./apple-root-certificates.ts";
import { createAppleTransactionVerifier } from "./apple-verifier.ts";
import type { ChatConfig } from "./config.ts";
import { GeminiAnswerStreamer } from "./gemini-answer-streamer.ts";
import { createIdentifierHasher, generateHashSecret } from "./hashing.ts";
import { createChatHandler, selectChatHandler, type ChatHandler } from "./handler.ts";
import { ChatRateLimiter, InMemoryRateLimitStore, type RateLimitStore } from "./rate-limit.ts";
import { UpstashRateLimitStore } from "./upstash-rate-limit-store.ts";

function rateLimitStore(config: ChatConfig): RateLimitStore {
  return config.upstash ? new UpstashRateLimitStore(config.upstash) : new InMemoryRateLimitStore();
}

/** Upstash counts are shared by every instance, so they need one agreed secret. */
function hashSecret(config: ChatConfig): string {
  if (config.hashSecret) return config.hashSecret;
  if (config.upstash) throw new Error("CHAT_HASH_SECRET is required when Upstash is configured");
  return generateHashSecret();
}

function buildEnabledHandler(config: ChatConfig, geminiApiKey: string): ChatHandler {
  return createChatHandler({
    hashIdentifier: createIdentifierHasher(hashSecret(config)),
    premiumVerifier: createAppleTransactionVerifier(loadAppleRootCertificates()),
    rateLimits: new ChatRateLimiter({ store: rateLimitStore(config), globalDailyLimit: config.globalDailyLimit }),
    answerStreamer: new GeminiAnswerStreamer(geminiApiKey, config.model),
    lookupAdditive: createAdditiveLookup(getAllAdditives()),
  });
}

export function buildChatHandler(config: ChatConfig): ChatHandler {
  return selectChatHandler(config, () => {
    if (!config.geminiApiKey) throw new Error("Chat is enabled without a Gemini API key");
    return buildEnabledHandler(config, config.geminiApiKey);
  });
}
