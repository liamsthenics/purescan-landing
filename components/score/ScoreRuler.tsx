import { VERDICTS_ON_SCALE, verdictColorVar } from "@/lib/verdict";
import type { CSSProperties } from "react";
import styles from "./Score.module.css";
import { unitStyle } from "./unit";

const SCALE_MAX = 100;
const TICK_STEP = 5;
const MAJOR_TICK_STEP = 25;
const TICK_VALUES = Array.from({ length: SCALE_MAX / TICK_STEP + 1 }, (_, index) => index * TICK_STEP);
const LABEL_VALUES = TICK_VALUES.filter((value) => value % MAJOR_TICK_STEP === 0);
const BAND_STRENGTH = "55%";
/** The end labels line up with the ends of the scale rather than centring on their ticks. */
const LABEL_EDGE: Partial<Record<number, "start" | "end">> = { 0: "start", [SCALE_MAX]: "end" };

interface ScoreRulerProps {
  /** Where the marker sits; null draws the scale alone. */
  score: number | null;
  /** Bands and marker only: no ticks or numbers. */
  compact?: boolean;
  unit?: string;
  animated?: boolean;
  /** Colour of the ring around the marker: the background the ruler sits on. */
  haloColor?: string;
  className?: string;
}

/** The 0–100 PureScan scale: four verdict bands, a tick every 5 and a marker at the score. */
export function ScoreRuler({ score, compact = false, unit, animated = false, haloColor, className }: ScoreRulerProps) {
  const position = score === null ? null : Math.min(SCALE_MAX, Math.max(0, score));
  return (
    <div className={`${styles.ruler} ${className ?? ""}`} style={unitStyle(unit, haloColor ? ({ "--ruler-halo": haloColor } as CSSProperties) : undefined)} data-compact={compact || undefined} aria-hidden="true">
      <div className={styles.bands}>
        {VERDICTS_ON_SCALE.map((info) => (
          <span
            key={info.verdict}
            style={{ background: `color-mix(in srgb, ${verdictColorVar(info.verdict)} ${BAND_STRENGTH}, transparent)` }}
          />
        ))}
      </div>
      {!compact && (
        <>
          <div className={styles.ticks}>
            {TICK_VALUES.map((value) => (
              <i key={value} data-major={value % MAJOR_TICK_STEP === 0 || undefined} />
            ))}
          </div>
          <div className={styles.labels}>
            {LABEL_VALUES.map((value) => (
              <span key={value} style={{ left: `${value}%` }} data-edge={LABEL_EDGE[value]}>
                {value}
              </span>
            ))}
          </div>
        </>
      )}
      {position !== null && (
        <span
          className={`${styles.marker} ${animated ? "ruler-marker-animated" : ""}`}
          style={{ left: `${position}%` }}
        />
      )}
    </div>
  );
}
