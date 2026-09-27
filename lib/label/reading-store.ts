// Saved label readings, one per barcode, so each product is read only once.
import { z } from "zod";
import type { KeyValueStore } from "../store/key-value-store.ts";
import { READING_KEY_PREFIX, READING_TTL_SECONDS } from "./config.ts";
import type { LabelReading } from "./reading.ts";

/** The stored record: the public reading plus who contributed it (a keyed hash) and which model read it. */
export interface StoredLabelReading extends LabelReading {
  contributorHash: string;
  model: string;
}

export interface LabelReadingStore {
  find(barcode: string): Promise<StoredLabelReading | null>;
  save(reading: StoredLabelReading): Promise<void>;
}

const nullableAmount = z.number().nullable();

const storedReadingSchema = z.object({
  barcode: z.string(),
  ingredientsText: z.string().nullable(),
  ingredientsLanguage: z.string().nullable(),
  nutrition: z
    .object({
      basis: z.enum(["100g", "100ml"]),
      energyKcal: nullableAmount,
      energyKilojoules: nullableAmount,
      fat: nullableAmount,
      saturatedFat: nullableAmount,
      carbohydrates: nullableAmount,
      sugars: nullableAmount,
      fibre: nullableAmount,
      protein: nullableAmount,
      salt: nullableAmount,
    })
    .nullable(),
  readAt: z.string(),
  contributorHash: z.string(),
  model: z.string(),
});

export function readingKey(barcode: string): string {
  return `${READING_KEY_PREFIX}:${barcode}`;
}

/** Only the contract's LabelReading fields: the contributor and model stay private. */
export function toPublicReading({ barcode, ingredientsText, ingredientsLanguage, nutrition, readAt }: LabelReading): LabelReading {
  return { barcode, ingredientsText, ingredientsLanguage, nutrition, readAt };
}

export class KeyValueLabelReadingStore implements LabelReadingStore {
  private readonly store: KeyValueStore;

  constructor(store: KeyValueStore) {
    this.store = store;
  }

  /** A record that no longer parses (corrupt, or an old format) counts as missing. */
  async find(barcode: string): Promise<StoredLabelReading | null> {
    const stored = await this.store.get(readingKey(barcode));
    if (stored === null) return null;
    try {
      const result = storedReadingSchema.safeParse(JSON.parse(stored));
      return result.success ? result.data : null;
    } catch {
      return null;
    }
  }

  async save(reading: StoredLabelReading): Promise<void> {
    await this.store.set(readingKey(reading.barcode), JSON.stringify(reading), READING_TTL_SECONDS);
  }
}
