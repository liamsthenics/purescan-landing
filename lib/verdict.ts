// Verdict bands for the 0–100 score, matching the app.

export type Verdict = "great" | "okay" | "poor" | "bad";

export interface VerdictInfo {
  verdict: Verdict;
  /** Word shown under the gauge, e.g. "Poor". */
  title: string;
  /** Fixed headline shown on the result screen. */
  headline: string;
  minScore: number;
  maxScore: number;
}

export const VERDICTS: readonly VerdictInfo[] = [
  { verdict: "great", title: "Great", headline: "A great choice", minScore: 75, maxScore: 100 },
  { verdict: "okay", title: "Okay", headline: "Fine now and then", minScore: 50, maxScore: 74 },
  { verdict: "poor", title: "Poor", headline: "Best kept occasional", minScore: 25, maxScore: 49 },
  { verdict: "bad", title: "Bad", headline: "Best avoided", minScore: 0, maxScore: 24 },
];

export function verdictFor(score: number): VerdictInfo {
  const clamped = Math.min(100, Math.max(0, Math.round(score)));
  const match = VERDICTS.find((info) => clamped >= info.minScore);
  // VERDICTS ends at minScore 0, so a clamped score always matches.
  return match ?? VERDICTS[VERDICTS.length - 1];
}

/** CSS custom property holding the verdict's colour. */
export function verdictColorVar(verdict: Verdict): string {
  return `var(--${verdict})`;
}
