import type { ReactNode } from "react";

interface SectionIntroProps {
  label: string;
  title: ReactNode;
  children?: ReactNode;
  /** id for the heading, so the section can be labelled by it. */
  headingId?: string;
  align?: "start" | "center";
}

export function SectionIntro({ label, title, children, headingId, align = "start" }: SectionIntroProps) {
  const isCentered = align === "center";
  return (
    <div className={isCentered ? "mx-auto max-w-2xl text-center" : "max-w-xl"}>
      <p className="section-label">{label}</p>
      <h2 id={headingId} className="type-headline mt-4">
        {title}
      </h2>
      {children && <div className="type-lede mt-5 space-y-4">{children}</div>}
    </div>
  );
}
