import { FIZZBROOK_COLA, fullProductName } from "@/lib/examples";
import { HOME_SECTION_IDS } from "@/lib/navigation";
import { WEIGHTS, capRule, scoreProduct } from "@/lib/scoring";
import { MonoLink } from "../MonoLink";
import { SectionHeading } from "../SectionHeading";
import { SegmentedBar } from "../SegmentedBar";
import { StorySection } from "../StorySection";

const PERCENT = 100;

interface ScorePart {
  key: keyof typeof WEIGHTS;
  title: string;
  body: string;
  color: string;
}

const SCORE_PARTS: readonly ScorePart[] = [
  {
    key: "ingredients",
    title: "Additives & ingredients",
    body: "Every additive and flagged ingredient, rated high, moderate, low or no known concern against published evidence.",
    color: "var(--forest-mark)",
  },
  {
    key: "nutrition",
    title: "Nutrition",
    body: "Sugars, saturates, fat and salt per 100 g or 100 ml, measured against the UK front-of-pack traffic-light thresholds.",
    color: "var(--mint)",
  },
  {
    key: "processing",
    title: "Processing",
    body: "The NOVA classification, from 1 (unprocessed) to 4 (ultra-processed).",
    color: "var(--okay)",
  },
];

function weightPercent(key: keyof typeof WEIGHTS): number {
  return Math.round(WEIGHTS[key] * PERCENT);
}

/** The caps paragraph, worked out from the published method so it can't drift from it. */
function CapsNote() {
  const product = FIZZBROOK_COLA;
  const breakdown = scoreProduct(product.facts);
  const severalModerateCap = capRule("severalModerateIngredients").max;
  const highConcernCap = capRule("highConcernIngredient").max;
  return (
    <p className="mt-10 max-w-[35rem] text-[16.5px] leading-relaxed text-ink/80">
      <strong className="font-semibold text-ink">Caps.</strong> A product can’t average its way out of a serious
      problem. Three or more ingredients of moderate concern cap a score at {severalModerateCap}; an ingredient of high
      concern caps it at {highConcernCap}. Caps scale a score down rather than cut it off, so products under the same
      cap keep their order: {fullProductName(product)} averages {Math.round(breakdown.average)} across the three parts,
      and its cap of {breakdown.cap?.max ?? severalModerateCap} places it at {breakdown.score}.
    </p>
  );
}

export function ScoreSection() {
  return (
    <StorySection screen="score" id={HOME_SECTION_IDS.score} headingId="score-heading">
      <SectionHeading
        number="03"
        eyebrow="How the score works"
        title="One score. Out of 100."
        headingId="score-heading"
        showWatermark
      >
        <p>Three parts, weighted and published. No hidden factors, no brand deals.</p>
      </SectionHeading>

      <div className="mt-12 max-w-[37.5rem]">
        <SegmentedBar
          segments={SCORE_PARTS.map((part) => ({ key: part.key, weight: WEIGHTS[part.key], color: part.color }))}
        />
        <ul className="mt-6 border-b border-hairline">
          {SCORE_PARTS.map((part) => (
            <li
              key={part.key}
              className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-x-5 border-t border-hairline py-6 sm:grid-cols-[6.5rem_minmax(0,1fr)]"
            >
              <span className="row-span-2 font-serif text-[clamp(2.5rem,2.1rem+1vw,3rem)] leading-[0.9] tabular-nums">
                {weightPercent(part.key)}
                <span className="text-[0.45em] text-ink/70">%</span>
              </span>
              <h3 className="text-[18px] font-medium leading-snug">{part.title}</h3>
              <p className="mt-1.5 text-[16px] leading-relaxed text-secondary">{part.body}</p>
            </li>
          ))}
        </ul>
      </div>

      <CapsNote />
      <MonoLink href="/how-we-score" className="mt-8">
        Read the full method
      </MonoLink>
    </StorySection>
  );
}
