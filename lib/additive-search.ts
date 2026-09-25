// Client-side search over the additive index (by E-number, name or function).
import type { Tier } from "./tiers.ts";

export interface AdditiveListing {
  slug: string;
  code: string;
  name: string;
  functions: string[];
  tier: Tier;
}

function normalise(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

/** "E 211", "e211" and "211" all match E211. */
function codeMatches(code: string, query: string): boolean {
  const compactQuery = query.replace(/[\s-]/g, "");
  const compactCode = code.toLowerCase();
  const withPrefix = compactQuery.startsWith("e") ? compactQuery : `e${compactQuery}`;
  return /^e?\d/.test(compactQuery) && compactCode.startsWith(withPrefix);
}

export function matchesQuery(additive: AdditiveListing, rawQuery: string): boolean {
  const query = normalise(rawQuery);
  if (!query) return true;
  if (codeMatches(additive.code, query)) return true;
  if (normalise(additive.name).includes(query)) return true;
  return additive.functions.some((fn) => normalise(fn).includes(query));
}

export function filterAdditives(
  additives: readonly AdditiveListing[],
  query: string,
  tier: Tier | "all",
): AdditiveListing[] {
  return additives.filter((additive) => (tier === "all" || additive.tier === tier) && matchesQuery(additive, query));
}
