import Image from "next/image";
import type { ExampleProduct } from "@/lib/examples";
import { verdictColorVar, type Verdict } from "@/lib/verdict";
import { ProductArt } from "../ProductArt";
import styles from "./Score.module.css";
import { unitStyle } from "./unit";

interface PackshotProps {
  product: ExampleProduct;
  /** Height of the product image, as a CSS length. */
  height: string;
  /** Adds the faint radial wash in this verdict's colour. */
  washVerdict?: Verdict;
  unit?: string;
  className?: string;
  priority?: boolean;
}

/** The product floating on paper, as on the app's result screen. */
export function Packshot({ product, height, washVerdict, unit, className, priority = false }: PackshotProps) {
  const washStyle = washVerdict ? { "--wash": verdictColorVar(washVerdict) } : {};
  return (
    <div className={`${styles.packshot} ${className ?? ""}`} style={unitStyle(unit, { height, ...washStyle })}>
      {washVerdict && <div className={styles.wash} aria-hidden="true" />}
      <div className={styles.plinth} aria-hidden="true" />
      {product.packshot ? (
        <Image
          src={product.packshot.src}
          width={product.packshot.width}
          height={product.packshot.height}
          alt=""
          priority={priority}
          className={styles.packshotImage}
        />
      ) : (
        <ProductArt art={product.art} className={styles.packshotImage} />
      )}
    </div>
  );
}
