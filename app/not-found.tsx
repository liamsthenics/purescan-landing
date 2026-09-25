import Link from "next/link";
import { ScoreGauge } from "@/components/ScoreGauge";

export default function NotFound() {
  return (
    <div className="container-page flex flex-col items-center py-24 text-center md:py-32">
      <ScoreGauge score={null} size="card" animated={false} />
      <h1 className="type-headline mt-8">We don’t know this page.</h1>
      <p className="type-lede mt-5 max-w-md">It may have moved. Try the additive index, or head back home.</p>
      <div className="mt-9 flex flex-wrap justify-center gap-3">
        <Link href="/" className="button-primary">
          Home
        </Link>
        <Link href="/additives" className="button-secondary">
          Additive index
        </Link>
      </div>
    </div>
  );
}
