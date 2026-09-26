import { Fragment } from "react";
import { DOWNLOAD_LINK } from "@/lib/download";
import { FIZZBROOK_COLA, exampleScore, fullProductName } from "@/lib/examples";
import { APP_STORE_LIVE } from "@/lib/site";
import { STORY_SCREEN_ATTRIBUTE, storyScreen } from "@/lib/story";
import { verdictColorVar, verdictFor } from "@/lib/verdict";
import { DownloadButton } from "../DownloadButton";
import { InlinePhone } from "../InlinePhone";
import styles from "./Hero.module.css";
import { HeroNumeral } from "./HeroNumeral";
import { TierRuler } from "./TierRuler";

/** SITE_TAGLINE, broken where the design breaks it. */
const HEADLINE_LINES = ["The honest truth", "about what’s", "in your food."];

const EYEBROW_PARTS = ["For iPhone", APP_STORE_LIVE ? null : "Public beta", "UK & Europe"].filter(
  (part): part is string => part !== null,
);

export function HeroSection() {
  const product = FIZZBROOK_COLA;
  const score = exampleScore(product);
  const scoreColor = verdictColorVar(verdictFor(score).verdict);

  return (
    <section
      aria-labelledby="hero-heading"
      {...{ [STORY_SCREEN_ATTRIBUTE]: "hero" }}
      className="relative pb-[clamp(5rem,4rem+4vw,8rem)] pt-[clamp(3.5rem,2rem+5vw,8rem)]"
    >
      <span className="hidden story:block">
        <HeroNumeral score={score} color={scoreColor} />
      </span>
      <div className={styles.content}>
        <p className="type-mono text-secondary">
          {EYEBROW_PARTS.map((part, index) => (
            <Fragment key={part}>
              {index > 0 && " · "}
              <span className="whitespace-nowrap">{part}</span>
            </Fragment>
          ))}
        </p>
        <h1 id="hero-heading" className="type-hero mt-7">
          {HEADLINE_LINES.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h1>
        <p className="type-body-lg mt-8 max-w-[31rem] !text-[clamp(1.125rem,1rem+0.45vw,1.375rem)]">
          Scan a barcode. Get one score out of 100, every additive rated, and the sources behind it.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-4">
          <DownloadButton tone="forest" />
          {DOWNLOAD_LINK.note && <p className="type-mono text-[11px] text-secondary">{DOWNLOAD_LINK.note}</p>}
        </div>
        <TierRuler
          score={score}
          label={`The PureScan scale from 0 to 100, marked at ${score} for ${fullProductName(product)}.`}
          className="mt-16 md:mt-20"
        />
      </div>
      <InlinePhone
        screen={storyScreen("hero")}
        align="end"
        backdrop={
          <span className={styles.inlineNumeral} style={{ color: scoreColor }} aria-hidden="true">
            {score}
          </span>
        }
      />
    </section>
  );
}
