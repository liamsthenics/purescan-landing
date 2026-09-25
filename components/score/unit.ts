import type { CSSProperties } from "react";

/**
 * Sets the size unit for the score components: "1px" on the site, or the
 * phone mockup's point size ("var(--pt)") so they scale with the phone.
 */
export function unitStyle(unit: string | undefined, extra?: CSSProperties): CSSProperties | undefined {
  if (!unit && !extra) return undefined;
  return { ...(unit ? ({ "--u": unit } as CSSProperties) : {}), ...extra };
}
