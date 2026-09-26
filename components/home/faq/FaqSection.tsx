import Link from "next/link";
import { HOME_FAQ } from "@/lib/faq";
import { HOME_SECTION_IDS } from "@/lib/navigation";
import { SectionHeading } from "../SectionHeading";
import { FaqAccordion } from "./FaqAccordion";

export function FaqSection() {
  return (
    <section id={HOME_SECTION_IDS.faq} aria-labelledby="faq-heading" className="pt-[clamp(5.5rem,4rem+6vw,10rem)]">
      {/* No bottom padding: the site footer brings its own space. */}
      <div className="container-wide grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-20">
        <div>
          <SectionHeading number="09" eyebrow="Questions" title="Asked often." headingId="faq-heading" />
          <p className="mt-7 max-w-[22rem] text-[16.5px] leading-relaxed text-ink/80">
            Anything else? Our{" "}
            <Link href="/support" className="text-link">
              support page
            </Link>{" "}
            has more answers and a way to get in touch.
          </p>
        </div>
        <FaqAccordion items={HOME_FAQ} groupName="home-faq" />
      </div>
    </section>
  );
}
