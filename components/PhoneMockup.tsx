import type { CSSProperties } from "react";
import type { ExampleProduct } from "@/lib/examples";
import { capNoteParts, formatGrams, nutrientReadings, whyLine, whyLineFacts } from "@/lib/result-copy";
import { scoreProduct } from "@/lib/scoring";
import { tierInfo } from "@/lib/tiers";
import { verdictFor } from "@/lib/verdict";
import { ChevronLeftIcon, ChevronRightIcon, ShareIcon } from "./icons";
import styles from "./PhoneMockup.module.css";
import { ProductArt } from "./ProductArt";
import { ScoreGauge } from "./ScoreGauge";
import { TierShape } from "./TierShape";
import { TrafficChip } from "./TrafficChip";

interface PhoneMockupProps {
  product: ExampleProduct;
  /** CSS width of the phone, e.g. "clamp(260px, 76vw, 330px)". */
  width?: string;
  className?: string;
}

const PT = "var(--pt)";

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

/** The app's result screen for an example product, drawn in HTML/CSS. */
export function PhoneMockup({ product, width, className }: PhoneMockupProps) {
  const { score } = scoreProduct(product.facts);
  const verdict = verdictFor(score);
  const capNote = capNoteParts(product);
  const readings = nutrientReadings(product);
  const description = `The PureScan result screen for ${product.name}, a fictional product: score ${score} out of 100, ${verdict.title}. ${whyLine(product)}.`;

  return (
    <figure className={className} aria-label={description} role="img">
      <div className={styles.phone} style={width ? ({ "--phone-width": width } as CSSProperties) : undefined}>
        <div className={styles.screen} aria-hidden="true">
          <div className={styles.island} />
          <div className={styles.statusBar}>
            <span>9:41</span>
            <StatusIcons />
          </div>
          <div className={styles.navRow}>
            <span className={styles.glassButton}>
              <ChevronLeftIcon size={18} />
            </span>
            <span className={styles.glassButton}>
              <ShareIcon size={17} />
            </span>
          </div>

          <div className={styles.content}>
            <div className={styles.header}>
              <span className={styles.productTile}>
                <ProductArt art={product.art} />
              </span>
              <div>
                <p className={styles.productName}>{product.name}</p>
                <p className={styles.productMeta}>
                  {product.brand} · {product.quantity}
                </p>
              </div>
            </div>

            <div className={styles.verdictBlock}>
              <ScoreGauge score={score} size="hero" width={`calc(132 * ${PT})`} />
              <p className={styles.verdictHeadline}>{verdict.headline}</p>
              <p className={styles.whyLine}>
                {whyLineFacts(product).map((fact, index) => (
                  <span key={fact} className={styles.whyFact}>
                    {index > 0 && " · "}
                    {fact}
                  </span>
                ))}
              </p>
              {capNote && (
                <p className={styles.capNote}>
                  <strong>{capNote.label}:</strong> {capNote.reason}
                </p>
              )}
            </div>

            <p className={styles.sectionLabel}>
              <span>What’s inside</span>
              <span className={styles.sectionTrailing}>{product.findings.length} flagged</span>
            </p>
            <div className={styles.card}>
              {product.findings.map((finding) => (
                <div key={finding.name} className={styles.row}>
                  <span className={styles.rowShape}>
                    <TierShape tier={finding.tier} size={12} />
                  </span>
                  <span className={styles.rowText}>
                    <span className={styles.rowTitle} style={{ display: "block" }}>
                      {finding.name}
                    </span>
                    <span className={styles.rowSubtitle} style={{ display: "block" }}>
                      {finding.code && <span className={styles.mono}>{finding.code} · </span>}
                      {finding.detail}
                    </span>
                  </span>
                  <span className={styles.rowTrailing}>
                    {tierInfo(finding.tier).chipLabel}
                    <ChevronRightIcon className={styles.chevron} />
                  </span>
                </div>
              ))}
            </div>

            <p className={styles.sectionLabel}>
              <span>Nutrition · per 100 {product.facts.isDrink ? "ml" : "g"}</span>
            </p>
            <div className={styles.tiles}>
              {readings.map((reading) => (
                <div key={reading.label} className={styles.tile}>
                  <p className={styles.tileLabel}>{reading.label}</p>
                  <p className={styles.tileValue}>
                    {formatGrams(reading.amount)}
                    <TrafficChip band={reading.band} scale={PT} />
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.fade} />
          <div className={styles.homeIndicator} />
        </div>
      </div>
    </figure>
  );
}
