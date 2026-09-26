import { APP_STORE_LIVE, APP_STORE_URL, TESTFLIGHT_URL } from "@/lib/site";

interface AppStoreButtonProps {
  size?: "large" | "small";
  /** "inverse" sits on a brand-coloured background. */
  tone?: "default" | "inverse";
  className?: string;
}

// Until APP_STORE_LIVE is flipped this links to the public TestFlight beta
// instead of a listing that doesn't exist yet, with a quiet note that the
// App Store listing itself is still coming.
// When the app is live, consider swapping in Apple's official badge artwork
// (developer.apple.com/app-store/marketing/guidelines).
export function AppStoreButton({ size = "large", tone = "default", className }: AppStoreButtonProps) {
  const isSmall = size === "small";
  const isInverse = tone === "inverse";

  if (!APP_STORE_LIVE) {
    const colours = isInverse ? "bg-on-brand text-brand" : "bg-brand text-on-brand";
    const link = (
      <a
        href={TESTFLIGHT_URL}
        rel="noopener"
        className={
          isSmall
            ? `inline-flex h-9 items-center rounded-xl px-4 text-[14px] font-semibold ${colours}`
            : `button-primary ${isInverse ? "!bg-on-brand !text-brand" : ""}`
        }
      >
        {isSmall ? "Join the beta" : "Join the public beta"}
      </a>
    );
    // The small size sits in a single-line, fixed-height nav slot, so it skips the caption.
    if (isSmall) return <span className={className}>{link}</span>;
    return (
      <span className={`inline-flex flex-col items-start gap-2 ${className ?? ""}`}>
        {link}
        <span className={`text-[12px] ${isInverse ? "text-on-brand/75" : "text-secondary"}`}>
          Coming soon to the App Store
        </span>
      </span>
    );
  }

  const colours = isInverse ? "bg-on-brand text-brand" : "bg-brand text-on-brand";
  return (
    <a
      href={APP_STORE_URL}
      className={`${
        isSmall
          ? `inline-flex h-9 items-center rounded-xl px-4 text-[14px] font-semibold ${colours}`
          : `button-primary ${isInverse ? "!bg-on-brand !text-brand" : ""}`
      } ${className ?? ""}`}
    >
      {isSmall ? "Get the app" : "Download on the App Store"}
    </a>
  );
}
