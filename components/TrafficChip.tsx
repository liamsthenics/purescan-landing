import type { NutrientBand } from "@/lib/scoring";

// UK front-of-pack traffic chip. Always labelled Low / Med / High; High is the only filled pill.
const BAND_STYLE: Record<NutrientBand, { label: string; colorVar: string; tint: number }> = {
  low: { label: "Low", colorVar: "var(--great)", tint: 10 },
  medium: { label: "Med", colorVar: "var(--okay)", tint: 12 },
  high: { label: "High", colorVar: "var(--bad)", tint: 100 },
};

interface TrafficChipProps {
  band: NutrientBand;
  /** Scales the chip, for use inside the phone mockup. */
  scale?: string;
}

export function TrafficChip({ band, scale = "1px" }: TrafficChipProps) {
  const { label, colorVar, tint } = BAND_STYLE[band];
  const isHigh = band === "high";
  const px = (value: number) => `calc(${value} * ${scale})`;
  return (
    <span
      className="inline-flex items-center rounded-full font-semibold"
      style={{
        gap: px(4),
        height: px(22),
        paddingInline: px(8),
        fontSize: px(12),
        color: isHigh ? "#ffffff" : colorVar,
        background: isHigh ? colorVar : `color-mix(in srgb, ${colorVar} ${tint}%, transparent)`,
      }}
    >
      <span
        className="rounded-full"
        style={{ width: px(6), height: px(6), background: isHigh ? "#ffffff" : colorVar }}
        aria-hidden="true"
      />
      {label}
    </span>
  );
}
