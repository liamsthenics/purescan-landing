// The LabelReading shape (docs/label-api.md), checking what the model returned
// against the contract's bounds, and merging a new reading into a saved one.
import { z } from "zod";
import { sanitiseMultilineText } from "../chat/sanitise.ts";
import { READING_LIMITS } from "./config.ts";

export type LabelPhotoKind = "ingredients" | "nutrition";
export const LABEL_PHOTO_KINDS: readonly LabelPhotoKind[] = ["ingredients", "nutrition"];

export type NutritionBasis = "100g" | "100ml";

export interface LabelNutrition {
  basis: NutritionBasis;
  energyKcal: number | null;
  energyKilojoules: number | null;
  fat: number | null;
  saturatedFat: number | null;
  carbohydrates: number | null;
  sugars: number | null;
  fibre: number | null;
  protein: number | null;
  salt: number | null;
}

/** What was read from the photos, before it is tied to a barcode. */
export interface LabelContent {
  ingredientsText: string | null;
  ingredientsLanguage: string | null;
  nutrition: LabelNutrition | null;
}

/** What the model reports: the content plus whether the photos show a food label at all. */
export interface ModelLabelReading extends LabelContent {
  isFoodLabel: boolean;
}

/** The public reading returned by GET and POST. */
export interface LabelReading extends LabelContent {
  barcode: string;
  /** ISO 8601 time of the latest read that contributed to this reading. */
  readAt: string;
}

const ISO_639_1 = /^[a-z]{2}$/;
const MINIMUM_AMOUNT = 0;

/** A value outside the contract's bounds, or of the wrong type, is dropped rather than failing the reading. */
const boundedAmount = (maximum: number) => z.number().min(MINIMUM_AMOUNT).max(maximum).nullable().catch(null);
const grams = boundedAmount(READING_LIMITS.gramsMax);

const nutritionSchema = z.object({
  basis: z.enum(["100g", "100ml"]).nullable().catch(null),
  energyKcal: boundedAmount(READING_LIMITS.energyKcalMax),
  energyKilojoules: boundedAmount(READING_LIMITS.energyKilojoulesMax),
  fat: grams,
  saturatedFat: grams,
  carbohydrates: grams,
  sugars: grams,
  fibre: grams,
  protein: grams,
  salt: grams,
});

type ParsedNutrition = z.infer<typeof nutritionSchema>;

const NUTRIENT_FIELDS = [
  "energyKcal",
  "energyKilojoules",
  "fat",
  "saturatedFat",
  "carbohydrates",
  "sugars",
  "fibre",
  "protein",
  "salt",
] as const satisfies readonly (keyof LabelNutrition)[];

export const modelReadingSchema = z.object({
  isFoodLabel: z.boolean(),
  ingredientsText: z.string().nullable().catch(null),
  ingredientsLanguage: z.string().nullable().catch(null),
  nutrition: nutritionSchema.nullable().catch(null),
});

/** Control and invisible characters removed, trimmed, cut to the contract's length; null when empty. */
export function cleanIngredientsText(text: string | null): string | null {
  if (text === null) return null;
  const cleaned = Array.from(sanitiseMultilineText(text))
    .slice(0, READING_LIMITS.ingredientsTextMaxCharacters)
    .join("")
    .trim();
  return cleaned.length > 0 ? cleaned : null;
}

function cleanLanguage(language: string | null): string | null {
  const normalised = language?.trim().toLowerCase() ?? null;
  return normalised !== null && ISO_639_1.test(normalised) ? normalised : null;
}

/** Only per-100 g/ml figures count; a table with no usable value is no table. */
function cleanNutrition(nutrition: ParsedNutrition | null): LabelNutrition | null {
  if (!nutrition?.basis) return null;
  const cleaned: LabelNutrition = { basis: nutrition.basis, ...emptyNutrients() };
  for (const field of NUTRIENT_FIELDS) cleaned[field] = nutrition[field] ?? null;
  return NUTRIENT_FIELDS.some((field) => cleaned[field] !== null) ? cleaned : null;
}

function emptyNutrients(): Omit<LabelNutrition, "basis"> {
  return Object.fromEntries(NUTRIENT_FIELDS.map((field) => [field, null])) as Omit<LabelNutrition, "basis">;
}

/**
 * Parses the model's JSON against the contract. Throws only when the overall
 * shape is wrong (a failed read); individual bad values are dropped.
 */
export function parseModelReading(json: unknown): ModelLabelReading {
  const parsed = modelReadingSchema.parse(json);
  return {
    isFoodLabel: parsed.isFoodLabel,
    ingredientsText: cleanIngredientsText(parsed.ingredientsText),
    ingredientsLanguage: cleanLanguage(parsed.ingredientsLanguage),
    nutrition: cleanNutrition(parsed.nutrition),
  };
}

/** The parts of a model reading that came from the photo kinds actually sent. */
export function contentForKinds(reading: ModelLabelReading, kinds: ReadonlySet<LabelPhotoKind>): LabelContent {
  const includesIngredients = kinds.has("ingredients") && reading.ingredientsText !== null;
  return {
    ingredientsText: includesIngredients ? reading.ingredientsText : null,
    ingredientsLanguage: includesIngredients ? reading.ingredientsLanguage : null,
    nutrition: kinds.has("nutrition") ? reading.nutrition : null,
  };
}

export function hasReadableContent(content: LabelContent): boolean {
  return content.ingredientsText !== null || content.nutrition !== null;
}

/**
 * The first reading of each part is kept: a new photo only fills a part that
 * nothing has been saved for yet. Readings are shared by everyone who scans the
 * barcode, so one wrong or malicious photo mustn't be able to replace a good
 * one; a bad saved reading is removed by hand (it records its contributor).
 */
export function mergeReadings(saved: LabelContent | null, fresh: LabelContent): LabelContent {
  const hasSavedIngredients = saved !== null && saved.ingredientsText !== null;
  return {
    ingredientsText: hasSavedIngredients ? saved.ingredientsText : fresh.ingredientsText,
    ingredientsLanguage: hasSavedIngredients ? saved.ingredientsLanguage : fresh.ingredientsLanguage,
    nutrition: saved?.nutrition ?? fresh.nutrition,
  };
}
