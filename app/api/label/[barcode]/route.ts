// GET /api/label/{barcode}: a saved label reading, if there is one. Contract:
// docs/label-api.md. Served even when photo reads are switched off.
import { readLabelConfig } from "@/lib/label/config";
import { labelErrorResponse } from "@/lib/label/http";
import { buildLabelLookupHandler, lazilyBuilt } from "@/lib/label/production";

// node:crypto and the Upstash client need the Node.js runtime.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const lookupHandler = lazilyBuilt(() => buildLabelLookupHandler(readLabelConfig(process.env)));

export async function GET(request: Request, context: { params: Promise<{ barcode: string }> }): Promise<Response> {
  const handle = lookupHandler();
  if (!handle) return labelErrorResponse("unavailable");
  const { barcode } = await context.params;
  return handle(request, barcode);
}
