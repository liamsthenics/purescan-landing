// Grounds answers in PureScan's own knowledge base: E-numbers mentioned in the
// question or flagged on the product are looked up and given to the model.
import type { Tier } from "../tiers.ts";

export interface ReferenceAdditive {
  code: string;
  name: string;
  tier: Tier;
  summary: string | null;
  reasons: readonly string[];
  sources: readonly { title: string; url: string }[];
}

/** Finds an additive by E-number (case-insensitive), e.g. "E150d". */
export type AdditiveLookup = (code: string) => ReferenceAdditive | undefined;

export const MAX_REFERENCED_ADDITIVES = 8;
/** E-number with an optional letter or roman-numeral suffix, e.g. E150d, E160aiii (and a plural "s"). */
const E_NUMBER_PATTERN = /\bE\s?-?(\d{3,4}[a-z]{0,5})\b/gi;
const PLURAL_SUFFIX = "s";

/** "e 150D" → "E150d". */
function normaliseENumber(digitsAndSuffix: string): string {
  return `E${digitsAndSuffix.toLowerCase()}`;
}

/** Distinct E-numbers mentioned in the texts, in order of appearance. */
export function findENumbers(texts: readonly string[]): string[] {
  const codes = texts.flatMap((text) =>
    Array.from(text.matchAll(E_NUMBER_PATTERN), (match) => normaliseENumber(match[1])),
  );
  return [...new Set(codes)];
}

/** "E621s" (a plural in a question) falls back to E621. */
function lookupAllowingPlural(code: string, lookup: AdditiveLookup): ReferenceAdditive | undefined {
  const exact = lookup(code);
  if (exact || !code.endsWith(PLURAL_SUFFIX)) return exact;
  return lookup(code.slice(0, -PLURAL_SUFFIX.length));
}

/** Distinct knowledge-base entries for the codes, skipping unknown ones, up to the limit. */
export function referencedAdditives(codes: readonly string[], lookup: AdditiveLookup): ReferenceAdditive[] {
  const found = codes.flatMap((code) => {
    const additive = lookupAllowingPlural(code, lookup);
    return additive ? [additive] : [];
  });
  return [...new Set(found)].slice(0, MAX_REFERENCED_ADDITIVES);
}

/** Builds a lookup keyed by lower-case E-number; the first entry for a code wins. */
export function createAdditiveLookup(additives: readonly ReferenceAdditive[]): AdditiveLookup {
  const byCode = new Map<string, ReferenceAdditive>();
  for (const additive of additives) {
    const key = additive.code.toLowerCase();
    if (!byCode.has(key)) byCode.set(key, additive);
  }
  return (code) => byCode.get(code.toLowerCase());
}
