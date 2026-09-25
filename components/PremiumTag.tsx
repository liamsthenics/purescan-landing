import { LockIcon } from "./icons";

/** Lock + "Premium" on the brand tint. */
export function PremiumTag({ className }: { className?: string }) {
  return (
    <span
      className={`inline-flex h-6 items-center gap-1 rounded-full bg-brand-tint px-2.5 text-[12px] font-semibold text-brand ${className ?? ""}`}
    >
      <LockIcon size={11} />
      Premium
    </span>
  );
}
