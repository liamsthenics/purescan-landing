import type { ReactNode } from "react";
import styles from "./SectionHeading.module.css";

const TONE_CLASSES = {
  paper: { eyebrow: "text-secondary", lede: "type-body-lg" },
  forest: { eyebrow: "text-mint", lede: "type-body-lg !text-on-forest-muted" },
} as const;

interface SectionHeadingProps {
  /** Two-digit section number, e.g. "01". */
  number: string;
  eyebrow: string;
  title: ReactNode;
  headingId: string;
  /** Draws the number again as a large faint watermark above the eyebrow. */
  showWatermark?: boolean;
  tone?: keyof typeof TONE_CLASSES;
  /** Lede paragraphs under the heading. */
  children?: ReactNode;
}

/** "01 — ONE TAP" eyebrow, a serif h2 and an optional lede. */
export function SectionHeading({
  number,
  eyebrow,
  title,
  headingId,
  showWatermark = false,
  tone = "paper",
  children,
}: SectionHeadingProps) {
  const toneClasses = TONE_CLASSES[tone];
  return (
    <header>
      {showWatermark && (
        <span className={styles.watermark} aria-hidden="true">
          {number}
        </span>
      )}
      <p className={`type-mono ${styles.eyebrow} ${toneClasses.eyebrow}`}>
        {number} — {eyebrow}
      </p>
      <h2 id={headingId} className="type-section mt-6">
        {title}
      </h2>
      {children && <div className={`${toneClasses.lede} mt-7 max-w-[35rem] space-y-4`}>{children}</div>}
    </header>
  );
}
