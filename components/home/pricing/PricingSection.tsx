import { HOME_SECTION_IDS } from "@/lib/navigation";
import { SectionHeading } from "../SectionHeading";
import { PricingPlans } from "./PricingPlans";

export function PricingSection() {
  return (
    <section
      id={HOME_SECTION_IDS.pricing}
      aria-labelledby="pricing-heading"
      className="border-t border-forest-hairline py-[clamp(5.5rem,4rem+6vw,10rem)]"
    >
      <div className="container-wide">
        <PricingPlans
          heading={
            <SectionHeading
              number="08"
              eyebrow="Pricing"
              title="Free to scan. Forever."
              headingId="pricing-heading"
              tone="forest"
            />
          }
        />
      </div>
    </section>
  );
}
