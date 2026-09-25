// Additive data for the website, from content/additives.json
// (synced from the app's knowledge base with `npm run sync:knowledge`).
import knowledge from "@/content/additives.json";
import { additiveIdentity, additiveSlug, compareENumbers, secureUrl } from "./additive-format.ts";
import type { AdditiveListing } from "./additive-search.ts";
import { TIER_ORDER, isTier, type Tier } from "./tiers.ts";

interface RawSource {
  title: string;
  url: string;
}

interface RawAdditive {
  code: string;
  name: string;
  functions: string[];
  tier: string;
  summary?: string;
  reasons?: string[];
  sources?: RawSource[];
  kidsWarning?: boolean;
  efsaUrl?: string;
}

export interface Additive extends AdditiveListing {
  id: string;
  summary: string | null;
  reasons: string[];
  sources: RawSource[];
  kidsWarning: boolean;
  efsaUrl: string | null;
}

export const KNOWLEDGE_VERSION: string = knowledge.version;
export const KNOWLEDGE_GENERATED: string = knowledge.generated;

function toAdditive(id: string, raw: RawAdditive): Additive | null {
  const identity = additiveIdentity(raw.code, raw.name);
  if (!identity || !isTier(raw.tier)) return null;
  return {
    id,
    slug: additiveSlug(identity.code, identity.name),
    code: identity.code,
    name: identity.name,
    functions: raw.functions,
    tier: raw.tier,
    summary: raw.summary ?? null,
    reasons: raw.reasons ?? [],
    sources: (raw.sources ?? []).map((source) => ({ title: source.title, url: secureUrl(source.url) })),
    kidsWarning: raw.kidsWarning ?? false,
    efsaUrl: raw.efsaUrl ? secureUrl(raw.efsaUrl) : null,
  };
}

function byTierThenCode(first: Additive, second: Additive): number {
  const tierDifference = TIER_ORDER.indexOf(first.tier) - TIER_ORDER.indexOf(second.tier);
  return tierDifference !== 0 ? tierDifference : compareENumbers(first.code, second.code);
}

const ALL_ADDITIVES: readonly Additive[] = Object.entries(knowledge.additives as Record<string, RawAdditive>)
  .flatMap(([id, raw]) => {
    const additive = toAdditive(id, raw);
    return additive ? [additive] : [];
  })
  .sort(byTierThenCode);

const ADDITIVES_BY_SLUG = new Map(ALL_ADDITIVES.map((additive) => [additive.slug, additive]));

/** Every additive with a page, most concerning first, then by E-number. */
export function getAllAdditives(): readonly Additive[] {
  return ALL_ADDITIVES;
}

export function getAdditiveBySlug(slug: string): Additive | undefined {
  return ADDITIVES_BY_SLUG.get(slug);
}

export function toListing(additive: Additive): AdditiveListing {
  const { slug, code, name, functions, tier } = additive;
  return { slug, code, name, functions, tier };
}

export function countByTier(): Record<Tier, number> {
  const counts: Record<Tier, number> = { high: 0, moderate: 0, low: 0, none: 0 };
  for (const additive of ALL_ADDITIVES) counts[additive.tier] += 1;
  return counts;
}

/** Other additives with the same function, flagged ones first. */
export function relatedAdditives(additive: Additive, limit: number): Additive[] {
  const primaryFunction = additive.functions[0];
  if (!primaryFunction) return [];
  return ALL_ADDITIVES.filter(
    (candidate) => candidate.slug !== additive.slug && candidate.functions.includes(primaryFunction),
  ).slice(0, limit);
}
