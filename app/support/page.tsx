import type { Metadata } from "next";
import Link from "next/link";
import { FaqList } from "@/components/FaqList";
import { ExternalLinkIcon } from "@/components/icons";
import { JsonLd } from "@/components/JsonLd";
import { SUPPORT_FAQ, faqJsonLd } from "@/lib/faq";
import { pageMetadata } from "@/lib/metadata";
import { CONTACT_EMAIL, FREE_HISTORY_LIMIT, FREE_TRIAL_DAYS, PRICES, PRIVACY_EMAIL } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Support and help",
  description:
    "Help with PureScan: scanning, products that aren't found, managing or cancelling your subscription, your data, and how to contact us.",
  path: "/support",
});

const APPLE_CANCEL_HELP_URL = "https://support.apple.com/en-gb/118428";
const APPLE_REFUND_URL = "https://reportaproblem.apple.com";

const CANCEL_STEPS = [
  "Open the Settings app on your iPhone.",
  "Tap your name at the top (your Apple Account, previously called Apple ID).",
  "Tap Subscriptions.",
  "Tap PureScan, then Cancel Subscription.",
];

const GETTING_STARTED = [
  {
    title: "Scanning",
    body: "Open the app and point your camera at a barcode. You’ll get a score, what’s flagged and why, nutrition and processing.",
  },
  {
    title: "Not found?",
    body: "Photograph the ingredients label instead. The photo is read on your device and isn’t uploaded or stored. You can also search by name.",
  },
  {
    title: "Your preferences",
    body: "Add allergens, a diet or a watch list and PureScan tells you when a product contains something on it. Alerts are personal and never change the score.",
  },
  {
    title: "Your history",
    body: `Free keeps your latest ${FREE_HISTORY_LIMIT} scans; Premium keeps them all. History is stored only on your phone.`,
  },
];

function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-link inline-flex items-center gap-1">
      {children}
      <ExternalLinkIcon size={14} />
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

export default function SupportPage() {
  return (
    <div className="container-page">
      <JsonLd data={faqJsonLd(SUPPORT_FAQ)} />
      <header className="max-w-3xl pb-12 pt-14 md:pt-20">
        <p className="section-label">Support</p>
        <h1 className="type-display mt-5">How can we help?</h1>
        <p className="type-lede mt-7 max-w-2xl">
          Answers to common questions below. If you can’t find what you need, email{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-link">
            {CONTACT_EMAIL}
          </a>{" "}
          and we’ll get back to you.
        </p>
      </header>

      <section aria-labelledby="start-heading" className="border-t border-separator py-14">
        <h2 id="start-heading" className="type-title">
          Using PureScan
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {GETTING_STARTED.map((item) => (
            <div key={item.title} className="card p-6">
              <h3 className="text-[17px] font-semibold">{item.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-secondary">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="subscriptions" aria-labelledby="subscriptions-heading" className="border-t border-separator py-14">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 id="subscriptions-heading" className="type-title">
              Manage or cancel your subscription
            </h2>
            <p className="mt-4 text-[17px] leading-relaxed text-secondary">
              PureScan Premium is sold and billed by Apple, so you manage it in your iPhone’s settings. Cancel at least
              24 hours before it renews and you won’t be charged for the next period.
            </p>
            <ol className="card mt-6 divide-y divide-separator">
              {CANCEL_STEPS.map((step, index) => (
                <li key={step} className="flex gap-4 px-5 py-4 text-[16px]">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-tint text-[13px] font-semibold tabular-nums text-brand">
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
            <p className="mt-4 text-[15px] text-secondary">
              More detail from Apple: <ExternalLink href={APPLE_CANCEL_HELP_URL}>Cancel a subscription from Apple</ExternalLink>
            </p>
          </div>
          <div className="space-y-6">
            <div className="card p-6">
              <h3 className="text-[17px] font-semibold">Restore a purchase</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-secondary">
                New phone, or reinstalled the app? Open the Premium screen in PureScan and tap Restore. Use the same
                Apple Account you subscribed with.
              </p>
            </div>
            <div className="card p-6">
              <h3 className="text-[17px] font-semibold">Refunds</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-secondary">
                Apple handles payments, so refund requests go to Apple:{" "}
                <ExternalLink href={APPLE_REFUND_URL}>reportaproblem.apple.com</ExternalLink>
              </p>
            </div>
            <div className="card p-6">
              <h3 className="text-[17px] font-semibold">Free trials</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-secondary">
                {FREE_TRIAL_DAYS}-day free trial for new subscribers, then {PRICES.yearly} a year or {PRICES.monthly}{" "}
                a month. Cancel any time in your Apple Account settings and you won’t be charged.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" aria-labelledby="faq-heading" className="border-t border-separator py-14">
        <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
          <h2 id="faq-heading" className="type-title">
            Questions
          </h2>
          <FaqList items={SUPPORT_FAQ} />
        </div>
      </section>

      <section id="contact" aria-labelledby="contact-heading" className="border-t border-separator py-14">
        <h2 id="contact-heading" className="type-title">
          Contact us
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="card p-6">
            <p className="section-label">Help and feedback</p>
            <a href={`mailto:${CONTACT_EMAIL}`} className="mt-2 block text-[20px] font-semibold text-brand hover:underline">
              {CONTACT_EMAIL}
            </a>
            <p className="mt-2 text-[15px] text-secondary">
              Questions, wrong product data, ideas. Include the barcode if it’s about a product.
            </p>
          </div>
          <div className="card p-6">
            <p className="section-label">Privacy</p>
            <a href={`mailto:${PRIVACY_EMAIL}`} className="mt-2 block text-[20px] font-semibold text-brand hover:underline">
              {PRIVACY_EMAIL}
            </a>
            <p className="mt-2 text-[15px] text-secondary">
              Anything about your data. See our{" "}
              <Link href="/privacy" className="text-link font-medium">
                privacy policy
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
