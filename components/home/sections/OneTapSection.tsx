import Image from "next/image";
import { WIDGET_CROP, storyScreen } from "@/lib/story";
import { SectionHeading } from "../SectionHeading";
import { StorySection } from "../StorySection";

interface TapCount {
  count: number;
  unit: string;
  body: string;
  isPureScan: boolean;
}

const TAP_COUNTS: readonly TapCount[] = [
  {
    count: 4,
    unit: "taps",
    body: "A typical food app. Unlock, find the icon, open, find the scanner. About ten seconds.",
    isPureScan: false,
  },
  {
    count: 1,
    unit: "tap",
    body: "PureScan, from the Home Screen widget, the Lock Screen, Control Centre, or Siri.",
    isPureScan: true,
  },
];

/** The ways into the scanner. The Siri phrase is the app's own App Shortcut phrase. */
const ENTRY_POINTS = ["Home Screen widget", "Lock Screen widget", "Control Centre", "“Siri, scan with PureScan”"];

export function OneTapSection() {
  return (
    <StorySection screen="one-tap" id="one-tap" headingId="one-tap-heading" showInlinePhone={false}>
      <SectionHeading number="01" eyebrow="One tap" title="One tap. Not four." headingId="one-tap-heading" showWatermark>
        <p>
          Most food apps take four taps and about ten seconds to reach a camera. PureScan puts Scan where your thumb
          already is. Tap, point, read.
        </p>
      </SectionHeading>

      <div className="mt-14 grid gap-12 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)] sm:gap-10">
        <dl className="border-b border-hairline">
          {TAP_COUNTS.map((item) => (
            <div key={item.unit} className="border-t border-hairline py-7">
              <dt className="flex items-baseline gap-2 font-serif leading-none">
                <span className={`text-[clamp(4.5rem,3.5rem+2.5vw,6rem)] ${item.isPureScan ? "text-great" : "text-ink/75"}`}>
                  {item.count}
                </span>
                <span className="text-[26px] text-ink/75">{item.unit}</span>
              </dt>
              <dd className="mt-4 max-w-[19rem] text-[16.5px] leading-relaxed text-ink/80">{item.body}</dd>
            </div>
          ))}
        </dl>

        <figure className="self-start">
          <div className="overflow-hidden rounded-[18px] shadow-[0_0_0_1px_var(--hairline),0_30px_60px_-30px_rgba(20,32,26,0.35)]">
            <Image
              src={WIDGET_CROP.src}
              width={WIDGET_CROP.width}
              height={WIDGET_CROP.height}
              sizes="(min-width: 960px) 360px, (min-width: 640px) 45vw, 90vw"
              alt={storyScreen("one-tap").alt}
              className="h-auto w-full"
            />
          </div>
          <figcaption className="type-mono mt-4 text-[11px] text-secondary">Home Screen · Scan widget</figcaption>
        </figure>
      </div>

      <ul className="mt-12 flex flex-wrap gap-x-7 gap-y-3" aria-label="Ways to open the scanner">
        {ENTRY_POINTS.map((entry) => (
          <li key={entry} className="type-mono text-[11px] text-secondary">
            {entry}
          </li>
        ))}
      </ul>
    </StorySection>
  );
}
