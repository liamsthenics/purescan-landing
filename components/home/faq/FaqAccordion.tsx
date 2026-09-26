import Link from "next/link";
import type { FaqItem } from "@/lib/faq";

interface FaqAccordionProps {
  items: readonly FaqItem[];
  /** Shared name so opening one question closes the others. */
  groupName: string;
}

/**
 * Hairline accordion built on <details>, so it works with the keyboard
 * (Tab, then Enter or Space) and without JavaScript. The first answer starts open.
 */
export function FaqAccordion({ items, groupName }: FaqAccordionProps) {
  return (
    <div className="border-b border-hairline">
      {items.map((item, index) => (
        <details key={item.question} name={groupName} open={index === 0} className="group border-t border-hairline">
          <summary className="flex cursor-pointer list-none items-baseline justify-between gap-6 py-6 font-serif text-[clamp(1.375rem,1.2rem+0.7vw,1.875rem)] leading-[1.15] tracking-[-0.01em] transition-colors hover:text-brand [&::-webkit-details-marker]:hidden">
            {item.question}
            <span aria-hidden="true" className="type-mono shrink-0 text-[15px] text-secondary">
              <span className="group-open:hidden">+</span>
              <span className="hidden group-open:inline">−</span>
            </span>
          </summary>
          <div className="pb-8 pr-8">
            <p className="max-w-[40rem] text-[17px] leading-relaxed text-ink/80">{item.answer}</p>
            {item.link && (
              <Link
                href={item.link.href}
                className="type-mono mt-5 inline-block border-b border-current pb-1 text-[11px] text-ink hover:opacity-70"
              >
                {item.link.label} →
              </Link>
            )}
          </div>
        </details>
      ))}
    </div>
  );
}
