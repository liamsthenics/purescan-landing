import { test } from "node:test";
import assert from "node:assert/strict";
import { createIdentifierHasher } from "../lib/chat/hashing.ts";
import { InMemoryRateLimitStore } from "../lib/chat/rate-limit.ts";
import { PHOTO_LIMITS, RATE_LIMITS } from "../lib/label/config.ts";
import {
  ASSERTION_HEADER,
  ATTEST_KEY_HEADER,
  createLabelLookupHandler,
  createLabelReadHandler,
  selectLabelReadHandler,
  type LabelReadHandler,
} from "../lib/label/handler.ts";
import { LABEL_ERROR_MESSAGES, type LabelErrorCode } from "../lib/label/http.ts";
import { LabelRateLimiter } from "../lib/label/rate-limit.ts";
import { KeyValueLabelReadingStore, readingKey, type LabelReadingStore } from "../lib/label/reading-store.ts";
import type { ModelLabelReading } from "../lib/label/reading.ts";
import { InMemoryKeyValueStore } from "../lib/store/key-value-store.ts";
import {
  ASSERTION,
  BARCODE,
  FULL_READING,
  FakeAttestor,
  FakeContributor,
  FakeReader,
  KEY_ID,
  NUTRITION,
  fakeJpeg,
  type LoggedEvent,
} from "./label-test-support.ts";

const READ_AT = new Date("2026-09-27T10:00:00.000Z");
const hashIdentifier = createIdentifierHasher("test-secret");

interface Harness {
  handle: LabelReadHandler;
  attestor: FakeAttestor;
  reader: FakeReader;
  readings: LabelReadingStore;
  keyValues: InMemoryKeyValueStore;
  rateLimitStore: InMemoryRateLimitStore;
  contributor: FakeContributor;
  scheduled: (() => Promise<void>)[];
  logged: LoggedEvent[];
}

interface HarnessOptions {
  reading?: ModelLabelReading;
  globalDailyLimit?: number;
  requireAttestation?: boolean;
  withContributor?: boolean;
}

function harness(options: HarnessOptions = {}): Harness {
  const attestor = new FakeAttestor();
  const reader = new FakeReader(options.reading);
  const keyValues = new InMemoryKeyValueStore();
  const readings = new KeyValueLabelReadingStore(keyValues);
  const rateLimitStore = new InMemoryRateLimitStore();
  const contributor = new FakeContributor();
  const scheduled: (() => Promise<void>)[] = [];
  const logged: LoggedEvent[] = [];
  const handle = createLabelReadHandler({
    deviceAttestor: attestor,
    rateLimits: new LabelRateLimiter({
      store: rateLimitStore,
      globalDailyLimit: options.globalDailyLimit ?? RATE_LIMITS.defaultGlobalDailyLimit,
    }),
    labelReader: reader,
    readings,
    hashIdentifier,
    model: "test-model",
    requireAttestation: options.requireAttestation ?? true,
    photoContributor: options.withContributor === false ? null : contributor,
    scheduleAfterResponse: (work) => scheduled.push(work),
    now: () => READ_AT,
    logger: (event, error) => logged.push({ event, error }),
  });
  return { handle, attestor, reader, readings, keyValues, rateLimitStore, contributor, scheduled, logged };
}

const jpegBase64 = fakeJpeg().toString("base64");

function readBody(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    barcode: BARCODE,
    photos: [
      { kind: "ingredients", jpeg: jpegBase64 },
      { kind: "nutrition", jpeg: jpegBase64 },
    ],
    ...overrides,
  };
}

