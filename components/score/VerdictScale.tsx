import { VERDICTS_ON_SCALE, verdictColorVar } from "@/lib/verdict";
import { ScoreRuler } from "./ScoreRuler";

interface VerdictScaleProps {
  /** Adds each band's fixed headline ("Scores low"). */
  showsHeadlines?: boolean;
}

/** The PureScan scale with its four verdict bands named underneath. */
export function VerdictScale({ showsHeadlines = false }: VerdictScaleProps) {
  return (
    <div>
      <ScoreRuler score={null} />
      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-4">
        {VERDICTS_ON_SCALE.map((info) => (
          <div key={info.verdict}>
            <dt className="text-[12px] font-semibold uppercase tracking-[0.14em]" style={{ color: verdictColorVar(info.verdict) }}>
              {info.title}
            </dt>
            <dd className="e-number mt-1 text-[12px] text-tertiary">
              {info.minScore}–{info.maxScore}
            </dd>
            {showsHeadlines && <dd className="mt-1.5 font-serif text-[19px] leading-tight text-ink">{info.headline}</dd>}
          </div>
        ))}
      </dl>
    </div>
  );
}
