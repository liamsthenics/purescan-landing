// Geometry for the score gauge: a 270° arc with the gap at the bottom.
// Angles are in degrees, clockwise from 3 o'clock (SVG's y axis points down).

export const GAUGE_START_ANGLE = 135;
export const GAUGE_SWEEP = 270;

export const GAUGE_SIZES = {
  hero: { diameter: 132, stroke: 9.4, showsVerdictWord: true },
  card: { diameter: 96, stroke: 7.5, showsVerdictWord: true },
  compact: { diameter: 64, stroke: 5.0, showsVerdictWord: false },
  mini: { diameter: 44, stroke: 3.8, showsVerdictWord: false },
} as const;

export type GaugeSize = keyof typeof GAUGE_SIZES;

interface Point {
  x: number;
  y: number;
}

function roundTo(value: number, places = 3): number {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
}

export function pointOnCircle(centre: Point, radius: number, angleDegrees: number): Point {
  const radians = (angleDegrees * Math.PI) / 180;
  return {
    x: roundTo(centre.x + radius * Math.cos(radians)),
    y: roundTo(centre.y + radius * Math.sin(radians)),
  };
}

/**
 * SVG path for a slice of the gauge track, from and to as fractions 0...1
 * of the 270° sweep. Returns an empty string when there is nothing to draw.
 */
export function gaugeArcPath(centre: Point, radius: number, from: number, to: number): string {
  const start = Math.max(0, Math.min(1, from));
  const end = Math.max(0, Math.min(1, to));
  if (end <= start) return "";
  const startAngle = GAUGE_START_ANGLE + GAUGE_SWEEP * start;
  const endAngle = GAUGE_START_ANGLE + GAUGE_SWEEP * end;
  const startPoint = pointOnCircle(centre, radius, startAngle);
  const endPoint = pointOnCircle(centre, radius, endAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${startPoint.x} ${startPoint.y} A ${radius} ${radius} 0 ${largeArc} 1 ${endPoint.x} ${endPoint.y}`;
}
