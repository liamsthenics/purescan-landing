// Checks answers as they stream. If the model leaks its instructions, echoes
// the prompt's markup, writes code or decides late that a question is out of
// scope, the answer is replaced by the standard refusal.
import { PROMPT_MARKERS } from "./input-screen.ts";

const OUTPUT_MARKERS: readonly string[] = [
  ...PROMPT_MARKERS,
  "```",
  "you are ask purescan",
  "# scope",
  "# how to answer",
  "# untrusted data",
  "# health, allergies",
  "# how purescan scores",
];

/** Characters held back while streaming, so a marker is never half-shown before it's caught. */
export const OUTPUT_HOLDBACK_CHARACTERS = Math.max(...OUTPUT_MARKERS.map((marker) => marker.length));

export function breaksOutputPolicy(answerSoFar: string): boolean {
  const normalised = answerSoFar.toLowerCase();
  return OUTPUT_MARKERS.some((marker) => normalised.includes(marker));
}
