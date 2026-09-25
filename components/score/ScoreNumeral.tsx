import styles from "./Score.module.css";
import { unitStyle } from "./unit";

interface ScoreNumeralProps {
  /** null when a product can't be scored. */
  score: number | null;
  /** Font size of the numeral, in units. */
  size: number;
  unit?: string;
  className?: string;
}

/** The large serif score, e.g. "25/100". */
export function ScoreNumeral({ score, size, unit, className }: ScoreNumeralProps) {
  return (
    <span
      role="img"
      aria-label={score === null ? "No score" : `Score ${score} out of 100`}
      className={`${styles.numeral} ${className ?? ""}`}
      style={unitStyle(unit, { fontSize: `calc(${size} * var(--u))` })}
    >
      <span aria-hidden="true">{score ?? "–"}</span>
      <span aria-hidden="true" className={styles.outOf}>
        /100
      </span>
    </span>
  );
}
