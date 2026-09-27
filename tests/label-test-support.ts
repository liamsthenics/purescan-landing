// Fakes and builders shared by the label and attestation tests (not a test file itself).
import type { AssertionOutcome, DeviceAttestor, DeviceRegistration, IssuedChallenge, SignedRequest } from "../lib/attest/device-attestor.ts";
import type { LabelReadInput, LabelReader } from "../lib/label/label-reader.ts";
import type { LabelLogEvent } from "../lib/label/log.ts";
import type { PhotoContribution, PhotoContributor } from "../lib/label/off-contribution.ts";
import type { LabelNutrition, ModelLabelReading } from "../lib/label/reading.ts";

export const KEY_ID = "q1XXz3N6vT9fP2yqL8Wb4dE0rHnJmK7sUcA5gYxZo+I=";
export const ASSERTION = Buffer.from("signed assertion").toString("base64");
export const BARCODE = "5000000000000";
const JPEG_HEADER = [0xff, 0xd8, 0xff, 0xe0];

export function fakeJpeg(totalBytes = 64): Buffer {
  const bytes = Buffer.alloc(totalBytes, 0x11);
  Buffer.from(JPEG_HEADER).copy(bytes);
  return bytes;
}

export const NUTRITION: LabelNutrition = {
  basis: "100g",
  energyKcal: 250,
  energyKilojoules: 1058,
  fat: 2,
  saturatedFat: 0.4,
  carbohydrates: 48,
  sugars: 3,
  fibre: 3,
  protein: 9,
  salt: 1,
};

export const FULL_READING: ModelLabelReading = {
  isFoodLabel: true,
  ingredientsText: "Wheat flour, water, salt, yeast.",
  ingredientsLanguage: "fr",
  nutrition: NUTRITION,
};

export class FakeAttestor implements DeviceAttestor {
  requests: SignedRequest[] = [];
  registrations: DeviceRegistration[] = [];
  isAssertionValid = true;
  isRegistrationValid = true;

  async issueChallenge(): Promise<IssuedChallenge> {
    return { challenge: "c".repeat(43), expiresInSeconds: 300 };
  }

  async register(registration: DeviceRegistration): Promise<boolean> {
    this.registrations.push(registration);
    return this.isRegistrationValid;
  }

  async verifyRequest(request: SignedRequest): Promise<AssertionOutcome> {
    this.requests.push(request);
    const hasEvidence = request.keyId === KEY_ID && request.assertion === ASSERTION;
    return this.isAssertionValid && hasEvidence ? { isValid: true, deviceId: "device-1" } : { isValid: false };
  }
}

export class FakeReader implements LabelReader {
  inputs: LabelReadInput[] = [];
  reading: ModelLabelReading;
  shouldFail = false;

  constructor(reading: ModelLabelReading = FULL_READING) {
    this.reading = reading;
  }

  async read(input: LabelReadInput): Promise<ModelLabelReading> {
    this.inputs.push(input);
    if (this.shouldFail) throw new Error("upstream down");
    return this.reading;
  }
}

export class FakeContributor implements PhotoContributor {
  contributions: PhotoContribution[] = [];
  async contribute(contribution: PhotoContribution): Promise<void> {
    this.contributions.push(contribution);
  }
}

export type LoggedEvent = { event: LabelLogEvent; error?: unknown };
