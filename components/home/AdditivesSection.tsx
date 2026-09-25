import Link from "next/link";
import { countByTier, getAdditiveBySlug, getAllAdditives } from "@/lib/additives";
import { TIERS } from "@/lib/tiers";
import { AdditiveCard } from "../additives/AdditiveCard";
import { ArrowRightIcon } from "../icons";
import { SectionIntro } from "../SectionIntro";
import { TierShape } from "../TierShape";

const FEATURED_ADDITIVE_SLUG = "e211-sodium-benzoate";

export function AdditivesSection() {
  const total = getAllAdditives().length;
  const counts = countByTier();
  const featured = getAdditiveBySlug(FEATURED_ADDITIVE_SLUG);

  return (
    <section aria-labelledby="additives-heading" className="border-t border-separator py-20 md:py-28">
      <div className="container-page grid items-start gap-14 lg:grid-cols-2 lg:gap-20">
        <div>
          <SectionIntro label="Additives" title="Sourced, not scary." headingId="additives-heading">
            <p>
              Every one of the {total} additives in our knowledge base has a rating. Where we flag one, we say
              why and link the source: EFSA, WHO, IARC, the FDA and peer-reviewed research.
            </p>
          </SectionIntro>
          <ul className="mt-10 divide-y divide-separator border-y border-separator">
            {TIERS.map((info) => (
              <li key={info.tier} className="flex items-start gap-4 py-4">
                <span className="mt-1.5">
                  <TierShape tier={info.tier} size={14} />
                </span>
                <span className="flex-1">
                  <span className="block text-[16px] font-semibold" style={{ color: info.colorVar }}>
                    {info.label}
                  </span>
                  <span className="mt-0.5 block text-[15px] leading-relaxed text-secondary">{info.description}</span>
                </span>
                <span className="mt-0.5 text-[15px] font-semibold tabular-nums text-ink">{counts[info.tier]}</span>
              </li>
            ))}
          </ul>
          <Link href="/additives" className="text-link mt-8 inline-flex items-center gap-1.5">
            Browse all {total} additives
            <ArrowRightIcon />
          </Link>
        </div>
        {featured && <AdditiveCard additive={featured} />}
      </div>
    </section>
  );
}
