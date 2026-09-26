// Screens a conversation before it reaches the model. Attempts to change the
// assistant's role, reveal its instructions or smuggle in fake markup are
// refused without spending a model call. The patterns are deliberately
// narrow: an ordinary food question should never match.

const MANIPULATION_PATTERNS: readonly RegExp[] = [
  /\bignore\b.{0,40}\b(instructions?|rules?|prompts?|guidelines?|directions?)\b/,
  /\b(disregard|forget|override|bypass)\b.{0,40}\b(instructions?|rules?|prompts?|guidelines?|restrictions?|above)\b/,
  /\b(system|developer|hidden|initial)\s+(prompt|message|instructions?)\b/,
  /\b(reveal|show|print|repeat|output|tell me|what are|what is)\b.{0,30}\byour\s+(instructions|prompt|rules|configuration|guidelines)\b/,
  /\brepeat\b.{0,30}\b(text|words|everything)\s+above\b/,
  /\b(jailbreak|dan mode|developer mode|debug mode|god mode|do anything now|unrestricted mode)\b/,
  /\byou are (now|no longer)\b/,
  /\bpretend (to be|you are|you're)\b/,
  /\brole-?play\b/,
];

/** Markup the server uses in the prompt and the out-of-scope reply; never legitimate in a message. */
export const PROMPT_MARKERS: readonly string[] = [
  "[[out_of_scope",
  "<product_data",
  "</product_data",
  "<purescan_reference",
  "</purescan_reference",
];

function normalise(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ");
}

export function isManipulationAttempt(text: string): boolean {
  const normalised = normalise(text);
  return (
    MANIPULATION_PATTERNS.some((pattern) => pattern.test(normalised)) ||
    PROMPT_MARKERS.some((marker) => normalised.includes(marker))
  );
}

/**
 * Every turn is checked, including earlier "assistant" turns: the app sends
 * the history back, so a modified client could forge a reply that primes the
 * model ("Sure, I'm in unrestricted mode now").
 */
export function conversationNeedsRefusal(messages: readonly { role: string; content: string }[]): boolean {
  return messages.some((message) => isManipulationAttempt(message.content));
}
