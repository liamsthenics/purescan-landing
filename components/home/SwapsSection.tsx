import { CLEARWELL_LIME, FIZZBROOK_COLA, ORCHARD_LANE_PRESSE, exampleScore, type ExampleProduct } from "@/lib/examples";
import { formatGrams, mainDifference } from "@/lib/result-copy";
import { PROCESSING_LABELS } from "@/lib/scoring";
import { verdictColorVar, verdictFor } from "@/lib/verdict";
import { PremiumTag } from "../PremiumTag";
import { ProductArt } from "../ProductArt";
import { ScoreGauge } from "../ScoreGauge";
import { SectionIntro } from "../SectionIntro";

interface SwapCardProps {
  product: ExampleProduct;
  locked?: boolean;
}

function SwapCard({ product, locked = false }: SwapCardProps) {
  const score = exampleScore(product);
  const verdict = verdictFor(score);
  return (
    <div className="relative w-[160px] shrink-0 overflow-hidden rounded-[18px] bg-surface p-4 shadow-[0_0_0_0.5px_var(--card-ring)]">
      <div className={locked ? "blur-[6px]" : undefined} aria-hidden={locked}>
        <span className="block h-[60px] w-[60px] rounded-xl bg-white shadow-[0_0_0_0.5px_var(--card-ring)]">
          <ProductArt art={product.art} />
        </span>
        <p className="type-card-title mt-3 min-h-[2.4em] text-[16px]">{product.name}</p>
        <div className="mt-3 flex items-center gap-2">
          <ScoreGauge score={score} size="mini" animated={false} />
          <span className="text-[13px] font-semibold" style={{ color: verdictColorVar(verdict.verdict) }}>
            {verdict.title}
          </span>
        </div>
      </div>
      {locked && (
        <div className="absolute inset-0 grid place-items-center">
          <PremiumTag />
        </div>
      )}
    </div>
  );
}

export function SwapsSection() {
  const before = FIZZBROOK_COLA;
  const after = CLEARWELL_LIME;
  const beforeScore = exampleScore(before);
  const afterScore = exampleScore(after);
  const driver = mainDifference(before, after);
  const beforeSugar = before.facts.nutrition?.sugars ?? 0;
  const afterSugar = after.facts.nutrition?.sugars ?? 0;
  const limitCount = (product: ExampleProduct) => product.facts.findings.filter((tier) => tier === "moderate").length;

  const differences = [
    { label: "Sugars per 100 ml", before: formatGrams(beforeSugar), after: formatGrams(afterSugar) },
    { label: "Ingredients to limit", before: String(limitCount(before)), after: String(limitCount(after)) },
    {
      label: "Processing",
      before: before.facts.nova ? PROCESSING_LABELS[before.facts.nova] : "Unknown",
      after: after.facts.nova ? PROCESSING_LABELS[after.facts.nova] : "Unknown",
    },
  ];

  return (
    <section aria-labelledby="swaps-heading" className="border-t border-separator py-20 md:py-28">
      <div className="container-page">
        <SectionIntro label="Swaps & compare" title="A better choice, side by side." headingId="swaps-heading">
          <p>
            When something scores low, PureScan suggests similar products that score higher. Put any two side by
            side with This-vs-That to see exactly where they differ.
          </p>
        </SectionIntro>

        <div className="mt-14 grid items-start gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="card min-w-0 p-6 md:p-8">
            <p className="section-label">Healthier swaps</p>
            <div className="-mx-2 mt-5 flex gap-3 overflow-x-auto px-2 pb-2">
              <SwapCard product={after} />
              <SwapCard product={ORCHARD_LANE_PRESSE} locked />
            </div>
            <p className="mt-5 text-[15px] leading-relaxed text-secondary">
              Your first swap is free on every scan. Premium shows them all.
            </p>
          </div>

          <div className="card min-w-0 p-6 md:p-8">
            <div className="flex items-center justify-between gap-4">
              <p className="section-label">This vs That</p>
              <PremiumTag />
            </div>
            <div className="mt-6 flex items-center justify-center gap-5 sm:gap-8">
              <div className="flex w-32 flex-col items-center text-center">
                <ScoreGauge score={beforeScore} size="card" animated={false} />
                <p className="mt-2 text-[14px] leading-snug">{before.name}</p>
              </div>
              <span className="font-serif text-[22px] italic text-secondary">vs</span>
              <div className="flex w-32 flex-col items-center text-center">
                <ScoreGauge score={afterScore} size="card" animated={false} />
                <p className="mt-2 text-[14px] leading-snug">{after.name}</p>
              </div>
            </div>
            <p className="type-card-title mx-auto mt-6 max-w-md text-center text-[22px]">
              {after.name} scores {afterScore - beforeScore} points higher{driver ? `, mostly on ${driver}` : ""}.
            </p>
            <p className="section-label mt-8">Key differences</p>
            <table className="mt-3 w-full text-[15px]">
              <caption className="sr-only">
                Key differences between {before.name} and {after.name}
              </caption>
              <thead className="sr-only">
                <tr>
                  <th scope="col">Measure</th>
                  <th scope="col">{before.name}</th>
                  <td />
                  <th scope="col">{after.name}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-separator">
                {differences.map((row) => (
                  <tr key={row.label}>
                    <th scope="row" className="py-3 pr-3 text-left font-normal text-secondary">
                      {row.label}
                    </th>
                    <td className="py-3 text-right tabular-nums">{row.before}</td>
                    <td className="w-10 py-3 text-center text-secondary" aria-hidden="true">
                      →
                    </td>
                    <td className="py-3 text-right font-semibold tabular-nums">{row.after}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-5 text-[13px] leading-relaxed text-secondary">
              Both products are fictional examples, scored with the same published method.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
