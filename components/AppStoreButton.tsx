import { DOWNLOAD_LINK } from "@/lib/download";

interface AppStoreButtonProps {
  size?: "large" | "small";
  /** "inverse" sits on a brand-coloured background. */
  tone?: "default" | "inverse";
  className?: string;
}

// Links to the public TestFlight beta until APP_STORE_LIVE is flipped (lib/download.ts),
// with a quiet note that the App Store listing itself is still coming.
// When the app is live, consider swapping in Apple's official badge artwork
// (developer.apple.com/app-store/marketing/guidelines).
export function AppStoreButton({ size = "large", tone = "default", className }: AppStoreButtonProps) {
  const isSmall = size === "small";
  const isInverse = tone === "inverse";
  const colours = isInverse ? "bg-on-brand text-brand" : "bg-brand text-on-brand";

  const link = (
    <a
      href={DOWNLOAD_LINK.href}
      rel="noopener"
      className={
        isSmall
          ? `inline-flex h-9 items-center rounded-xl px-4 text-[14px] font-semibold ${colours}`
          : `button-primary ${isInverse ? "!bg-on-brand !text-brand" : ""}`
      }
    >
      {isSmall ? DOWNLOAD_LINK.shortLabel : DOWNLOAD_LINK.label}
    </a>
  );

  // The small size sits in a single-line, fixed-height slot, so it skips the note.
  if (isSmall || !DOWNLOAD_LINK.note) return <span className={className}>{link}</span>;
  return (
    <span className={`inline-flex flex-col items-start gap-2 ${className ?? ""}`}>
      {link}
      <span className={`text-[12px] ${isInverse ? "text-on-brand/75" : "text-secondary"}`}>{DOWNLOAD_LINK.note}</span>
    </span>
  );
}
