import { FIZZBROOK_COLA } from "@/lib/examples";
import { SOFT_CAP_FLOOR, WEIGHTS, scoreProduct, softCap } from "@/lib/scoring";
import { verdictFor } from "@/lib/verdict";
import { ScoreGauge } from "../ScoreGauge";

function formatOneDecimal(value: number): string {
  return (Math.round(value * 10) / 10).toFixed(1);
}

/** The Fizzbrook example worked through step by step, computed from the method itself. */
export function WorkedExample() {
  const product = FIZZBROOK_COLA;
  const result = scoreProduct(product.facts);
  const cap = result.cap;
  const nutrition = result.nutrition ?? 0;
  const processing = result.processing ?? 0;

  const steps = [
    {
      label: "Additives & ingredients",
      detail: `Three rated Limit: 100 − 3 × 20`,
      value: String(result.ingredients),
    },
    { label: "Nutrition", detail: "Sugars High for a drink: 100 − 60", value: String(nutrition) },
    { label: "Processing", detail: "Ultra-processed (NOVA 4)", value: String(processing) },
    {
      label: "Weighted average",
      detail: `${WEIGHTS.ingredients} × ${result.ingredients} + ${WEIGHTS.nutrition} × ${nutrition} + ${WEIGHTS.processing} × ${processing}`,
      value: formatOneDecimal(result.average),
    },
  ];

  return (
    <div className="card p-6 md:p-8">
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="section-label">Worked example</p>
          <p className="type-card-title mt-2 text-[22px] text-ink">{product.name}</p>
          <p className="mt-1 text-[14px] text-secondary">A fictional cola, per 100 ml: 10.6 g sugars.</p>
        </div>
        <ScoreGauge score={result.score} size="compact" animated={false} />
      </div>
      <dl className="mt-6 divide-y divide-separator border-y border-separator text-[15px]">
        {steps.map((step) => (
          <div key={step.label} className="flex items-baseline justify-between gap-4 py-3">
            <dt>
              <span className="block font-medium text-ink">{step.label}</span>
              <span className="block text-[13px] text-secondary">{step.detail}</span>
            </dt>
            <dd className="text-[17px] font-semibold tabular-nums text-ink">{step.value}</dd>
          </div>
        ))}
        {cap && (
          <div className="flex items-baseline justify-between gap-4 py-3">
            <dt>
              <span className="block font-medium text-ink">Soft cap: {cap.condition.charAt(0).toLowerCase() + cap.condition.slice(1)} (max {cap.max})</span>
              <span className="block text-[13px] text-secondary">
                {cap.max} × ({SOFT_CAP_FLOOR} + {1 - SOFT_CAP_FLOOR} × {formatOneDecimal(result.average)} ÷ 100)
              </span>
            </dt>
            <dd className="text-[17px] font-semibold tabular-nums text-ink">
              {formatOneDecimal(softCap(cap.max, result.average))}
            </dd>
          </div>
        )}
      </dl>
      <p className="mt-4 text-[15px] text-ink">
        Score <strong className="font-semibold tabular-nums">{result.score}</strong>, {verdictFor(result.score).title}:
        “{verdictFor(result.score).headline}”.
        {cap && <span className="text-secondary"> Held down: {cap.heldDown}.</span>}
      </p>
    </div>
  );
}
