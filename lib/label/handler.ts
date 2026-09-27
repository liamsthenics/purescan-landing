// POST /api/label and GET /api/label/{barcode}, implementing docs/label-api.md.
// Every dependency is injected so the whole flow can be tested without a network.
import type { DeviceAttestor } from "../attest/device-attestor.ts";
import type { IdentifierHasher } from "../chat/hashing.ts";
import { clientIpAddress, decodeUtf8, readBodyBytesWithLimit } from "../chat/http.ts";
import { MAX_LABEL_REQUEST_BODY_BYTES } from "./config.ts";
import { jsonResponse, labelErrorResponse } from "./http.ts";
import type { LabelReader } from "./label-reader.ts";
import { consoleLabelLogger, type LabelLogger } from "./log.ts";
import type { PhotoContributor } from "./off-contribution.ts";
import type { LabelRateLimits } from "./rate-limit.ts";
import { toPublicReading, type LabelReadingStore, type StoredLabelReading } from "./reading-store.ts";
import {
  contentForKinds,
  hasReadableContent,
  mergeReadings,
  type LabelContent,
  type LabelPhotoKind,
  type ModelLabelReading,
} from "./reading.ts";
import { isValidBarcode, parseLabelReadRequest, type LabelReadRequest } from "./validation.ts";

export const ATTEST_KEY_HEADER = "x-purescan-attest-key";
export const ASSERTION_HEADER = "x-purescan-assertion";

export type LabelReadHandler = (request: Request) => Promise<Response>;
export type LabelLookupHandler = (request: Request, barcode: string) => Promise<Response>;

/** Runs work after the response has been sent (Next.js `after` in production). */
export type AfterResponseScheduler = (work: () => Promise<void>) => void;

export interface LabelReadHandlerDependencies {
  deviceAttestor: DeviceAttestor;
  rateLimits: LabelRateLimits;
  labelReader: LabelReader;
  readings: LabelReadingStore;
  hashIdentifier: IdentifierHasher;
  /** Model code saved with each reading. */
  model: string;
  /** False only for local Simulator testing (never in production): unattested requests are keyed by IP. */
  requireAttestation: boolean;
  /** Null when contributing to Open Food Facts isn't configured. */
  photoContributor: PhotoContributor | null;
  scheduleAfterResponse: AfterResponseScheduler;
  now?: () => Date;
  logger?: LabelLogger;
}

interface ReadContext extends LabelReadHandlerDependencies {
  now: () => Date;
  logger: LabelLogger;
}

/** The kill switch: builds the real handler only when photo reads are enabled. */
export function selectLabelReadHandler(
  config: { photoReadsEnabled: boolean },
  buildEnabledHandler: () => LabelReadHandler,
): LabelReadHandler {
  return config.photoReadsEnabled ? buildEnabledHandler() : async () => labelErrorResponse("unavailable");
}

export function createLabelReadHandler(dependencies: LabelReadHandlerDependencies): LabelReadHandler {
  const context: ReadContext = {
    ...dependencies,
    now: dependencies.now ?? (() => new Date()),
    logger: dependencies.logger ?? consoleLabelLogger,
  };
  return async (request) => {
    try {
      return await handleLabelRead(request, context);
    } catch (error) {
      context.logger("unexpected_error", error);
      return labelErrorResponse("unavailable");
    }
  };
}

async function handleLabelRead(request: Request, context: ReadContext): Promise<Response> {
  const ipHash = context.hashIdentifier(clientIpAddress(request.headers));
  const client = await context.rateLimits.checkReadClient(ipHash);
  if (!client.isAllowed) return labelErrorResponse("rate_limited", client.retryAfterSeconds);

  const rawBody = await readBodyBytesWithLimit(request, MAX_LABEL_REQUEST_BODY_BYTES);
  const readRequest = rawBody === null ? null : parseBody(rawBody);
  if (rawBody === null || readRequest === null) return labelErrorResponse("invalid_request");

  const deviceId = await attestedDeviceId(request, rawBody, ipHash, context);
  if (deviceId === null) return labelErrorResponse("attestation_required");

  const deviceHash = context.hashIdentifier(deviceId);
  const decision = await context.rateLimits.checkDeviceRead(deviceHash);
  if (decision.outcome === "rate_limited") return labelErrorResponse("rate_limited", decision.retryAfterSeconds);
  if (decision.outcome === "capacity_reached") {
    context.logger("global_cap_reached");
    return labelErrorResponse("unavailable");
  }

  const modelReading = await readLabelOrRefund(request, readRequest, deviceHash, context);
  if (modelReading === null) return labelErrorResponse("unavailable");

  const content = contentForKinds(modelReading, photoKinds(readRequest));
  if (!modelReading.isFoodLabel || !hasReadableContent(content)) return labelErrorResponse("unreadable");

  const reading = await saveMergedReading(readRequest.barcode, content, deviceHash, context);
  scheduleContribution(readRequest, modelReading.ingredientsLanguage, deviceHash, context);
  return jsonResponse({ reading: toPublicReading(reading) });
}

