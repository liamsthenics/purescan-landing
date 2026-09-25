import { gaugeArcPath } from "@/lib/gauge";

// Brand mark (design 1c): the gauge's 270° track with a scan line through it.
// Geometry on a 64-unit square, matching the app's BrandMark.
const MARK_SIZE = 64;
const CENTRE = { x: 32, y: 32 };
const STROKE = 4.5;
const ARC_RADIUS = MARK_SIZE * 0.34;
const LINE_INSET = MARK_SIZE * 0.06;
const DOT_RADIUS = 3.5;
const ARC_PATH = gaugeArcPath(CENTRE, ARC_RADIUS, 0, 1);

interface BrandMarkProps {
  size?: number;
  /** Defaults to the brand colour. Never a verdict colour. */
  color?: string;
  className?: string;
}

export function BrandMark({ size = 24, color = "var(--brand)", className }: BrandMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${MARK_SIZE} ${MARK_SIZE}`}
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d={ARC_PATH} style={{ stroke: color }} strokeWidth={STROKE} strokeLinecap="round" />
      <line
        x1={LINE_INSET}
        y1={CENTRE.y}
        x2={MARK_SIZE - LINE_INSET}
        y2={CENTRE.y}
        style={{ stroke: color }}
        strokeWidth={STROKE}
        strokeLinecap="round"
      />
      <circle cx={CENTRE.x} cy={CENTRE.y} r={DOT_RADIUS} style={{ fill: color }} />
    </svg>
  );
}
