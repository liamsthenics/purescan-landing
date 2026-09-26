import Link from "next/link";
import { PRIMARY_NAV } from "@/lib/navigation";
import { DownloadPill } from "./DownloadPill";
import { MobileMenu } from "./MobileMenu";
import { SerifWordmark } from "./SerifWordmark";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-paper/85 backdrop-blur-md supports-[backdrop-filter]:bg-paper/75">
      <div className="container-wide grid h-16 grid-cols-[1fr_auto] items-center gap-6 md:grid-cols-[1fr_auto_1fr]">
        <Link href="/" className="justify-self-start rounded-md" aria-label="PureScan home">
          <SerifWordmark />
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-1 md:flex lg:gap-3">
          {PRIMARY_NAV.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="type-mono rounded-full px-3 py-2 text-[11.5px] text-secondary transition-colors hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="hidden justify-self-end md:block">
          <DownloadPill />
        </div>
        <MobileMenu links={PRIMARY_NAV} action={<DownloadPill className="w-full" />} />
      </div>
    </header>
  );
}
