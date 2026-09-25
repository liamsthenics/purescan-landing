import type { CSSProperties } from "react";
import { fullProductName, type ExampleProduct } from "@/lib/examples";
import { capNoteParts, formatGrams, nutrientBars, whyLine, type NutrientBar } from "@/lib/result-copy";
import { scoreProduct, type NutrientBand } from "@/lib/scoring";
import { tierInfo } from "@/lib/tiers";
import { verdictFor } from "@/lib/verdict";
import { ArrowRightIcon, ChevronRightIcon, CloseIcon, ShareIcon } from "./icons";
import styles from "./PhoneMockup.module.css";
import { KeyFactsStrip } from "./score/KeyFactsStrip";
import { Packshot } from "./score/Packshot";
import { ProductEyebrow } from "./score/ProductEyebrow";
import { ScoreNumeral } from "./score/ScoreNumeral";
import { ScoreRuler } from "./score/ScoreRuler";
import { VerdictReadout } from "./score/VerdictReadout";
import { TierShape } from "./TierShape";

interface PhoneMockupProps {
  product: ExampleProduct;
  /** CSS width of the phone, e.g. "clamp(260px, 76vw, 330px)". */
  width?: string;
  className?: string;
}

const PT = "var(--pt)";
const BAND_LABELS: Record<NutrientBand, string> = { low: "Low", medium: "Med", high: "High" };
const BAND_COLOURS: Record<NutrientBand, string> = { low: "var(--great)", medium: "var(--okay)", high: "var(--bad)" };

function StatusIcons() {
  return (
    <span className={styles.statusIcons} aria-hidden="true">
      <svg viewBox="0 0 18 12" style={{ width: `calc(18 * ${PT})` }}>
        {[0, 1, 2, 3].map((bar) => (
          <rect key={bar} x={bar * 4.8} y={9 - bar * 3} width="3.2" height={3 + bar * 3} rx="0.8" fill="currentColor" />
        ))}
      </svg>
      <svg viewBox="0 0 16 12" style={{ width: `calc(16 * ${PT})` }}>
        <path d="M8 11.5 5.6 9a3.4 3.4 0 0 1 4.8 0L8 11.5Z M3.4 6.8a6.5 6.5 0 0 1 9.2 0l-1.5 1.5a4.4 4.4 0 0 0-6.2 0L3.4 6.8Z M1 4.4a9.9 9.9 0 0 1 14 0l-1.5 1.5a7.8 7.8 0 0 0-11 0L1 4.4Z" fill="currentColor" />
      </svg>
      <svg viewBox="0 0 27 13" style={{ width: `calc(26 * ${PT})` }}>
        <rect x="0.5" y="0.5" width="23" height="12" rx="3.6" fill="none" stroke="currentColor" opacity="0.4" />
        <rect x="2.3" y="2.3" width="19.4" height="8.4" rx="2" fill="currentColor" />
        <rect x="24.7" y="4.3" width="1.6" height="4.4" rx="0.8" fill="currentColor" opacity="0.4" />
      </svg>
    </span>
  );
}

function NutrientRow({ bar }: { bar: NutrientBar }) {
  const colour = BAND_COLOURS[bar.band];
  return (
    <div className={styles.nutrientRow}>
      <span className={styles.nutrientName}>{bar.label}</span>
      <span className={styles.nutrientValue}>{formatGrams(bar.amount)}</span>
      <span className={styles.track}>
        <span className={styles.zones}>
          {bar.zones.map((width, index) => (
            <span key={index} style={{ flex: width }} />
          ))}
        </span>
        <span
          className={styles.dot}
          style={{ left: `calc(${bar.position * 100}% - 6 * ${PT})`, background: colour } as CSSProperties}
        />
        <span className={styles.bandLabel} style={{ color: colour }}>
          {BAND_LABELS[bar.band]}
        </span>
      </span>
    </div>
  );
}

/** The app's result screen for an example product, drawn in HTML/CSS. */
export function PhoneMockup({ product, width, className }: PhoneMockupProps) {
  const { score } = scoreProduct(product.facts);
  const verdict = verdictFor(score);
  const capNote = capNoteParts(product);
  const unit = product.facts.isDrink ? "ml" : "g";
  const description = `The PureScan result screen for ${fullProductName(product)}, a fictional product: score ${score} out of 100, ${verdict.title}. ${whyLine(product)}.`;

  return (
    <figure className={className} aria-label={description} role="img">
      <div className={styles.phone} style={width ? ({ "--phone-width": width } as CSSProperties) : undefined}>
        <div className={styles.screen} aria-hidden="true">
          <div className={styles.grain} />
          <div className={styles.island} />
          <div className={styles.statusBar}>
            <span>9:41</span>
            <StatusIcons />
          </div>
          <div className={styles.navRow}>
            <span className={styles.glassButton}>
              <ShareIcon size={17} />
            </span>
            <span className={styles.glassButton}>
              <CloseIcon size={15} />
            </span>
          </div>

          <Packshot
            product={product}
            height={`calc(170 * ${PT})`}
            washVerdict={verdict.verdict}
            unit={PT}
            className={styles.hero}
            priority
          />
          <div className={styles.identity}>
            <ProductEyebrow product={product} className={styles.eyebrow} />
            <p className={styles.productName}>{product.name}</p>
          </div>

          <div className={styles.scoreBlock}>
            <div className={styles.scoreLine}>
              <ScoreNumeral score={score} size={88} unit={PT} />
              <VerdictReadout score={score} unit={PT} className={styles.verdict} />
            </div>
            <ScoreRuler score={score} unit={PT} animated className={styles.ruler} />
          </div>

          <KeyFactsStrip product={product} unit={PT} className={styles.factsStrip} />
          {capNote && (
            <p className={styles.capNote}>
              <strong>{capNote.label}:</strong> {capNote.reason}
            </p>
          )}

          <section className={styles.section}>
            <p className={styles.sectionTitle}>
              What’s inside <small>{product.findings.length} flagged</small>
            </p>
            {product.findings.map((finding) => (
              <div key={finding.name} className={styles.findingRow}>
                <TierShape tier={finding.tier} size={12} />
                <span className={styles.findingText}>
                  <span className={styles.findingName}>{finding.name}</span>
                  <span className={styles.findingMeta}>
                    {finding.code ? `${finding.code} · ${finding.detail}` : finding.detail}
                  </span>
                </span>
                <span className={styles.findingLevel} style={{ color: tierInfo(finding.tier).colorVar }}>
                  {tierInfo(finding.tier).chipLabel}
                  <ChevronRightIcon className={styles.chevron} />
                </span>
              </div>
            ))}
          </section>

          <section className={styles.section}>
            <p className={styles.sectionTitle}>
              Nutrition <small>per 100 {unit}</small>
            </p>
            <p className={styles.sectionNote}>
              Against the UK front-of-pack thresholds for {product.facts.isDrink ? "drinks" : "food"}.
            </p>
            {nutrientBars(product).map((bar) => (
              <NutrientRow key={bar.label} bar={bar} />
            ))}
          </section>

          <div className={styles.fade} />
          <div className={styles.askBar}>
            Ask about this product
            <span className={styles.askButton}>
              <ArrowRightIcon size={15} className="-rotate-90" />
            </span>
          </div>
          <div className={styles.homeIndicator} />
        </div>
      </div>
    </figure>
  );
}
