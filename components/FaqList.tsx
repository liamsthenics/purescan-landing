import Link from "next/link";
import type { FaqItem } from "@/lib/faq";
import { PlusIcon } from "./icons";

interface FaqListProps {
  items: readonly FaqItem[];
}

export function FaqList({ items }: FaqListProps) {
  return (
    <div className="card divide-y divide-separator overflow-hidden">
      {items.map((item) => (
        <details key={item.question} className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 px-5 py-5 text-[17px] font-medium text-ink md:px-7 [&::-webkit-details-marker]:hidden">
            {item.question}
            <PlusIcon size={18} className="shrink-0 text-secondary transition-transform duration-200 group-open:rotate-45" />
          </summary>
          <div className="px-5 pb-6 md:px-7">
            <p className="max-w-2xl text-[16px] leading-relaxed text-secondary">{item.answer}</p>
            {item.link && (
              <Link href={item.link.href} className="text-link mt-3 inline-block text-[15px]">
                {item.link.label}
              </Link>
            )}
          </div>
        </details>
      ))}
    </div>
  );
}
