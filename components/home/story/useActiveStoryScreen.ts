"use client";

import { useEffect, useState, type RefObject } from "react";
import { FIRST_STORY_SCREEN, STORY_SCREEN_ATTRIBUTE, isStoryScreenId, type StoryScreenId } from "@/lib/story";

/**
 * A thin horizontal band just above the middle of the viewport. Whichever
 * section crosses it is the one being read, so exactly one is active at a time.
 */
const READING_LINE_ROOT_MARGIN = "-42% 0px -57% 0px";

/** The story section currently being read, tracked with an IntersectionObserver (no scroll handlers). */
export function useActiveStoryScreen(containerRef: RefObject<HTMLElement | null>): StoryScreenId {
  const [activeScreen, setActiveScreen] = useState<StoryScreenId>(FIRST_STORY_SCREEN);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const sections = container.querySelectorAll<HTMLElement>(`[${STORY_SCREEN_ATTRIBUTE}]`);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const screen = entry.target.getAttribute(STORY_SCREEN_ATTRIBUTE) ?? undefined;
          if (entry.isIntersecting && isStoryScreenId(screen)) setActiveScreen(screen);
        }
      },
      { rootMargin: READING_LINE_ROOT_MARGIN },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [containerRef]);

  return activeScreen;
}
