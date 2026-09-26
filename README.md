# purescan.io

Marketing site and API for PureScan, the UK food scanner for iPhone. Next.js (app router), React 19, Tailwind 4, TypeScript. Every page is statically generated; the only server code is `POST /api/chat` (Ask PureScan).

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # unit tests (Node's built-in runner, no extra dependencies)
npm run lint
npm run build
```

The pages need no environment variables. Ask PureScan needs `GEMINI_API_KEY` and reads `GEMINI_MODEL` (optional), `CHAT_ENABLED`, `CHAT_GLOBAL_DAILY_LIMIT`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` and `CHAT_HASH_SECRET` (required with Upstash); see `.env.example`.

## Where things live

| What | Where |
| --- | --- |
| Launch switch, App Store link, prices, emails | `lib/site.ts` (`APP_STORE_LIVE`) |
| Scoring rules shown on /how-we-score | `lib/scoring.ts` (mirrors the app's `ScoringPolicy.swift`) |
| Additive ratings, reasons and sources | `content/additives.json` |
| Privacy and terms copy | `content/legal.md` → `app/privacy`, `app/terms` |
| Design tokens (light and dark) | `app/globals.css` |
| Fictional example products | `lib/examples.ts` |
| Voice and vocabulary (inform, never advise) | `docs/voice.md`, banned phrases in `lib/voice.ts` |
| Ask PureScan API contract | `docs/chat-api.md` |
| Ask PureScan server (validation, Apple verification, rate limits, prompt) | `lib/chat/`, route in `app/api/chat/route.ts` |
| Apple root certificates for StoreKit verification | `certs/apple/` |

## Updating additive data

The additive pages are generated from the app's knowledge base. After the app's `knowledge.json` changes:

```bash
npm run sync:knowledge                       # reads the iOS repo next to this one
npm run sync:knowledge -- /path/to/knowledge.json
```

## Launch

When the app is live, set `APP_STORE_LIVE = true` in `lib/site.ts`. That turns every "Coming soon" note into an App Store link, adds the link to the JSON-LD and enables Safari's Smart App Banner. Consider swapping in Apple's official badge artwork at the same time.

## Ask PureScan

`POST /api/chat` follows `docs/chat-api.md`: it checks the caller's StoreKit 2 Premium transaction with Apple's App Store Server Library (Production, then Sandbox), validates the request, applies rate limits (Upstash Redis when configured, otherwise in memory) and streams an answer from Google's Gemini API as server-sent events. The system prompt is in `lib/chat/system-prompt.ts` and is built from the same scoring constants as the site. Message content is never logged or stored. Set `CHAT_ENABLED=false` to switch it off.

## Copy rules

Follow `docs/voice.md`: PureScan informs; it never advises. Describe what's in the food and attribute every judgement to its source ("EFSA set an acceptable daily intake…"); never tell people to eat, avoid, limit, choose or swap anything. UK English, sentence case, no "toxic", "poison", "junk" or other scare words, no health outcome claims. Name the source next to every claim. Example products are fictional; never show a real brand negatively. `npm test` fails if a banned phrase from `lib/voice.ts` appears in `app/`, `components/`, `lib/` or `content/`.
