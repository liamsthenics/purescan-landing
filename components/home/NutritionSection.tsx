import { FIZZBROOK_COLA } from "@/lib/examples";
import { formatGrams, nutrientReadings } from "@/lib/result-copy";
import { NUTRIENT_BANDS } from "@/lib/scoring";
import { SectionIntro } from "../SectionIntro";
import { TrafficChip } from "../TrafficChip";

export function NutritionSection() {
  const readings = nutrientReadings(FIZZBROOK_COLA);
  const drinkSugarHigh = NUTRIENT_BANDS.drink.sugars.highMin;

  return (
    <section aria-labelledby="nutrition-heading" className="border-t border-separator py-20 md:py-28">
      <div className="container-page grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
        <div className="lg:order-2">
          <SectionIntro label="Nutrition" title="UK traffic lights, always labelled." headingId="nutrition-heading">
            <p>
              Sugar, salt, saturated fat and fat are graded with the UK government’s front-of-pack
              traffic-light thresholds: per 100 g for food and per 100 ml for drinks.
            </p>
            <p>
              Every light says Low, Med or High in words, so colour is never the only signal. For drinks, sugar
              counts as High above {drinkSugarHigh} g per 100 ml, the higher band of the UK soft drinks levy.
            </p>
          </SectionIntro>
        </div>
        <div className="lg:order-1">
          <div className="card p-6 md:p-8">
            <div className="flex items-baseline justify-between gap-4">
              <p className="section-label">Nutrition · per 100 ml</p>
              <p className="text-[13px] text-secondary">{FIZZBROOK_COLA.name}</p>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {readings.map((reading) => (
                <div key={reading.label} className="rounded-2xl bg-paper p-4 hairline-ring">
                  <p className="text-[14px] text-secondary">{reading.label}</p>
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[24px] font-semibold tabular-nums tracking-tight">
                      {formatGrams(reading.amount)}
                    </span>
                    <TrafficChip band={reading.band} />
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-5 text-[13px] leading-relaxed text-secondary">
              UK front-of-pack thresholds for drinks. Fictional example product.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
