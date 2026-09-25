import { BrandMark } from "./BrandMark";

interface WordmarkProps {
  /** Size of "Pure" in px; "Scan" is 0.8× and the mark 1.2×. */
  size?: number;
  className?: string;
}

/** Mark + "Pure" (Instrument Serif) + "Scan" (semibold, brand colour). */
export function Wordmark({ size = 24, className }: WordmarkProps) {
  return (
    <span
      className={`inline-flex items-center ${className ?? ""}`}
      style={{ gap: size * 0.35, letterSpacing: "-0.03em" }}
    >
      <BrandMark size={size * 1.2} />
      <span className="leading-none" aria-hidden="true">
        <span className="font-serif text-ink" style={{ fontSize: size }}>
          Pure
        </span>
        <span className="font-sans font-semibold text-brand" style={{ fontSize: size * 0.8 }}>
          Scan
        </span>
      </span>
      <span className="sr-only">PureScan</span>
    </span>
  );
}
