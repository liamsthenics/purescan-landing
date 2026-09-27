// Shared helpers for reading server settings from environment variables.

export type Environment = Readonly<Record<string, string | undefined>>;

export interface UpstashCredentials {
  url: string;
  token: string;
}

const DISABLED_VALUES: ReadonlySet<string> = new Set(["false", "0", "off", "no"]);
const ENABLED_VALUES: ReadonlySet<string> = new Set(["true", "1", "on", "yes"]);

export function nonEmpty(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function positiveInteger(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

/** True only for an explicit "off" value (false, 0, off, no); unset means not switched off. */
export function isSwitchedOff(value: string | undefined): boolean {
  const normalised = nonEmpty(value)?.toLowerCase();
  return normalised !== undefined && DISABLED_VALUES.has(normalised);
}

/** True only for an explicit "on" value (true, 1, on, yes); unset means off. */
export function isSwitchedOn(value: string | undefined): boolean {
  const normalised = nonEmpty(value)?.toLowerCase();
  return normalised !== undefined && ENABLED_VALUES.has(normalised);
}

/** Upstash Redis (REST) credentials, or null unless both the URL and token are set. */
export function readUpstashCredentials(environment: Environment): UpstashCredentials | null {
  const url = nonEmpty(environment.UPSTASH_REDIS_REST_URL);
  const token = nonEmpty(environment.UPSTASH_REDIS_REST_TOKEN);
  return url && token ? { url, token } : null;
}
