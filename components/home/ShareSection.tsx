import { FIZZBROOK_COLA, WILD_SPRING_LEMON_LIME, exampleScore, fullProductName } from "@/lib/examples";
import { formatGrams, mainDifference } from "@/lib/result-copy";
import { verdictFor } from "@/lib/verdict";
import { BrandMark } from "../BrandMark";
import { KeyFactsStrip } from "../score/KeyFactsStrip";
import { Packshot } from "../score/Packshot";
import { ProductEyebrow } from "../score/ProductEyebrow";
import { ProductScoreColumn } from "../score/ProductScoreColumn";
import { ScoreNumeral } from "../score/ScoreNumeral";
import { ScoreRuler } from "../score/ScoreRuler";
import { VerdictReadout } from "../score/VerdictReadout";
import { SectionIntro } from "../SectionIntro";

/** Share cards are sized in their own units so they read like the app's story image, only smaller. */
const CARD_UNIT = "0.82px";
const SHARE_CARD_CLASS =
  "app-sheet mx-auto flex w-full max-w-[340px] flex-col px-6 pb-5 pt-6";

function ShareFooter() {
  return (
    <p className="mt-auto flex items-center justify-center gap-1.5 whitespace-nowrap pt-5 text-[11px] text-secondary">
      <BrandMark size={13} />
      Scanned with <span className="font-semibold text-ink">PureScan</span> · purescan.io
    </p>
  );
}

function ResultShareCard() {
  const product = FIZZBROOK_COLA;
  const score = exampleScore(product);
  return (
    <figure
      className={SHARE_CARD_CLASS}
      aria-label={`Share card: ${fullProductName(product)}, score ${score} out of 100, ${verdictFor(score).title}`}
      role="img"
    >
      <div aria-hidden="true" className="flex flex-1 flex-col">
        <Packshot product={product} height="118px" />
        <div className="mt-3 text-center">
          <ProductEyebrow product={product} className="text-[10px]" />
          <p className="mt-1 font-serif text-[26px] leading-none text-ink">{product.name}</p>
        </div>
        <div className="mt-5 flex items-end justify-between gap-3">
          <ScoreNumeral score={score} size={64} />
          <VerdictReadout score={score} unit={CARD_UNIT} className="pb-1" />
        </div>
        <ScoreRuler score={score} unit={CARD_UNIT} className="mt-4" />
        <KeyFactsStrip product={product} unit={CARD_UNIT} className="mt-1" />
      </div>
      <ShareFooter />
    </figure>
  );
}

function CompareShareCard() {
  const before = FIZZBROOK_COLA;
  const after = WILD_SPRING_LEMON_LIME;
  const difference = exampleScore(after) - exampleScore(before);
  const driver = mainDifference(before, after);
  const sugarChange = `${formatGrams(before.facts.nutrition?.sugars ?? 0)} → ${formatGrams(after.facts.nutrition?.sugars ?? 0)}`;
  return (
    <figure
      className={SHARE_CARD_CLASS}
      aria-label={`Comparison card: ${fullProductName(after)} scores ${difference} points higher than ${fullProductName(before)}`}
      role="img"
    >
      <div aria-hidden="true" className="flex flex-1 flex-col">
        <p className="e-number text-center text-[10px] uppercase tracking-[0.12em] text-secondary">This vs That</p>
        <div className="mt-4 flex items-start gap-3">
          <ProductScoreColumn product={before} packshotHeight="104px" numeralSize={46} unit={CARD_UNIT} />
          <span className="mt-[150px] font-serif text-[20px] italic text-tertiary">vs</span>
          <ProductScoreColumn product={after} packshotHeight="104px" numeralSize={46} unit={CARD_UNIT} />
        </div>
        <div className="mt-5 border-y border-separator py-3 text-center">
          <p className="font-serif text-[26px] leading-none text-ink">+{difference} points</p>
          {driver && <p className="mt-1.5 text-[12px] text-secondary">mostly on {driver}</p>}
          {driver === "sugars" && (
            <p className="e-number mt-0.5 text-[11px] text-tertiary">{sugarChange} sugars per 100 ml</p>
          )}
        </div>
      </div>
      <ShareFooter />
    </figure>
  );
}

export function ShareSection() {
  return (
    <section aria-labelledby="share-heading" className="border-t border-separator py-20 md:py-28">
      <div className="container-page grid items-center gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <SectionIntro label="Share" title="Share what you find." headingId="share-heading">
          <p>
            Turn any result or comparison into a clean card for a Story or a post. Each card shows the score on the
            PureScan scale and the facts behind it, so the people you share it with can see why.
          </p>
        </SectionIntro>
        <div className="grid items-stretch gap-5 sm:grid-cols-2 sm:gap-6">
          <ResultShareCard />
          <CompareShareCard />
        </div>
      </div>
    </section>
  );
}