function labelRequest(body: unknown = readBody(), headers: Record<string, string> = {}): Request {
  return new Request("https://www.purescan.io/api/label", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": "203.0.113.7",
      [ATTEST_KEY_HEADER]: KEY_ID,
      [ASSERTION_HEADER]: ASSERTION,
      ...headers,
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

async function assertError(response: Response, status: number, code: LabelErrorCode) {
  assert.equal(response.status, status);
  assert.equal(response.headers.get("cache-control"), "no-store");
  const body = await response.json();
  assert.equal(body.error, code);
  assert.equal(body.message, LABEL_ERROR_MESSAGES[code]);
  return body;
}

test("reads both photos, saves the reading and returns only the contract's fields", async () => {
  const { handle, reader, keyValues } = harness();
  const response = await handle(labelRequest());
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.deepEqual(await response.json(), {
    reading: {
      barcode: BARCODE,
      ingredientsText: FULL_READING.ingredientsText,
      ingredientsLanguage: "fr",
      nutrition: NUTRITION,
      readAt: READ_AT.toISOString(),
    },
  });
  assert.deepEqual(reader.inputs[0]?.photos.map((photo) => photo.kind), ["ingredients", "nutrition"]);

  const stored = JSON.parse((await keyValues.get(readingKey(BARCODE))) ?? "{}");
  assert.equal(stored.model, "test-model");
  assert.equal(stored.contributorHash, hashIdentifier("device-1"));
});

test("the assertion is checked over the exact raw body bytes", async () => {
  const { handle, attestor } = harness();
  const rawBody = JSON.stringify(readBody());
  await handle(labelRequest(rawBody));
  assert.equal(Buffer.from(attestor.requests[0]?.payload ?? []).toString("utf8"), rawBody);
});

test("a missing or invalid assertion gets 401 attestation_required and no AI read", async () => {
  const missing = harness();
  await assertError(await missing.handle(labelRequest(readBody(), { [ASSERTION_HEADER]: "" })), 401, "attestation_required");

  const invalid = harness();
  invalid.attestor.isAssertionValid = false;
  await assertError(await invalid.handle(labelRequest()), 401, "attestation_required");
  assert.equal(invalid.reader.inputs.length, 0);
});

test("without required attestation (local testing), an unattested request is keyed by IP", async () => {
  const { handle, attestor, reader } = harness({ requireAttestation: false });
  const request = new Request("https://www.purescan.io/api/label", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": "203.0.113.7" },
    body: JSON.stringify(readBody()),
  });
  assert.equal((await handle(request)).status, 200);
  assert.equal(attestor.requests.length, 0);
  assert.equal(reader.inputs.length, 1);
});

test("even without required attestation, a key that is sent must verify", async () => {
  const { handle, attestor } = harness({ requireAttestation: false });
  attestor.isAssertionValid = false;
  await assertError(await handle(labelRequest()), 401, "attestation_required");
});

test("invalid requests get 400 before attestation is checked", async () => {
  const { handle, attestor } = harness();
  const invalidBodies: unknown[] = [
    "{not json",
    readBody({ barcode: "12345" }),
    readBody({ barcode: "123456789012345" }),
    readBody({ barcode: "50000abc00000" }),
    readBody({ photos: [] }),
    readBody({
      photos: [
        { kind: "ingredients", jpeg: jpegBase64 },
        { kind: "nutrition", jpeg: jpegBase64 },
        { kind: "nutrition", jpeg: jpegBase64 },
      ],
    }),
    readBody({ photos: [{ kind: "ingredients", jpeg: jpegBase64 }, { kind: "ingredients", jpeg: jpegBase64 }] }),
    readBody({ photos: [{ kind: "front", jpeg: jpegBase64 }] }),
    readBody({ photos: [{ kind: "ingredients", jpeg: Buffer.from("GIF89a....").toString("base64") }] }),
    readBody({ photos: [{ kind: "ingredients", jpeg: "not base64!!" }] }),
    readBody({ shareWithOpenFoodFacts: "yes" }),
  ];
  for (const body of invalidBodies) {
    await assertError(await handle(labelRequest(body)), 400, "invalid_request");
  }
  assert.equal(attestor.requests.length, 0);
});

test("an oversized photo or body is refused with 400", async () => {
  const { handle } = harness();
  const oversizedPhoto = fakeJpeg(PHOTO_LIMITS.maxDecodedBytes + 1).toString("base64");
  await assertError(
    await handle(labelRequest(readBody({ photos: [{ kind: "ingredients", jpeg: oversizedPhoto }] }))),
    400,
    "invalid_request",
  );
  const atLimit = fakeJpeg(PHOTO_LIMITS.maxDecodedBytes).toString("base64");
  assert.equal((await handle(labelRequest(readBody({ photos: [{ kind: "ingredients", jpeg: atLimit }] })))).status, 200);
});

test("a photo that isn't a readable food label gets 422 and still counts", async () => {
  const notALabel: ModelLabelReading = { isFoodLabel: false, ingredientsText: null, ingredientsLanguage: null, nutrition: null };
  const { handle, keyValues, rateLimitStore } = harness({ reading: notALabel });
  await assertError(await handle(labelRequest()), 422, "unreadable");
  assert.equal(await keyValues.get(readingKey(BARCODE)), null);
  assert.equal((await rateLimitStore.peek(`purescan:label:device:day:${hashIdentifier("device-1")}`))?.count, 1);

  const blank = harness({ reading: { ...notALabel, isFoodLabel: true } });
  await assertError(await blank.handle(labelRequest()), 422, "unreadable");
});

test("only the parts for the photo kinds sent are used", async () => {
  const { handle } = harness();
  const response = await handle(labelRequest(readBody({ photos: [{ kind: "nutrition", jpeg: jpegBase64 }] })));
  const { reading } = await response.json();
  assert.equal(reading.ingredientsText, null);
  assert.deepEqual(reading.nutrition, NUTRITION);
});

test("a saved part is kept, so a later photo can't replace it", async () => {
  const { handle, reader } = harness();
  await handle(labelRequest());

  reader.reading = { ...FULL_READING, ingredientsText: "Rye flour, water.", ingredientsLanguage: "de", nutrition: null };
  const response = await handle(labelRequest(readBody({ photos: [{ kind: "ingredients", jpeg: jpegBase64 }] })));
  const { reading } = await response.json();
  assert.equal(reading.ingredientsText, FULL_READING.ingredientsText);
  assert.deepEqual(reading.nutrition, NUTRITION);
});

test("an AI failure is a 503 and is refunded against the device and global counts", async () => {
  const { handle, reader, logged, rateLimitStore } = harness({ globalDailyLimit: 1 });
  reader.shouldFail = true;
  await assertError(await handle(labelRequest()), 503, "unavailable");
  assert.ok(logged.some((entry) => entry.event === "reader_failed"));
  assert.equal((await rateLimitStore.peek(`purescan:label:device:day:${hashIdentifier("device-1")}`))?.count, 0);

  // The refunded global count means the single daily read is still available.
  reader.shouldFail = false;
  assert.equal((await handle(labelRequest())).status, 200);
});

test("each device gets 10 reads a day", async () => {
  const { handle } = harness();
  for (let read = 0; read < RATE_LIMITS.readsPerDevicePerDay; read += 1) {
    const response = await handle(labelRequest(readBody(), { "x-forwarded-for": `198.51.100.${read}` }));
    assert.equal(response.status, 200);
  }
  const refused = await handle(labelRequest(readBody(), { "x-forwarded-for": "198.51.100.200" }));
  const body = await assertError(refused, 429, "rate_limited");
  assert.ok(Number(refused.headers.get("retry-after")) > 0);
  assert.equal(body.retryAfter, Number(refused.headers.get("retry-after")));
});

test("each IP gets 20 photo reads an hour, checked before the body is read", async () => {
  const { handle, attestor } = harness({ globalDailyLimit: 1_000 });
  for (let read = 0; read < RATE_LIMITS.readsPerIpPerHour; read += 1) await handle(labelRequest("{}"));
  const refused = await handle(labelRequest());
  await assertError(refused, 429, "rate_limited");
  assert.ok(refused.headers.get("retry-after"));
  assert.equal(attestor.requests.length, 0);
});

test("the global daily cap switches reads off with 503", async () => {
  const { handle, reader, logged } = harness({ globalDailyLimit: 1 });
  assert.equal((await handle(labelRequest())).status, 200);
  await assertError(await handle(labelRequest()), 503, "unavailable");
  assert.equal(reader.inputs.length, 1);
  assert.ok(logged.some((entry) => entry.event === "global_cap_reached"));
});

test("opted-in photos are given to Open Food Facts after the response", async () => {
  const { handle, contributor, scheduled } = harness();
  await handle(labelRequest(readBody({ shareWithOpenFoodFacts: true })));
  assert.equal(contributor.contributions.length, 0, "nothing is uploaded before the response");
  assert.equal(scheduled.length, 1);
  await scheduled[0]?.();
  const [contribution] = contributor.contributions;
  assert.equal(contribution?.barcode, BARCODE);
  assert.equal(contribution?.contributorId, hashIdentifier("device-1"));
  assert.deepEqual(contribution?.photos.map((photo) => photo.kind), ["ingredients", "nutrition"]);
});

test("nothing is given to Open Food Facts without opt-in, configuration or a readable label", async () => {
  const notOptedIn = harness();
  await notOptedIn.handle(labelRequest());
  assert.equal(notOptedIn.scheduled.length, 0);

  const notConfigured = harness({ withContributor: false });
  await notConfigured.handle(labelRequest(readBody({ shareWithOpenFoodFacts: true })));
  assert.equal(notConfigured.scheduled.length, 0);

  const unreadable = harness({ reading: { ...FULL_READING, isFoodLabel: false } });
  await unreadable.handle(labelRequest(readBody({ shareWithOpenFoodFacts: true })));
  assert.equal(unreadable.scheduled.length, 0);
});

test("the kill switch answers 503 without doing any work", async () => {
  let built = false;
  const handle = selectLabelReadHandler({ photoReadsEnabled: false }, () => {
    built = true;
    return harness().handle;
  });
  await assertError(await handle(labelRequest()), 503, "unavailable");
  assert.equal(built, false);
});

test("a storage failure still returns what was read", async () => {
  const { handle, readings, logged } = harness();
  readings.save = async () => {
    throw new Error("store down");
  };
  const response = await handle(labelRequest());
  assert.equal(response.status, 200);
  assert.ok(logged.some((entry) => entry.event === "reading_not_saved"));
});

function lookupHarness() {
  const keyValues = new InMemoryKeyValueStore();
  const readings = new KeyValueLabelReadingStore(keyValues);
  const handle = createLabelLookupHandler({
    rateLimits: new LabelRateLimiter({ store: new InMemoryRateLimitStore(), globalDailyLimit: 1 }),
    readings,
    hashIdentifier,
    logger: () => {},
  });
  return { handle, readings, keyValues };
}

function lookupRequest(ip = "203.0.113.9"): Request {
  return new Request(`https://www.purescan.io/api/label/${BARCODE}`, { headers: { "x-forwarded-for": ip } });
}

test("GET returns a saved reading without the private fields, or 404", async () => {
  const { handle, readings } = lookupHarness();
  await assertError(await handle(lookupRequest(), BARCODE), 404, "not_found");

  await readings.save({
    barcode: BARCODE,
    ingredientsText: "Oats.",
    ingredientsLanguage: "en",
    nutrition: null,
    readAt: READ_AT.toISOString(),
    contributorHash: "secret-hash",
    model: "test-model",
  });
  const response = await handle(lookupRequest(), BARCODE);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    reading: { barcode: BARCODE, ingredientsText: "Oats.", ingredientsLanguage: "en", nutrition: null, readAt: READ_AT.toISOString() },
  });
});

test("GET rejects a bad barcode and treats a corrupt record as missing", async () => {
  const { handle, keyValues } = lookupHarness();
  await assertError(await handle(lookupRequest(), "12345"), 400, "invalid_request");
  await assertError(await handle(lookupRequest(), "../../etc"), 400, "invalid_request");
  await keyValues.set(readingKey(BARCODE), "{corrupt", 60);
  await assertError(await handle(lookupRequest(), BARCODE), 404, "not_found");
});

test("GET is limited to 300 lookups an hour per IP", async () => {
  const { handle } = lookupHarness();
  for (let lookup = 0; lookup < RATE_LIMITS.lookupsPerIpPerHour; lookup += 1) await handle(lookupRequest(), BARCODE);
  const refused = await handle(lookupRequest(), BARCODE);
  await assertError(refused, 429, "rate_limited");
  assert.ok(refused.headers.get("retry-after"));
  assert.equal((await handle(lookupRequest("203.0.113.10"), BARCODE)).status, 404);
});

test("GET answers 503 when storage fails", async () => {
  const { handle, readings } = lookupHarness();
  readings.find = async () => {
    throw new Error("store down");
  };
  await assertError(await handle(lookupRequest(), BARCODE), 503, "unavailable");
});
