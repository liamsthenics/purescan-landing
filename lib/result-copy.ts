// Result wording shared by the phone mockup and examples, mirroring the app's ResultCopy.
import type { ExampleProduct } from "./examples.ts";
import { NUTRIENTS, NUTRIENT_BANDS, WEIGHTS, bandFor, scoreProduct, type NutrientBand } from "./scoring.ts";

export interface NutrientReading {
  label: string;
  amount: number;
  band: NutrientBand;
}

export function nutrientReadings(product: ExampleProduct): NutrientReading[] {
  const { nutrition, isDrink } = product.facts;
  return NUTRIENTS.flatMap(({ nutrient, label }) => {
    const amount = nutrition?.[nutrient];
    return amount === undefined ? [] : [{ label, amount, band: bandFor(nutrient, amount, isDrink) }];
  });
}

/** "10.6 g", "0 g": one decimal unless it's a whole number. */
export function formatGrams(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? `${rounded} g` : `${rounded.toFixed(1)} g`;
}

/** The why-line, e.g. "3 to limit · High in sugars · Ultra-processed". */
export function whyLine(product: ExampleProduct): string {
  const facts: string[] = [];
  const avoid = product.facts.findings.filter((tier) => tier === "high").length;
  const limit = product.facts.findings.filter((tier) => tier === "moderate").length;
  if (avoid > 0) facts.push(`${avoid} to avoid`);
  if (limit > 0) facts.push(`${limit} to limit`);
  const high = nutrientReadings(product).filter((reading) => reading.band === "high");
  if (high.length > 0) facts.push(`High in ${high.map((reading) => reading.label.toLowerCase()).join(" and ")}`);
  if (product.facts.nova === 4) facts.push("Ultra-processed");
  return facts.length > 0 ? facts.join(" · ") : "Nothing of concern found";
}

export function heldDownNote(product: ExampleProduct): string | null {
  const { cap } = scoreProduct(product.facts);
  return cap ? `Held down: ${cap.heldDown}.` : null;
}

/**
 * What drives the gap between two products, e.g. "sugars" or "additives",
 * weighted the same way the score is (mirrors the app's mainDifference).
 */
export function mainDifference(worse: ExampleProduct, better: ExampleProduct): string | null {
  const worseScore = scoreProduct(worse.facts);
  const betterScore = scoreProduct(better.facts);
  const deltas: [string, number][] = [
    ["additives", (betterScore.ingredients - worseScore.ingredients) * WEIGHTS.ingredients],
    ["nutrition", ((betterScore.nutrition ?? 0) - (worseScore.nutrition ?? 0)) * WEIGHTS.nutrition],
    ["processing", ((betterScore.processing ?? 0) - (worseScore.processing ?? 0)) * WEIGHTS.processing],
  ];
  const [driver, amount] = deltas.reduce((top, delta) => (delta[1] > top[1] ? delta : top));
  if (amount <= 0) return null;
  if (driver !== "nutrition") return driver;

  // The app compares nutrient gaps against the food thresholds for both kinds of product.
  const gaps = NUTRIENTS.flatMap(({ nutrient, label }) => {
    const worseAmount = worse.facts.nutrition?.[nutrient];
    const betterAmount = better.facts.nutrition?.[nutrient];
    if (worseAmount === undefined || betterAmount === undefined) return [];
    return [{ label: label.toLowerCase(), gap: (worseAmount - betterAmount) / NUTRIENT_BANDS.food[nutrient].highMin }];
  });
  if (gaps.length === 0) return "nutrition";
  return gaps.reduce((top, gap) => (gap.gap > top.gap ? gap : top)).label;
}
