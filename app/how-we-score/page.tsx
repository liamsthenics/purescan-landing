import type { Metadata } from "next";
import Link from "next/link";
import { CapsTable } from "@/components/method/CapsTable";
import { MethodSection } from "@/components/method/MethodSection";
import { NutritionThresholds } from "@/components/method/NutritionThresholds";
import { WorkedExample } from "@/components/method/WorkedExample";
import { ScoreGauge } from "@/components/ScoreGauge";
import { TierShape } from "@/components/TierShape";
import { KNOWLEDGE_VERSION } from "@/lib/additives";
import { METHOD_SOURCES } from "@/lib/method-sources";
import { pageMetadata } from "@/lib/metadata";
import {
  CAPS,
  HIGH_FIBRE_BONUS,
  HIGH_FIBRE_GRAMS,
  HIGH_PROTEIN_BONUS,
  HIGH_PROTEIN_GRAMS,
  INGREDIENT_PENALTIES,
  MINIMUM_KNOWN_NUTRIENTS,
  NUTRIENT_BANDS,
  PROCESSING_EXPLANATIONS,
  PROCESSING_LABELS,
  PROCESSING_SCORES,
  SOFT_CAP_FLOOR,
  WEIGHTS,
  capRule,
  type NovaGroup,
} from "@/lib/scoring";
import { TIERS } from "@/lib/tiers";
import { VERDICTS, verdictColorVar } from "@/lib/verdict";

export const metadata: Metadata = pageMetadata({
  title: "How we score food",
  description:
    "The full PureScan method: how additives, UK traffic-light nutrition and NOVA processing combine into one 0–100 score, the caps that limit a score, and our sources.",
  path: "/how-we-score",
});

const NOVA_GROUPS: readonly NovaGroup[] = [1, 2, 3, 4];
const SAMPLE_SCORES = { great: 93, okay: 60, poor: 35, bad: 15 } as const;
const percent = (weight: number) => `${Math.round(weight * 100)}%`;

function Formula() {
  return (
    <div className="card p-6 text-ink md:p-8">
      <p className="section-label">The formula</p>
      <p className="mt-4 font-serif text-[26px] leading-snug md:text-[30px]">
        Score = {percent(WEIGHTS.ingredients)} additives &amp; ingredients + {percent(WEIGHTS.nutrition)} nutrition +{" "}
        {percent(WEIGHTS.processing)} processing
      </p>
      <p className="mt-4 text-[15px] leading-relaxed text-secondary">
        Each part is scored from 0 to 100. If a part can’t be worked out, it’s left out and the others are
        re-weighted, then the strictest cap that applies sets the maximum.
      </p>
    </div>
  );
}

function TierPenalties() {
  return (
    <ul className="card divide-y divide-separator">
      {TIERS.map((info) => (
        <li key={info.tier} className="flex items-start gap-4 px-5 py-4">
          <span className="mt-1.5">
            <TierShape tier={info.tier} size={14} />
          </span>
          <span className="flex-1">
            <span className="block font-semibold" style={{ color: info.colorVar }}>
              {info.label}
            </span>
            <span className="block text-[15px] text-secondary">{info.description}</span>
          </span>
          <span className="text-[17px] font-semibold tabular-nums text-ink">
            {INGREDIENT_PENALTIES[info.tier] === 0 ? "0" : `−${INGREDIENT_PENALTIES[info.tier]}`}
          </span>
        </li>
      ))}
    </ul>
  );
}

function NovaTable() {
  return (
    <ul className="card divide-y divide-separator">
      {NOVA_GROUPS.map((group) => (
        <li key={group} className="flex items-start gap-4 px-5 py-4">
          <span className="e-number mt-0.5 w-14 shrink-0 text-[13px] text-secondary">NOVA {group}</span>
          <span className="flex-1">
            <span className="block font-semibold text-ink">{PROCESSING_LABELS[group]}</span>
            <span className="block text-[15px] text-secondary">{PROCESSING_EXPLANATIONS[group]}</span>
          </span>
          <span className="text-[17px] font-semibold tabular-nums text-ink">{PROCESSING_SCORES[group]}</span>
        </li>
      ))}
    </ul>
  );
}

function VerdictBands() {
  return (
    <div className="card grid grid-cols-2 gap-y-8 p-6 sm:grid-cols-4">
      {VERDICTS.map((info) => (
        <div key={info.verdict} className="flex flex-col items-center text-center">
          <ScoreGauge score={SAMPLE_SCORES[info.verdict]} size="compact" animated={false} />
          <p className="mt-2 text-[14px] font-semibold" style={{ color: verdictColorVar(info.verdict) }}>
            {info.title} · {info.minScore}–{info.maxScore}
          </p>
          <p className="mt-0.5 font-serif text-[17px] text-ink">{info.headline}</p>
        </div>
      ))}
    </div>
  );
}

