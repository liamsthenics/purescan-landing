// Fictional example products used across the site, matching the app's demo
// products (DemoProducts.swift) and their packshots in public/products.
// Invented names only: never show a real brand negatively. Scores come from
// scoreProduct, so the examples always follow the published method.
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

/** A transparent product image in public/products, with its pixel size. */
export interface Packshot {
  src: string;
  width: number;
  height: number;
}

export interface ExampleProduct {
  name: string;
  brand: string;
  quantity: string;
  /** Drawn illustration, used where there is no packshot. */
  art: { kind: "can" | "bottle"; body: string; band: string };
  packshot?: Packshot;
  facts: ProductFacts;
  findings: ExampleFinding[];
  ingredientsText: string;
}

const CAN_PACKSHOT_SIZE = { width: 232, height: 482 } as const;

export const FIZZBROOK_COLA: ExampleProduct = {
  name: "Original Cola",
  brand: "Fizzbrook",
  quantity: "330 ml",
  art: { kind: "can", body: "#A8231D", band: "#231A18" },
  packshot: { src: "/products/fizzbrook-cola.png", ...CAN_PACKSHOT_SIZE },
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

export const WILD_SPRING_LEMON_LIME: ExampleProduct = {
  name: "Sparkling Lemon & Lime",
  brand: "Wild Spring",
  quantity: "330 ml",
  art: { kind: "can", body: "#CFE3DA", band: "#2F6B5E" },
  packshot: { src: "/products/wild-spring-lemon-lime.png", ...CAN_PACKSHOT_SIZE },
  facts: {
    findings: [],
    nutrition: { fat: 0, saturatedFat: 0, sugars: 0.6, salt: 0.01 },
    isDrink: true,
    nova: 3,
  },
  findings: [],
  ingredientsText:
    "Sparkling spring water, lemon juice from concentrate (4%), lime juice from concentrate (1%), natural flavourings.",
};

export const ORCHARD_LANE_PRESSE: ExampleProduct = {
  name: "Apple Pressé",
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

/** "Fizzbrook Original Cola": brand and name, for sentences. */
export function fullProductName(product: ExampleProduct): string {
  return `${product.brand} ${product.name}`;
}

export function exampleScore(product: ExampleProduct): number {
  return scoreProduct(product.facts).score;
}
