import Link from "next/link";
import { FOOTER_NAV } from "@/lib/navigation";
import { CONTACT_EMAIL, ODBL_URL, OPEN_FOOD_FACTS_URL } from "@/lib/site";
import { Wordmark } from "./Wordmark";

const COPYRIGHT_YEAR = new Date().getFullYear();

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-separator">
      <div className="container-page grid gap-12 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="max-w-sm">
          <Wordmark size={22} />
          <p className="mt-4 text-[15px] leading-relaxed text-secondary">
            An honest food scanner for the UK. Scores, ratings and sources, with no accounts and no tracking.
          </p>
          <p className="mt-4 text-[15px]">
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-link">
              {CONTACT_EMAIL}
            </a>
          </p>
        </div>
        {FOOTER_NAV.map((group) => (
          <nav key={group.heading} aria-label={group.heading}>
            <h2 className="section-label">{group.heading}</h2>
            <ul className="mt-4 space-y-3">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-[15px] text-ink hover:text-brand">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="container-page flex flex-col gap-3 border-t border-separator py-8 text-[13px] leading-relaxed text-secondary md:flex-row md:justify-between">
        <p className="max-w-2xl">
          Product data from{" "}
          <a href={OPEN_FOOD_FACTS_URL} className="underline underline-offset-2 hover:text-ink">
            Open Food Facts
          </a>
          , available under the{" "}
          <a href={ODBL_URL} className="underline underline-offset-2 hover:text-ink">
            Open Database Licence
          </a>
          . PureScan gives general information, not medical or dietary advice.
        </p>
        <p>© {COPYRIGHT_YEAR} PureScan</p>
      </div>
    </footer>
  );
}
