import type { ExampleProduct } from "@/lib/examples";

// Plain illustrations for the fictional example products (no real packaging).

interface ProductArtProps {
  art: ExampleProduct["art"];
  className?: string;
}

export function ProductArt({ art, className }: ProductArtProps) {
  return (
    <svg viewBox="0 0 60 60" className={className} aria-hidden="true" focusable="false">
      {art.kind === "can" ? (
        <g>
          <rect x="19" y="9" width="22" height="42" rx="4" fill={art.body} />
          <rect x="19" y="22" width="22" height="13" fill={art.band} />
          <rect x="20.5" y="7" width="19" height="4" rx="1.6" fill="#B9BEBB" />
          <rect x="20.5" y="49" width="19" height="3.5" rx="1.4" fill="#A9AEAB" />
          <rect x="22" y="12" width="2.4" height="36" rx="1.2" fill="#ffffff" opacity="0.22" />
        </g>
      ) : (
        <g>
          <path
            d="M26 6h8v7c0 2 5 5 5 11v24a4 4 0 0 1-4 4H25a4 4 0 0 1-4-4V24c0-6 5-9 5-11V6z"
            fill={art.body}
          />
          <rect x="21" y="30" width="18" height="12" fill={art.band} opacity="0.85" />
          <rect x="25.5" y="4" width="9" height="4" rx="1.2" fill="#8C918E" />
          <rect x="23.5" y="18" width="2.2" height="30" rx="1.1" fill="#ffffff" opacity="0.3" />
        </g>
      )}
    </svg>
  );
}
