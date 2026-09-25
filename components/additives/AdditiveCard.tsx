import Link from "next/link";
import type { Additive } from "@/lib/additives";
import { TierChip } from "../TierShape";
import { ReasonList } from "./ReasonList";
import { SourceList } from "./SourceList";

interface AdditiveCardProps {
  additive: Additive;
}

/** A compact version of the app's additive detail screen. */
export function AdditiveCard({ additive }: AdditiveCardProps) {
  return (
    <article className="card p-6 md:p-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <TierChip tier={additive.tier} />
          {additive.functions[0] && <span className="text-[14px] text-secondary">{additive.functions[0]}</span>}
        </div>
        <span className="e-number text-[14px] text-secondary">{additive.code}</span>
      </div>
      <h3 className="type-title mt-5">
        <Link href={`/additives/${additive.slug}`} className="hover:text-brand">
          {additive.name}
        </Link>
      </h3>
      {additive.summary && <p className="mt-3 text-[16px] leading-relaxed text-secondary">{additive.summary}</p>}
      {additive.reasons.length > 0 && (
        <>
          <p className="section-label mt-7 mb-4">Why it’s flagged</p>
          <ReasonList reasons={additive.reasons} />
        </>
      )}
      {additive.sources.length > 0 && (
        <>
          <p className="section-label mt-7 mb-1">Sources</p>
          <SourceList sources={additive.sources} />
        </>
      )}
    </article>
  );
}
