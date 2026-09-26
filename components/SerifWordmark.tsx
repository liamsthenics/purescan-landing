interface SerifWordmarkProps {
  /** Font size in px. */
  size?: number;
  className?: string;
}

/** "PureScan" set in Instrument Serif, as on the editorial pages. */
export function SerifWordmark({ size = 26, className }: SerifWordmarkProps) {
  return (
    <span
      className={`font-serif leading-none tracking-[-0.02em] text-ink ${className ?? ""}`}
      style={{ fontSize: size }}
    >
      PureScan
    </span>
  );
}
