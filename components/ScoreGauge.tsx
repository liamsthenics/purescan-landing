import { GAUGE_SIZES, gaugeArcPath, type GaugeSize } from "@/lib/gauge";
import { VERDICTS, verdictColorVar, verdictFor, type Verdict } from "@/lib/verdict";

// Score gauge (design 1d, banded): a 270° arc with the gap at the bottom,
// four faint verdict bands on the track and a progress arc in the score's
// verdict colour. Scales to its container; the number uses container units.

const VIEWBOX = 100;
const CENTRE = { x: VIEWBOX / 2, y: VIEWBOX / 2 };
/** Track bands from 0 to 100, low scores first (bad → great). */
const BAND_VERDICTS: readonly Verdict[] = [...VERDICTS].reverse().map((info) => info.verdict);
const BAND_COUNT = BAND_VERDICTS.length;
const SCORE_FONT_RATIO = { hero: 46 / 132, card: 34 / 96, compact: 22 / 64, mini: 15 / 44 } as const;
const WORD_FONT_RATIO = { hero: 13 / 132, card: 11 / 96 } as const;

interface ScoreGaugeProps {
  score: number | null;
  size?: GaugeSize;
  /** CSS width; defaults to the spec size in px. */
  width?: string;
  animated?: boolean;
  className?: string;
}

export function ScoreGauge({ score, size = "hero", width, animated = true, className }: ScoreGaugeProps) {
  const spec = GAUGE_SIZES[size];
  // Stroke is centred on the arc, so inset the radius to keep it inside the box.
  const strokeWidth = (spec.stroke / spec.diameter) * VIEWBOX;
  const radius = VIEWBOX / 2 - strokeWidth / 2;
  const info = score === null ? null : verdictFor(score);
  const progressPath = score === null ? "" : gaugeArcPath(CENTRE, radius, 0, score / 100);
  const label = info ? `Score ${score} out of 100, ${info.title}` : "No score";
  const showsWord = spec.showsVerdictWord && size in WORD_FONT_RATIO;

  return (
    <div
      role="img"
      aria-label={label}
      className={`relative shrink-0 ${className ?? ""}`}
      style={{ width: width ?? `${spec.diameter}px`, aspectRatio: "1", containerType: "inline-size" }}
    >
      <svg viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`} className="absolute inset-0 h-full w-full" aria-hidden="true">
        {BAND_VERDICTS.map((verdict, index) => (
          <path
            key={verdict}
            d={gaugeArcPath(CENTRE, radius, index / BAND_COUNT, (index + 1) / BAND_COUNT)}
            fill="none"
            style={{ stroke: verdictColorVar(verdict), strokeOpacity: "var(--band-opacity)" }}
            strokeWidth={strokeWidth}
            strokeLinecap="butt"
          />
        ))}
        {info && progressPath && (
          <path
            d={progressPath}
            fill="none"
            style={{ stroke: verdictColorVar(info.verdict) }}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            pathLength={1}
            className={animated ? "gauge-progress" : undefined}
          />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center" aria-hidden="true">
        <span
          className="font-semibold tabular-nums leading-none text-ink"
          style={{ fontSize: `${SCORE_FONT_RATIO[size] * 100}cqw`, letterSpacing: "-0.04em", marginTop: "4cqw" }}
        >
          {score ?? "–"}
        </span>
        {showsWord && (
          <span
            className="font-semibold uppercase leading-none"
            style={{
              fontSize: `${WORD_FONT_RATIO[size as keyof typeof WORD_FONT_RATIO] * 100}cqw`,
              letterSpacing: "0.1em",
              marginTop: "3cqw",
              color: info ? verdictColorVar(info.verdict) : "var(--none)",
            }}
          >
            {info?.title ?? "No score"}
          </span>
        )}
      </div>
    </div>
  );
}
