// The PureScan scoring method, mirrored from the app's
// PureScanCore/Analysis/ScoringPolicy.swift and HealthScorer.swift.
// The app is the source of truth: if its numbers change, change them here too.
import type { Tier } from "./tiers.ts";
import { VERDICTS_ON_SCALE, verdictFor } from "./verdict.ts";

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
  | "moderateIngredient";

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

export type NutritionFacts = Partial<Record<Nutrient, number>> & { fibre?: number; protein?: number; carbohydrates?: number };

export interface ProductFacts {
  /** Tiers of every flagged additive or ingredient. */
  findings: Tier[];
  /** Per 100 g (food) or 100 ml (drinks); omit what's unknown. */
  nutrition?: NutritionFacts;
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
 * e.g. salt typed in the wrong unit, before scoring; examples here are
 * hand-checked, so that data check isn't mirrored.)
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

function applicableCaps(facts: ProductFacts, isHighIn: boolean): CapReason[] {
  const reasons: CapReason[] = [];
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
  const caps = applicableCaps(facts, isHighIn).map(capRule);
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

// --- Data confidence ---------------------------------------------------
// Missing or wrong nutrition never caps a score (see scoreProduct above);
// instead every result gets a deterministic confidence, mirroring the app's
// PureScanCore/Analysis/DataConfidence.swift.

export type DataConfidenceStatus = "complete" | "incomplete" | "suspect";

/** A "what-if" re-score this many points lower than the real score is suspect on its own. */
export const SUSPECT_SCORE_DROP = 8;
/** A smaller drop is enough to be suspect once a signal also points to a hidden problem. */
export const SUSPECT_SCORE_DROP_WITH_SIGNAL = 3;
/** How many of a product's first ingredients count towards a nutrient's own ingredient being "prominent". */
export const PROMINENT_INGREDIENT_COUNT = 3;

/** A missing nutrient's typical amount for the product's kind of food, e.g. from UK Open Food Facts. */
export interface TypicalAmount {
  /** Median amount, used to fill the gap for the what-if re-score. */
  median: number;
  /** Upper quartile amount, used to test whether a quarter of that kind of food is high in it. */
  upperQuartile: number;
}

export interface DataConfidenceOptions {
  /** Typical figures for the product's kind of food, keyed by the nutrients that are missing. Omit what isn't known. */
  typical?: Partial<Record<Nutrient, TypicalAmount>>;
  /** Nutrients whose own ingredient (salt, sugar, or an oil or fat) is among the product's first PROMINENT_INGREDIENT_COUNT ingredients. */
  prominentIngredients?: readonly Nutrient[];
}

/** Something that suggests a gap is hiding a problem rather than nothing in particular. */
export type ConfidenceSignal =
  | { kind: "oftenHigh"; nutrient: Nutrient }
  | { kind: "prominentIngredient"; nutrient: Nutrient }
  | { kind: "ultraProcessed" };

export interface DataConfidenceGap {
  nutrient: Nutrient;
  /** The typical figure for this gap, when one is known. */
  typical: TypicalAmount | null;
  /** The band the fill (typical median, or the cautious stand-in) falls in; null when the gap couldn't be filled at all. */
  band: NutrientBand | null;
}

export interface DataConfidenceResult {
  status: DataConfidenceStatus;
  /** The traffic-light nutrients missing from the record. Empty when status is "complete". */
  gaps: readonly DataConfidenceGap[];
  /** What the product would score with every fillable gap filled in; null when none could be filled. */
  estimatedScore: number | null;
  /** Why a suspect result probably flatters the product. Empty unless status is "suspect". */
  signals: readonly ConfidenceSignal[];
}

function verdictRank(score: number): number {
  return VERDICTS_ON_SCALE.indexOf(verdictFor(score));
}

/**
 * Decides a product's data confidence with a "what-if" re-score: each gap is
 * filled with the typical figure for its kind of food or, failing that, a
 * cautious stand-in when the ingredient list points to it, and re-scored. If
 * that would drop the verdict band, or the score by SUSPECT_SCORE_DROP (or
 * SUSPECT_SCORE_DROP_WITH_SIGNAL once a signal agrees), the result is
 * suspect rather than merely incomplete. The website has no per-category
 * typical figures, so callers supply them via `options`.
 */
export function assessDataConfidence(facts: ProductFacts, options: DataConfidenceOptions = {}): DataConfidenceResult {
  // Whole foods and kitchen ingredients (NOVA 1-2) have nothing added, so a missing figure can't hide a red
  // light, as long as there's still enough of the panel left to score. Their fat never counts at all.
  const isWholeFood = facts.nova === 1 || facts.nova === 2;
  const missing = unknownNutrientsThatCouldBeHigh(facts).filter(
    (nutrient) => !(isWholeFood && (nutrient === "fat" || nutrient === "saturatedFat")),
  );
  if (missing.length === 0) return { status: "complete", gaps: [], estimatedScore: null, signals: [] };

  if (isWholeFood && nutritionPart(facts, nutrientLevels(facts)) !== null) {
    return { status: "complete", gaps: [], estimatedScore: null, signals: [] };
  }

  const bands = NUTRIENT_BANDS[facts.isDrink ? "drink" : "food"];
  const prominent = new Set(options.prominentIngredients ?? []);
  const gaps: DataConfidenceGap[] = missing.map((nutrient) => {
    const typical = options.typical?.[nutrient] ?? null;
    const amount = typical ? typical.median : prominent.has(nutrient) ? bands[nutrient].highMin : null;
    return { nutrient, typical, band: amount === null ? null : bandFor(nutrient, amount, facts.isDrink) };
  });

  const fillable = gaps.filter((gap): gap is DataConfidenceGap & { band: NutrientBand } => gap.band !== null);
  if (fillable.length === 0) return { status: "incomplete", gaps, estimatedScore: null, signals: [] };

  const filledNutrition: NutritionFacts = { ...facts.nutrition };
  for (const gap of fillable) {
    filledNutrition[gap.nutrient] = gap.typical ? gap.typical.median : bands[gap.nutrient].highMin;
  }
  // Saturates can't exceed fat, nor sugars carbohydrate: a typical figure is capped by the product's own record.
  if (filledNutrition.fat !== undefined && filledNutrition.saturatedFat !== undefined) {
    filledNutrition.saturatedFat = Math.min(filledNutrition.saturatedFat, filledNutrition.fat);
  }
  if (filledNutrition.carbohydrates !== undefined && filledNutrition.sugars !== undefined) {
    filledNutrition.sugars = Math.min(filledNutrition.sugars, filledNutrition.carbohydrates);
  }

  const actualScore = scoreProduct(facts).score;
  const estimatedScore = scoreProduct({ ...facts, nutrition: filledNutrition }).score;

  const signals: ConfidenceSignal[] = fillable.flatMap((gap) => {
    const oftenHigh: ConfidenceSignal[] =
      gap.typical && bandFor(gap.nutrient, gap.typical.upperQuartile, facts.isDrink) === "high"
        ? [{ kind: "oftenHigh", nutrient: gap.nutrient }]
        : [];
    const prominentSignal: ConfidenceSignal[] = prominent.has(gap.nutrient)
      ? [{ kind: "prominentIngredient", nutrient: gap.nutrient }]
      : [];
    return [...oftenHigh, ...prominentSignal];
  });
  if (facts.nova === 4) signals.push({ kind: "ultraProcessed" });

  const hasCostlyGap = fillable.some((gap) => gap.band !== "low");
  const drop = actualScore - estimatedScore;
  const threshold = signals.length === 0 ? SUSPECT_SCORE_DROP : SUSPECT_SCORE_DROP_WITH_SIGNAL;
  const dropsABand = verdictRank(estimatedScore) < verdictRank(actualScore);

  const isSuspect = hasCostlyGap && drop > 0 && (dropsABand || drop >= threshold);
  return {
    status: isSuspect ? "suspect" : "incomplete",
    gaps,
    estimatedScore,
    signals: isSuspect ? signals : [],
  };
}
