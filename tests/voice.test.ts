import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { BANNED_ADVISORY_PHRASES, BANNED_SCARE_WORDS } from "../lib/voice.ts";

const PROJECT_ROOT = fileURLToPath(new URL("..", import.meta.url));
/** Everything the site renders comes from these folders. */
const CONTENT_DIRECTORIES = ["app", "components", "lib", "content"];
const CONTENT_EXTENSIONS = /\.(tsx?|md|json)$/;
/** The list of banned phrases has to contain them. */
const EXCLUDED_FILES = new Set(["lib/voice.ts"]);
/** The chat system prompt names the scare words the model must not use; it is never shown to people. */
const SCARE_WORD_EXEMPT_FILES = new Set(["lib/chat/system-prompt.ts"]);

function contentFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) return contentFiles(path);
    return CONTENT_EXTENSIONS.test(entry) ? [path] : [];
  });
}

function projectFiles(): { path: string; text: string }[] {
  return CONTENT_DIRECTORIES.flatMap((directory) => contentFiles(join(PROJECT_ROOT, directory)))
    .map((path) => ({ path: relative(PROJECT_ROOT, path), text: readFileSync(path, "utf8") }))
    .filter((file) => !EXCLUDED_FILES.has(file.path));
}

test("content sources contain no advisory phrases", () => {
  const offences = projectFiles().flatMap(({ path, text }) => {
    const lower = text.toLowerCase();
    return BANNED_ADVISORY_PHRASES.filter((phrase) => lower.includes(phrase)).map((phrase) => `${path}: "${phrase}"`);
  });
  assert.deepEqual(offences, []);
});

test("content sources contain no scare words", () => {
  const pattern = new RegExp(`\\b(${BANNED_SCARE_WORDS.join("|")})\\b`, "gi");
  const offences = projectFiles()
    .filter((file) => !SCARE_WORD_EXEMPT_FILES.has(file.path))
    .flatMap(({ path, text }) => Array.from(text.matchAll(pattern), (match) => `${path}: "${match[0]}"`));
  assert.deepEqual(offences, []);
});

test("the checks catch the old wording", () => {
  const lower = "Best avoided. Your Avoid list. A healthier swap.".toLowerCase();
  assert.ok(BANNED_ADVISORY_PHRASES.filter((phrase) => lower.includes(phrase)).length >= 3);
});

/** The legal pages must name the AI processor; marketing copy must not. */
const AI_DISCLOSURE_FILES = /^(app\/privacy|app\/terms|app\/api|content\/legal\.md|lib\/chat\/)/;
const AI_PROVIDER_OR_HEDGE = /\b(Gemini|Google)\b|can be wrong/g;

test("marketing copy doesn't name the AI provider or say answers can be wrong", () => {
  const offences = projectFiles()
    .filter((file) => !AI_DISCLOSURE_FILES.test(file.path))
    .flatMap(({ path, text }) => Array.from(text.matchAll(AI_PROVIDER_OR_HEDGE), (match) => `${path}: "${match[0]}"`));
  assert.deepEqual(offences, []);
});

test("the privacy policy still discloses the AI processor", () => {
  const privacy = readFileSync(join(PROJECT_ROOT, "app/privacy/page.tsx"), "utf8");
  assert.match(privacy, /Google’s Gemini API/);
});
