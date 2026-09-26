"use client";

export type BillingPeriod = "yearly" | "monthly";

const OPTIONS: readonly { period: BillingPeriod; label: string }[] = [
  { period: "yearly", label: "Yearly" },
  { period: "monthly", label: "Monthly" },
];

interface BillingToggleProps {
  value: BillingPeriod;
  onChange: (period: BillingPeriod) => void;
}

/** A two-way pill switch. Plain buttons with aria-pressed, so Tab, Enter and Space all work. */
export function BillingToggle({ value, onChange }: BillingToggleProps) {
  return (
    <div
      role="group"
      aria-label="Premium billing period"
      className="inline-flex rounded-full p-1 shadow-[inset_0_0_0_1px_var(--forest-hairline)]"
    >
      {OPTIONS.map((option) => {
        const isSelected = option.period === value;
        return (
          <button
            key={option.period}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onChange(option.period)}
            className={`type-mono h-10 rounded-full px-5 text-[11px] !tracking-[0.08em] transition-colors duration-200 ${
              isSelected ? "bg-on-forest text-forest" : "text-on-forest-muted hover:text-on-forest"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
