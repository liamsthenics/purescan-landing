interface ReasonListProps {
  reasons: readonly string[];
}

/** Numbered "What the evidence says" list. */
export function ReasonList({ reasons }: ReasonListProps) {
  return (
    <ol className="space-y-3">
      {reasons.map((reason, index) => (
        <li key={reason} className="flex gap-3 text-[16px] leading-relaxed text-ink">
          <span className="mt-[3px] grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full bg-surface-tint text-[12px] font-semibold tabular-nums text-secondary">
            {index + 1}
          </span>
          <span>{reason}</span>
        </li>
      ))}
    </ol>
  );
}
