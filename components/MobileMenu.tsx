"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useId, useState } from "react";
import type { NavLink } from "@/lib/navigation";

interface MobileMenuProps {
  links: readonly NavLink[];
}

/** Keyed on the path so the menu closes after navigating. */
export function MobileMenu({ links }: MobileMenuProps) {
  const pathname = usePathname();
  return <MobileMenuPanel key={pathname} links={links} />;
}

function MobileMenuPanel({ links }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const panelId = useId();

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setIsOpen((open) => !open)}
        className="flex h-10 items-center gap-2 rounded-full bg-surface-tint px-4 text-[15px] font-semibold text-ink"
      >
        {isOpen ? "Close" : "Menu"}
      </button>
      <nav
        id={panelId}
        aria-label="Main"
        hidden={!isOpen}
        className="absolute inset-x-0 top-16 border-b border-separator bg-paper px-5 pb-6 pt-2 shadow-[0_24px_40px_-24px_rgba(0,0,0,0.25)]"
      >
        <ul className="divide-y divide-separator">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="flex min-h-[52px] items-center text-[17px] font-medium text-ink"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
