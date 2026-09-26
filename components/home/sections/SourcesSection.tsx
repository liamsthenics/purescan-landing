import { HOME_SECTION_IDS } from "@/lib/navigation";
import { SectionHeading } from "../SectionHeading";
import { StorySection } from "../StorySection";

const SOURCE_KINDS = [
  { tag: "EFSA", body: "European Food Safety Authority re-evaluations of approved additives." },
  { tag: "WHO · IARC", body: "Carcinogen classifications from the International Agency for Research on Cancer, and WHO guidelines." },
  { tag: "FSA", body: "UK Food Standards Agency guidance on how additives are approved and labelled, and the UK’s front-of-pack traffic-light thresholds." },
  { tag: "Journals", body: "Peer-reviewed research, cited by author, journal and year, never by headline." },
] as const;

export function SourcesSection() {
  return (
    <StorySection screen="sources" id={HOME_SECTION_IDS.sources} headingId="sources-heading">
      <SectionHeading number="04" eyebrow="Sources" title="Sources, not slogans." headingId="sources-heading" showWatermark>
        <p>
          Where we flag an additive, we link the evaluation or study behind it, with the year it was published. Read it,
          weigh it, decide for yourself.
        </p>
      </SectionHeading>

      <dl className="mt-12 max-w-[35rem] border-b border-hairline">
        {SOURCE_KINDS.map((source) => (
          <div
            key={source.tag}
            className="grid grid-cols-[6.5rem_minmax(0,1fr)] items-baseline gap-x-5 border-t border-hairline py-6 sm:grid-cols-[7.5rem_minmax(0,1fr)]"
          >
            <dt>
              <span className="type-mono inline-block rounded-[4px] bg-surface-tint px-2 py-1 text-[10.5px] !tracking-[0.1em] text-ink">
                {source.tag}
              </span>
            </dt>
            <dd className="text-[16.5px] leading-relaxed text-ink/80">{source.body}</dd>
          </div>
        ))}
      </dl>
    </StorySection>
  );
}
