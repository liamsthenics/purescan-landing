import type { CSSProperties, ReactNode } from "react";
import { CAPTURE_HEIGHT, CAPTURE_WIDTH } from "@/lib/story";
import styles from "./PhoneFrame.module.css";

const SCREEN_ASPECT = `${CAPTURE_WIDTH} / ${CAPTURE_HEIGHT}`;

interface PhoneFrameProps {
  /** Width of the whole device, as a CSS length. */
  width: string;
  /** The screen's contents: one or more stacked captures. */
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/** Bezel, side buttons and a rounded screen. The captures carry their own status bar and Dynamic Island. */
export function PhoneFrame({ width, children, className, style }: PhoneFrameProps) {
  return (
    <div
      className={`${styles.frame} ${className ?? ""}`}
      style={{ "--frame-width": width, "--screen-aspect": SCREEN_ASPECT, ...style } as CSSProperties}
    >
      <span className={`${styles.button} ${styles.action}`} aria-hidden="true" />
      <span className={`${styles.button} ${styles.volumeUp}`} aria-hidden="true" />
      <span className={`${styles.button} ${styles.volumeDown}`} aria-hidden="true" />
      <span className={`${styles.button} ${styles.side}`} aria-hidden="true" />
      <div className={styles.screen}>{children}</div>
    </div>
  );
}
