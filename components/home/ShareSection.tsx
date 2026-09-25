import { CLEARWELL_LIME, FIZZBROOK_COLA, exampleScore } from "@/lib/examples";
import { formatGrams, mainDifference, whyLine } from "@/lib/result-copy";
import { verdictFor } from "@/lib/verdict";
import { BrandMark } from "../BrandMark";
import { ProductArt } from "../ProductArt";
import { ScoreGauge } from "../ScoreGauge";
import { SectionIntro } from "../SectionIntro";

function ShareFooter() {
  return (
    <p className="flex items-center justify-center gap-1.5 whitespace-nowrap text-[11px] text-secondary">
      <BrandMark size={13} />
      Scanned with PureScan · purescan.io
    </p>
  );
}

function ResultShareCard() {
  const product = CLEARWELL_LIME;
  const score = exampleScore(product);
  return (
    <figure
      className="flex aspect-square w-full flex-col items-center justify-between mx-auto max-w-[340px] rounded-[22px] bg-paper p-6 text-center shadow-[var(--shadow-float)]"
      aria-label={`Share card: ${product.name}, score ${score}, ${verdictFor(score).title}`}
      role="img"
    >
      <div className="flex items-center gap-3 self-stretch text-left" aria-hidden="true">
        <span className="block h-11 w-11 rounded-xl bg-white shadow-[0_0_0_0.5px_var(--card-ring)]">
          <ProductArt art={product.art} />
        </span>
        <span>
          <span className="type-card-title block text-[17px]">{product.name}</span>
          <span className="block text-[12px] text-secondary">
            {product.brand} · {product.quantity}
          </span>
        </span>
      </div>
      <div className="flex flex-col items-center" aria-hidden="true">
        <ScoreGauge score={score} size="card" width="104px" animated={false} />
        <p className="type-card-title mt-2 text-[20px]">{verdictFor(score).headline}</p>
        <p className="mt-1 text-[12px] text-secondary">{whyLine(product)}</p>
      </div>
      <ShareFooter />
    </figure>
  );
}

function CompareShareCard() {
  const before = FIZZBROOK_COLA;
  const after = CLEARWELL_LIME;
  const beforeScore = exampleScore(before);
  const afterScore = exampleScore(after);
  const driver = mainDifference(before, after);
  const sugarChange = `${formatGrams(before.facts.nutrition?.sugars ?? 0)} → ${formatGrams(after.facts.nutrition?.sugars ?? 0)}`;
  return (
    <figure
      className="flex aspect-square w-full flex-col items-center justify-between mx-auto max-w-[340px] rounded-[22px] bg-paper p-6 text-center shadow-[var(--shadow-float)]"
      aria-label={`Comparison card: ${after.name} scores ${afterScore - beforeScore} points higher than ${before.name}`}
      role="img"
    >
      <p className="section-label" aria-hidden="true">
        This vs That
      </p>
      <div className="flex items-center gap-4" aria-hidden="true">
        <ScoreGauge score={beforeScore} size="compact" width="68px" animated={false} />
        <span className="text-[18px] text-secondary">→</span>
        <ScoreGauge score={afterScore} size="compact" width="68px" animated={false} />
      </div>
      <div aria-hidden="true">
        <p className="type-card-title text-[22px]">+{afterScore - beforeScore} points</p>
        {driver && (
          <p className="mt-1 text-[13px] text-secondary">
            mostly on {driver}
            {driver === "sugars" && (
              <>
                : <span className="whitespace-nowrap">{sugarChange}</span>
              </>
            )}
          </p>
        )}
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
            Turn any result or comparison into a clean card for a Story or a post. Each card shows the score and
            the reasons behind it, so the people you share it with can see why.
          </p>
        </SectionIntro>
        <div className="grid gap-5 sm:grid-cols-2 sm:gap-6">
          <ResultShareCard />
          <CompareShareCard />
        </div>
      </div>
    </section>
  );
}
