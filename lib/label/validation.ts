// Request validation for the label and attestation routes (docs/label-api.md).
import { z } from "zod";
import { decodeStrictBase64, maxBase64Length } from "../base64.ts";
import { PHOTO_LIMITS } from "./config.ts";
import type { LabelPhotoKind } from "./reading.ts";

export const BARCODE_PATTERN = /^\d{6,14}$/;
const JPEG_SIGNATURE: readonly number[] = [0xff, 0xd8, 0xff];
const BYTES_PER_KILOBYTE = 1_024;
/** Generous: an attestation object (two certificates and a receipt) is a few kilobytes. */
const ATTESTATION_MAX_KILOBYTES = 16;
const MAX_ATTESTATION_BYTES = ATTESTATION_MAX_KILOBYTES * BYTES_PER_KILOBYTE;
const MAX_IDENTIFIER_CHARACTERS = 128;

export interface LabelPhoto {
  kind: LabelPhotoKind;
  jpeg: Buffer;
}

export interface LabelReadRequest {
  barcode: string;
  photos: LabelPhoto[];
  shareWithOpenFoodFacts: boolean;
}

export function isValidBarcode(barcode: string): boolean {
  return BARCODE_PATTERN.test(barcode);
}

function startsWithJpegSignature(bytes: Buffer): boolean {
  return JPEG_SIGNATURE.every((byte, index) => bytes[index] === byte);
}

const jpegSchema = z
  .string()
  .max(maxBase64Length(PHOTO_LIMITS.maxDecodedBytes))
  .transform((text, context) => {
    const bytes = decodeStrictBase64(text);
    if (bytes === null) {
      context.addIssue({ code: "custom", message: "not base64" });
      return z.NEVER;
    }
    return bytes;
  })
  .refine((bytes) => bytes.byteLength <= PHOTO_LIMITS.maxDecodedBytes && startsWithJpegSignature(bytes));

const photoSchema = z.object({
  kind: z.enum(["ingredients", "nutrition"]),
  jpeg: jpegSchema,
});

function hasUniqueKinds(photos: readonly { kind: LabelPhotoKind }[]): boolean {
  return new Set(photos.map((photo) => photo.kind)).size === photos.length;
}

export const labelReadRequestSchema = z.object({
  barcode: z.string().regex(BARCODE_PATTERN),
  photos: z.array(photoSchema).min(PHOTO_LIMITS.minPhotos).max(PHOTO_LIMITS.maxPhotos).refine(hasUniqueKinds),
  shareWithOpenFoodFacts: z.boolean().default(false),
});

/** The validated request, or null for anything that isn't exactly what the contract allows. */
export function parseLabelReadRequest(json: unknown): LabelReadRequest | null {
  const result = labelReadRequestSchema.safeParse(json);
  return result.success ? result.data : null;
}

export interface RegistrationRequest {
  keyId: string;
  challenge: string;
  attestation: string;
}

const identifierSchema = z.string().min(1).max(MAX_IDENTIFIER_CHARACTERS);

export const registrationRequestSchema = z.object({
  keyId: identifierSchema,
  challenge: identifierSchema,
  attestation: z.string().min(1).max(maxBase64Length(MAX_ATTESTATION_BYTES)),
});

/** Shape only: the attestor checks the key id, challenge and attestation themselves. */
export function parseRegistrationRequest(json: unknown): RegistrationRequest | null {
  const result = registrationRequestSchema.safeParse(json);
  return result.success ? result.data : null;
}
