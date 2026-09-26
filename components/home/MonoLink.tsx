import Link from "next/link";
import type { ReactNode } from "react";

interface MonoLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
}

/** An uppercase mono text link with an arrow, underlined by a hairline. */
export function MonoLink({ href, children, className }: MonoLinkProps) {
  return (
    <Link
      href={href}
      className={`type-mono group inline-flex items-center gap-2 border-b border-current pb-1.5 text-[11.5px] transition-opacity hover:opacity-70 ${className ?? ""}`}
    >
      {children}
      <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-0.5">
        →
      </span>
    </Link>
  );
}
