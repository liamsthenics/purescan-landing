import Link from "next/link";
import { getAdditiveBySlug } from "@/lib/additives";
import { sourceDescription, sourceTag } from "@/lib/additive-format";
import { FIZZBROOK_COLA, exampleScore } from "@/lib/examples";
import { INGREDIENT_PENALTIES } from "@/lib/scoring";
import { tierInfo } from "@/lib/tiers";
import { BrandMark } from "../BrandMark";
import { ArrowRightIcon, CheckIcon } from "../icons";
import { PremiumTag } from "../PremiumTag";
import { ProductArt } from "../ProductArt";
import { ScoreGauge } from "../ScoreGauge";
import { SectionIntro } from "../SectionIntro";

const EXAMPLE_ADDITIVE_SLUG = "e150d-sulphite-ammonia-caramel";
const EXAMPLE_QUESTION = "Why is E150d flagged?";
const FOLLOW_UP_QUESTIONS = ["What does ultra-processed mean?", "How much sugar is in a can?"];

const POINTS = [
  "Grounded in PureScan’s additive ratings, scores and sources",
  "Information, not advice: what you do with it is up to you",
  "Your questions aren’t stored",
];

function ExampleAnswer() {
  const additive = getAdditiveBySlug(EXAMPLE_ADDITIVE_SLUG);
  const source = additive?.sources[0];
  const tier = tierInfo(additive?.tier ?? "moderate");
  return (
    <div className="mr-6 rounded-[18px] rounded-bl-[6px] bg-paper p-4 hairline-ring sm:mr-10">
      <p className="flex items-center gap-1.5 text-[12px] font-semibold text-brand">
        <BrandMark size={14} />
        Ask PureScan
      </p>
      <p className="mt-2 text-[15px] leading-relaxed text-ink">
        E150d is sulphite ammonia caramel, a colour made by heating sugars with ammonia and sulphites. Making it can
        leave traces of 4-MEI, which IARC classes as possibly carcinogenic to humans (Group 2B). It adds colour only.
      </p>
      <p className="mt-2 text-[15px] leading-relaxed text-ink">
        PureScan rates it {tier.label.toLowerCase()}, so it removes {INGREDIENT_PENALTIES[tier.tier]} points from this
        product’s additives score.
      </p>
      {source && (
        <a
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex max-w-full items-center gap-2 rounded-full bg-surface-tint py-1 pl-1.5 pr-3 text-[12px] text-secondary hover:text-brand"
        >
          <span className="e-number rounded-full bg-surface px-1.5 py-0.5 text-[10px] font-semibold uppercase">
            {sourceTag(source.title)}
          </span>
          <span className="truncate">{sourceDescription(source.title)}</span>
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      )}
    </div>
  );
}

function ExampleConversation() {
  const product = FIZZBROOK_COLA;
  return (
    <figure className="card min-w-0 p-5 md:p-7">
      <div className="flex items-center gap-3 border-b border-separator pb-4">
        <span className="block h-11 w-11 shrink-0 rounded-xl bg-white shadow-[0_0_0_0.5px_var(--card-ring)]">
          <ProductArt art={product.art} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="type-card-title block truncate text-[17px]">{product.name}</span>
          <span className="block text-[12px] text-secondary">
            {product.brand} · {product.quantity}
          </span>
        </span>
        <ScoreGauge score={exampleScore(product)} size="mini" animated={false} />
      </div>

      <div className="mt-5 space-y-4">
        <p className="ml-auto w-fit max-w-[80%] rounded-[18px] rounded-br-[6px] bg-brand px-4 py-2.5 text-[15px] text-on-brand">
          {EXAMPLE_QUESTION}
        </p>
        <ExampleAnswer />
      </div>

      <ul className="mt-5 flex flex-wrap gap-2" aria-label="Other questions you could ask">
        {FOLLOW_UP_QUESTIONS.map((question) => (
          <li key={question} className="rounded-full px-3 py-1.5 text-[13px] text-ink hairline-ring">
            {question}
          </li>
        ))}
      </ul>

      <div
        className="mt-4 flex h-11 items-center justify-between rounded-full bg-paper pl-4 pr-1.5 text-[15px] text-secondary hairline-ring"
        aria-hidden="true"
      >
        Ask about this product
        <span className="grid h-8 w-8 place-items-center rounded-full bg-brand text-on-brand">
          <ArrowRightIcon size={15} className="-rotate-90" />
        </span>
      </div>
      <figcaption className="mt-4 text-[13px] leading-relaxed text-secondary">
        Example conversation about a fictional product.
      </figcaption>
    </figure>
  );
}

export function AskSection() {
  return (
    <section aria-labelledby="ask-heading" className="border-t border-separator py-20 md:py-28">
      <div className="container-page grid items-center gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div>
          <SectionIntro label="Ask PureScan" title="Ask about anything you scan." headingId="ask-heading">
            <p>
              Ask anything about the product you scanned, or any ingredient. Answers come from PureScan’s data and
              the sources behind it, in plain English.
            </p>
          </SectionIntro>
          <ul className="mt-8 space-y-3">
            {POINTS.map((point) => (
              <li key={point} className="flex items-start gap-3 text-[16px]">
                <CheckIcon size={18} className="mt-[3px] shrink-0 text-brand" />
                {point}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-3">
            <PremiumTag />
            <p className="text-[14px] leading-relaxed text-secondary">
              Answers are written by AI and can be wrong.{" "}
              <Link href="/privacy" className="text-link font-medium">
                How your questions are handled
              </Link>
            </p>
          </div>
        </div>
        <ExampleConversation />
      </div>
    </section>
  );
}
