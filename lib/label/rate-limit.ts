// Fixed-window limits for label photo-fill (docs/label-api.md, "Limits"), on the
// same RateLimitStore as Ask PureScan. Keys hold only keyed hashes and expire
// with their window.
import {
  SECONDS_PER_DAY,
  SECONDS_PER_HOUR,
  utcDay,
  type ClientDecision,
  type RateLimitStore,
} from "../chat/rate-limit.ts";
import { LABEL_KEY_PREFIX, RATE_LIMITS } from "./config.ts";

export type ReadDecision =
  | { outcome: "allowed" }
  | { outcome: "rate_limited"; retryAfterSeconds: number }
  | { outcome: "capacity_reached" };

/** What the label and attestation handlers need from the rate limiter. Pass hashes, never raw identifiers. */
export interface LabelRateLimits {
  checkLookupClient(ipHash: string): Promise<ClientDecision>;
  checkReadClient(ipHash: string): Promise<ClientDecision>;
  checkChallengeClient(ipHash: string): Promise<ClientDecision>;
  checkRegistrationClient(ipHash: string): Promise<ClientDecision>;
  /** The per-device daily limit, then the global daily cap. */
  checkDeviceRead(deviceHash: string): Promise<ReadDecision>;
  /** Gives back an allowed read the AI couldn't complete. */
  refundDeviceRead(deviceHash: string): Promise<void>;
}

export interface LabelRateLimiterOptions {
  store: RateLimitStore;
  globalDailyLimit: number;
  now?: () => number;
}

export class LabelRateLimiter implements LabelRateLimits {
  private readonly store: RateLimitStore;
  private readonly globalDailyLimit: number;
  private readonly now: () => number;

  constructor(options: LabelRateLimiterOptions) {
    this.store = options.store;
    this.globalDailyLimit = options.globalDailyLimit;
    this.now = options.now ?? Date.now;
  }

  checkLookupClient(ipHash: string): Promise<ClientDecision> {
    return this.checkHourly(`ip:lookup:${ipHash}`, RATE_LIMITS.lookupsPerIpPerHour);
  }

  checkReadClient(ipHash: string): Promise<ClientDecision> {
    return this.checkHourly(`ip:read:${ipHash}`, RATE_LIMITS.readsPerIpPerHour);
  }

  checkChallengeClient(ipHash: string): Promise<ClientDecision> {
    return this.checkHourly(`ip:challenge:${ipHash}`, RATE_LIMITS.challengesPerIpPerHour);
  }

  checkRegistrationClient(ipHash: string): Promise<ClientDecision> {
    return this.checkHourly(`ip:register:${ipHash}`, RATE_LIMITS.registrationsPerIpPerHour);
  }

  async checkDeviceRead(deviceHash: string): Promise<ReadDecision> {
    const deviceKey = this.deviceKey(deviceHash);
    const day = await this.store.increment(deviceKey, SECONDS_PER_DAY);
    if (day.count > RATE_LIMITS.readsPerDevicePerDay) {
      return { outcome: "rate_limited", retryAfterSeconds: day.resetInSeconds };
    }
    const global = await this.store.increment(this.globalKey(), SECONDS_PER_DAY);
    if (global.count > this.globalDailyLimit) {
      // Nobody is being served, so this doesn't count against the device's day.
      await this.store.decrement(deviceKey);
      return { outcome: "capacity_reached" };
    }
    return { outcome: "allowed" };
  }

  async refundDeviceRead(deviceHash: string): Promise<void> {
    await Promise.all([this.store.decrement(this.deviceKey(deviceHash)), this.store.decrement(this.globalKey())]);
  }

  private async checkHourly(scope: string, limit: number): Promise<ClientDecision> {
    const hour = await this.store.increment(`${LABEL_KEY_PREFIX}:${scope}:hour`, SECONDS_PER_HOUR);
    return hour.count > limit ? { isAllowed: false, retryAfterSeconds: hour.resetInSeconds } : { isAllowed: true };
  }

  private deviceKey(deviceHash: string): string {
    return `${LABEL_KEY_PREFIX}:device:day:${deviceHash}`;
  }

  /** Keyed by UTC date, so the cap lifts for everyone at midnight UTC. */
  private globalKey(): string {
    return `${LABEL_KEY_PREFIX}:global:${utcDay(this.now())}`;
  }
}
