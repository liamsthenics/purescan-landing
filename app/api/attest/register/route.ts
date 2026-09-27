// POST /api/attest/register: stores an App Attest key after verifying its
// attestation with Apple's certificates. Contract: docs/label-api.md.
import { readLabelConfig } from "@/lib/label/config";
import { labelErrorResponse } from "@/lib/label/http";
import { buildAttestRegisterHandler, lazilyBuilt } from "@/lib/label/production";

// node-app-attest and node:crypto need the Node.js runtime.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const registerHandler = lazilyBuilt(() => buildAttestRegisterHandler(readLabelConfig(process.env)));

export async function POST(request: Request): Promise<Response> {
  const handle = registerHandler();
  return handle ? handle(request) : labelErrorResponse("unavailable");
}
