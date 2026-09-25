// Plain-English copy about how a rating affects the PureScan score.
import { INGREDIENT_PENALTIES, capRule } from "./scoring.ts";
import type { Tier } from "./tiers.ts";

export function scoreEffect(tier: Tier): string {
  const penalty = INGREDIENT_PENALTIES[tier];
  switch (tier) {
    case "high":
      return `An ingredient rated Avoid removes ${penalty} points from the additives and ingredients part of the score, and holds a product’s whole score to ${capRule("avoidIngredient").max} or below.`;
    case "moderate":
      return `An ingredient rated Limit removes ${penalty} points from the additives and ingredients part of the score. One Limit ingredient caps a score at ${capRule("limitIngredient").max}, two at ${capRule("twoLimitIngredients").max}, and three or more at ${capRule("severalLimitIngredients").max}.`;
    case "low":
      return `An ingredient rated Minor removes ${penalty} points from the additives and ingredients part of the score. Minor ratings never cap a score.`;
    case "none":
      return "With no known concerns, it doesn’t lower a product’s score.";
  }
}

/** "Antioxidant, sequestrant" from ["Antioxidant", "Sequestrant"]. */
export function formatFunctions(functions: readonly string[]): string {
  return functions.map((fn, index) => (index === 0 ? fn : fn.toLowerCase())).join(", ");
}
