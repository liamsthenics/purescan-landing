// The PureScan scoring method, mirrored from the app's
// PureScanCore/Analysis/ScoringPolicy.swift and HealthScorer.swift.
// The app is the source of truth: if its numbers change, change them here too.
import type { Tier } from "./tiers.ts";

export type Nutrient = "fat" | "saturatedFat" | "sugars" | "salt";
export type NutrientBand = "low" | "medium" | "high";
export type NovaGroup = 1 | 2 | 3 | 4;

export const NUTRIENTS: readonly { nutrient: Nutrient; label: string }[] = [
  { nutrient: "fat", label: "Fat" },
  { nutrient: "saturatedFat", label: "Saturates" },
  { nutrient: "sugars", label: "Sugars" },
  { nutrient: "salt", label: "Salt" },
];

export const WEIGHTS = { ingredients: 0.35, nutrition: 0.45, processing: 0.2 } as const;

export const INGREDIENT_PENALTIES: Record<Tier, number> = { high: 40, moderate: 20, low: 6, none: 0 };

/** UK FSA front-of-pack thresholds: low up to lowMax, high above highMin (per 100 g or 100 ml). */
export const NUTRIENT_BANDS: Record<"food" | "drink", Record<Nutrient, { lowMax: number; highMin: number }>> = {
  food: {
    fat: { lowMax: 3.0, highMin: 17.5 },
    saturatedFat: { lowMax: 1.5, highMin: 5.0 },
    sugars: { lowMax: 5.0, highMin: 22.5 },
    salt: { lowMax: 0.3, highMin: 1.5 },
  },
  drink: {
    fat: { lowMax: 1.5, highMin: 8.75 },
    saturatedFat: { lowMax: 0.75, highMin: 2.5 },
    // Drinks' high sugar band follows the UK soft drinks industry levy's higher rate (8 g).
    sugars: { lowMax: 2.5, highMin: 8.0 },
    salt: { lowMax: 0.3, highMin: 0.75 },
  },
};

/** Points removed from the nutrition part for a medium / high traffic light. */
export const NUTRIENT_PENALTIES: Record<"food" | "drink", Record<Nutrient, { medium: number; high: number }>> = {
  food: {
    sugars: { medium: 15, high: 40 },
    saturatedFat: { medium: 10, high: 30 },
    salt: { medium: 10, high: 30 },
    fat: { medium: 5, high: 20 },
  },
  drink: {
    sugars: { medium: 20, high: 60 },
    saturatedFat: { medium: 10, high: 30 },
    salt: { medium: 10, high: 30 },
    fat: { medium: 5, high: 20 },
  },
};

export const MINIMUM_KNOWN_NUTRIENTS = 3;
export const HIGH_FIBRE_GRAMS = 6;
export const HIGH_FIBRE_BONUS = 10;
export const HIGH_PROTEIN_GRAMS = 10;
export const HIGH_PROTEIN_BONUS = 5;

export const PROCESSING_SCORES: Record<NovaGroup, number> = { 1: 100, 2: 90, 3: 65, 4: 30 };

export const PROCESSING_LABELS: Record<NovaGroup, string> = {
  1: "Unprocessed",
  2: "Culinary ingredient",
  3: "Processed",
  4: "Ultra-processed",
};

/** The app's plain-English explanation of each NOVA group. */
export const PROCESSING_EXPLANATIONS: Record<NovaGroup, string> = {
  1: "Whole or minimally processed food, as close to nature as it gets.",
  2: "A basic kitchen ingredient like oil, butter, sugar or salt.",
  3: "Made from whole foods with added salt, sugar or oil, like cheese, bread or tinned veg.",
  4: "Made mostly from industrial ingredients rather than foods.",
};

export type CapReason =
  | "highConcernIngredient"
  | "severalModerateIngredients"
  | "ultraProcessedAndHighIn"
  | "twoModerateIngredients"
  | "highIn"
  | "ultraProcessed"
  | "moderateIngredient"
  | "missingNutrition"
  | "unreliableNutrition"
  | "incompleteNutrition";

export interface CapRule {
  reason: CapReason;
  max: number;
  /** When the cap applies. */
  condition: string;
  /** Factual reason shown after "Capped at N: ", in its general form. */
  capReason: string;
}

