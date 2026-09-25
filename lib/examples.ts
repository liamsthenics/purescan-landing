// Fictional example products used across the site. Invented names only:
// never show a real brand negatively. Scores come from scoreProduct, so the
// examples always follow the published method.
import { scoreProduct, type ProductFacts } from "./scoring.ts";
import type { Tier } from "./tiers.ts";

export interface ExampleFinding {
  name: string;
  /** E-number, when the finding is an additive. */
  code?: string;
  detail: string;
  tier: Tier;
  /** Additive page slug, when there is one. */
  slug?: string;
}

export interface ExampleProduct {
  name: string;
  brand: string;
  quantity: string;
  art: { kind: "can" | "bottle"; body: string; band: string };
  facts: ProductFacts;
  findings: ExampleFinding[];
  ingredientsText: string;
}

export const FIZZBROOK_COLA: ExampleProduct = {
  name: "Fizzbrook Original Cola",
  brand: "Fizzbrook",
  quantity: "330 ml",
  art: { kind: "can", body: "#5A3A2A", band: "#E9DCC6" },
  facts: {
    findings: ["moderate", "moderate", "moderate"],
    nutrition: { fat: 0, saturatedFat: 0, sugars: 10.6, salt: 0.01 },
    isDrink: true,
    nova: 4,
  },
  findings: [
    { name: "Sulphite ammonia caramel", code: "E150d", detail: "Colour", tier: "moderate", slug: "e150d-sulphite-ammonia-caramel" },
    { name: "Phosphoric acid", code: "E338", detail: "Antioxidant", tier: "moderate", slug: "e338-phosphoric-acid" },
    { name: "Glucose-fructose syrup", detail: "Added sugar", tier: "moderate" },
  ],
  ingredientsText:
    "Carbonated water, glucose-fructose syrup, sugar, colour (sulphite ammonia caramel), acid (phosphoric acid), natural flavourings including caffeine.",
};

export const CLEARWELL_LIME: ExampleProduct = {
  name: "Clearwell Sparkling Lime",
  brand: "Clearwell",
  quantity: "330 ml",
  art: { kind: "can", body: "#CFE3DA", band: "#2F6B5E" },
  facts: {
    findings: [],
    nutrition: { fat: 0, saturatedFat: 0, sugars: 0, salt: 0.01 },
    isDrink: true,
    nova: 3,
  },
  findings: [],
  ingredientsText: "Sparkling spring water, lime juice from concentrate (2%).",
};

export const ORCHARD_LANE_PRESSE: ExampleProduct = {
  name: "Orchard Lane Apple Pressé",
  brand: "Orchard Lane",
  quantity: "275 ml",
  art: { kind: "bottle", body: "#E8D9A8", band: "#7A6A2E" },
  facts: {
    findings: [],
    nutrition: { fat: 0, saturatedFat: 0, sugars: 5.0, salt: 0.01 },
    isDrink: true,
    nova: 3,
  },
  findings: [],
  ingredientsText: "Sparkling spring water, pressed apple juice (30%), elderflower infusion, lemon juice.",
};

export function exampleScore(product: ExampleProduct): number {
  return scoreProduct(product.facts).score;
}
