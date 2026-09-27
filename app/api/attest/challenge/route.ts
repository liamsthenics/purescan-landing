// POST /api/attest/challenge: a one-time App Attest challenge. Contract:
// docs/label-api.md. Next.js answers every other method with 405.
import { readLabelConfig } from "@/lib/label/config";
import { labelErrorResponse } from "@/lib/label/http";
import { buildAttestChallengeHandler, lazilyBuilt } from "@/lib/label/production";

// node:crypto and the Upstash client need the Node.js runtime.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const challengeHandler = lazilyBuilt(() => buildAttestChallengeHandler(readLabelConfig(process.env)));

export async function POST(request: Request): Promise<Response> {
  const handle = challengeHandler();
  return handle ? handle(request) : labelErrorResponse("unavailable");
}
