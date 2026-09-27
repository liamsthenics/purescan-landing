// Wires the label and attestation handlers to their real services.
import { AppAttestDeviceAttestor, type DeviceAttestor } from "../attest/device-attestor.ts";
import { createAppAttestVerifier } from "../attest/app-attest-verifier.ts";
import { InMemoryAttestedKeyStore, type AttestedKeyStore } from "../attest/attested-key-store.ts";
import { AttestChallengeStore } from "../attest/challenge-store.ts";
import { ATTESTED_KEY_TTL_SECONDS } from "../attest/config.ts";
import { UpstashAttestedKeyStore } from "../attest/upstash-attested-key-store.ts";
import { createIdentifierHasher, generateHashSecret } from "../chat/hashing.ts";
import { InMemoryRateLimitStore, type RateLimitStore } from "../chat/rate-limit.ts";
import { UpstashRateLimitStore } from "../chat/upstash-rate-limit-store.ts";
import { InMemoryKeyValueStore, type KeyValueStore } from "../store/key-value-store.ts";
import { UpstashKeyValueStore } from "../store/upstash-key-value-store.ts";
import { createAttestChallengeHandler, createAttestRegisterHandler, type AttestHandler } from "./attest-handler.ts";
import type { LabelConfig } from "./config.ts";
import { GeminiLabelReader } from "./gemini-label-reader.ts";
import {
  createLabelLookupHandler,
  createLabelReadHandler,
  selectLabelReadHandler,
  type AfterResponseScheduler,
  type LabelLookupHandler,
  type LabelReadHandler,
} from "./handler.ts";
import { labelErrorResponse } from "./http.ts";
import { consoleLabelLogger } from "./log.ts";
import { OpenFoodFactsPhotoContributor } from "./off-contribution.ts";
import { LabelRateLimiter } from "./rate-limit.ts";
import { KeyValueLabelReadingStore } from "./reading-store.ts";

interface LabelInfrastructure {
  keyValues: KeyValueStore;
  attestedKeys: AttestedKeyStore;
  rateLimitStore: RateLimitStore;
  hashSecret: string;
}

/**
 * Next.js bundles each route separately, so a module-level singleton would give
 * every route its own memory. Local development keeps one copy on globalThis so
 * a challenge issued by one route can be consumed by another.
 */
const IN_MEMORY_INFRASTRUCTURE = Symbol.for("purescan.label.inMemoryInfrastructure");
type GlobalWithInfrastructure = typeof globalThis & { [IN_MEMORY_INFRASTRUCTURE]?: LabelInfrastructure };

function inMemoryInfrastructure(): LabelInfrastructure {
  const globalScope = globalThis as GlobalWithInfrastructure;
  globalScope[IN_MEMORY_INFRASTRUCTURE] ??= {
    keyValues: new InMemoryKeyValueStore(),
    attestedKeys: new InMemoryAttestedKeyStore(ATTESTED_KEY_TTL_SECONDS),
    rateLimitStore: new InMemoryRateLimitStore(),
    hashSecret: generateHashSecret(),
  };
  return globalScope[IN_MEMORY_INFRASTRUCTURE];
}

function labelInfrastructure(config: LabelConfig): LabelInfrastructure {
  if (config.upstash) {
    // Hashes in shared storage must match across instances, so they need one agreed secret.
    if (!config.hashSecret) throw new Error("CHAT_HASH_SECRET is required when Upstash is configured");
    return {
      keyValues: new UpstashKeyValueStore(config.upstash),
      attestedKeys: new UpstashAttestedKeyStore(config.upstash, ATTESTED_KEY_TTL_SECONDS),
      rateLimitStore: new UpstashRateLimitStore(config.upstash),
      hashSecret: config.hashSecret,
    };
  }
  if (config.isProduction) throw new Error("Label storage requires Upstash in production");
  const infrastructure = inMemoryInfrastructure();
  return config.hashSecret ? { ...infrastructure, hashSecret: config.hashSecret } : infrastructure;
}

function deviceAttestor(config: LabelConfig, infrastructure: LabelInfrastructure): DeviceAttestor {
  return new AppAttestDeviceAttestor({
    challenges: new AttestChallengeStore(infrastructure.keyValues),
    keys: infrastructure.attestedKeys,
    verifier: createAppAttestVerifier({ allowDevelopmentEnvironment: config.allowDevelopmentAttestations }),
  });
}

function sharedDependencies(config: LabelConfig, infrastructure: LabelInfrastructure) {
  return {
    rateLimits: new LabelRateLimiter({ store: infrastructure.rateLimitStore, globalDailyLimit: config.globalDailyLimit }),
    hashIdentifier: createIdentifierHasher(infrastructure.hashSecret),
  };
}

const unavailable = async (): Promise<Response> => labelErrorResponse("unavailable");

export function buildLabelReadHandler(config: LabelConfig, scheduleAfterResponse: AfterResponseScheduler): LabelReadHandler {
  return selectLabelReadHandler(config, () => {
    if (!config.geminiApiKey) throw new Error("Label reading is enabled without a Gemini API key");
    const infrastructure = labelInfrastructure(config);
    return createLabelReadHandler({
      ...sharedDependencies(config, infrastructure),
      deviceAttestor: deviceAttestor(config, infrastructure),
      labelReader: new GeminiLabelReader(config.geminiApiKey, config.model),
      readings: new KeyValueLabelReadingStore(infrastructure.keyValues),
      model: config.model,
      requireAttestation: config.requireAppAttest,
      photoContributor: config.openFoodFacts
        ? new OpenFoodFactsPhotoContributor({ credentials: config.openFoodFacts, logger: consoleLabelLogger })
        : null,
      scheduleAfterResponse,
    });
  });
}

/** Saved readings are served even when photo reads are switched off. */
export function buildLabelLookupHandler(config: LabelConfig): LabelLookupHandler {
  if (!config.isStoreAvailable) return unavailable;
  const infrastructure = labelInfrastructure(config);
  return createLabelLookupHandler({
    ...sharedDependencies(config, infrastructure),
    readings: new KeyValueLabelReadingStore(infrastructure.keyValues),
  });
}

function buildAttestHandler(
  config: LabelConfig,
  create: typeof createAttestChallengeHandler | typeof createAttestRegisterHandler,
): AttestHandler {
  if (!config.isStoreAvailable) return unavailable;
  const infrastructure = labelInfrastructure(config);
  return create({ ...sharedDependencies(config, infrastructure), deviceAttestor: deviceAttestor(config, infrastructure) });
}

export function buildAttestChallengeHandler(config: LabelConfig): AttestHandler {
  return buildAttestHandler(config, createAttestChallengeHandler);
}

export function buildAttestRegisterHandler(config: LabelConfig): AttestHandler {
  return buildAttestHandler(config, createAttestRegisterHandler);
}

/** Builds a route's handler on first use and keeps it; a setup failure is logged and retried next time. */
export function lazilyBuilt<Handler>(build: () => Handler): () => Handler | null {
  let cached: Handler | null = null;
  return () => {
    if (cached) return cached;
    try {
      cached = build();
      return cached;
    } catch (error) {
      consoleLabelLogger("setup_failed", error);
      return null;
    }
  };
}
