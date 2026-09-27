import { test } from "node:test";
import assert from "node:assert/strict";
import type { LabelLogEvent } from "../lib/label/log.ts";
import {
  OFF_IMAGE_UPLOAD_URL,
  OFF_USER_AGENT,
  OpenFoodFactsPhotoContributor,
} from "../lib/label/off-contribution.ts";
import { BARCODE, fakeJpeg } from "./label-test-support.ts";

const CREDENTIALS = { userId: "purescan-app", password: "not-a-real-password" };

function contributorWith(respond: (form: FormData) => Response | Promise<Response>) {
  const calls: { url: string; init: RequestInit; form: FormData }[] = [];
  const logged: LabelLogEvent[] = [];
  const contributor = new OpenFoodFactsPhotoContributor({
    credentials: CREDENTIALS,
    logger: (event) => logged.push(event),
    fetch: async (url, init) => {
      const form = init?.body as FormData;
      calls.push({ url: String(url), init: init ?? {}, form });
      return respond(form);
    },
  });
  return { contributor, calls, logged };
}

const PHOTOS = [
  { kind: "ingredients" as const, jpeg: fakeJpeg() },
  { kind: "nutrition" as const, jpeg: fakeJpeg() },
];

test("uploads each photo to the OFF image endpoint with the documented fields", async () => {
  const { contributor, calls, logged } = contributorWith(() => Response.json({ status: "status ok" }));
  await contributor.contribute({ barcode: BARCODE, photos: PHOTOS, contributorId: "hashed-device", language: null });

  assert.equal(calls.length, 2);
  const [first, second] = calls;
  assert.equal(first?.url, OFF_IMAGE_UPLOAD_URL);
  assert.equal(first?.init.method, "POST");
  assert.equal((first?.init.headers as Record<string, string>)["User-Agent"], OFF_USER_AGENT);
  assert.equal(first?.form.get("code"), BARCODE);
  assert.equal(first?.form.get("imagefield"), "ingredients_en");
  assert.ok(first?.form.get("imgupload_ingredients_en") instanceof Blob);
  assert.equal(first?.form.get("user_id"), CREDENTIALS.userId);
  assert.equal(first?.form.get("password"), CREDENTIALS.password);
  assert.equal(first?.form.get("app_name"), "PureScan");
  assert.equal(first?.form.get("app_uuid"), "hashed-device");
  assert.equal(second?.form.get("imagefield"), "nutrition_en");
  assert.deepEqual(logged, []);
});

test("files each photo under the label's own language when it was read", async () => {
  const { contributor, calls } = contributorWith(() => Response.json({ status: "status ok" }));
  await contributor.contribute({ barcode: BARCODE, photos: PHOTOS, contributorId: "hashed-device", language: "fr" });
  assert.equal(calls[0]?.form.get("imagefield"), "ingredients_fr");
  assert.ok(calls[0]?.form.get("imgupload_ingredients_fr") instanceof Blob);
  assert.equal(calls[1]?.form.get("imagefield"), "nutrition_fr");
});

test("sends only photos: no reading text goes to OFF", async () => {
  const { contributor, calls } = contributorWith(() => Response.json({ status: "status ok" }));
  await contributor.contribute({ barcode: BARCODE, photos: [PHOTOS[0]!], contributorId: "hashed-device", language: null });
  const fieldNames = [...(calls[0]?.form.keys() ?? [])].sort();
  assert.deepEqual(fieldNames, ["app_name", "app_uuid", "app_version", "code", "imagefield", "imgupload_ingredients_en", "password", "user_id"]);
});

test("failures are logged, never thrown, and don't stop the next upload", async () => {
  let call = 0;
  const { contributor, calls, logged } = contributorWith(() => {
    call += 1;
    if (call === 1) throw new TypeError("network down");
    return Response.json({ status: "status not ok" });
  });
  await contributor.contribute({ barcode: BARCODE, photos: PHOTOS, contributorId: "hashed-device", language: null });
  assert.equal(calls.length, 2);
  assert.deepEqual(logged, ["contribution_failed", "contribution_failed"]);

  const httpError = contributorWith(() => new Response("oops", { status: 500 }));
  await httpError.contributor.contribute({ barcode: BARCODE, photos: [PHOTOS[0]!], contributorId: "hashed-device", language: null });
  assert.deepEqual(httpError.logged, ["contribution_failed"]);
});
