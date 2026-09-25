import type { ReactNode } from "react";

interface MethodSectionProps {
  id: string;
  number: string;
  title: string;
  children: ReactNode;
}

/** A numbered section of the method page, with its heading in a left rail on wide screens. */
export function MethodSection({ id, number, title, children }: MethodSectionProps) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="border-t border-separator py-14 md:py-20">
      <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">
        <div>
          <p className="section-label tabular-nums">{number}</p>
          <h2 id={`${id}-heading`} className="type-title mt-3 md:text-[2.25rem]">
            {title}
          </h2>
        </div>
        <div className="min-w-0 space-y-5 text-[17px] leading-relaxed text-secondary">{children}</div>
      </div>
    </section>
  );
}
