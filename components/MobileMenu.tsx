"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useId, useState, type ReactNode } from "react";
import type { NavLink } from "@/lib/navigation";

interface MobileMenuProps {
  links: readonly NavLink[];
  /** Call to action shown under the links. */
  action?: ReactNode;
}

/** Keyed on the path so the menu closes after navigating. */
export function MobileMenu({ links, action }: MobileMenuProps) {
  const pathname = usePathname();
  return <MobileMenuPanel key={pathname} links={links} action={action} />;
}

function MobileMenuPanel({ links, action }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const panelId = useId();

  return (
    <div className="justify-self-end md:hidden">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setIsOpen((open) => !open)}
        className="type-mono flex h-10 items-center rounded-full px-4 text-[11.5px] text-ink shadow-[inset_0_0_0_1px_var(--hairline)]"
      >
        {isOpen ? "Close" : "Menu"}
      </button>
      <nav
        id={panelId}
        aria-label="Main"
        hidden={!isOpen}
        className="absolute inset-x-0 top-16 border-b border-hairline bg-paper px-5 pb-6 pt-2 shadow-[0_24px_40px_-24px_rgba(0,0,0,0.25)]"
      >
        <ul className="divide-y divide-hairline">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="flex min-h-[56px] items-center font-serif text-[26px] leading-none text-ink"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        {action && <div className="mt-4">{action}</div>}
      </nav>
    </div>
  );
}
