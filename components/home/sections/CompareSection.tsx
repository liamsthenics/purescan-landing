import { FIZZBROOK_COLA, WILD_SPRING_LEMON_LIME, exampleScore, type ExampleProduct } from "@/lib/examples";
import { verdictColorVar, verdictFor } from "@/lib/verdict";
import { SectionHeading } from "../SectionHeading";
import { StorySection } from "../StorySection";

function ComparedScore({ product }: { product: ExampleProduct }) {
  const score = exampleScore(product);
  const verdict = verdictFor(score);
  const color = verdictColorVar(verdict.verdict);
  return (
    <div className="min-w-0">
      <p className="font-serif text-[clamp(6.5rem,4rem+9vw,12.5rem)] leading-[0.82] tracking-[-0.04em] tabular-nums" style={{ color }}>
        {score}
      </p>
      <p className="type-mono mt-5 text-[11px]" style={{ color: `var(--${verdict.verdict}-text, ${color})` }}>
        {verdict.title} · {product.name}
      </p>
    </div>
  );
}

export function CompareSection() {
  const alternative = WILD_SPRING_LEMON_LIME;
  return (
    <StorySection screen="compare" id="this-vs-that" headingId="compare-heading">
      <SectionHeading
        number="05"
        eyebrow="This vs That"
        title="This vs that. Point by point."
        headingId="compare-heading"
        showWatermark
      >
        <p>
          Put two products side by side and see exactly where the points went: sugars, ingredients of concern,
          processing. No verdict, just the differences.
        </p>
      </SectionHeading>

      <div className="mt-14 grid grid-cols-[auto_auto_auto] items-start justify-start gap-x-[clamp(1.25rem,3vw,3rem)]">
        <ComparedScore product={FIZZBROOK_COLA} />
        <span className="pt-[clamp(2.5rem,1.5rem+3vw,4.5rem)] font-serif text-[clamp(2.25rem,1.8rem+1.6vw,3.5rem)] italic leading-none text-ink/60">
          vs
        </span>
        <ComparedScore product={alternative} />
      </div>

      <div className="mt-16 max-w-[35rem] border-t border-hairline pt-10">
        <p className="type-mono text-secondary">Alternatives</p>
        <h3 className="mt-5 font-serif text-[clamp(1.875rem,1.5rem+1.4vw,2.75rem)] leading-[1.02] tracking-[-0.015em]">
          Higher-scoring alternatives from the same aisle, ranked.
        </h3>
        <p className="mt-5 text-[16.5px] leading-relaxed text-ink/80">
          A cola shows you a {alternative.name.toLowerCase()} at {exampleScore(alternative)}. Free includes the top
          alternative; Premium lists every one, and adds This vs That.
        </p>
      </div>
    </StorySection>
  );
}
