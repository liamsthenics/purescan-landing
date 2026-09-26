import Link from "next/link";
import { FOOTER_NAV } from "@/lib/navigation";
import { CONTACT_EMAIL, ODBL_URL, OPEN_FOOD_FACTS_URL, STANDARD_DISCLAIMER } from "@/lib/site";
import { SerifWordmark } from "./SerifWordmark";

const COPYRIGHT_YEAR = new Date().getFullYear();

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-hairline">
      <div className="container-wide grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div className="max-w-xs">
          <SerifWordmark size={30} />
          <p className="mt-5 text-[15px] leading-relaxed text-secondary">
            An honest food scanner for the UK. Scores, ratings and sources, with no accounts and no tracking.
          </p>
        </div>
        {FOOTER_NAV.map((group) => (
          <nav key={group.heading} aria-label={group.heading}>
            <h2 className="type-mono text-[11px] text-tertiary">{group.heading}</h2>
            <ul className="mt-5 space-y-3.5">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="type-mono text-[11.5px] text-ink hover:text-brand">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
        <div>
          <h2 className="type-mono text-[11px] text-tertiary">Contact</h2>
          <p className="mt-5">
            <a href={`mailto:${CONTACT_EMAIL}`} className="font-mono text-[13px] text-ink hover:text-brand">
              {CONTACT_EMAIL}
            </a>
          </p>
          <p className="type-mono mt-3.5 text-[11px] text-tertiary">© {COPYRIGHT_YEAR} PureScan</p>
        </div>
      </div>
      <div className="container-wide border-t border-hairline py-8">
        <p className="max-w-3xl text-[13px] leading-relaxed text-secondary">
          Product data from{" "}
          <a href={OPEN_FOOD_FACTS_URL} className="underline underline-offset-2 hover:text-ink">
            Open Food Facts
          </a>
          , available under the{" "}
          <a href={ODBL_URL} className="underline underline-offset-2 hover:text-ink">
            Open Database Licence
          </a>
          . {STANDARD_DISCLAIMER.replace(/'/g, "’")}
        </p>
      </div>
    </footer>
  );
}
