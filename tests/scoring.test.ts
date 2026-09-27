import { test } from "node:test";
import assert from "node:assert/strict";
import { CAPS, bandFor, scoreProduct, softCap } from "../lib/scoring.ts";
import { FIZZBROOK_COLA, ORCHARD_LANE_PRESSE } from "../lib/examples.ts";

test("caps are listed strictest first with the app's maximums", () => {
  assert.deepEqual(
    CAPS.map((rule) => rule.max),
    [30, 40, 45, 50, 60, 60, 65, 70, 70, 70],
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

test("the Fizzbrook example scores 25, capped by three ingredients of moderate concern", () => {
  const result = scoreProduct(FIZZBROOK_COLA.facts);
  assert.equal(result.ingredients, 40);
  assert.equal(result.nutrition, 40);
  assert.equal(result.processing, 30);
  assert.equal(Math.round(result.average), 38);
  assert.equal(result.cap?.reason, "severalModerateIngredients");
  assert.equal(result.score, 25);
});

test("the Orchard Lane alternative scores 84 with no cap", () => {
  const result = scoreProduct(ORCHARD_LANE_PRESSE.facts);
  assert.equal(result.cap, null);
  assert.equal(result.score, 84);
});

test("an ingredient of high concern caps a product at 30", () => {
  const result = scoreProduct({
    findings: ["high"],
    nutrition: { fat: 1, saturatedFat: 0.5, sugars: 2, salt: 0.1 },
    isDrink: false,
    nova: 3,
  });
  assert.equal(result.cap?.reason, "highConcernIngredient");
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

test("missing salt caps the score at 70, like the app", () => {
  const result = scoreProduct({
    findings: [],
    nutrition: { fat: 2, saturatedFat: 0.4, sugars: 3, protein: 9 },
    isDrink: false,
    nova: 3,
  });
  assert.equal(result.cap?.reason, "incompleteNutrition");
  assert.ok(result.score <= 70);
});

test("missing salt doesn't cap a whole food", () => {
  const oats = scoreProduct({ findings: [], nutrition: { fat: 8, saturatedFat: 1.5, sugars: 1, protein: 11 }, isDrink: false, nova: 1 });
  assert.notEqual(oats.cap?.reason, "incompleteNutrition");
});

test("missing saturates doesn't cap a drink with no fat", () => {
  const result = scoreProduct({ findings: [], nutrition: { fat: 0, sugars: 4.5, salt: 0.05 }, isDrink: true, nova: 4 });
  assert.notEqual(result.cap?.reason, "incompleteNutrition");
});

test("a cap note names only the red lights that caused the cap", async () => {
  const { capNoteFor } = await import("../lib/result-copy.ts");
  // High in fat and sugars, but with enough protein that high fat doesn't count towards a cap.
  const proteinBar = {
    ...FIZZBROOK_COLA,
    facts: {
      findings: [],
      nutrition: { fat: 25, saturatedFat: 3, sugars: 30, salt: 0.2, protein: 12 },
      isDrink: false,
      nova: 3 as const,
    },
  };
  assert.equal(capNoteFor(proteinBar), "Capped at 60: high in sugars");
});

test("result copy for the examples follows the voice guide", async () => {
  const { WILD_SPRING_LEMON_LIME } = await import("../lib/examples.ts");
  const { capNoteFor, mainDifference, whyLine, formatGrams } = await import("../lib/result-copy.ts");
  assert.equal(whyLine(FIZZBROOK_COLA), "3 of moderate concern · High in sugars · Ultra-processed");
  assert.equal(capNoteFor(FIZZBROOK_COLA), "Capped at 40: contains 3 ingredients of moderate concern");
  assert.equal(capNoteFor(WILD_SPRING_LEMON_LIME), null);
  assert.equal(mainDifference(FIZZBROOK_COLA, WILD_SPRING_LEMON_LIME), "sugars");
  assert.equal(mainDifference(FIZZBROOK_COLA, ORCHARD_LANE_PRESSE), "additives");
  assert.equal(formatGrams(10.6), "10.6 g");
  assert.equal(formatGrams(0), "0 g");
});

test("the facts strip shows concerns, sugars and processing, as in the app", async () => {
  const { WILD_SPRING_LEMON_LIME } = await import("../lib/examples.ts");
  const { keyFacts } = await import("../lib/result-copy.ts");
  assert.deepEqual(keyFacts(FIZZBROOK_COLA), [
    { value: "3", label: "of moderate concern" },
    { value: "10.6g", label: "sugars per 100 ml" },
    { value: "NOVA 4", label: "ultra-processed" },
  ]);
  assert.deepEqual(keyFacts(WILD_SPRING_LEMON_LIME)[0], { value: "0", label: "flagged ingredients" });
});

test("nutrient bars sit against the UK thresholds, highest band first", async () => {
  const { nutrientBars } = await import("../lib/result-copy.ts");
  const [sugars, ...rest] = nutrientBars(FIZZBROOK_COLA);
  assert.equal(sugars.label, "Sugars");
  assert.equal(sugars.band, "high");
  assert.deepEqual(sugars.zones, [2.5, 5.5, 8]);
  assert.equal(sugars.position, 10.6 / 16);
  assert.ok(rest.every((bar) => bar.band === "low" && bar.position >= 0 && bar.position <= 1));
});

test("verdicts describe their range on the scale", async () => {
  const { verdictFor, verdictRangeText } = await import("../lib/verdict.ts");
  assert.equal(verdictRangeText(verdictFor(25)), "25–49 on the PureScan scale");
});
