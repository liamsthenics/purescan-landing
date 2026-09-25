// Result wording shared by the phone mockup and examples, mirroring the app's ResultCopy.
import type { ExampleProduct } from "./examples.ts";
import {
  NUTRIENTS,
  NUTRIENT_BANDS,
  PROCESSING_LABELS,
  WEIGHTS,
  bandFor,
  capLabel,
  capNote,
  capRule,
  countsAsHighIn,
  scoreProduct,
  type CapReason,
  type NutrientBand,
} from "./scoring.ts";
import type { Tier } from "./tiers.ts";

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

function countOfTier(product: ExampleProduct, tier: Tier): number {
  return product.facts.findings.filter((finding) => finding === tier).length;
}

/** "sugars", "sugars and salt": the nutrients with a red traffic light. */
function highNutrientNames(product: ExampleProduct): string | null {
  const names = nutrientReadings(product)
    .filter((reading) => reading.band === "high")
    .map((reading) => reading.label.toLowerCase());
  return names.length > 0 ? names.join(" and ") : null;
}

/** Like highNutrientNames, but only the red lights that trigger a cap (see scoring.countsAsHighIn). */
function cappingNutrientNames(product: ExampleProduct): string | null {
  const names = NUTRIENTS.filter(({ nutrient }) => {
    const amount = product.facts.nutrition?.[nutrient];
    if (amount === undefined) return false;
    return bandFor(nutrient, amount, product.facts.isDrink) === "high" && countsAsHighIn(nutrient, product.facts);
  }).map(({ label }) => label.toLowerCase());
  return names.length > 0 ? names.join(" and ") : null;
}

const WHY_LINE_SEPARATOR = " · ";
const NOTHING_OF_CONCERN = "Nothing of concern found";

/** The facts behind a score, e.g. ["3 of moderate concern", "High in sugars", "Ultra-processed"]. */
export function whyLineFacts(product: ExampleProduct): string[] {
  const facts: string[] = [];
  const highCount = countOfTier(product, "high");
  const moderateCount = countOfTier(product, "moderate");
  if (highCount > 0) facts.push(`${highCount} of high concern`);
  if (moderateCount > 0) facts.push(`${moderateCount} of moderate concern`);
  const highNutrients = highNutrientNames(product);
  if (highNutrients) facts.push(`High in ${highNutrients}`);
  if (product.facts.nova === 4) facts.push("Ultra-processed");
  return facts.length > 0 ? facts : [NOTHING_OF_CONCERN];
}

/** The why-line, e.g. "3 of moderate concern · High in sugars · Ultra-processed". */
export function whyLine(product: ExampleProduct): string {
  return whyLineFacts(product).join(WHY_LINE_SEPARATOR);
}

function ingredientCount(count: number, tierWords: string): string {
  return count === 1 ? `contains 1 ingredient of ${tierWords}` : `contains ${count} ingredients of ${tierWords}`;
}

/** The cap's reason for this product, with its real counts and nutrients. */
function productCapReason(reason: CapReason, product: ExampleProduct): string {
  const highNutrients = cappingNutrientNames(product);
  switch (reason) {
    case "highConcernIngredient":
      return ingredientCount(countOfTier(product, "high"), "high concern");
    case "severalModerateIngredients":
      return ingredientCount(countOfTier(product, "moderate"), "moderate concern");
    case "ultraProcessedAndHighIn":
      return highNutrients ? `ultra-processed and high in ${highNutrients}` : capRule(reason).capReason;
    case "highIn":
      return highNutrients ? `high in ${highNutrients}` : capRule(reason).capReason;
    default:
      return capRule(reason).capReason;
  }
}

export interface CapNote {
  max: number;
  /** "Capped at 40" */
  label: string;
  /** "contains 3 ingredients of moderate concern" */
  reason: string;
}

export function capNoteParts(product: ExampleProduct): CapNote | null {
  const { cap } = scoreProduct(product.facts);
  return cap ? { max: cap.max, label: capLabel(cap.max), reason: productCapReason(cap.reason, product) } : null;
}

/** "Capped at 40: contains 3 ingredients of moderate concern", or null when no cap applied. */
export function capNoteFor(product: ExampleProduct): string | null {
  const note = capNoteParts(product);
  return note ? capNote(note.max, note.reason) : null;
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

export interface KeyFact {
  /** Set large, e.g. "3", "10.6g", "NOVA 4". */
  value: string;
  /** e.g. "of moderate concern", "sugars per 100 ml". */
  label: string;
}

/** "10.6g": the compact form used in the facts strip. */
function compactGrams(value: number): string {
  return formatGrams(value).replace(" ", "");
}

function concernFact(product: ExampleProduct): KeyFact {
  const highCount = countOfTier(product, "high");
  if (highCount > 0) return { value: String(highCount), label: "of high concern" };
  const moderateCount = countOfTier(product, "moderate");
  if (moderateCount > 0) return { value: String(moderateCount), label: "of moderate concern" };
  return { value: "0", label: "flagged ingredients" };
}

/** The three facts under the score, as in the app: concerns, sugars, processing. */
export function keyFacts(product: ExampleProduct): KeyFact[] {
  const facts = [concernFact(product)];
  const sugars = product.facts.nutrition?.sugars;
  const unit = product.facts.isDrink ? "100 ml" : "100 g";
  if (sugars !== undefined) facts.push({ value: compactGrams(sugars), label: `sugars per ${unit}` });
  const nova = product.facts.nova;
  if (nova) facts.push({ value: `NOVA ${nova}`, label: PROCESSING_LABELS[nova].toLowerCase() });
  return facts;
}

export interface NutrientBar extends NutrientReading {
  /** Widths of the low, medium and high zones, in grams (high is drawn as wide as the high threshold). */
  zones: [number, number, number];
  /** Where the amount sits along the bar, 0 to 1. */
  position: number;
}

const BAND_SEVERITY: Record<NutrientBand, number> = { high: 0, medium: 1, low: 2 };

/** Nutrients against the UK front-of-pack thresholds, highest band first. */
export function nutrientBars(product: ExampleProduct): NutrientBar[] {
  const kind = product.facts.isDrink ? "drink" : "food";
  const bars = NUTRIENTS.flatMap(({ nutrient, label }) => {
    const amount = product.facts.nutrition?.[nutrient];
    if (amount === undefined) return [];
    const { lowMax, highMin } = NUTRIENT_BANDS[kind][nutrient];
    const scaleMax = highMin * 2;
    return [
      {
        label,
        amount,
        band: bandFor(nutrient, amount, product.facts.isDrink),
        zones: [lowMax, highMin - lowMax, highMin] as [number, number, number],
        position: Math.min(1, Math.max(0, amount / scaleMax)),
      },
    ];
  });
  return bars.sort((first, second) => BAND_SEVERITY[first.band] - BAND_SEVERITY[second.band]);
}
