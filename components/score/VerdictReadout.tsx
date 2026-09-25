import { verdictColorVar, verdictFor, verdictRangeText } from "@/lib/verdict";
import styles from "./Score.module.css";
import { unitStyle } from "./unit";

const TEXT_ALIGN = { start: "left", center: "center", end: "right" } as const;
const FLEX_ALIGN = { start: "flex-start", center: "center", end: "flex-end" } as const;

interface VerdictReadoutProps {
  score: number;
  unit?: string;
  align?: "start" | "center" | "end";
  /** Adds "25–49 on the PureScan scale" under the verdict word. */
  showsRange?: boolean;
  className?: string;
}

/** "POOR" in the verdict colour, with its range on the scale. */
export function VerdictReadout({ score, unit, align = "end", showsRange = true, className }: VerdictReadoutProps) {
  const info = verdictFor(score);
  return (
    <span
      className={`${styles.verdict} ${className ?? ""}`}
      style={unitStyle(unit, { textAlign: TEXT_ALIGN[align], alignItems: FLEX_ALIGN[align] })}
    >
      <span className={styles.verdictWord} style={{ color: verdictColorVar(info.verdict) }}>
        {info.title}
      </span>
      {showsRange && <span className={styles.verdictRange}>{verdictRangeText(info)}</span>}
    </span>
  );
}
