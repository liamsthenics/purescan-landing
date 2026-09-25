import { APP_STORE_LIVE, APP_STORE_URL } from "@/lib/site";

interface AppStoreButtonProps {
  size?: "large" | "small";
  /** "inverse" sits on a brand-coloured background. */
  tone?: "default" | "inverse";
  className?: string;
}

// Until APP_STORE_LIVE is flipped this renders a quiet, non-interactive
// "Coming soon" note instead of a link to a listing that doesn't exist yet.
// When the app is live, consider swapping in Apple's official badge artwork
// (developer.apple.com/app-store/marketing/guidelines).
export function AppStoreButton({ size = "large", tone = "default", className }: AppStoreButtonProps) {
  const isSmall = size === "small";
  const isInverse = tone === "inverse";

  if (!APP_STORE_LIVE) {
    return (
      <p
        className={`inline-flex items-center gap-2 rounded-full font-semibold ${
          isInverse ? "bg-on-brand/15 text-on-brand" : "bg-surface-tint text-ink"
        } ${isSmall ? "h-9 px-4 text-[14px]" : "h-[54px] px-6 text-[16px]"} ${className ?? ""}`}
      >
        <span className={`h-2 w-2 rounded-full ${isInverse ? "bg-on-brand" : "bg-brand"}`} aria-hidden="true" />
        Coming soon to the App Store
      </p>
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
