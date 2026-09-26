import { MonoLink } from "../MonoLink";
import { SectionHeading } from "../SectionHeading";

/** The independence and privacy promises, in the wording of the privacy policy. */
const PROMISES = [
  { title: "No ads, no tracking.", body: "No analytics, advertising or tracking in the app." },
  { title: "No sponsored scores.", body: "No brand can pay to change a score or a rating." },
  { title: "No account.", body: "Open the app and scan. There’s nothing to sign up for." },
  {
    title: "Scans stay on your phone.",
    body: "Your history, allergens, diet and watch list are stored only on your device. To look a product up we send its barcode to Open Food Facts, and nothing about you.",
  },
] as const;

const PROMISE_NUMBER_DIGITS = 2;

export function IndependentSection() {
  return (
    <section
      id="independent"
      aria-labelledby="independent-heading"
      className="py-[clamp(5.5rem,4rem+6vw,10rem)]"
    >
      <div className="container-wide grid gap-14 lg:grid-cols-2 lg:gap-20">
        <div>
          <SectionHeading
            number="07"
            eyebrow="Independent"
            title="Nobody pays for a score."
            headingId="independent-heading"
            tone="forest"
          >
            <p>
              Scores are PureScan’s assessment, using a method we publish in full. The same product always gets the
              same score, for everyone.
            </p>
          </SectionHeading>
          <MonoLink href="/privacy" className="mt-10 text-on-forest">
            Read the privacy policy
          </MonoLink>
        </div>

        <ol className="border-b border-forest-hairline">
          {PROMISES.map((promise, index) => (
            <li
              key={promise.title}
              className="grid grid-cols-[2.75rem_minmax(0,1fr)] gap-x-4 border-t border-forest-hairline py-7 sm:grid-cols-[4rem_minmax(0,1fr)]"
            >
              <span className="type-mono pt-2 text-[11px] text-mint" aria-hidden="true">
                {String(index + 1).padStart(PROMISE_NUMBER_DIGITS, "0")}
              </span>
              <div>
                <h3 className="font-serif text-[clamp(1.75rem,1.5rem+0.9vw,2.25rem)] leading-[1.05] tracking-[-0.01em]">
                  {promise.title}
                </h3>
                <p className="mt-2.5 max-w-[30rem] text-[16.5px] leading-relaxed text-on-forest-muted">{promise.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
