// What the label handler needs from a vision model: a checked reading of the photos.
import type { ModelLabelReading } from "./reading.ts";
import type { LabelPhoto } from "./validation.ts";

export interface LabelReadInput {
  photos: readonly LabelPhoto[];
  /** Aborted when the app disconnects, so the upstream call stops too. */
  signal?: AbortSignal;
}

export interface LabelReader {
  /** Throws when the model fails or returns something unusable (a failed read, refunded). */
  read(input: LabelReadInput): Promise<ModelLabelReading>;
}
