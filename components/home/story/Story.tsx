"use client";

import { useRef, type ReactNode } from "react";
import { StoryPhone } from "./StoryPhone";
import styles from "./Story.module.css";
import { useActiveStoryScreen } from "./useActiveStoryScreen";

interface StoryProps {
  /** The story sections, each marked with data-story-screen. */
  children: ReactNode;
}

/** Lays the sections beside the sticky phone and tells the phone which one is being read. */
export function Story({ children }: StoryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeScreen = useActiveStoryScreen(containerRef);

  return (
    <div ref={containerRef} className={`container-wide ${styles.story}`}>
      <div className={styles.sections}>{children}</div>
      <div className={styles.rail}>
        <StoryPhone activeScreen={activeScreen} />
      </div>
    </div>
  );
}
