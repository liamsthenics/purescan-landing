import { test } from "node:test";
import assert from "node:assert/strict";
import { MAX_LABEL_REQUEST_BODY_BYTES, READING_LIMITS } from "../lib/label/config.ts";
import {
  LABEL_RESPONSE_SCHEMA,
  LABEL_SYSTEM_INSTRUCTION,
  LabelModelOutputError,
  parseModelText,
  toGeminiParts,
} from "../lib/label/gemini-label-reader.ts";
import { contentForKinds, mergeReadings, parseModelReading, type LabelContent } from "../lib/label/reading.ts";
import { parseLabelReadRequest } from "../lib/label/validation.ts";
import { readBodyBytesWithLimit } from "../lib/chat/http.ts";
import { BARCODE, FULL_READING, NUTRITION, fakeJpeg } from "./label-test-support.ts";

test("keeps in-range values and drops out-of-range ones without failing the reading", () => {
  const reading = parseModelReading({
    isFoodLabel: true,
    ingredientsText: "Oats (100%).",
    ingredientsLanguage: "EN",
    nutrition: {
      basis: "100g",
      energyKcal: 950,
      energyKilojoules: 3_800,
      fat: 101,
      saturatedFat: -1,
      carbohydrates: 60,
      sugars: "1",
      fibre: 0,
      protein: 13,
      salt: null,
    },
  });
  assert.equal(reading.ingredientsLanguage, "en");
  assert.deepEqual(reading.nutrition, {
    basis: "100g",
    energyKcal: null,
    energyKilojoules: READING_LIMITS.energyKilojoulesMax,
    fat: null,
    saturatedFat: null,
    carbohydrates: 60,
    sugars: null,
    fibre: 0,
    protein: 13,
    salt: null,
  });
});

test("per-serving or valueless nutrition is no nutrition", () => {
  const perServing = parseModelReading({ ...FULL_READING, nutrition: { ...NUTRITION, basis: "serving" } });
  assert.equal(perServing.nutrition, null);
  const empty = parseModelReading({ ...FULL_READING, nutrition: { basis: "100ml", fat: 500 } });
  assert.equal(empty.nutrition, null);
});

test("ingredient text is cleaned of control characters and cut to 3,000 characters", () => {
  const cleaned = parseModelReading({ ...FULL_READING, ingredientsText: "  Sugar,\u0000 cocoa​ butter.\u0007 " });
  assert.equal(cleaned.ingredientsText, "Sugar, cocoa butter.");

  const long = parseModelReading({ ...FULL_READING, ingredientsText: "é".repeat(READING_LIMITS.ingredientsTextMaxCharacters + 50) });
  assert.equal(Array.from(long.ingredientsText ?? "").length, READING_LIMITS.ingredientsTextMaxCharacters);

  assert.equal(parseModelReading({ ...FULL_READING, ingredientsText: " \u0000 " }).ingredientsText, null);
  assert.equal(parseModelReading({ ...FULL_READING, ingredientsLanguage: "french" }).ingredientsLanguage, null);
});

test("model output that isn't the requested JSON is a failed read", () => {
  assert.throws(() => parseModelText(undefined), LabelModelOutputError);
  assert.throws(() => parseModelText("not json"), LabelModelOutputError);
  assert.throws(() => parseModelText(JSON.stringify({ ingredientsText: "Oats" })), LabelModelOutputError);
  assert.equal(parseModelText(JSON.stringify(FULL_READING)).ingredientsText, FULL_READING.ingredientsText);
});

test("photos go to the model as labelled inline JPEG parts", () => {
  const jpeg = fakeJpeg();
  const parts = toGeminiParts([{ kind: "nutrition", jpeg }]);
  assert.equal(parts[0]?.text, "Photo of the nutrition label:");
  assert.deepEqual(parts[1]?.inlineData, { mimeType: "image/jpeg", data: jpeg.toString("base64") });
});

test("the model is told to treat label text as data and never guess", () => {
  assert.match(LABEL_SYSTEM_INSTRUCTION, /never instructions/i);
  assert.match(LABEL_SYSTEM_INSTRUCTION, /Never guess/);
  assert.match(LABEL_SYSTEM_INSTRUCTION, /per-serving/);
  assert.deepEqual(LABEL_RESPONSE_SCHEMA.required, ["isFoodLabel", "ingredientsText", "ingredientsLanguage", "nutrition"]);
});

test("only the parts for the photo kinds sent are taken from a reading", () => {
  assert.deepEqual(contentForKinds(FULL_READING, new Set(["nutrition"])), {
    ingredientsText: null,
    ingredientsLanguage: null,
    nutrition: NUTRITION,
  });
  assert.deepEqual(contentForKinds(FULL_READING, new Set(["ingredients"])), {
    ingredientsText: FULL_READING.ingredientsText,
    ingredientsLanguage: "fr",
    nutrition: null,
  });
});

test("merging keeps the first reading of each part and only fills missing parts", () => {
  const saved: LabelContent = { ingredientsText: "Old list.", ingredientsLanguage: "en", nutrition: NUTRITION };
  const newNutrition = { ...NUTRITION, sugars: 10 };
  // A later photo can't replace what's saved, so one bad photo can't overwrite a good reading.
  assert.deepEqual(mergeReadings(saved, { ingredientsText: "New list.", ingredientsLanguage: "it", nutrition: newNutrition }), saved);
  const ingredientsOnly: LabelContent = { ingredientsText: "Old list.", ingredientsLanguage: "en", nutrition: null };
  assert.deepEqual(mergeReadings(ingredientsOnly, { ingredientsText: null, ingredientsLanguage: null, nutrition: newNutrition }), {
    ingredientsText: "Old list.",
    ingredientsLanguage: "en",
    nutrition: newNutrition,
  });
  assert.deepEqual(mergeReadings(null, { ingredientsText: "List.", ingredientsLanguage: null, nutrition: null }), {
    ingredientsText: "List.",
    ingredientsLanguage: null,
    nutrition: null,
  });
});

test("the request defaults shareWithOpenFoodFacts to false", () => {
  const parsed = parseLabelReadRequest({ barcode: BARCODE, photos: [{ kind: "ingredients", jpeg: fakeJpeg().toString("base64") }] });
  assert.equal(parsed?.shareWithOpenFoodFacts, false);
  assert.ok(parsed?.photos[0]?.jpeg.equals(fakeJpeg()));
});

test("a body over the limit is refused while reading, even without Content-Length", async () => {
  const oversized = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(new Uint8Array(MAX_LABEL_REQUEST_BODY_BYTES));
      controller.enqueue(new Uint8Array(1));
      controller.close();
    },
  });
  const request = new Request("https://www.purescan.io/api/label", { method: "POST", body: oversized, duplex: "half" } as RequestInit);
  assert.equal(await readBodyBytesWithLimit(request, MAX_LABEL_REQUEST_BODY_BYTES), null);
});
