import { tierInfo, type Tier } from "@/lib/tiers";

// Tiers use a shape and a word so colour is never the only signal:
// High ◆, Moderate ▲, Low ●, No known concern ○.

interface TierShapeProps {
  tier: Tier;
  size?: number;
}

export function TierShape({ tier, size = 12 }: TierShapeProps) {
  const { shape, colorVar } = tierInfo(tier);
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" aria-hidden="true" focusable="false" className="shrink-0">
      {shape === "diamond" && (
        <rect x="2.9" y="2.9" width="6.2" height="6.2" rx="0.8" transform="rotate(45 6 6)" style={{ fill: colorVar }} />
      )}
      {shape === "triangle" && <path d="M6 1.2 L11.4 10.6 L0.6 10.6 Z" style={{ fill: colorVar }} />}
      {shape === "circle" && <circle cx="6" cy="6" r="4.6" style={{ fill: colorVar }} />}
      {shape === "ring" && <circle cx="6" cy="6" r="4.1" fill="none" style={{ stroke: colorVar }} strokeWidth="1.5" />}
    </svg>
  );
}

interface TierChipProps {
  tier: Tier;
  className?: string;
}

/**
 * "▲ Moderate concern" chip on a 10% tint of the tier colour. The web uses the full
 * tier name because visitors often land on a page without the app's context.
 */
export function TierChip({ tier, className }: TierChipProps) {
  const { label, colorVar } = tierInfo(tier);
  return (
    <span
      className={`inline-flex h-[30px] items-center gap-[6px] rounded-full px-[11px] text-[13px] font-semibold ${className ?? ""}`}
      style={{ color: colorVar, background: `color-mix(in srgb, ${colorVar} 10%, transparent)` }}
    >
      <TierShape tier={tier} size={10} />
      {label}
    </span>
  );
}

/** UK "Child warning" pill for the Southampton colours. */
export function ChildWarningTag() {
  return (
    <span
      className="inline-flex h-[24px] items-center rounded-full px-[9px] text-[12px] font-semibold"
      style={{ color: "var(--bad)", background: "color-mix(in srgb, var(--bad) 10%, transparent)" }}
    >
      Child warning
    </span>
  );
}
