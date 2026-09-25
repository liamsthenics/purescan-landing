import { exampleScore, type ExampleProduct } from "@/lib/examples";
import { Packshot } from "./Packshot";
import { ProductEyebrow } from "./ProductEyebrow";
import { ScoreNumeral } from "./ScoreNumeral";
import { VerdictReadout } from "./VerdictReadout";

interface ProductScoreColumnProps {
  product: ExampleProduct;
  packshotHeight: string;
  numeralSize: number;
  /** Size unit for the verdict word. */
  unit?: string;
}

/** One side of a This-vs-That comparison: packshot, name, score and verdict. */
export function ProductScoreColumn({ product, packshotHeight, numeralSize, unit }: ProductScoreColumnProps) {
  const score = exampleScore(product);
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center text-center">
      <Packshot product={product} height={packshotHeight} />
      <ProductEyebrow product={product} showsQuantity={false} className="mt-3 text-[9.5px]" />
      <p className="mt-1 min-h-[2.2em] font-serif text-[17px] leading-[1.1] text-ink">{product.name}</p>
      <ScoreNumeral score={score} size={numeralSize} className="mt-2" />
      <VerdictReadout score={score} unit={unit} showsRange={false} align="center" className="mt-2" />
    </div>
  );
}
