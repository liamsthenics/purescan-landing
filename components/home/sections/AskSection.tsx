import { MonoLink } from "../MonoLink";
import { SectionHeading } from "../SectionHeading";
import { StorySection } from "../StorySection";

/** The two questions shown on the capture, with the sources each answer links. */
const EXAMPLE_QUESTIONS = [
  { question: "Why is E150d flagged?", sourceCount: 1 },
  { question: "Is it banned anywhere?", sourceCount: 1 },
] as const;

function sourceCountLabel(count: number): string {
  return `${count} ${count === 1 ? "source" : "sources"}`;
}

export function AskSection() {
  return (
    <StorySection screen="ask" id="ask" headingId="ask-heading">
      <SectionHeading
        number="02"
        eyebrow="Ask PureScan"
        title="Don’t take our word for it. Ask."
        headingId="ask-heading"
        showWatermark
      >
        <p>
          Ask PureScan answers any question about a product: why an additive is flagged, whether it is approved in the
          UK, what the evidence actually says. Ask a follow-up. Answers link the sources behind each rating, so you can
          open them and read them yourself.
        </p>
      </SectionHeading>

      <ul className="mt-12 max-w-[35rem] border-b border-hairline">
        {EXAMPLE_QUESTIONS.map((item) => (
          <li key={item.question} className="flex items-baseline justify-between gap-6 border-t border-hairline py-6">
            <span className="font-serif text-[clamp(1.375rem,1.2rem+0.6vw,1.75rem)] leading-tight">{item.question}</span>
            <span className="type-mono shrink-0 text-[11px] text-secondary">{sourceCountLabel(item.sourceCount)}</span>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
        <p className="type-mono text-[11px] text-secondary">Instant answers from artificial intelligence. Premium.</p>
        <MonoLink href="/privacy" className="text-secondary">
          How your questions are handled
        </MonoLink>
      </div>
    </StorySection>
  );
}
