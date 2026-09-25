// Concern tiers for additives and ingredients, matching the app and docs/voice.md.

export type Tier = "high" | "moderate" | "low" | "none";

export interface TierInfo {
  tier: Tier;
  /** Full name, e.g. "High concern". */
  label: string;
  /** Short chip text, e.g. "High". */
  chipLabel: string;
  /** Shape used alongside colour so colour is never the only signal. */
  shape: "diamond" | "triangle" | "circle" | "ring";
  /** Colour token (tiers reuse verdict colours). */
  colorVar: string;
  description: string;
}

export const TIERS: readonly TierInfo[] = [
  {
    tier: "high",
    label: "High concern",
    chipLabel: "High",
    shape: "diamond",
    colorVar: "var(--bad)",
    description: "A regulator or strong research has raised a concern, such as a hazard classification or a ban elsewhere.",
  },
  {
    tier: "moderate",
    label: "Moderate concern",
    chipLabel: "Moderate",
    shape: "triangle",
    colorVar: "var(--poor)",
    description: "There is evidence worth knowing about, such as an intake limit some people exceed or studies that raise questions.",
  },
  {
    tier: "low",
    label: "Low concern",
    chipLabel: "Low",
    shape: "circle",
    colorVar: "var(--okay)",
    description: "A small or uncertain concern, such as a marker of ultra-processing.",
  },
  {
    tier: "none",
    label: "No known concern",
    chipLabel: "No known concern",
    shape: "ring",
    colorVar: "var(--none)",
    description: "No known concerns at the levels permitted in food.",
  },
];

export const TIER_ORDER: readonly Tier[] = TIERS.map((info) => info.tier);

export function tierInfo(tier: Tier): TierInfo {
  const info = TIERS.find((candidate) => candidate.tier === tier);
  if (!info) throw new Error(`Unknown tier: ${tier}`);
  return info;
}

export function isTier(value: string): value is Tier {
  return TIER_ORDER.includes(value as Tier);
}