function parseBody(rawBody: Uint8Array): LabelReadRequest | null {
  const text = decodeUtf8(rawBody);
  if (text === null) return null;
  try {
    return parseLabelReadRequest(JSON.parse(text));
  } catch {
    return null;
  }
}

/**
 * The attested key's device id, or null when attestation fails. Without
 * required attestation (local testing only) a request with no key falls back
 * to the IP hash; one that does send a key is still verified.
 */
async function attestedDeviceId(
  request: Request,
  rawBody: Uint8Array,
  ipHash: string,
  context: ReadContext,
): Promise<string | null> {
  const keyId = request.headers.get(ATTEST_KEY_HEADER);
  const assertion = request.headers.get(ASSERTION_HEADER);
  if (!context.requireAttestation && keyId === null && assertion === null) return `unattested:${ipHash}`;
  const outcome = await context.deviceAttestor.verifyRequest({ keyId, assertion, payload: rawBody });
  return outcome.isValid ? outcome.deviceId : null;
}

function photoKinds(readRequest: LabelReadRequest): ReadonlySet<LabelPhotoKind> {
  return new Set(readRequest.photos.map((photo) => photo.kind));
}

/** A failed AI read doesn't count against the device's day or the global cap. */
async function readLabelOrRefund(
  request: Request,
  readRequest: LabelReadRequest,
  deviceHash: string,
  context: ReadContext,
): Promise<ModelLabelReading | null> {
  try {
    return await context.labelReader.read({ photos: readRequest.photos, signal: request.signal });
  } catch (error) {
    context.logger("reader_failed", error);
    await context.rateLimits.refundDeviceRead(deviceHash);
    return null;
  }
}

/**
 * Merges into any saved reading and saves it. The read has already been paid
 * for, so a storage failure still returns what was read.
 */
async function saveMergedReading(
  barcode: string,
  content: LabelContent,
  contributorHash: string,
  context: ReadContext,
): Promise<StoredLabelReading> {
  const fresh = (saved: LabelContent | null): StoredLabelReading => ({
    barcode,
    ...mergeReadings(saved, content),
    readAt: context.now().toISOString(),
    contributorHash,
    model: context.model,
  });
  try {
    const merged = fresh(await context.readings.find(barcode));
    await context.readings.save(merged);
    return merged;
  } catch (error) {
    context.logger("reading_not_saved", error);
    return fresh(null);
  }
}

function scheduleContribution(
  readRequest: LabelReadRequest,
  language: string | null,
  deviceHash: string,
  context: ReadContext,
): void {
  const contributor = context.photoContributor;
  if (!readRequest.shareWithOpenFoodFacts || contributor === null) return;
  const contribution = { barcode: readRequest.barcode, photos: readRequest.photos, contributorId: deviceHash, language };
  context.scheduleAfterResponse(() => contributor.contribute(contribution));
}

export interface LabelLookupHandlerDependencies {
  rateLimits: LabelRateLimits;
  readings: LabelReadingStore;
  hashIdentifier: IdentifierHasher;
  logger?: LabelLogger;
}

/** GET: a cheap cache read, limited per IP, no attestation. */
export function createLabelLookupHandler(dependencies: LabelLookupHandlerDependencies): LabelLookupHandler {
  const logger = dependencies.logger ?? consoleLabelLogger;
  return async (request, barcode) => {
    try {
      const ipHash = dependencies.hashIdentifier(clientIpAddress(request.headers));
      const client = await dependencies.rateLimits.checkLookupClient(ipHash);
      if (!client.isAllowed) return labelErrorResponse("rate_limited", client.retryAfterSeconds);
      if (!isValidBarcode(barcode)) return labelErrorResponse("invalid_request");

      const saved = await dependencies.readings.find(barcode);
      return saved ? jsonResponse({ reading: toPublicReading(saved) }) : labelErrorResponse("not_found");
    } catch (error) {
      logger("unexpected_error", error);
      return labelErrorResponse("unavailable");
    }
  };
}
