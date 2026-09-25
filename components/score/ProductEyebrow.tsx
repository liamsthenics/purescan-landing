import type { ExampleProduct } from "@/lib/examples";
import styles from "./Score.module.css";

interface ProductEyebrowProps {
  product: ExampleProduct;
  /** Leave out the quantity where space is tight. */
  showsQuantity?: boolean;
  className?: string;
}

/** "FIZZBROOK · 330 ML" in uppercase mono. */
export function ProductEyebrow({ product, showsQuantity = true, className }: ProductEyebrowProps) {
  return (
    <span className={`${styles.eyebrow} ${className ?? ""}`}>
      {showsQuantity ? `${product.brand} · ${product.quantity}` : product.brand}
    </span>
  );
}
