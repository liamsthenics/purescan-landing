import type { ExampleProduct } from "@/lib/examples";
import { keyFacts } from "@/lib/result-copy";
import styles from "./Score.module.css";
import { unitStyle } from "./unit";

/** "3 of moderate concern | 10.6g sugars per 100 ml | NOVA 4 ultra-processed", between hairlines. */
export function KeyFactsStrip({ product, unit, className }: { product: ExampleProduct; unit?: string; className?: string }) {
  return (
    <div className={`${styles.facts} ${className ?? ""}`} style={unitStyle(unit)}>
      {keyFacts(product).map((fact) => (
        <div key={fact.label} className={styles.fact}>
          <span className={styles.factValue}>{fact.value}</span>
          {fact.label}
        </div>
      ))}
    </div>
  );
}
