import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  additiveIdentity,
  additiveSlug,
  compareENumbers,
  secureUrl,
  sourceDescription,
  sourceTag,
  sourceYear,
} from "../lib/additive-format.ts";
import { filterAdditives, type AdditiveListing } from "../lib/additive-search.ts";
import { gaugeArcPath } from "../lib/gauge.ts";
import { verdictFor } from "../lib/verdict.ts";

test("slugs combine the E-number and name", () => {
  assert.equal(additiveSlug("E211", "Sodium benzoate"), "e211-sodium-benzoate");
  assert.equal(additiveSlug("E101ii", "Riboflavin-5-phosphate"), "e101ii-riboflavin-5-phosphate");
  assert.ok(additiveSlug("E472e", "Mono- and diacetyltartaric acid esters of mono- and diglycerides of fatty acids").length <= 67);
});

test("every additive in the knowledge base gets a unique slug", () => {
  const data = JSON.parse(readFileSync(new URL("../content/additives.json", import.meta.url), "utf8")) as {
    additives: Record<string, { code: string; name: string }>;
  };
  const identities = Object.values(data.additives).flatMap((additive) => {
    const identity = additiveIdentity(additive.code, additive.name);
    return identity ? [identity] : [];
  });
  assert.ok(identities.length > 600);
  const slugs = identities.map((identity) => additiveSlug(identity.code, identity.name));
  assert.equal(new Set(slugs).size, slugs.length);
  for (const slug of slugs) assert.match(slug, /^e\d+[a-z0-9-]*$/);
});

test("entries resolve to a display code and name", () => {
  assert.deepEqual(additiveIdentity("E211", "Sodium benzoate"), { code: "E211", name: "Sodium benzoate" });
  assert.deepEqual(additiveIdentity("E1404", "1‚4-Heptonolactone"), { code: "E1404", name: "1,4-Heptonolactone" });
  assert.deepEqual(additiveIdentity("E101", "E101ii - Riboflavin"), { code: "E101ii", name: "Riboflavin" });
  assert.deepEqual(additiveIdentity("E160a", "E160aiv - Algal carotenes"), { code: "E160aiv", name: "Algal carotenes" });
  assert.deepEqual(additiveIdentity("E440", "E440i - non-amidated pectines"), { code: "E440i", name: "Non-amidated pectines" });
  // The name's code disagrees with the code field, so the code field wins.
  assert.deepEqual(additiveIdentity("E639", "E369 - Alanin"), { code: "E639", name: "Alanin" });
});

test("placeholder entries don't get a page", () => {
  assert.equal(additiveIdentity("E999", "Exxx - Exxx food additive"), null);
  assert.equal(additiveIdentity("E1499", "E14XX - Modified Starch"), null);
  assert.equal(additiveIdentity("E450", "E450viii"), null);
  assert.equal(additiveIdentity("E411", "E411 food additive"), null);
});

test("sources get a short tag and year", () => {
  assert.equal(sourceTag("EFSA: caramel colours re-evaluation (2011)"), "EFSA");
  assert.equal(sourceTag("WHO/IARC: processed meat"), "WHO/IARC");
  assert.equal(sourceTag("McCann et al., The Lancet (2007): food colours"), "Study");
  assert.equal(sourceYear("EFSA: caramel colours re-evaluation (2011)"), "2011");
  assert.equal(sourceYear("FDA: benzene in soft drinks"), null);
  assert.equal(sourceDescription("EFSA: caramel colours re-evaluation (2011)"), "Caramel colours re-evaluation (2011)");
});

test("old DOI links are upgraded to https", () => {
  assert.equal(secureUrl("http://dx.doi.org/10.2903/j.efsa.2016.4433"), "https://doi.org/10.2903/j.efsa.2016.4433");
  assert.equal(secureUrl("https://www.efsa.europa.eu/x"), "https://www.efsa.europa.eu/x");
});

test("E-numbers sort naturally", () => {
  const codes = ["E1000", "E150d", "E101a", "E100", "E101"];
  assert.deepEqual([...codes].sort(compareENumbers), ["E100", "E101", "E101a", "E150d", "E1000"]);
});

test("search matches E-numbers, names and functions", () => {
  const additives: AdditiveListing[] = [
    { slug: "e211-sodium-benzoate", code: "E211", name: "Sodium benzoate", functions: ["Preservative"], tier: "moderate" },
    { slug: "e2110", code: "E2110", name: "Imaginary", functions: [], tier: "none" },
    { slug: "e100-curcumin", code: "E100", name: "Curcumin", functions: ["Colour"], tier: "none" },
  ];
  assert.deepEqual(filterAdditives(additives, "e 211", "all").map((a) => a.code), ["E211", "E2110"]);
  assert.deepEqual(filterAdditives(additives, "211", "moderate").map((a) => a.code), ["E211"]);
  assert.deepEqual(filterAdditives(additives, "benzo", "all").map((a) => a.code), ["E211"]);
  assert.deepEqual(filterAdditives(additives, "colour", "all").map((a) => a.code), ["E100"]);
  assert.equal(filterAdditives(additives, "", "none").length, 2);
});

test("verdict bands match the app", () => {
  assert.equal(verdictFor(100).verdict, "great");
  assert.equal(verdictFor(75).verdict, "great");
  assert.equal(verdictFor(74).verdict, "okay");
  assert.equal(verdictFor(50).verdict, "okay");
  assert.equal(verdictFor(49).verdict, "poor");
  assert.equal(verdictFor(25).verdict, "poor");
  assert.equal(verdictFor(24).verdict, "bad");
  assert.equal(verdictFor(0).verdict, "bad");
});

test("gauge arcs start bottom-left and sweep clockwise", () => {
  const centre = { x: 50, y: 50 };
  assert.equal(gaugeArcPath(centre, 40, 0, 0), "");
  const full = gaugeArcPath(centre, 40, 0, 1);
  assert.match(full, /^M 21\.716 78\.284 A 40 40 0 1 1 78\.284 78\.284$/);
  const quarter = gaugeArcPath(centre, 40, 0, 0.25);
  assert.match(quarter, / 0 0 1 /);
});

test("example findings link to real additive pages", async () => {
  const { FIZZBROOK_COLA } = await import("../lib/examples.ts");
  const data = JSON.parse(readFileSync(new URL("../content/additives.json", import.meta.url), "utf8")) as {
    additives: Record<string, { code: string; name: string; tier: string }>;
  };
  const slugToTier = new Map(
    Object.values(data.additives).flatMap((additive) => {
      const identity = additiveIdentity(additive.code, additive.name);
      return identity ? [[additiveSlug(identity.code, identity.name), additive.tier] as const] : [];
    }),
  );
  for (const finding of FIZZBROOK_COLA.findings.filter((candidate) => candidate.slug)) {
    assert.equal(slugToTier.get(finding.slug!), finding.tier);
  }
});
