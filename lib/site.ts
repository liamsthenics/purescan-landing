// Site-wide constants. Change launch state and prices here only.

/** Flip to true once PureScan is live on the App Store. */
export const APP_STORE_LIVE = false;
export const APP_STORE_ID = "6757192930";
export const APP_STORE_URL = `https://apps.apple.com/gb/app/id${APP_STORE_ID}`;
/** Public TestFlight beta, shown in place of the App Store link until APP_STORE_LIVE is true. */
export const TESTFLIGHT_URL = "https://testflight.apple.com/join/bR8UXnCy";

// The apex (purescan.io) redirects to www; canonical URLs use www so they resolve without a redirect hop.
export const SITE_URL = "https://www.purescan.io";
export const SITE_NAME = "PureScan";
export const SITE_TAGLINE = "The honest truth about what's in your food.";
/** The second half of the positioning line in docs/voice.md. */
export const SITE_TAGLINE_FOLLOW_UP = "What you do with it is up to you.";
export const SITE_DESCRIPTION =
  "PureScan is a UK food scanner for iPhone: one honest 0–100 score, every additive with its evidence and sources, and UK traffic-light nutrition. What you do with it is up to you.";
export const SHARE_IMAGE_ALT = `PureScan: ${SITE_TAGLINE} ${SITE_TAGLINE_FOLLOW_UP}`;
/** The standard disclaimer from docs/voice.md. */
export const STANDARD_DISCLAIMER =
  "PureScan tells you what's in your food and what the evidence says. It isn't medical or dietary advice, and what you do with it is up to you.";

export const CONTACT_EMAIL = "hello@purescan.io";
export const PRIVACY_EMAIL = "privacy@purescan.io";

/** App Store prices in pence (GBP). The App Store is the source of truth. */
export const PREMIUM_MONTHLY_PENCE = 399;
export const PREMIUM_YEARLY_PENCE = 2799;
/** Length of the introductory offer for new subscribers. The App Store is the source of truth. */
export const FREE_TRIAL_DAYS = 3;
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
