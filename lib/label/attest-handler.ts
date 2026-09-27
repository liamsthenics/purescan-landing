// POST /api/attest/challenge and POST /api/attest/register (docs/label-api.md,
// "Device attestation"). Dependencies are injected so both can be tested offline.
import type { DeviceAttestor } from "../attest/device-attestor.ts";
import type { IdentifierHasher } from "../chat/hashing.ts";
import { clientIpAddress, readBodyWithLimit } from "../chat/http.ts";
import { MAX_ATTEST_REQUEST_BODY_BYTES } from "./config.ts";
import { jsonResponse, labelErrorResponse, noContentResponse } from "./http.ts";
import { consoleLabelLogger, type LabelLogger } from "./log.ts";
import type { LabelRateLimits } from "./rate-limit.ts";
import { parseRegistrationRequest, type RegistrationRequest } from "./validation.ts";

export type AttestHandler = (request: Request) => Promise<Response>;

export interface AttestHandlerDependencies {
  deviceAttestor: DeviceAttestor;
  rateLimits: LabelRateLimits;
  hashIdentifier: IdentifierHasher;
  logger?: LabelLogger;
}

/** Store outages and other surprises become a generic 503. */
function withErrorBoundary(handle: AttestHandler, logger: LabelLogger): AttestHandler {
  return async (request) => {
    try {
      return await handle(request);
    } catch (error) {
      logger("unexpected_error", error);
      return labelErrorResponse("unavailable");
    }
  };
}

export function createAttestChallengeHandler(dependencies: AttestHandlerDependencies): AttestHandler {
  const { deviceAttestor, rateLimits, hashIdentifier } = dependencies;
  return withErrorBoundary(async (request) => {
    const client = await rateLimits.checkChallengeClient(hashIdentifier(clientIpAddress(request.headers)));
    if (!client.isAllowed) return labelErrorResponse("rate_limited", client.retryAfterSeconds);
    const { challenge, expiresInSeconds } = await deviceAttestor.issueChallenge();
    return jsonResponse({ challenge, expiresIn: expiresInSeconds });
  }, dependencies.logger ?? consoleLabelLogger);
}

export function createAttestRegisterHandler(dependencies: AttestHandlerDependencies): AttestHandler {
  const { deviceAttestor, rateLimits, hashIdentifier } = dependencies;
  return withErrorBoundary(async (request) => {
    const client = await rateLimits.checkRegistrationClient(hashIdentifier(clientIpAddress(request.headers)));
    if (!client.isAllowed) return labelErrorResponse("rate_limited", client.retryAfterSeconds);
    const registration = await readRegistration(request);
    if (registration === null) return labelErrorResponse("invalid_request");
    return (await deviceAttestor.register(registration)) ? noContentResponse() : labelErrorResponse("invalid_request");
  }, dependencies.logger ?? consoleLabelLogger);
}

async function readRegistration(request: Request): Promise<RegistrationRequest | null> {
  const body = await readBodyWithLimit(request, MAX_ATTEST_REQUEST_BODY_BYTES);
  if (body === null) return null;
  try {
    return parseRegistrationRequest(JSON.parse(body));
  } catch {
    return null;
  }
}
