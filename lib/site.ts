// Site-wide constants. Change launch state and prices here only.

/** Flip to true once PureScan is live on the App Store. */
export const APP_STORE_LIVE = false;
export const APP_STORE_ID = "6757192930";
export const APP_STORE_URL = `https://apps.apple.com/gb/app/id${APP_STORE_ID}`;

export const SITE_URL = "https://purescan.io";
export const SITE_NAME = "PureScan";
export const SITE_TAGLINE = "Know what's really in your food.";
export const SITE_DESCRIPTION =
  "PureScan is a UK food scanner for iPhone. Scan a barcode for one honest 0–100 score, every additive rated with sources, UK traffic-light nutrition and healthier swaps.";

export const CONTACT_EMAIL = "hello@purescan.io";
export const PRIVACY_EMAIL = "privacy@purescan.io";

/** App Store prices in pence (GBP). The App Store is the source of truth. */
export const PREMIUM_MONTHLY_PENCE = 399;
export const PREMIUM_YEARLY_PENCE = 2799;
const MONTHS_PER_YEAR = 12;

export function formatPounds(pence: number): string {
  return `£${(pence / 100).toFixed(2)}`;
}

export const PRICES = {
  monthly: formatPounds(PREMIUM_MONTHLY_PENCE),
  yearly: formatPounds(PREMIUM_YEARLY_PENCE),
  yearlyPerMonth: formatPounds(Math.round(PREMIUM_YEARLY_PENCE / MONTHS_PER_YEAR)),
} as const;

export const FREE_HISTORY_LIMIT = 30;

export const OPEN_FOOD_FACTS_URL = "https://world.openfoodfacts.org";
export const ODBL_URL = "https://opendatacommons.org/licenses/odbl/1-0/";
