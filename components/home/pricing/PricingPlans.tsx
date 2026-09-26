"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { FREE_HISTORY_LIMIT, PRICES, TRIAL_DISCLOSURE } from "@/lib/site";
import { DownloadButton } from "../DownloadButton";
import { BillingToggle, type BillingPeriod } from "./BillingToggle";
import { PlanColumn } from "./PlanColumn";

const FREE_FEATURES = [
  "Unlimited scans",
  "Full scores, every additive rated",
  "Allergen and diet alerts",
  "The top higher-scoring alternative",
  `Your latest ${FREE_HISTORY_LIMIT} scans`,
];

const PREMIUM_FEATURES = [
  "Everything in Free",
  "Ask PureScan",
  "Every alternative, ranked",
  "This vs That",
  "Watch-list alerts",
  "Unlimited scan history",
];

const PREMIUM_PRICING: Record<BillingPeriod, { price: string; unit: string; summary: string }> = {
  yearly: {
    price: PRICES.yearly,
    unit: "per year",
    summary: `Works out at ${PRICES.yearlyPerMonth} a month.`,
  },
  monthly: {
    price: PRICES.monthly,
    unit: "per month",
    summary: `Or ${PRICES.yearly} a year, which works out at ${PRICES.yearlyPerMonth} a month.`,
  },
};

interface PricingPlansProps {
  /** The section heading, laid out beside the billing switch. */
  heading: ReactNode;
}

/** Free and Premium side by side, with a Yearly / Monthly switch for Premium's price. */
export function PricingPlans({ heading }: PricingPlansProps) {
  const [period, setPeriod] = useState<BillingPeriod>("yearly");
  const premium = PREMIUM_PRICING[period];

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-8">
        {heading}
        <BillingToggle value={period} onChange={setPeriod} />
      </div>

      <div className="mt-14 grid border-t border-forest-hairline md:grid-cols-2">
        <PlanColumn
          name="Free"
          price="£0"
          summary="Everything you need to read a label properly."
          features={FREE_FEATURES}
          className="md:pr-12"
        />
        <PlanColumn
          name="Premium"
          price={premium.price}
          priceUnit={premium.unit}
          summary={premium.summary}
          features={PREMIUM_FEATURES}
          className="border-t border-forest-hairline md:border-l md:border-t-0 md:pl-12"
        >
          <DownloadButton tone="mint" className="mt-10" />
          <p className="mt-6 max-w-[30rem] text-[14px] leading-relaxed text-on-forest-muted">
            {TRIAL_DISCLOSURE}{" "}
            <Link href="/support#subscriptions" className="font-medium text-on-forest underline underline-offset-4">
              How to manage your subscription
            </Link>
          </p>
        </PlanColumn>
      </div>
    </>
  );
}
