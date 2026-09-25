// Plain-English copy about how a rating affects the PureScan score.
import { INGREDIENT_PENALTIES, capRule } from "./scoring.ts";
import type { Tier } from "./tiers.ts";

export function scoreEffect(tier: Tier): string {
  const penalty = INGREDIENT_PENALTIES[tier];
  switch (tier) {
    case "high":
      return `An ingredient of high concern removes ${penalty} points from the additives and ingredients part of the score, and caps a product’s whole score at ${capRule("highConcernIngredient").max}.`;
    case "moderate":
      return `An ingredient of moderate concern removes ${penalty} points from the additives and ingredients part of the score. One caps a score at ${capRule("moderateIngredient").max}, two at ${capRule("twoModerateIngredients").max}, and three or more at ${capRule("severalModerateIngredients").max}.`;
    case "low":
      return `An ingredient of low concern removes ${penalty} points from the additives and ingredients part of the score. Low concern ratings never cap a score.`;
    case "none":
      return "With no known concerns, it doesn’t lower a product’s score.";
  }
}

/** "Antioxidant, sequestrant" from ["Antioxidant", "Sequestrant"]. */
export function formatFunctions(functions: readonly string[]): string {
  return functions.map((fn, index) => (index === 0 ? fn : fn.toLowerCase())).join(", ");
}
