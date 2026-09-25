// Concern tiers for additives and ingredients, matching the app.

export type Tier = "high" | "moderate" | "low" | "none";

export interface TierInfo {
  tier: Tier;
  label: string;
  /** Shape used alongside colour so colour is never the only signal. */
  shape: "diamond" | "triangle" | "circle" | "ring";
  /** Colour token (tiers reuse verdict colours). */
  colorVar: string;
  description: string;
}

export const TIERS: readonly TierInfo[] = [
  {
    tier: "high",
    label: "Avoid",
    shape: "diamond",
    colorVar: "var(--bad)",
    description: "Regulators or strong research have raised a concern. We suggest avoiding it.",
  },
  {
    tier: "moderate",
    label: "Limit",
    shape: "triangle",
    colorVar: "var(--poor)",
    description: "Fine occasionally, but there is evidence worth knowing about. We suggest limiting it.",
  },
  {
    tier: "low",
    label: "Minor",
    shape: "circle",
    colorVar: "var(--okay)",
    description: "A small or uncertain concern, such as a marker of ultra-processing.",
  },
  {
    tier: "none",
    label: "No known concerns",
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