/** Every cap, strictest first. The lowest applicable cap wins. */
export const CAPS: readonly CapRule[] = [
  { reason: "highConcernIngredient", max: 30, condition: "Contains an ingredient of high concern", capReason: "contains an ingredient of high concern" },
  { reason: "severalModerateIngredients", max: 40, condition: "Three or more of moderate concern", capReason: "contains 3 or more ingredients of moderate concern" },
  { reason: "ultraProcessedAndHighIn", max: 45, condition: "Ultra-processed and high in sugar, salt or saturates", capReason: "ultra-processed and high in sugar, salt or saturates" },
  { reason: "twoModerateIngredients", max: 50, condition: "Two of moderate concern", capReason: "contains 2 ingredients of moderate concern" },
  { reason: "highIn", max: 60, condition: "High in sugar, salt or saturates", capReason: "high in sugar, salt or saturates" },
  { reason: "ultraProcessed", max: 60, condition: "Ultra-processed (NOVA 4)", capReason: "ultra-processed" },
  { reason: "moderateIngredient", max: 65, condition: "One of moderate concern", capReason: "contains 1 ingredient of moderate concern" },
  { reason: "missingNutrition", max: 70, condition: "Nutrition information missing", capReason: "nutrition information is missing" },
  { reason: "unreliableNutrition", max: 70, condition: "Nutrition figures that don't add up", capReason: "nutrition information on record doesn't add up" },
  { reason: "incompleteNutrition", max: 70, condition: "Salt, sugar or saturates not on record", capReason: "nutrition information is incomplete" },
];

/** "Capped at 40", the start of every cap note. */
export function capLabel(max: number): string {
  return `Capped at ${max}`;
}

/** "Capped at 40: contains 3 ingredients of moderate concern" (docs/voice.md wording). */
export function capNote(max: number, reason: string): string {
  return `${capLabel(max)}: ${reason}`;
}

/** Capped products score between this fraction of the cap and the full cap. */
export const SOFT_CAP_FLOOR = 0.4;

export function capRule(reason: CapReason): CapRule {
  const rule = CAPS.find((candidate) => candidate.reason === reason);
  if (!rule) throw new Error(`Unknown cap: ${reason}`);
  return rule;
}

export function softCap(cap: number, average: number): number {
  return cap * (SOFT_CAP_FLOOR + ((1 - SOFT_CAP_FLOOR) * average) / 100);
}

export interface ProductFacts {
  /** Tiers of every flagged additive or ingredient. */
  findings: Tier[];
  /** Per 100 g (food) or 100 ml (drinks); omit what's unknown. */
  nutrition?: Partial<Record<Nutrient, number>> & { fibre?: number; protein?: number; carbohydrates?: number };
  isDrink: boolean;
  nova?: NovaGroup;
}

export interface ScoreBreakdown {
  ingredients: number;
  nutrition: number | null;
  processing: number | null;
  average: number;
  cap: CapRule | null;
  score: number;
}

export function bandFor(nutrient: Nutrient, amount: number, isDrink: boolean): NutrientBand {
  const bands = NUTRIENT_BANDS[isDrink ? "drink" : "food"][nutrient];
  if (amount <= bands.lowMax) return "low";
  return amount > bands.highMin ? "high" : "medium";
}

function nutrientLevels(facts: ProductFacts): { nutrient: Nutrient; band: NutrientBand }[] {
  return NUTRIENTS.flatMap(({ nutrient }) => {
    const amount = facts.nutrition?.[nutrient];
    if (amount === undefined || amount < 0) return [];
    return [{ nutrient, band: bandFor(nutrient, amount, facts.isDrink) }];
  });
}

function ingredientsPart(findings: Tier[]): number {
  const penalty = findings.reduce((total, tier) => total + INGREDIENT_PENALTIES[tier], 0);
  return Math.max(0, 100 - penalty);
}

function nutritionPart(facts: ProductFacts, levels: { nutrient: Nutrient; band: NutrientBand }[]): number | null {
  if (levels.length < MINIMUM_KNOWN_NUTRIENTS) return null;
  const penalties = NUTRIENT_PENALTIES[facts.isDrink ? "drink" : "food"];
  let score = 100;
  for (const { nutrient, band } of levels) {
    if (band !== "low") score -= penalties[nutrient][band];
  }
  if ((facts.nutrition?.fibre ?? 0) >= HIGH_FIBRE_GRAMS) score += HIGH_FIBRE_BONUS;
  if (!facts.isDrink && (facts.nutrition?.protein ?? 0) >= HIGH_PROTEIN_GRAMS) score += HIGH_PROTEIN_BONUS;
  return Math.min(100, Math.max(0, score));
}

