// Display helpers for additive data from the app's knowledge base.

const MAX_SLUG_NAME_LENGTH = 60;
const CODE_PREFIX_PATTERN = /^(E[\dx]+[a-z]*)\s+-\s+(.+)$/i;
const BARE_CODE_PATTERN = /^E\d+[a-z]*$/i;
const PLACEHOLDER_NAME_PATTERN = /food additive$/i;
const LOW_NINE_QUOTE = /\u201A/g;
const KNOWN_SOURCE_TAG = /^([A-Z]{2,}(?:\/[A-Z]{2,})?)\b/;
const YEAR_PATTERN = /\b(19|20)\d{2}\b/;

export interface AdditiveIdentity {
  code: string;
  name: string;
}

function normaliseCode(code: string): string {
  return `E${code.slice(1).toLowerCase()}`;
}

function capitaliseFirst(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * The E-number and name to show for a knowledge-base entry, or null for
 * placeholder entries (e.g. "Exxx - Exxx food additive") that shouldn't get a page.
 *
 * Sub-variants store the parent code with the specific one in the name
 * ("E101" + "E101i - Riboflavin"), so the specific code wins when it extends
 * the parent. Otherwise the code field is trusted.
 */
export function additiveIdentity(code: string, rawName: string): AdditiveIdentity | null {
  const name = rawName.replace(LOW_NINE_QUOTE, ",").trim();
  const prefixed = CODE_PREFIX_PATTERN.exec(name);
  if (prefixed) {
    const [, prefixCode, rest] = prefixed;
    if (/x/i.test(prefixCode.slice(1)) || PLACEHOLDER_NAME_PATTERN.test(rest)) return null;
    const variant = normaliseCode(prefixCode);
    const isVariantOfCode = variant.toLowerCase().startsWith(code.toLowerCase());
    return { code: isVariantOfCode ? variant : normaliseCode(code), name: capitaliseFirst(rest.trim()) };
  }
  if (BARE_CODE_PATTERN.test(name) || PLACEHOLDER_NAME_PATTERN.test(name)) return null;
  return { code: normaliseCode(code), name: capitaliseFirst(name) };
}

function slugifyText(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function truncateAtHyphen(slug: string, maxLength: number): string {
  if (slug.length <= maxLength) return slug;
  const cut = slug.slice(0, maxLength);
  const lastHyphen = cut.lastIndexOf("-");
  return lastHyphen > 0 ? cut.slice(0, lastHyphen) : cut;
}

/** "E211" + "Sodium benzoate" → "e211-sodium-benzoate" (pass the resolved identity). */
export function additiveSlug(code: string, name: string): string {
  const namePart = truncateAtHyphen(slugifyText(name), MAX_SLUG_NAME_LENGTH);
  const codePart = slugifyText(code);
  return namePart ? `${codePart}-${namePart}` : codePart;
}

/** Short mono tag for a source, e.g. "EFSA", "WHO/IARC", or "Study" for papers. */
export function sourceTag(title: string): string {
  const match = KNOWN_SOURCE_TAG.exec(title);
  return match ? match[1] : "Study";
}

export function sourceYear(title: string): string | null {
  const match = YEAR_PATTERN.exec(title);
  return match ? match[0] : null;
}

/** "EFSA: benzoates re-evaluation (2016)" → "Benzoates re-evaluation (2016)" when the tag already says EFSA. */
export function sourceDescription(title: string): string {
  const tag = sourceTag(title);
  if (tag === "Study") return title;
  const withoutTag = title.slice(tag.length).replace(/^[\s:]+/, "");
  return withoutTag ? withoutTag.charAt(0).toUpperCase() + withoutTag.slice(1) : title;
}

/** Old dx.doi.org and http links become https://doi.org links. */
export function secureUrl(url: string): string {
  return url.replace(/^https?:\/\/dx\.doi\.org\//, "https://doi.org/").replace(/^http:\/\//, "https://");
}

/** Natural order for E-numbers: E100 < E101 < E101a < E150d < E1000. */
export function compareENumbers(first: string, second: string): number {
  const parse = (code: string) => {
    const match = /^E(\d+)(.*)$/i.exec(code);
    return match ? { number: Number(match[1]), suffix: match[2].toLowerCase() } : { number: Infinity, suffix: code };
  };
  const a = parse(first);
  const b = parse(second);
  if (a.number !== b.number) return a.number - b.number;
  return a.suffix.localeCompare(b.suffix);
}
