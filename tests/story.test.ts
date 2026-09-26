import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { STORY_SCREENS, WIDGET_CROP, isStoryScreenId, poseTransform, storyScreen } from "../lib/story.ts";

const PUBLIC_DIRECTORY = fileURLToPath(new URL("../public", import.meta.url));
/** "A few degrees": the phone tilts, it never spins. */
const MAX_POSE_DEGREES = 20;

test("every story capture exists in public/", () => {
  const missing = [...STORY_SCREENS.map((screen) => screen.src), WIDGET_CROP.src].filter(
    (src) => !existsSync(join(PUBLIC_DIRECTORY, src)),
  );
  assert.deepEqual(missing, []);
});

test("story screens have unique ids and alt text", () => {
  const ids = STORY_SCREENS.map((screen) => screen.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const screen of STORY_SCREENS) assert.ok(screen.alt.length > 20, `${screen.id} needs descriptive alt text`);
});

test("phone poses stay within a few degrees", () => {
  for (const { id, pose } of STORY_SCREENS) {
    for (const degrees of [pose.rotateX, pose.rotateY, pose.rotateZ]) {
      assert.ok(Math.abs(degrees) <= MAX_POSE_DEGREES, `${id} turns ${degrees}°`);
    }
  }
});

test("poses become a CSS rotation", () => {
  assert.equal(poseTransform({ rotateX: 6, rotateY: -16, rotateZ: 2 }), "rotateX(6deg) rotateY(-16deg) rotateZ(2deg)");
});

test("screen ids are recognised and looked up", () => {
  assert.equal(storyScreen("ask").src, "/screens/ask-followup.webp");
  assert.ok(isStoryScreenId("hero"));
  assert.ok(!isStoryScreenId("pricing"));
  assert.ok(!isStoryScreenId(undefined));
});
