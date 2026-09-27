// POST /api/label: reads a label photo with AI and saves the reading against
// the barcode. Contract: docs/label-api.md. Next.js answers every other method with 405.
import { after } from "next/server";
import { readLabelConfig } from "@/lib/label/config";
import { labelErrorResponse } from "@/lib/label/http";
import { buildLabelReadHandler, lazilyBuilt } from "@/lib/label/production";

// node-app-attest and node:crypto need the Node.js runtime.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
/** Seconds: one 25 s AI read, then up to two 12 s Open Food Facts uploads after the response (lib/label/config.ts). */
export const maxDuration = 60;

const readHandler = lazilyBuilt(() =>
  // Photo uploads to Open Food Facts run after the response, so the app never waits for them.
  buildLabelReadHandler(readLabelConfig(process.env), (work) => after(work)),
);

export async function POST(request: Request): Promise<Response> {
  const handle = readHandler();
  return handle ? handle(request) : labelErrorResponse("unavailable");
}
