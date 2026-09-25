import Link from "next/link";
import { WEIGHTS } from "@/lib/scoring";
import { VERDICTS, verdictColorVar } from "@/lib/verdict";
import { ArrowRightIcon } from "../icons";
import { ScoreGauge } from "../ScoreGauge";
import { SectionIntro } from "../SectionIntro";

const PARTS = [
  {
    title: "Additives & ingredients",
    weight: WEIGHTS.ingredients,
    body: "Every additive and flagged ingredient checked against our knowledge base, each rated with sources.",
  },
  {
    title: "Nutrition",
    weight: WEIGHTS.nutrition,
    body: "Sugar, salt, saturated fat and fat, graded with the UK’s front-of-pack traffic-light thresholds.",
  },
  {
    title: "Processing",
    weight: WEIGHTS.processing,
    body: "How processed it is on the NOVA scale, from 1 (unprocessed) to 4 (ultra-processed).",
  },
];

const LARGEST_WEIGHT = Math.max(...PARTS.map((part) => part.weight));
/** A representative score inside each verdict band, for the legend gauges. */
const SAMPLE_SCORES = { great: 93, okay: 60, poor: 35, bad: 15 } as const;

export function ScoreSection() {
  return (
    <section aria-labelledby="score-heading" className="border-t border-separator py-20 md:py-28">
      <div className="container-page grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div>
          <SectionIntro label="The score" title="One honest score." headingId="score-heading">
            <p>
              Every product gets one score from 0 to 100, made of three weighted parts. Caps stop a product
              averaging its way out of a serious problem.
            </p>
          </SectionIntro>
          <p className="type-title mt-10 max-w-md text-ink">Same product, same score, for everyone.</p>
          <p className="mt-3 max-w-md text-[16px] leading-relaxed text-secondary">
            Your allergens and diet add personal alerts but never change a score, and no brand can pay to change
            one.
          </p>
          <Link href="/how-we-score" className="text-link mt-8 inline-flex items-center gap-1.5">
            Read the full method
            <ArrowRightIcon />
          </Link>
        </div>

        <div className="space-y-4">
          {PARTS.map((part) => (
            <div key={part.title} className="card p-6">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="text-[17px] font-semibold">{part.title}</h3>
                <span className="text-[20px] font-semibold tabular-nums text-secondary">
                  {Math.round(part.weight * 100)}%
                </span>
              </div>
              <div className="mt-3 h-1 rounded-full bg-surface-tint" aria-hidden="true">
                <div
                  className="h-1 rounded-full bg-brand"
                  style={{ width: `${(part.weight / LARGEST_WEIGHT) * 100}%` }}
                />
              </div>
              <p className="mt-3 text-[15px] leading-relaxed text-secondary">{part.body}</p>
            </div>
          ))}
          <div className="card grid grid-cols-2 gap-y-8 p-6 sm:grid-cols-4">
            {VERDICTS.map((info) => (
              <div key={info.verdict} className="flex flex-col items-center text-center">
                <ScoreGauge score={SAMPLE_SCORES[info.verdict]} size="compact" animated={false} />
                <p className="mt-2 text-[14px] font-semibold" style={{ color: verdictColorVar(info.verdict) }}>
                  {info.title}
                </p>
                <p className="text-[13px] tabular-nums text-secondary">
                  {info.minScore}–{info.maxScore}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
