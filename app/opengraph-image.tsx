import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { gaugeArcPath } from "@/lib/gauge";
import { WILD_SPRING_LEMON_LIME, exampleScore, type ExampleProduct, type Packshot } from "@/lib/examples";
import { SHARE_IMAGE_ALT, SITE_TAGLINE, SITE_TAGLINE_FOLLOW_UP } from "@/lib/site";
import { VERDICTS_ON_SCALE, verdictFor } from "@/lib/verdict";

// The shared Open Graph image: brand mark, wordmark and headline, with an
// example product on the PureScan scale as in the app's result screen.

export const alt = SHARE_IMAGE_ALT;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PAPER = "#F7F5F0";
const INK = "#14201A";
const SECONDARY = "#5B665F";
const BRAND = "#1F4D45";
const TERTIARY = "#8C958F";
/** Verdict colours from app/globals.css (light), keyed by verdict. */
const VERDICT_COLOURS = { bad: "#C8372D", poor: "#D9651E", okay: "#C98A00", great: "#1E8E4E" } as const;
const EXAMPLE_PRODUCT = WILD_SPRING_LEMON_LIME;
const EXAMPLE_PACKSHOT: Packshot = requirePackshot(EXAMPLE_PRODUCT);

function requirePackshot(product: ExampleProduct): Packshot {
  if (!product.packshot) throw new Error("The Open Graph example product needs a packshot");
  return product.packshot;
}
const EXAMPLE_SCORE = exampleScore(EXAMPLE_PRODUCT);
const PANEL_WIDTH = 380;
const RULER = { width: 380, height: 46, bandHeight: 7, tickStep: 5, majorStep: 25, bandOpacity: 0.55 } as const;
const PACKSHOT_HEIGHT = 190;

// Inter SemiBold for "Scan", fetched as TTF at build time (Satori can't read woff2).
const INTER_GLYPHS = `Scan${VERDICTS_ON_SCALE.map((info) => info.title.toUpperCase()).join("")}`;
const INTER_SEMIBOLD_CSS_URL = `https://fonts.googleapis.com/css2?family=Inter:wght@600&text=${encodeURIComponent(INTER_GLYPHS)}`;

async function loadInterSemiBold(): Promise<ArrayBuffer | null> {
  try {
    const css = await (await fetch(INTER_SEMIBOLD_CSS_URL)).text();
    const fontUrl = /src: url\((.+?)\) format\('(?:truetype|opentype)'\)/.exec(css)?.[1];
    if (!fontUrl) return null;
    const response = await fetch(fontUrl);
    return response.ok ? await response.arrayBuffer() : null;
  } catch {
    return null;
  }
}

function svgDataUri(svg: string): string {
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

/** The 0–100 ruler: four verdict bands, a tick every 5 and a marker at the score. */
function rulerSvg(score: number): string {
  const { width, height, bandHeight, tickStep, majorStep, bandOpacity } = RULER;
  const bandGap = 3;
  const bandWidth = (width - bandGap * 3) / 4;
  const bands = VERDICTS_ON_SCALE.map(
      (info, index) =>
        `<rect x="${index * (bandWidth + bandGap)}" y="10" width="${bandWidth}" height="${bandHeight}" rx="3.5" fill="${VERDICT_COLOURS[info.verdict]}" fill-opacity="${bandOpacity}"/>`,
    )
    .join("");
  const ticks = Array.from({ length: 100 / tickStep + 1 }, (_, index) => {
    const value = index * tickStep;
    const x = Math.min(width - 1, (value / 100) * width);
    const isMajor = value % majorStep === 0;
    return `<rect x="${x}" y="24" width="1.5" height="${isMajor ? 18 : 9}" fill="${INK}" fill-opacity="${isMajor ? 0.45 : 0.22}"/>`;
  }).join("");
  const markerX = (score / 100) * width;
  const marker = `<rect x="${markerX - 1.5}" y="6" width="3" height="${height - 6}" rx="1.5" fill="${INK}"/><circle cx="${markerX}" cy="8" r="8" fill="${INK}" stroke="${PAPER}" stroke-width="4"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -2 ${width} ${height + 2}">${bands}${ticks}${marker}</svg>`;
}

function markSvg(): string {
  const arc = gaugeArcPath({ x: 32, y: 32 }, 21.76, 0, 1);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="${arc}" fill="none" stroke="${BRAND}" stroke-width="4.5" stroke-linecap="round"/><line x1="3.84" y1="32" x2="60.16" y2="32" stroke="${BRAND}" stroke-width="4.5" stroke-linecap="round"/><circle cx="32" cy="32" r="3.5" fill="${BRAND}"/></svg>`;
}

export default async function OpenGraphImage() {
  const [serif, sans, packshot] = await Promise.all([
    readFile(join(process.cwd(), "assets/fonts/InstrumentSerif-Regular.ttf")),
    loadInterSemiBold(),
    readFile(join(process.cwd(), "public", EXAMPLE_PACKSHOT.src)),
  ]);
  const verdict = verdictFor(EXAMPLE_SCORE);
  const packshotWidth = Math.round((PACKSHOT_HEIGHT * EXAMPLE_PACKSHOT.width) / EXAMPLE_PACKSHOT.height);
  const sansFamily = sans ? "Inter" : "Instrument Serif";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: PAPER,
          padding: "64px 72px",
          fontFamily: "Instrument Serif",
          color: INK,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <img src={svgDataUri(markSvg())} width={58} height={58} alt="" />
            <div style={{ display: "flex", alignItems: "baseline", letterSpacing: "-0.03em" }}>
              <span style={{ fontSize: 48 }}>Pure</span>
              <span style={{ fontSize: 38, fontFamily: sansFamily, fontWeight: 600, color: BRAND }}>Scan</span>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 84, lineHeight: 0.98, letterSpacing: "-0.02em", maxWidth: 660 }}>
              {SITE_TAGLINE.replace("'", "’")}
            </div>
            <div style={{ marginTop: 26, fontSize: 34, color: SECONDARY, lineHeight: 1.2 }}>
              {SITE_TAGLINE_FOLLOW_UP}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", width: PANEL_WIDTH }}>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              backgroundImage: `radial-gradient(circle at 50% 55%, ${VERDICT_COLOURS[verdict.verdict]}29, ${PAPER}00 65%)`,
            }}
          >
            <img
              src={`data:image/png;base64,${packshot.toString("base64")}`}
              width={packshotWidth}
              height={PACKSHOT_HEIGHT}
              alt=""
            />
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: 26 }}>
            <div style={{ display: "flex", alignItems: "baseline", lineHeight: 0.8 }}>
              <span style={{ fontSize: 150, letterSpacing: "-0.03em" }}>{EXAMPLE_SCORE}</span>
              <span style={{ fontSize: 38, color: TERTIARY, marginLeft: 6 }}>/100</span>
            </div>
            <span
              style={{
                fontFamily: sansFamily,
                fontWeight: 600,
                fontSize: 24,
                letterSpacing: "0.14em",
                color: VERDICT_COLOURS[verdict.verdict],
                marginBottom: 10,
              }}
            >
              {verdict.title.toUpperCase()}
            </span>
          </div>
          <img src={svgDataUri(rulerSvg(EXAMPLE_SCORE))} width={RULER.width} height={RULER.height + 2} alt="" style={{ marginTop: 24 }} />
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Instrument Serif", data: serif, style: "normal", weight: 400 },
        ...(sans ? [{ name: "Inter", data: sans, style: "normal" as const, weight: 600 as const }] : []),
      ],
    },
  );
}