/** Whether a red traffic light triggers a cap (natural fat in whole foods doesn't). */
export function countsAsHighIn(nutrient: Nutrient, facts: ProductFacts): boolean {
  const isFat = nutrient === "fat" || nutrient === "saturatedFat";
  if (isFat && (facts.nova === 1 || facts.nova === 2)) return false;
  if (nutrient !== "fat") return true;
  return (facts.nutrition?.protein ?? 0) < HIGH_PROTEIN_GRAMS;
}

/**
 * Traffic-light nutrients not on record that could be high. Saturates can't
 * exceed fat and sugars can't exceed carbohydrate, so a known low parent rules
 * the missing one out. (The app also sets aside figures that can't be right,
 * e.g. salt typed in the wrong unit, and caps with "unreliableNutrition" when
 * the whole panel doesn't add up; examples here are hand-checked, so that
 * data check isn't mirrored.)
 */
export function unknownNutrientsThatCouldBeHigh(facts: ProductFacts): Nutrient[] {
  const nutrition = facts.nutrition ?? {};
  const bands = NUTRIENT_BANDS[facts.isDrink ? "drink" : "food"];
  return NUTRIENTS.map(({ nutrient }) => nutrient).filter((nutrient) => {
    if (nutrition[nutrient] !== undefined) return false;
    if (nutrient === "saturatedFat") return (nutrition.fat ?? Infinity) > bands.saturatedFat.highMin;
    if (nutrient === "sugars") return (nutrition.carbohydrates ?? Infinity) > bands.sugars.highMin;
    return true;
  });
}

function applicableCaps(
  facts: ProductFacts,
  isHighIn: boolean,
  hasNutrition: boolean,
  unknownNutrients: Nutrient[],
): CapReason[] {
  const reasons: CapReason[] = [];
  // Whole foods and kitchen ingredients (NOVA 1-2) have nothing added, so a missing figure can't hide a red light.
  const isWholeFood = facts.nova === 1 || facts.nova === 2;
  if (!hasNutrition) reasons.push("missingNutrition");
  else if (unknownNutrients.length > 0 && !isWholeFood) reasons.push("incompleteNutrition");
  if (facts.findings.includes("high")) reasons.push("highConcernIngredient");
  const moderateCount = facts.findings.filter((tier) => tier === "moderate").length;
  if (moderateCount === 1) reasons.push("moderateIngredient");
  if (moderateCount === 2) reasons.push("twoModerateIngredients");
  if (moderateCount >= 3) reasons.push("severalModerateIngredients");
  if (isHighIn) reasons.push("highIn");
  if (facts.nova === 4) reasons.push(isHighIn ? "ultraProcessedAndHighIn" : "ultraProcessed");
  return reasons;
}

/** Scores a product exactly as the app does (for products with an ingredient list). */
export function scoreProduct(facts: ProductFacts): ScoreBreakdown {
  const levels = nutrientLevels(facts);
  const ingredients = ingredientsPart(facts.findings);
  const nutrition = nutritionPart(facts, levels);
  const processing = facts.nova ? PROCESSING_SCORES[facts.nova] : null;

  const weighted: [number, number][] = [[ingredients, WEIGHTS.ingredients]];
  if (nutrition !== null) weighted.push([nutrition, WEIGHTS.nutrition]);
  if (processing !== null) weighted.push([processing, WEIGHTS.processing]);
  const totalWeight = weighted.reduce((total, [, weight]) => total + weight, 0);
  const average = weighted.reduce((total, [value, weight]) => total + value * weight, 0) / totalWeight;

  const isHighIn = levels.some(({ nutrient, band }) => band === "high" && countsAsHighIn(nutrient, facts));
  const caps = applicableCaps(facts, isHighIn, nutrition !== null, unknownNutrientsThatCouldBeHigh(facts)).map(capRule);
  if (caps.length === 0) {
    return { ingredients, nutrition, processing, average, cap: null, score: Math.round(average) };
  }
  const strictest = caps.reduce((lowest, rule) => (rule.max < lowest.max ? rule : lowest));
  const capped = softCap(strictest.max, average);
  return {
    ingredients,
    nutrition,
    processing,
    average,
    cap: capped < average ? strictest : null,
    score: Math.round(Math.min(average, capped)),
  };
}
