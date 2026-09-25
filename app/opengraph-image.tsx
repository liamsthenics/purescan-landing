import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { gaugeArcPath } from "@/lib/gauge";
import { SITE_TAGLINE } from "@/lib/site";

// The shared Open Graph image: brand mark, wordmark, headline and a score gauge.

export const alt = "PureScan: know what's really in your food. One honest score for UK food.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PAPER = "#F7F5F0";
const INK = "#14201A";
const SECONDARY = "#5B665F";
const BRAND = "#1F4D45";
const VERDICT_BANDS = ["#C8372D", "#D9651E", "#C98A00", "#1E8E4E"];
const EXAMPLE_SCORE = 93;
const GAUGE_SIZE = 300;
const GAUGE_STROKE = 21;

// Inter SemiBold for "Scan", fetched as TTF at build time (Satori can't read woff2).
const INTER_SEMIBOLD_CSS_URL = "https://fonts.googleapis.com/css2?family=Inter:wght@600&text=Scan0123456789GREAT";

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

function gaugeSvg(): string {
  const centre = { x: 50, y: 50 };
  const stroke = (GAUGE_STROKE / GAUGE_SIZE) * 100;
  const radius = 50 - stroke / 2;
  const bands = VERDICT_BANDS.map(
    (colour, index) =>
      `<path d="${gaugeArcPath(centre, radius, index / 4, (index + 1) / 4)}" fill="none" stroke="${colour}" stroke-opacity="0.18" stroke-width="${stroke}"/>`,
  ).join("");
  const progress = `<path d="${gaugeArcPath(centre, radius, 0, EXAMPLE_SCORE / 100)}" fill="none" stroke="${VERDICT_BANDS[3]}" stroke-width="${stroke}" stroke-linecap="round"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${bands}${progress}</svg>`;
}

function markSvg(): string {
  const arc = gaugeArcPath({ x: 32, y: 32 }, 21.76, 0, 1);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="${arc}" fill="none" stroke="${BRAND}" stroke-width="4.5" stroke-linecap="round"/><line x1="3.84" y1="32" x2="60.16" y2="32" stroke="${BRAND}" stroke-width="4.5" stroke-linecap="round"/><circle cx="32" cy="32" r="3.5" fill="${BRAND}"/></svg>`;
}

export default async function OpenGraphImage() {
  const [serif, sans] = await Promise.all([
    readFile(join(process.cwd(), "assets/fonts/InstrumentSerif-Regular.ttf")),
    loadInterSemiBold(),
  ]);
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
            <div style={{ fontSize: 94, lineHeight: 0.98, letterSpacing: "-0.02em", maxWidth: 640 }}>
              {SITE_TAGLINE.replace("'", "’")}
            </div>
            <div style={{ marginTop: 26, fontSize: 34, color: SECONDARY, lineHeight: 1.2 }}>
              One honest score for UK food, with sources.
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 360 }}>
          <div style={{ display: "flex", position: "relative", width: GAUGE_SIZE, height: GAUGE_SIZE }}>
            <img src={svgDataUri(gaugeSvg())} width={GAUGE_SIZE} height={GAUGE_SIZE} alt="" />
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: GAUGE_SIZE,
                height: GAUGE_SIZE,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: sansFamily,
                fontWeight: 600,
              }}
            >
              <span style={{ fontSize: 104, letterSpacing: "-0.04em", lineHeight: 1 }}>{EXAMPLE_SCORE}</span>
              <span style={{ fontSize: 26, letterSpacing: "0.12em", color: VERDICT_BANDS[3], marginTop: 6 }}>GREAT</span>
            </div>
          </div>
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
