// Phrases that break docs/voice.md ("inform, never advise"; no fear, no hype).
// tests/voice.test.ts fails if any appears in the site's content sources.

/** Lower case; matched case-insensitively. */
export const BANNED_ADVISORY_PHRASES: readonly string[] = [
  "best avoided",
  "best kept occasional",
  "fine now and then",
  "a great choice",
  "avoid list",
  "avoid-list",
  "healthier swap",
  "healthier choice",
  "better choice",
  "we suggest",
  "suggest limiting",
  "suggest avoiding",
  "held down",
  "rated avoid",
  "rated limit",
  "rated minor",
  "cut down",
  "swap to",
  "be careful",
];

/** Scare words, matched as whole words. */
export const BANNED_SCARE_WORDS: readonly string[] = ["toxic", "poison", "poisonous", "junk", "shocking"];
