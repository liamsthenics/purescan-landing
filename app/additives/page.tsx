import type { Metadata } from "next";
import Link from "next/link";
import { AdditiveIndex } from "@/components/additives/AdditiveIndex";
import { KNOWLEDGE_VERSION, getAllAdditives, toListing } from "@/lib/additives";
import { pageMetadata } from "@/lib/metadata";

const additives = getAllAdditives();

export const metadata: Metadata = pageMetadata({
  title: "Food additives A to Z: every E-number with the evidence",
  description: `Search ${additives.length} food additives by E-number or name. Each has a concern tier (high, moderate, low or no known concern) with the evidence and sources behind it.`,
  path: "/additives",
});

export default function AdditivesPage() {
  return (
    <div className="container-page">
      <header className="max-w-3xl pb-6 pt-14 md:pt-20">
        <p className="section-label">Additive index</p>
        <h1 className="type-display mt-5">Every additive, with the evidence.</h1>
        <p className="type-lede mt-7 max-w-2xl">
          All {additives.length} additives in the PureScan knowledge base. Where we flag one, its page explains why
          and links the evidence, from EFSA, the WHO, IARC, the FDA and peer-reviewed research.
        </p>
        <p className="mt-5 text-[14px] text-secondary">
          Knowledge base version {KNOWLEDGE_VERSION} ·{" "}
          <Link href="/how-we-score#ingredients" className="text-link font-medium">
            How concern tiers affect a score
          </Link>
        </p>
      </header>
      <AdditiveIndex additives={additives.map(toListing)} />
    </div>
  );
}
