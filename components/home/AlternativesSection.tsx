import {
  FIZZBROOK_COLA,
  ORCHARD_LANE_PRESSE,
  WILD_SPRING_LEMON_LIME,
  exampleScore,
  fullProductName,
  type ExampleProduct,
} from "@/lib/examples";
import { formatGrams, mainDifference } from "@/lib/result-copy";
import { PROCESSING_LABELS } from "@/lib/scoring";
import { verdictColorVar, verdictFor } from "@/lib/verdict";
import { PremiumTag } from "../PremiumTag";
import { Packshot } from "../score/Packshot";
import { ProductEyebrow } from "../score/ProductEyebrow";
import { ProductScoreColumn } from "../score/ProductScoreColumn";
import { ScoreNumeral } from "../score/ScoreNumeral";
import { ScoreRuler } from "../score/ScoreRuler";
import { SectionIntro } from "../SectionIntro";

interface AlternativeCardProps {
  product: ExampleProduct;
  locked?: boolean;
}

function AlternativeCard({ product, locked = false }: AlternativeCardProps) {
  const score = exampleScore(product);
  const verdict = verdictFor(score);
  return (
    <div className="relative w-[168px] shrink-0 overflow-hidden rounded-[18px] bg-paper px-4 pb-4 pt-5 hairline-ring">
      <div className={locked ? "blur-[6px]" : undefined} aria-hidden={locked}>
        <Packshot product={product} height="92px" washVerdict={verdict.verdict} />
        <ProductEyebrow product={product} showsQuantity={false} className="mt-3 block text-[9.5px]" />
        <p className="mt-1 min-h-[2.2em] font-serif text-[18px] leading-[1.1] text-ink">{product.name}</p>
        <div className="mt-3 flex items-end justify-between gap-2">
          <ScoreNumeral score={score} size={40} />
          <span
            className="pb-0.5 text-[11px] font-semibold uppercase tracking-[0.14em]"
            style={{ color: verdictColorVar(verdict.verdict) }}
          >
            {verdict.title}
          </span>
        </div>
        <ScoreRuler score={score} compact className="mt-4" />
      </div>
      {locked && (
        <div className="absolute inset-0 grid place-items-center">
          <PremiumTag />
        </div>
      )}
    </div>
  );
}

export function AlternativesSection() {
  const before = FIZZBROOK_COLA;
  const after = WILD_SPRING_LEMON_LIME;
  const beforeScore = exampleScore(before);
  const afterScore = exampleScore(after);
  const driver = mainDifference(before, after);
  const beforeSugar = before.facts.nutrition?.sugars ?? 0;
  const afterSugar = after.facts.nutrition?.sugars ?? 0;
  const moderateCount = (product: ExampleProduct) => product.facts.findings.filter((tier) => tier === "moderate").length;

  const differences = [
    { label: "Sugars per 100 ml", before: formatGrams(beforeSugar), after: formatGrams(afterSugar) },
    { label: "Ingredients of moderate concern", before: String(moderateCount(before)), after: String(moderateCount(after)) },
    {
      label: "Processing",
      before: before.facts.nova ? PROCESSING_LABELS[before.facts.nova] : "Unknown",
      after: after.facts.nova ? PROCESSING_LABELS[after.facts.nova] : "Unknown",
    },
  ];

  return (
    <section aria-labelledby="alternatives-heading" className="border-t border-separator py-20 md:py-28">
      <div className="container-page">
        <SectionIntro label="Alternatives & compare" title="Higher-scoring alternatives, side by side." headingId="alternatives-heading">
          <p>
            When something scores low, PureScan shows similar products that score higher. Put any two side by side
            with This-vs-That to see exactly where they differ.
          </p>
        </SectionIntro>

        <div className="mt-14 grid items-start gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="app-sheet min-w-0 p-6 md:p-8">
            <p className="section-label">Higher-scoring alternatives</p>
            <div className="-mx-2 mt-5 flex gap-3 overflow-x-auto px-2 pb-2">
              <AlternativeCard product={after} />
              <AlternativeCard product={ORCHARD_LANE_PRESSE} locked />
            </div>
            <p className="mt-5 text-[15px] leading-relaxed text-secondary">
              Your first alternative is free on every scan. Premium shows them all.
            </p>
          </div>

          <div className="app-sheet min-w-0 p-6 md:p-8">
            <div className="flex items-center justify-between gap-4">
              <p className="section-label">This vs That</p>
              <PremiumTag />
            </div>
            <div className="mx-auto mt-6 flex max-w-md items-start gap-4 sm:gap-8">
              <ProductScoreColumn product={before} packshotHeight="112px" numeralSize={56} />
              <span className="mt-[170px] font-serif text-[22px] italic text-tertiary">vs</span>
              <ProductScoreColumn product={after} packshotHeight="112px" numeralSize={56} />
            </div>
            <p className="type-card-title mx-auto mt-6 max-w-md text-center text-[22px]">
              {fullProductName(after)} scores {afterScore - beforeScore} points higher{driver ? `, mostly on ${driver}` : ""}.
            </p>
            <p className="section-label mt-8">Key differences</p>
            <table className="mt-3 w-full text-[15px]">
              <caption className="sr-only">
                Key differences between {fullProductName(before)} and {fullProductName(after)}
              </caption>
              <thead className="sr-only">
                <tr>
                  <th scope="col">Measure</th>
                  <th scope="col">{fullProductName(before)}</th>
                  <td />
                  <th scope="col">{fullProductName(after)}</th>
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
