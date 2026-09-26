import type { Metadata } from "next";
import { FaqSection } from "@/components/home/faq/FaqSection";
import { HeroSection } from "@/components/home/hero/HeroSection";
import { PricingSection } from "@/components/home/pricing/PricingSection";
import { AdditiveIndexSection } from "@/components/home/sections/AdditiveIndexSection";
import { AskSection } from "@/components/home/sections/AskSection";
import { CompareSection } from "@/components/home/sections/CompareSection";
import { IndependentSection } from "@/components/home/sections/IndependentSection";
import { OneTapSection } from "@/components/home/sections/OneTapSection";
import { ScoreSection } from "@/components/home/sections/ScoreSection";
import { SourcesSection } from "@/components/home/sections/SourcesSection";
import { Story } from "@/components/home/story/Story";
import { JsonLd } from "@/components/JsonLd";
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
      <Story>
        <HeroSection />
        <OneTapSection />
        <AskSection />
        <ScoreSection />
        <SourcesSection />
        <CompareSection />
        <AdditiveIndexSection />
      </Story>
      <div className="surface-forest">
        <IndependentSection />
        <PricingSection />
      </div>
      <FaqSection />
    </>
  );
}
