import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReasonList } from "@/components/additives/ReasonList";
import { SourceList } from "@/components/additives/SourceList";
import { AppStoreButton } from "@/components/AppStoreButton";
import { BrandMark } from "@/components/BrandMark";
import { ChevronRightIcon, ExternalLinkIcon } from "@/components/icons";
import { JsonLd } from "@/components/JsonLd";
import { ChildWarningTag, TierChip, TierShape } from "@/components/TierShape";
import { formatFunctions, scoreEffect } from "@/lib/additive-copy";
import { getAdditiveBySlug, getAllAdditives, relatedAdditives, type Additive } from "@/lib/additives";
import { pageMetadata } from "@/lib/metadata";
import { SITE_URL } from "@/lib/site";
import { tierInfo } from "@/lib/tiers";

const RELATED_LIMIT = 6;
const DESCRIPTION_MAX_LENGTH = 158;
const UK_CHILD_WARNING = "may have an adverse effect on activity and attention in children";

export const dynamicParams = false;

export function generateStaticParams(): { slug: string }[] {
  return getAllAdditives().map((additive) => ({ slug: additive.slug }));
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, text.lastIndexOf(" ", maxLength - 1))}…`;
}

function describe(additive: Additive): string {
  if (additive.tier === "none") {
    const role = additive.functions.length > 0 ? ` (${formatFunctions(additive.functions).toLowerCase()})` : "";
    return `${additive.code} ${additive.name}${role}: what it is, how PureScan rates it and the EFSA evaluation. No known concerns at permitted levels.`;
  }
  return truncate(`Rated ${tierInfo(additive.tier).label} by PureScan. ${additive.summary ?? ""}`, DESCRIPTION_MAX_LENGTH);
}

export async function generateMetadata({ params }: PageProps<"/additives/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const additive = getAdditiveBySlug(slug);
  if (!additive) return {};
  return pageMetadata({
    title: `${additive.code} ${additive.name}: what it is and whether it's safe`,
    description: describe(additive),
    path: `/additives/${additive.slug}`,
  });
}

function breadcrumbJsonLd(additive: Additive): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Additives", item: `${SITE_URL}/additives` },
      { "@type": "ListItem", position: 2, name: `${additive.code} ${additive.name}`, item: `${SITE_URL}/additives/${additive.slug}` },
    ],
  };
}

function FlaggedDetails({ additive }: { additive: Additive }) {
  return (
    <>
      {additive.reasons.length > 0 && (
        <section aria-labelledby="why-heading" className="mt-12">
          <h2 id="why-heading" className="section-label mb-5">
            Why it’s flagged
          </h2>
          <ReasonList reasons={additive.reasons} />
        </section>
      )}
      {additive.sources.length > 0 && (
        <section aria-labelledby="sources-heading" className="mt-12">
          <h2 id="sources-heading" className="section-label mb-1">
            Sources
          </h2>
          <SourceList sources={additive.sources} />
        </section>
      )}
    </>
  );
}

function NoConcernsDetails({ additive }: { additive: Additive }) {
  return (
    <section aria-labelledby="no-concerns-heading" className="mt-10">
      <h2 id="no-concerns-heading" className="type-title">
        No known concerns at permitted levels
      </h2>
      <p className="mt-4 text-[17px] leading-relaxed text-secondary">
        PureScan doesn’t flag {additive.name}. Our knowledge base has no known concerns for it at the levels
        permitted in food.
      </p>
    </section>
  );
}

function ChildWarningNote() {
  return (
    <aside
      className="mt-10 rounded-2xl p-5"
      style={{ background: "color-mix(in srgb, var(--bad) 8%, transparent)" }}
      aria-label="UK child warning"
    >
      <ChildWarningTag />
      <p className="mt-3 text-[16px] leading-relaxed text-ink">
        In the UK, food containing this colour must carry the warning “{UK_CHILD_WARNING}”.
      </p>
    </aside>
  );
}

export default async function AdditivePage({ params }: PageProps<"/additives/[slug]">) {
  const { slug } = await params;
  const additive = getAdditiveBySlug(slug);
  if (!additive) notFound();

  const related = relatedAdditives(additive, RELATED_LIMIT);
  const isFlagged = additive.tier !== "none";

  return (
    <div className="container-page">
      <JsonLd data={breadcrumbJsonLd(additive)} />
      <nav aria-label="Breadcrumb" className="pt-10 text-[14px] text-secondary">
        <ol className="flex items-center gap-1.5">
          <li>
            <Link href="/additives" className="hover:text-brand">
              Additives
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRightIcon size={12} />
          </li>
          <li aria-current="page" className="e-number">
            {additive.code}
          </li>
        </ol>
      </nav>

      <div className="grid gap-12 pb-8 pt-8 lg:grid-cols-[1.35fr_0.65fr] lg:gap-16">
        <article className="min-w-0 max-w-2xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <TierChip tier={additive.tier} />
              {additive.functions.length > 0 && (
                <span className="text-[15px] text-secondary">{additive.functions.join(" · ")}</span>
              )}
            </div>
            <span className="e-number text-[15px] text-secondary">{additive.code}</span>
          </div>
          <h1 className="type-headline mt-6">{additive.name}</h1>

          {isFlagged && additive.summary && <p className="type-lede mt-6 text-ink">{additive.summary}</p>}
          {additive.kidsWarning && <ChildWarningNote />}
          {isFlagged ? <FlaggedDetails additive={additive} /> : <NoConcernsDetails additive={additive} />}

          {additive.efsaUrl && (
            <a
              href={additive.efsaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="card mt-10 flex items-center justify-between gap-4 px-5 py-4 text-[16px] font-medium text-ink hover:text-brand"
            >
              <span>
                EFSA’s scientific evaluation of {additive.code}
                <span className="sr-only"> (opens in a new tab)</span>
              </span>
              <ExternalLinkIcon size={16} className="shrink-0 text-secondary" />
            </a>
          )}

          <section aria-labelledby="score-effect-heading" className="mt-12 border-t border-separator pt-8">
            <h2 id="score-effect-heading" className="section-label">
              In a PureScan score
            </h2>
            <p className="mt-3 text-[16px] leading-relaxed text-secondary">
              {scoreEffect(additive.tier)}{" "}
              <Link href="/how-we-score" className="text-link">
                How we score
              </Link>
            </p>
          </section>
        </article>

        <aside className="space-y-6 lg:pt-2">
          <div className="rounded-[20px] bg-brand p-6 text-on-brand">
            <BrandMark size={32} color="var(--on-brand)" />
            <p className="type-card-title mt-4 text-[24px]">Scan products with PureScan</p>
            <p className="mt-2 text-[15px] leading-relaxed opacity-80">
              Scan a barcode to see whether a product contains {additive.code}, and get one honest score for
              everything in it.
            </p>
            <div className="mt-5">
              <AppStoreButton size="small" tone="inverse" />
            </div>
          </div>

          {related.length > 0 && (
            <nav aria-labelledby="related-heading" className="card p-5">
              <h2 id="related-heading" className="section-label">
                Other {additive.functions[0].toLowerCase()} additives
              </h2>
              <ul className="mt-3 divide-y divide-separator">
                {related.map((item) => (
                  <li key={item.slug}>
                    <Link href={`/additives/${item.slug}`} className="group flex items-center gap-3 py-3 text-[15px]">
                      <TierShape tier={item.tier} size={11} />
                      <span className="e-number w-16 shrink-0 text-[13px] text-secondary">{item.code}</span>
                      <span className="min-w-0 flex-1 truncate text-ink group-hover:text-brand">{item.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </aside>
      </div>
    </div>
  );
}
