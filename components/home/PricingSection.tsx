import Link from "next/link";
import { FREE_HISTORY_LIMIT, PRICES } from "@/lib/site";
import { AppStoreButton } from "../AppStoreButton";
import { CheckIcon } from "../icons";
import { SectionIntro } from "../SectionIntro";

const FREE_FEATURES = [
  "Unlimited scans",
  "Full scores and findings",
  "Allergen and diet alerts",
  "Your first healthier swap",
  `Your latest ${FREE_HISTORY_LIMIT} scans`,
];

const PREMIUM_FEATURES = [
  "Everything in Free",
  "Every healthier swap",
  "Alerts for your avoid list",
  "This-vs-That compare",
  "Your full scan history",
];

function FeatureList({ features }: { features: readonly string[] }) {
  return (
    <ul className="mt-7 space-y-3.5">
      {features.map((feature) => (
        <li key={feature} className="flex items-start gap-3 text-[16px]">
          <CheckIcon size={18} className="mt-[3px] shrink-0 text-brand" />
          {feature}
        </li>
      ))}
    </ul>
  );
}

export function PricingSection() {
  return (
    <section id="pricing" aria-labelledby="pricing-heading" className="border-t border-separator py-20 md:py-28">
      <div className="container-page">
        <SectionIntro label="Pricing" title="Free to scan. Premium for more." headingId="pricing-heading" align="center">
          <p>Every scan and every score is free. Premium adds more ways to act on what you find.</p>
        </SectionIntro>

        <div className="mx-auto mt-14 grid max-w-4xl gap-5 md:grid-cols-2">
          <div className="card flex flex-col p-7 md:p-9">
            <h3 className="type-title">Free</h3>
            <p className="mt-4 flex items-baseline gap-2">
              <span className="text-[34px] font-semibold tabular-nums tracking-tight">£0</span>
            </p>
            <p className="mt-1 text-[15px] text-secondary">No account needed.</p>
            <FeatureList features={FREE_FEATURES} />
          </div>

          <div className="flex flex-col rounded-[20px] bg-surface p-7 shadow-[0_0_0_2px_var(--brand)] md:p-9">
            <div className="flex items-center justify-between gap-4">
              <h3 className="type-title">Premium</h3>
              <span className="rounded-full bg-brand-tint px-2.5 py-1 text-[12px] font-semibold text-brand">
                Best value yearly
              </span>
            </div>
            <p className="mt-4 flex flex-wrap items-baseline gap-x-2">
              <span className="text-[34px] font-semibold tabular-nums tracking-tight">{PRICES.yearly}</span>
              <span className="text-[15px] text-secondary">a year, about {PRICES.yearlyPerMonth} a month</span>
            </p>
            <p className="mt-1 text-[15px] text-secondary">or {PRICES.monthly} a month.</p>
            <FeatureList features={PREMIUM_FEATURES} />
          </div>
        </div>

        <div className="mx-auto mt-10 flex max-w-2xl flex-col items-center text-center">
          <AppStoreButton />
          <p className="mt-6 text-[14px] leading-relaxed text-secondary">
            Prices in pounds sterling. Any free trial, and its terms, is shown in the App Store before you subscribe.
            Subscriptions renew automatically; cancel any time in your iPhone’s Settings.{" "}
            <Link href="/support#subscriptions" className="text-link font-medium">
              How to manage your subscription
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