function SourcesList() {
  return (
    <ul className="card divide-y divide-separator">
      {METHOD_SOURCES.map((source) => (
        <li key={source.url}>
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-start gap-3 px-5 py-4 text-[15px]"
          >
            <span className="e-number mt-0.5 shrink-0 rounded-md bg-surface-tint px-1.5 py-0.5 text-[11px] font-semibold uppercase text-secondary">
              {source.tag}
            </span>
            <span>
              <span className="block font-medium text-ink group-hover:text-brand">
                {source.title}
                <span className="sr-only"> (opens in a new tab)</span>
              </span>
              <span className="block text-secondary">{source.use}</span>
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}

export default function HowWeScorePage() {
  const highConcernCap = capRule("highConcernIngredient").max;
  return (
    <div className="container-page">
      <header className="max-w-3xl pb-14 pt-14 md:pb-20 md:pt-20">
        <p className="section-label">The method</p>
        <h1 className="type-display mt-5">How PureScan scores food.</h1>
        <p className="type-lede mt-7 max-w-2xl">
          Transparency is the product. Here is every rule behind the score, with the numbers the app uses and the
          sources they come from. Nothing is hidden and no brand can pay to change a result.
        </p>
        <p className="mt-5 text-[14px] text-secondary">Knowledge base version {KNOWLEDGE_VERSION}.</p>
      </header>

      <MethodSection id="overview" number="01" title="One score, three parts">
        <p>
          Every product with an ingredient list gets one score from 0 to 100. The same product always gets the same
          score, for everyone. Without an ingredient list we don’t score a product at all, because any score would
          be a guess.
        </p>
        <Formula />
      </MethodSection>

      <MethodSection id="ingredients" number="02" title={`Additives & ingredients · ${percent(WEIGHTS.ingredients)}`}>
        <p>
          This part starts at 100. Every additive and flagged ingredient is checked against our knowledge base and
          removes points by its concern tier, down to a minimum of 0.
        </p>
        <TierPenalties />
        <p>
          Concern tiers are built from decisions by bodies such as EFSA, the WHO, IARC, the UK Food Standards Agency
          and the FDA, and from peer-reviewed research. Each flagged additive lists its reasons and sources.{" "}
          <Link href="/additives" className="text-link">
            Browse every additive
          </Link>
          .
        </p>
      </MethodSection>

      <MethodSection id="nutrition" number="03" title={`Nutrition · ${percent(WEIGHTS.nutrition)}`}>
        <p>
          Fat, saturates, sugars and salt are graded Low, Med or High using the UK’s front-of-pack traffic-light
          thresholds. This part starts at 100 and each Med or High light removes points. Sugars count most.
        </p>
        <NutritionThresholds kind="food" />
        <NutritionThresholds kind="drink" />
        <p>
          For drinks, sugars are High above {NUTRIENT_BANDS.drink.sugars.highMin} g per 100 ml, the higher band of
          the UK soft drinks industry levy, rather than the general front-of-pack value.
        </p>
        <p>
          Fibre of {HIGH_FIBRE_GRAMS} g or more per 100 g adds {HIGH_FIBRE_BONUS} points, and protein of{" "}
          {HIGH_PROTEIN_GRAMS} g or more adds {HIGH_PROTEIN_BONUS} (food only). This part is capped at 100. We need
          at least {MINIMUM_KNOWN_NUTRIENTS} of the four traffic-light values; otherwise nutrition is left out and a
          cap applies (see below).
        </p>
      </MethodSection>

      <MethodSection id="processing" number="04" title={`Processing · ${percent(WEIGHTS.processing)}`}>
        <p>
          We use the NOVA scale, from 1 (unprocessed) to 4 (ultra-processed), as recorded by Open Food Facts.
        </p>
        <NovaTable />
        <p>
          The UK’s Scientific Advisory Committee on Nutrition (SACN, 2025) found that links between ultra-processed
          food and poorer health are consistent but come mostly from observational studies, and that NOVA has
          limits. Processing counts for a fifth of the score, alongside what’s actually in the food.
        </p>
      </MethodSection>

      <MethodSection id="caps" number="05" title="Caps">
        <p>
          A product can’t average its way out of a serious problem. If one of these applies, the score is capped at
          about the maximum shown. Only the lowest cap that applies counts, and the app tells you which one it was.
        </p>
        <CapsTable />
        <p>
          “High in” means a red traffic light for sugars, salt or saturates, which the app names (for example, “high
          in sugars”). High fat counts too, unless the product also has {HIGH_PROTEIN_GRAMS} g of protein or more
          per 100 g, as seed and nut products often do. Fat and saturates in unprocessed foods and basic kitchen
          ingredients (NOVA 1 and 2), such as nuts, plain yoghurt or butter, never trigger a cap.
        </p>
        <p>
          An ingredient of high concern caps any product at {highConcernCap}, whatever else is in it. There are{" "}
          {CAPS.length} caps in all.
        </p>
      </MethodSection>

      <MethodSection id="soft-caps" number="06" title="Soft caps">
        <p>
          Caps are soft, so capped products keep their order: a better product under the same cap still scores
          higher. A capped product scores between {Math.round(SOFT_CAP_FLOOR * 100)}% of the cap (if everything else
          scored 0) and the full cap (if everything else scored 100):
        </p>
        <p className="card px-6 py-5 font-serif text-[22px] text-ink">
          capped = cap × ({SOFT_CAP_FLOOR} + {1 - SOFT_CAP_FLOOR} × average ÷ 100)
        </p>
        <p>The score is whichever is lower: the weighted average or the capped value.</p>
        <WorkedExample />
      </MethodSection>

      <MethodSection id="verdicts" number="07" title="Verdicts">
        <p>
          Every score falls into one of four bands, each with a fixed headline. A verdict rates the product, not the
          person, and what you do with it is up to you.
        </p>
        <VerdictBands />
      </MethodSection>

      <MethodSection id="personal" number="08" title="What never changes a score">
        <p>
          Your allergens, diet and watch list add personal alerts to a result, but they never change the score. That
          way a score means the same thing to everyone, and you can compare notes with anyone.
        </p>
        <p>
          PureScan has no advertising, and no brand can pay to change a score or a rating. Scores are our
          assessment using this published method, not a regulatory judgement, and they aren’t medical advice.
        </p>
      </MethodSection>

      <MethodSection id="sources" number="09" title="Sources">
        <p>Where the data and thresholds come from. Each additive page lists its own sources too.</p>
        <SourcesList />
      </MethodSection>
    </div>
  );
}
