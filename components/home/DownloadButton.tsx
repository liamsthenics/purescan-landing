import { DOWNLOAD_LINK } from "@/lib/download";

const TONE_CLASSES = {
  forest: "bg-forest text-on-forest",
  mint: "bg-mint text-on-mint",
} as const;

interface DownloadButtonProps {
  tone: keyof typeof TONE_CLASSES;
  className?: string;
}

/** The large pill: "Join the public beta" with a quiet TESTFLIGHT tag, or the App Store once live. */
export function DownloadButton({ tone, className }: DownloadButtonProps) {
  return (
    <a
      href={DOWNLOAD_LINK.href}
      rel="noopener"
      className={`inline-flex min-h-14 items-center gap-3.5 rounded-full px-7 text-[16.5px] font-medium tracking-[-0.005em] transition-[transform,opacity] duration-200 ease-out hover:-translate-y-px hover:opacity-95 active:translate-y-0 active:scale-[0.985] ${TONE_CLASSES[tone]} ${className ?? ""}`}
    >
      {DOWNLOAD_LINK.label}
      {DOWNLOAD_LINK.channelTag && (
        <span className="type-mono text-[10.5px] opacity-70">{DOWNLOAD_LINK.channelTag}</span>
      )}
    </a>
  );
}
