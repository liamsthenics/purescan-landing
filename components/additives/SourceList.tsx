import { sourceDescription, sourceTag, sourceYear } from "@/lib/additive-format";
import { ExternalLinkIcon } from "../icons";

interface SourceListProps {
  sources: readonly { title: string; url: string }[];
}

/** Source rows: mono tag, title, year and an external-link icon. */
export function SourceList({ sources }: SourceListProps) {
  return (
    <ul className="divide-y divide-separator">
      {sources.map((source) => {
        const year = sourceYear(source.title);
        return (
          <li key={source.url}>
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-3 py-3.5 text-[15px] leading-snug"
            >
              <span className="e-number mt-[1px] shrink-0 rounded-md bg-surface-tint px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.03em] text-secondary">
                {sourceTag(source.title)}
              </span>
              <span className="flex-1 text-ink group-hover:text-brand">
                {sourceDescription(source.title)}
                {year && !source.title.includes(`(${year})`) && <span className="text-secondary"> · {year}</span>}
                <span className="sr-only"> (opens in a new tab)</span>
              </span>
              <ExternalLinkIcon size={15} className="mt-[3px] shrink-0 text-secondary group-hover:text-brand" />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
