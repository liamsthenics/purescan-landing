# purescan.io

Marketing site for PureScan, the UK food scanner for iPhone. Next.js (app router), React 19, Tailwind 4, TypeScript. Every page is statically generated.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # unit tests (Node's built-in runner, no extra dependencies)
npm run lint
npm run build
```

No environment variables are needed.

## Where things live

| What | Where |
| --- | --- |
| Launch switch, App Store link, prices, emails | `lib/site.ts` (`APP_STORE_LIVE`) |
| Scoring rules shown on /how-we-score | `lib/scoring.ts` (mirrors the app's `ScoringPolicy.swift`) |
| Additive ratings, reasons and sources | `content/additives.json` |
| Privacy and terms copy | `content/legal.md` → `app/privacy`, `app/terms` |
| Design tokens (light and dark) | `app/globals.css` |
| Fictional example products | `lib/examples.ts` |

## Updating additive data

The additive pages are generated from the app's knowledge base. After the app's `knowledge.json` changes:

```bash
npm run sync:knowledge                       # reads the iOS repo next to this one
npm run sync:knowledge -- /path/to/knowledge.json
```

## Launch

When the app is live, set `APP_STORE_LIVE = true` in `lib/site.ts`. That turns every "Coming soon" note into an App Store link, adds the link to the JSON-LD and enables Safari's Smart App Banner. Consider swapping in Apple's official badge artwork at the same time.

## Copy rules

UK English, calm and evidence-led. No "toxic", "poison", "junk" or scare words; say "we suggest limiting". No health outcome claims. Name the source next to every claim. Example products are fictional; never show a real brand negatively.
