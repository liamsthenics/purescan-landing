// Verdict bands for the 0–100 score, matching the app.

export type Verdict = "great" | "okay" | "poor" | "bad";

export interface VerdictInfo {
  verdict: Verdict;
  /** Word shown under the gauge, e.g. "Poor". */
  title: string;
  /** Fixed headline shown on the result screen: a rating of the product, not advice. */
  headline: string;
  minScore: number;
  maxScore: number;
}

export const VERDICTS: readonly VerdictInfo[] = [
  { verdict: "great", title: "Great", headline: "Scores highly", minScore: 75, maxScore: 100 },
  { verdict: "okay", title: "Okay", headline: "A mixed picture", minScore: 50, maxScore: 74 },
  { verdict: "poor", title: "Poor", headline: "Scores low", minScore: 25, maxScore: 49 },
  { verdict: "bad", title: "Bad", headline: "Scores very low", minScore: 0, maxScore: 24 },
];

/** Verdicts in scale order, 0 to 100 (bad, poor, okay, great). */
export const VERDICTS_ON_SCALE: readonly VerdictInfo[] = [...VERDICTS].reverse();

export function verdictFor(score: number): VerdictInfo {
  const clamped = Math.min(100, Math.max(0, Math.round(score)));
  const match = VERDICTS.find((info) => clamped >= info.minScore);
  // VERDICTS ends at minScore 0, so a clamped score always matches.
  return match ?? VERDICTS[VERDICTS.length - 1];
}

/** "25–49 on the PureScan scale" */
export function verdictRangeText(info: VerdictInfo): string {
  return `${info.minScore}–${info.maxScore} on the PureScan scale`;
}

/** CSS custom property holding the verdict's colour. */
export function verdictColorVar(verdict: Verdict): string {
  return `var(--${verdict})`;
}
