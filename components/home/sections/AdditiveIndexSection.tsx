import { countByTier, getAllAdditives } from "@/lib/additives";
import { HOME_SECTION_IDS } from "@/lib/navigation";
import { TIERS, type Tier } from "@/lib/tiers";
import { MonoLink } from "../MonoLink";
import { SectionHeading } from "../SectionHeading";
import { SegmentedBar } from "../SegmentedBar";
import { StorySection } from "../StorySection";

/** Bar colours and the numeral colours (darker where needed for large-text contrast), most concerning first. */
const TIER_COLOURS: Record<Tier, { bar: string; text: string }> = {
  high: { bar: "var(--bad)", text: "var(--bad)" },
  moderate: { bar: "var(--poor)", text: "var(--poor)" },
  low: { bar: "var(--okay)", text: "var(--okay-text)" },
  none: { bar: "var(--great)", text: "var(--great)" },
};

export function AdditiveIndexSection() {
  const total = getAllAdditives().length;
  const counts = countByTier();

  return (
    <StorySection screen="additives" id={HOME_SECTION_IDS.additives} headingId="additive-index-heading">
      <SectionHeading
        number="06"
        eyebrow="The additive index"
        headingId="additive-index-heading"
        showWatermark
        title={
          <>
            <span className="block text-[1.45em] leading-[0.9] tabular-nums">{total}</span>
            <span className="block">additives, rated.</span>
          </>
        }
      >
        <p>
          Additives used in UK and EU food, each with its E-number, function and concern level, and the evaluations
          behind every one we flag. Most have no known concern. We say so.
        </p>
      </SectionHeading>

      <div className="mt-12 max-w-[37.5rem]">
        <SegmentedBar
          segments={TIERS.map((info) => ({ key: info.tier, weight: counts[info.tier], color: TIER_COLOURS[info.tier].bar }))}
        />
        <dl className="mt-6 grid grid-cols-2 gap-x-6 border-t border-hairline sm:grid-cols-4">
          {TIERS.map((info) => (
            <div key={info.tier} className="flex flex-col-reverse border-b border-hairline pb-6 pt-7">
              <dt className="type-mono mt-3 text-[10.5px] text-secondary">{info.chipLabel}</dt>
              <dd
                className="font-serif text-[clamp(3.25rem,2.6rem+1.8vw,4.5rem)] leading-[0.9] tabular-nums"
                style={{ color: TIER_COLOURS[info.tier].text }}
              >
                {counts[info.tier]}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <MonoLink href="/additives" className="mt-10">
        Browse the additive index
      </MonoLink>
    </StorySection>
  );
}
