// Cleans text from the client before validation: control characters and
// invisible formatting characters (which can hide text from a reader) are removed.

/** C0 and C1 control characters, except tab, line feed and carriage return. */
const CONTROL_CHARACTERS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g;
/** Zero-width space, direction marks and bidirectional overrides, word joiners and the byte-order mark. */
const INVISIBLE_FORMATTING = /[​‎‏‪-‮⁠-⁤⁦-⁩﻿]/g;
const WINDOWS_OR_OLD_MAC_NEWLINE = /\r\n?/g;
const THREE_OR_MORE_NEWLINES = /\n{3,}/g;
const ANY_WHITESPACE_RUN = /\s+/g;

export function sanitiseMultilineText(text: string): string {
  return text
    .replace(WINDOWS_OR_OLD_MAC_NEWLINE, "\n")
    .replace(CONTROL_CHARACTERS, "")
    .replace(INVISIBLE_FORMATTING, "")
    .replace(THREE_OR_MORE_NEWLINES, "\n\n")
    .trim();
}

export function sanitiseSingleLineText(text: string): string {
  return sanitiseMultilineText(text).replace(ANY_WHITESPACE_RUN, " ");
}

/** Length in Unicode code points, so an emoji counts once rather than twice. */
export function characterCount(text: string): number {
  return Array.from(text).length;
}
