import { DOWNLOAD_LINK } from "@/lib/download";

interface DownloadPillProps {
  className?: string;
}

/** The compact dark "Join the beta" pill used in the header and menu. */
export function DownloadPill({ className }: DownloadPillProps) {
  return (
    <a
      href={DOWNLOAD_LINK.href}
      rel="noopener"
      className={`type-mono inline-flex h-11 items-center justify-center whitespace-nowrap rounded-full bg-pill px-5 text-[11.5px] text-on-pill transition-opacity hover:opacity-85 ${className ?? ""}`}
    >
      {DOWNLOAD_LINK.shortLabel}
    </a>
  );
}
