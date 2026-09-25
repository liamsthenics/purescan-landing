import type { Metadata } from "next";
import Link from "next/link";
import { FaqList } from "@/components/FaqList";
import { AdditivesSection } from "@/components/home/AdditivesSection";
import { AlternativesSection } from "@/components/home/AlternativesSection";
import { AskSection } from "@/components/home/AskSection";
import { HeroSection } from "@/components/home/HeroSection";
import { NutritionSection } from "@/components/home/NutritionSection";
import { PricingSection } from "@/components/home/PricingSection";
import { PrivacySection } from "@/components/home/PrivacySection";
import { ScoreSection } from "@/components/home/ScoreSection";
import { ShareSection } from "@/components/home/ShareSection";
import { JsonLd } from "@/components/JsonLd";
import { SectionIntro } from "@/components/SectionIntro";
import { HOME_FAQ, faqJsonLd } from "@/lib/faq";
import { pageMetadata } from "@/lib/metadata";
import {
  APP_STORE_LIVE,
  APP_STORE_URL,
  PREMIUM_MONTHLY_PENCE,
  PREMIUM_YEARLY_PENCE,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_URL,
} from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: `${SITE_NAME}: ${SITE_TAGLINE}`,
  description: SITE_DESCRIPTION,
  path: "/",
  absoluteTitle: true,
});

function softwareApplicationJsonLd(): Record<string, unknown> {
  const offer = (name: string, pence: number) => ({
    "@type": "Offer",
    name,
    price: (pence / 100).toFixed(2),
    priceCurrency: "GBP",
  });
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    applicationCategory: "HealthApplication",
    operatingSystem: "iOS",
    inLanguage: "en-GB",
    ...(APP_STORE_LIVE ? { installUrl: APP_STORE_URL } : {}),
    offers: [
      offer("Free", 0),
      offer("Premium (monthly)", PREMIUM_MONTHLY_PENCE),
      offer("Premium (yearly)", PREMIUM_YEARLY_PENCE),
    ],
  };
}

export default function HomePage() {
  return (
    <>
      <JsonLd data={softwareApplicationJsonLd()} />
      <JsonLd data={faqJsonLd(HOME_FAQ)} />
      <HeroSection />
      <ScoreSection />
      <AdditivesSection />
      <NutritionSection />
      <AlternativesSection />
      <AskSection />
      <ShareSection />
      <PrivacySection />
      <PricingSection />
      <section id="faq" aria-labelledby="faq-heading" className="border-t border-separator py-20 md:py-28">
        <div className="container-page grid gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
          <SectionIntro label="Questions" title="Good questions." headingId="faq-heading">
            <p>
              Anything else? Our <Link href="/support" className="text-link">support page</Link> has more answers and a
              way to get in touch.
            </p>
          </SectionIntro>
          <FaqList items={HOME_FAQ} />
        </div>
      </section>
    </>
  );
}
