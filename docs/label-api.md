# Label photo-fill API contract (v1)

Server: `purescan-web` (Next.js on Vercel), base `https://www.purescan.io`.
Client: the iOS app (`LabelFillService`, `AppAttestClient`). Both sides must
follow this file; a copy lives in `purescan-web/docs/label-api.md`.

## What it does

When Open Food Facts is missing a product's ingredients, or its nutrition
figures are missing or don't add up, the user can photograph the label. The
server reads the photo with an AI model (Google Gemini), checks the result and
saves it against the barcode. **Each product is read once**: every later scan
of that barcode, by anyone, gets the saved reading for free (`GET`).

The model only *reads the label*. It never scores anything: the app scores the
reading with the same deterministic rules as every other product, and runs its
own nutrition checks (`NutritionCheck`) on it.

## Protecting the AI key and the bill

- The Gemini key (`GEMINI_LABEL_API_KEY`) lives only on the server, in a Google
  project separate from Ask PureScan's, with **prepaid billing and auto-reload
  off**, so spend can never exceed what's loaded.
- Photo reads (`POST /api/label`) need **App Attest**: proof, signed by the
  iPhone's Secure Enclave and checked against Apple's certificates, that the
  request comes from a genuine copy of PureScan on a real device. Scripts that
  copy the URL can't produce one.
- Limits: per IP, per attested device per day, and a global daily cap that
  switches reads off for everyone until midnight UTC.
- Kill switch: `LABEL_ENABLED=false` stops photo reads (saved readings are
  still served).

## Device attestation (once per install)

### `POST /api/attest/challenge`

No body. `200 {"challenge": "<base64url, 32 random bytes>", "expiresIn": 300}`.
The challenge is single-use and expires after 300 seconds.

### `POST /api/attest/register`

```json
{ "keyId": "<base64 key id from DCAppAttestService.generateKey>",
  "challenge": "<the challenge>",
  "attestation": "<base64 attestation object>" }
```

The app calls `attestKey(keyId, clientDataHash: SHA256(UTF-8 bytes of challenge))`.
The server verifies the attestation for team `X4TA4HKBM7`, bundle
`com.purescan.app` (development-environment attestations only when
`APP_ATTEST_ALLOW_DEVELOPMENT=true`), consumes the challenge and stores the
key's public key with sign count 0. `204` on success; `400 invalid_request`
otherwise. The app stores the key id and reuses it for the life of the install.
If a later request answers `401 attestation_required`, the app discards its key
id and attests a new one once.

## Reading a saved label

### `GET /api/label/{barcode}`

`barcode` is 6–14 digits. `200 {"reading": LabelReading}` or
`404 {"error": "not_found"}`. No attestation (it's a cheap cache read), limited
per IP.

## Reading a new label

### `POST /api/label`

Headers:

```
Content-Type: application/json
X-PureScan-Attest-Key: <keyId>
X-PureScan-Assertion: <base64 assertion>
```

The app calls `generateAssertion(keyId, clientDataHash: SHA256(exact request body bytes))`.
The server verifies the signature over the raw body it received and requires
the sign count to be higher than the last one it saw for that key (so a
captured request can't be replayed).

Body (at most 4 MB):

```json
{
  "barcode": "5000000000000",
  "photos": [
    { "kind": "ingredients", "jpeg": "<base64 JPEG>" },
    { "kind": "nutrition", "jpeg": "<base64 JPEG>" }
  ],
  "shareWithOpenFoodFacts": false
}
```

- 1 or 2 photos, each `kind` at most once. Each decoded photo must start with
  the JPEG signature `FF D8 FF` and be at most 1.2 MB. The app resizes to at
  most 1,600 px on the long side.
- `shareWithOpenFoodFacts`: the user opted in to also give the photos to Open
  Food Facts (public, CC BY-SA). The server uploads **photos only**, filed under the label's language (never the
  AI reading), and only when `OFF_CONTRIBUTION_ENABLED=true` and the app's Open
  Food Facts account is configured. Photos are otherwise not stored anywhere.

Response `200 {"reading": LabelReading}`: the saved reading for the barcode.
The first reading of each part is kept: a new photo only fills in a part
(ingredients or nutrition) that nothing has been saved for yet, so one wrong or
malicious photo can't replace a good reading. Bad readings are removed by hand;
each records a keyed hash of the device that sent it.

### `LabelReading`

```json
{
  "barcode": "5000000000000",
  "ingredientsText": "Wheat flour, water, salt, yeast.",
  "ingredientsLanguage": "fr",
  "nutrition": {
    "basis": "100g",
    "energyKcal": 250, "energyKilojoules": 1058,
    "fat": 2, "saturatedFat": 0.4, "carbohydrates": 48, "sugars": 3,
    "fibre": 3, "protein": 9, "salt": 1.0
  },
  "readAt": "2026-09-27T10:00:00.000Z"
}
```

- `ingredientsText`: the ingredient list in English, in label order, with
  percentages and bracketed sub-ingredients kept; `null` if none was read.
- `ingredientsLanguage`: ISO 639-1 code of the label's language, or `null`.
- `nutrition`: per 100 g (`"100g"`) or per 100 ml (`"100ml"`) only; `null` if
  the label shows only per-serving figures or none were read. Every value is
  optional, grams except energy; bounds: grams 0–100, kcal 0–900, kJ 0–3,800.

## Errors

`{"error": code, "message": "..."}`, messages generic (nothing about internals).

| Status | `error` | Meaning |
|---|---|---|
| 400 | `invalid_request` | Malformed body, bad barcode, bad or oversized photo |
| 401 | `attestation_required` | Missing, unknown or invalid App Attest key or assertion |
| 404 | `not_found` | (`GET` only) no saved reading |
| 422 | `unreadable` | The photo isn't a readable food label |
| 429 | `rate_limited` | Too many requests; `Retry-After` header in seconds |
| 503 | `unavailable` | Switched off, daily capacity reached, or the AI failed |

## Limits (defaults)

| Limit | Value | Env override |
|---|---|---|
| Saved-reading lookups per IP | 300 / hour | |
| Photo reads per IP | 20 / hour | |
| Photo reads per attested device | 10 / day | |
| Photo reads, everyone | 500 / day | `LABEL_GLOBAL_DAILY_LIMIT` |
| Attestation challenges per IP | 30 / hour | |

A failed AI read is refunded against the device and global counts.
