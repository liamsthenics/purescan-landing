// Gives label photos to Open Food Facts when the user opted in
// (docs/label-api.md, shareWithOpenFoodFacts). Photos only: never the AI reading.
// API: https://openfoodfacts.github.io/documentation/docs/Product-Opener/api/tutorial-uploading-photo-to-a-product/
import type { OpenFoodFactsCredentials } from "./config.ts";
import type { LabelLogger } from "./log.ts";
import type { LabelPhotoKind } from "./reading.ts";
import type { LabelPhoto } from "./validation.ts";

export const OFF_IMAGE_UPLOAD_URL = "https://world.openfoodfacts.org/cgi/product_image_upload.pl";
export const OFF_APP_NAME = "PureScan";
export const OFF_APP_VERSION = "2.0";
export const OFF_USER_AGENT = `${OFF_APP_NAME}/${OFF_APP_VERSION} (https://purescan.io)`;
/** Both uploads run after the response and must fit in the route's maxDuration after the AI read. */
export const OFF_UPLOAD_TIMEOUT_MS = 12_000;
const OFF_SUCCESS_STATUS = "status ok";

/** Used when the label's language wasn't read. */
export const DEFAULT_LABEL_LANGUAGE = "en";

/** OFF files each panel under the language it's printed in, e.g. "ingredients_fr". */
function imageField(kind: LabelPhotoKind, language: string): string {
  return `${kind}_${language}`;
}

export interface PhotoContribution {
  barcode: string;
  photos: readonly LabelPhoto[];
  /** A keyed hash of the device, so OFF can group one installation's uploads without identifying it. */
  contributorId: string;
  /** ISO 639-1 code of the label's language, when it was read. */
  language: string | null;
}

export interface PhotoContributor {
  /** Never throws: failures are logged and otherwise ignored. */
  contribute(contribution: PhotoContribution): Promise<void>;
}

export interface OpenFoodFactsPhotoContributorOptions {
  credentials: OpenFoodFactsCredentials;
  logger: LabelLogger;
  fetch?: typeof fetch;
}

export class OpenFoodFactsUploadError extends Error {
  name = "OpenFoodFactsUploadError";
}

export function buildUploadForm(
  photo: LabelPhoto,
  contribution: Omit<PhotoContribution, "photos">,
  credentials: OpenFoodFactsCredentials,
): FormData {
  const field = imageField(photo.kind, contribution.language ?? DEFAULT_LABEL_LANGUAGE);
  const form = new FormData();
  form.set("code", contribution.barcode);
  form.set("imagefield", field);
  form.set(`imgupload_${field}`, new Blob([new Uint8Array(photo.jpeg)], { type: "image/jpeg" }), `${field}.jpg`);
  form.set("user_id", credentials.userId);
  form.set("password", credentials.password);
  form.set("app_name", OFF_APP_NAME);
  form.set("app_version", OFF_APP_VERSION);
  form.set("app_uuid", contribution.contributorId);
  return form;
}

export class OpenFoodFactsPhotoContributor implements PhotoContributor {
  private readonly credentials: OpenFoodFactsCredentials;
  private readonly logger: LabelLogger;
  private readonly fetch: typeof fetch;

  constructor(options: OpenFoodFactsPhotoContributorOptions) {
    this.credentials = options.credentials;
    this.logger = options.logger;
    this.fetch = options.fetch ?? globalThis.fetch;
  }

  async contribute({ photos, ...contribution }: PhotoContribution): Promise<void> {
    // One at a time: gentler on OFF than parallel uploads to the same product.
    for (const photo of photos) {
      try {
        await this.upload(buildUploadForm(photo, contribution, this.credentials));
      } catch (error) {
        this.logger("contribution_failed", error);
      }
    }
  }

  private async upload(form: FormData): Promise<void> {
    const response = await this.fetch(OFF_IMAGE_UPLOAD_URL, {
      method: "POST",
      headers: { "User-Agent": OFF_USER_AGENT },
      body: form,
      signal: AbortSignal.timeout(OFF_UPLOAD_TIMEOUT_MS),
    });
    if (!response.ok) throw new OpenFoodFactsUploadError(`HTTP ${response.status}`);
    const result: unknown = await response.json();
    const status = (result as { status?: unknown } | null)?.status;
    if (status !== OFF_SUCCESS_STATUS) throw new OpenFoodFactsUploadError("upload not accepted");
  }
}
