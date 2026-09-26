import type { ReactNode } from "react";

interface PlanColumnProps {
  name: string;
  price: string;
  /** Mono text after the price, e.g. "per year". */
  priceUnit?: string;
  summary: string;
  features: readonly string[];
  className?: string;
  /** Anything under the feature list, such as the call to action. */
  children?: ReactNode;
}

/** One plan: mono name, serif price, a sentence and a hairline list. */
export function PlanColumn({ name, price, priceUnit, summary, features, className, children }: PlanColumnProps) {
  return (
    <div className={`py-10 ${className ?? ""}`}>
      <h3 className="type-mono text-[11px] text-mint">{name}</h3>
      <p className="mt-6 flex flex-wrap items-baseline gap-x-4 gap-y-2" aria-live="polite">
        <span className="font-serif text-[clamp(4.25rem,3.5rem+2.4vw,5.75rem)] leading-[0.85] tracking-[-0.03em] tabular-nums">
          {price}
        </span>
        {priceUnit && <span className="type-mono text-[11px] text-on-forest-muted">{priceUnit}</span>}
      </p>
      <p className="mt-6 min-h-[3.3em] max-w-[26rem] text-[17px] leading-relaxed text-on-forest-muted">{summary}</p>
      <ul className="mt-8 border-b border-forest-hairline">
        {features.map((feature) => (
          <li key={feature} className="border-t border-forest-hairline py-4 text-[17px]">
            {feature}
          </li>
        ))}
      </ul>
      {children}
    </div>
  );
}
