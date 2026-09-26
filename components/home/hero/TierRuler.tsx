import type { CSSProperties } from "react";
import { SegmentedBar, type BarSegment } from "../SegmentedBar";
import styles from "./TierRuler.module.css";

const SCALE_MAX = 100;
const TICK_STEP = 5;
const LABEL_STEP = 25;
const TICK_COUNT = SCALE_MAX / TICK_STEP + 1;
const LABELS = Array.from({ length: SCALE_MAX / LABEL_STEP + 1 }, (_, index) => index * LABEL_STEP);
const LABEL_EDGE: Partial<Record<number, "start" | "end">> = { 0: "start", [SCALE_MAX]: "end" };

/** The four verdict bands, bad to great, each a quarter of the scale. */
const TIER_BANDS: readonly BarSegment[] = [
  { key: "bad", weight: 1, color: "var(--rule-bad)" },
  { key: "poor", weight: 1, color: "var(--rule-poor)" },
  { key: "okay", weight: 1, color: "var(--rule-okay)" },
  { key: "great", weight: 1, color: "var(--rule-great)" },
];

interface TierRulerProps {
  score: number;
  label: string;
  className?: string;
}

/** The 0–100 instrument: tier rule, a tick every 5, labels every 25 and a marker at the score. */
export function TierRuler({ score, label, className }: TierRulerProps) {
  return (
    <figure className={`${styles.ruler} ${className ?? ""}`} aria-label={label} role="img">
      <SegmentedBar segments={TIER_BANDS} className="!h-[5px]" />
      <div className={styles.ticks} aria-hidden="true">
        {Array.from({ length: TICK_COUNT }, (_, index) => (
          <i key={index} />
        ))}
      </div>
      <div className={`type-mono text-[11px] !tracking-[0.06em] text-secondary ${styles.labels}`} aria-hidden="true">
        {LABELS.map((value) => (
          <span key={value} style={{ left: `${value}%` }} data-edge={LABEL_EDGE[value]}>
            {value}
          </span>
        ))}
      </div>
      <div className={styles.markerTrack} style={{ "--score": score } as CSSProperties} aria-hidden="true">
        <span className={styles.stem} />
        <span className={styles.marker} />
      </div>
    </figure>
  );
}
