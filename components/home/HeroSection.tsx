import Link from "next/link";
import { FIZZBROOK_COLA } from "@/lib/examples";
import { AppStoreButton } from "../AppStoreButton";
import { BrandMark } from "../BrandMark";
import { ArrowRightIcon, CheckIcon } from "../icons";
import { PhoneMockup } from "../PhoneMockup";

const PROMISES = ["No account", "No ads or tracking", "Your scans stay on your phone"];

export function HeroSection() {
  return (
    <section aria-labelledby="hero-heading" className="relative overflow-hidden">
      <div className="container-page grid items-center gap-16 pb-20 pt-12 md:pt-20 lg:grid-cols-[1.15fr_0.85fr] lg:gap-8 lg:pb-28">
        <div>
          <p className="section-label">A food scanner for UK shoppers</p>
          <h1 id="hero-heading" className="type-display mt-5 max-w-[11ch]">
            Know what’s really in your food.
          </h1>
          <p className="type-lede mt-7 max-w-[33rem]">
            Scan a barcode for one honest score from 0 to 100, with every additive rated and sourced, UK
            traffic-light nutrition, and a healthier swap when there is one.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-5">
            <AppStoreButton />
            <Link href="/how-we-score" className="text-link inline-flex items-center gap-1.5 text-[16px]">
              See how we score
              <ArrowRightIcon size={16} />
            </Link>
          </div>
          <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-[14px] text-secondary">
            {PROMISES.map((promise) => (
              <li key={promise} className="inline-flex items-center gap-1.5">
                <CheckIcon size={15} className="text-brand" />
                {promise}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative isolate flex flex-col items-center">
          <BrandMark
            size={620}
            color="var(--brand-tint)"
            className="pointer-events-none absolute left-1/2 top-1/2 -z-10 hidden lg:block max-w-none -translate-x-1/2 -translate-y-[52%] opacity-90"
          />
          <PhoneMockup product={FIZZBROOK_COLA} width="clamp(264px, 74vw, 322px)" />
          <p className="mt-5 text-[13px] text-secondary">Example result for a fictional product.</p>
        </div>
      </div>
    </section>
  );
}
