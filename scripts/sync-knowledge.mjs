#!/usr/bin/env node
// Copies the additive ratings from the iOS app's knowledge base into
// content/additives.json, so the website always shows the same ratings,
// reasons and sources as the app.
//
// Usage: npm run sync:knowledge [-- /path/to/knowledge.json]
// The path can also be set with PURESCAN_KNOWLEDGE_PATH.

import { readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_KNOWLEDGE_PATH = join(
  projectRoot,
  "../Xcode Purescan/PureScan/App/PureScanCore/Sources/PureScanCore/Resources/knowledge.json",
);
const OUTPUT_PATH = join(projectRoot, "content/additives.json");
const VALID_TIERS = new Set(["none", "low", "moderate", "high"]);
const ADDITIVE_FIELDS = ["code", "name", "functions", "tier", "summary", "reasons", "sources", "kidsWarning", "efsaUrl"];

function pickAdditiveFields(additive) {
  return Object.fromEntries(ADDITIVE_FIELDS.filter((field) => field in additive).map((field) => [field, additive[field]]));
}

function assertValidAdditive(id, additive) {
  if (typeof additive.code !== "string" || typeof additive.name !== "string") {
    throw new Error(`Additive ${id} is missing a code or name`);
  }
  if (!VALID_TIERS.has(additive.tier)) {
    throw new Error(`Additive ${id} has an unknown tier: ${additive.tier}`);
  }
  for (const source of additive.sources ?? []) {
    if (!/^https:\/\//.test(source.url)) {
      throw new Error(`Additive ${id} has a non-https source URL: ${source.url}`);
    }
  }
}

async function main() {
  const knowledgePath = process.argv[2] ?? process.env.PURESCAN_KNOWLEDGE_PATH ?? DEFAULT_KNOWLEDGE_PATH;
  const knowledge = JSON.parse(await readFile(knowledgePath, "utf8"));

  const additives = {};
  for (const id of Object.keys(knowledge.additives).sort()) {
    const additive = knowledge.additives[id];
    assertValidAdditive(id, additive);
    additives[id] = pickAdditiveFields(additive);
  }

  const output = { version: knowledge.version, generated: knowledge.generated, additives };
  await writeFile(OUTPUT_PATH, `${JSON.stringify(output, null, 1)}\n`);
  console.log(`Wrote ${Object.keys(additives).length} additives (knowledge base ${knowledge.version}) to content/additives.json`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
