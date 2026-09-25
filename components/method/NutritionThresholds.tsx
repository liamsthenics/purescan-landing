import { NUTRIENTS, NUTRIENT_BANDS, NUTRIENT_PENALTIES } from "@/lib/scoring";

interface NutritionThresholdsProps {
  kind: "food" | "drink";
}

function formatAmount(value: number): string {
  return `${value} g`;
}

/** Traffic-light thresholds and points removed, for food (per 100 g) or drinks (per 100 ml). */
export function NutritionThresholds({ kind }: NutritionThresholdsProps) {
  const unit = kind === "food" ? "100 g" : "100 ml";
  return (
    <div className="card overflow-x-auto">
      <table className="w-full min-w-[480px] text-left text-[15px]">
        <caption className="px-5 pt-5 text-left text-[15px] font-semibold text-ink">
          {kind === "food" ? "Food" : "Drinks"}, per {unit}
        </caption>
        <thead>
          <tr className="text-[13px] text-secondary">
            <th scope="col" className="px-5 py-3 font-medium">
              Nutrient
            </th>
            <th scope="col" className="px-3 py-3 font-medium">
              Low up to
            </th>
            <th scope="col" className="px-3 py-3 font-medium">
              High above
            </th>
            <th scope="col" className="px-3 py-3 font-medium">
              Med removes
            </th>
            <th scope="col" className="px-5 py-3 font-medium">
              High removes
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-separator border-t border-separator text-ink">
          {NUTRIENTS.map(({ nutrient, label }) => {
            const bands = NUTRIENT_BANDS[kind][nutrient];
            const penalties = NUTRIENT_PENALTIES[kind][nutrient];
            return (
              <tr key={nutrient}>
                <th scope="row" className="px-5 py-3 font-medium">
                  {label}
                </th>
                <td className="px-3 py-3 tabular-nums">{formatAmount(bands.lowMax)}</td>
                <td className="px-3 py-3 tabular-nums">{formatAmount(bands.highMin)}</td>
                <td className="px-3 py-3 tabular-nums">−{penalties.medium}</td>
                <td className="px-5 py-3 tabular-nums">−{penalties.high}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
