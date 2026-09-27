// App Attest settings. The team and bundle identifiers are public (they appear
// in every signed build), so they are constants rather than secrets.
import { APPLE_APP } from "../chat/config.ts";

export const APPLE_TEAM_ID = "X4TA4HKBM7";
export const APP_BUNDLE_ID = APPLE_APP.bundleId;

export const CHALLENGE_RANDOM_BYTES = 32;
export const CHALLENGE_TTL_SECONDS = 300;

const SECONDS_PER_DAY = 86_400;
const ATTESTED_KEY_RETENTION_DAYS = 365;
/**
 * A registered key is forgotten after a year without use; the app then gets
 * 401 attestation_required and attests a new key.
 */
export const ATTESTED_KEY_TTL_SECONDS = ATTESTED_KEY_RETENTION_DAYS * SECONDS_PER_DAY;

export const ATTEST_KEY_PREFIX = "purescan:attest:v1";
