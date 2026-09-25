import Link from "next/link";
import { PRIMARY_NAV } from "@/lib/navigation";
import { AppStoreButton } from "./AppStoreButton";
import { MobileMenu } from "./MobileMenu";
import { Wordmark } from "./Wordmark";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-separator bg-paper/85 backdrop-blur-md supports-[backdrop-filter]:bg-paper/75">
      <div className="container-page flex h-16 items-center justify-between gap-6">
        <Link href="/" className="rounded-md" aria-label="PureScan home">
          <Wordmark size={22} />
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {PRIMARY_NAV.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-3 py-2 text-[15px] font-medium text-secondary transition-colors hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="hidden md:block">
          <AppStoreButton size="small" />
        </div>
        <MobileMenu links={PRIMARY_NAV} />
      </div>
    </header>
  );
}
