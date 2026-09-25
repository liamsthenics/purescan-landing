// POST /api/chat: Ask PureScan. Contract: docs/chat-api.md. Next.js answers
// every other method with 405.
import { readChatConfig } from "@/lib/chat/config";
import type { ChatHandler } from "@/lib/chat/handler";
import { errorResponse } from "@/lib/chat/http";
import { consoleChatLogger } from "@/lib/chat/log";
import { buildChatHandler } from "@/lib/chat/production";

// The Apple library and node:crypto need the Node.js runtime.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
/** Seconds: two 20 s upstream attempts (lib/chat/config.ts) plus a streamed 600-token answer. */
export const maxDuration = 60;

let cachedHandler: ChatHandler | null = null;

function chatHandler(): ChatHandler {
  cachedHandler ??= buildChatHandler(readChatConfig(process.env));
  return cachedHandler;
}

export async function POST(request: Request): Promise<Response> {
  let handler: ChatHandler;
  try {
    handler = chatHandler();
  } catch (error) {
    consoleChatLogger("setup_failed", error);
    return errorResponse("unavailable");
  }
  return handler(request);
}
