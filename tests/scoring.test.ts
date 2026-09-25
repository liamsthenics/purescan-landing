import { test } from "node:test";
import assert from "node:assert/strict";
import { CAPS, bandFor, scoreProduct, softCap } from "../lib/scoring.ts";
import { FIZZBROOK_COLA, ORCHARD_LANE_PRESSE } from "../lib/examples.ts";

test("caps are listed strictest first with the app's maximums", () => {
  assert.deepEqual(
    CAPS.map((rule) => rule.max),
    [30, 40, 45, 50, 60, 60, 65, 70],
  );
});

test("soft cap scales between 40% of the cap and the full cap", () => {
  assert.equal(softCap(40, 0), 16);
  assert.equal(softCap(40, 100), 40);
});

test("drinks use levy-based sugar bands", () => {
  assert.equal(bandFor("sugars", 2.5, true), "low");
  assert.equal(bandFor("sugars", 8, true), "medium");
  assert.equal(bandFor("sugars", 8.1, true), "high");
  assert.equal(bandFor("sugars", 8.1, false), "medium");
});

test("the Fizzbrook example scores 25, held down by three Limit ingredients", () => {
  const result = scoreProduct(FIZZBROOK_COLA.facts);
  assert.equal(result.ingredients, 40);
  assert.equal(result.nutrition, 40);
  assert.equal(result.processing, 30);
  assert.equal(Math.round(result.average), 38);
  assert.equal(result.cap?.reason, "severalLimitIngredients");
  assert.equal(result.score, 25);
});

test("the Orchard Lane swap scores 84 with no cap", () => {
  const result = scoreProduct(ORCHARD_LANE_PRESSE.facts);
  assert.equal(result.cap, null);
  assert.equal(result.score, 84);
});

test("an Avoid ingredient holds a product down to at most 30", () => {
  const result = scoreProduct({
    findings: ["high"],
    nutrition: { fat: 1, saturatedFat: 0.5, sugars: 2, salt: 0.1 },
    isDrink: false,
    nova: 3,
  });
  assert.equal(result.cap?.reason, "avoidIngredient");
  assert.ok(result.score <= 30);
});

test("natural fat in whole foods doesn't cap the score", () => {
  const nuts = scoreProduct({
    findings: [],
    nutrition: { fat: 50, saturatedFat: 6, sugars: 4, salt: 0, protein: 20, fibre: 9 },
    isDrink: false,
    nova: 1,
  });
  assert.equal(nuts.cap, null);
});

test("missing nutrition caps the score at 70", () => {
  const result = scoreProduct({ findings: [], isDrink: false, nova: 1 });
  assert.equal(result.nutrition, null);
  assert.equal(result.cap?.reason, "missingNutrition");
  assert.equal(result.score, 70);
});

test("result copy for the examples matches the app's wording", async () => {
  const { CLEARWELL_LIME } = await import("../lib/examples.ts");
  const { heldDownNote, mainDifference, whyLine, formatGrams } = await import("../lib/result-copy.ts");
  assert.equal(whyLine(FIZZBROOK_COLA), "3 to limit · High in sugars · Ultra-processed");
  assert.equal(heldDownNote(FIZZBROOK_COLA), "Held down: contains several ingredients we suggest limiting.");
  assert.equal(heldDownNote(CLEARWELL_LIME), null);
  assert.equal(mainDifference(FIZZBROOK_COLA, CLEARWELL_LIME), "sugars");
  assert.equal(mainDifference(FIZZBROOK_COLA, ORCHARD_LANE_PRESSE), "additives");
  assert.equal(formatGrams(10.6), "10.6 g");
  assert.equal(formatGrams(0), "0 g");
});
