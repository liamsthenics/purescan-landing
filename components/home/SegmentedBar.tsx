export interface BarSegment {
  key: string;
  /** Relative share of the bar. */
  weight: number;
  /** Any CSS colour. */
  color: string;
}

interface SegmentedBarProps {
  segments: readonly BarSegment[];
  className?: string;
}

/** A proportional bar of flat segments with hairline gaps. Decorative: the numbers are always printed beside it. */
export function SegmentedBar({ segments, className }: SegmentedBarProps) {
  return (
    <div className={`flex h-2 gap-1 ${className ?? ""}`} aria-hidden="true">
      {segments.map((segment) => (
        <span
          key={segment.key}
          className="h-full min-w-1 rounded-[2px]"
          style={{ flexGrow: segment.weight, flexBasis: 0, background: segment.color }}
        />
      ))}
    </div>
  );
}
