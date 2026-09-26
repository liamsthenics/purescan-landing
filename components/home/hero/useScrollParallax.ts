"use client";

import { useEffect, type RefObject } from "react";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Drifts an element vertically at `rate` × the scroll distance, so it moves
 * slower than the page. Transform-only, one write per frame, passive listener,
 * and only while the element is on screen. Does nothing when motion is reduced.
 */
export function useScrollParallax(elementRef: RefObject<HTMLElement | null>, rate: number): void {
  useEffect(() => {
    const element = elementRef.current;
    if (!element || window.matchMedia(REDUCED_MOTION_QUERY).matches) return;

    let frame = 0;
    const applyOffset = () => {
      frame = 0;
      element.style.transform = `translate3d(0, ${(window.scrollY * rate).toFixed(1)}px, 0)`;
    };
    const onScroll = () => {
      if (frame === 0) frame = requestAnimationFrame(applyOffset);
    };

    const visibility = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();
      } else {
        window.removeEventListener("scroll", onScroll);
      }
    });
    visibility.observe(element);

    return () => {
      visibility.disconnect();
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [elementRef, rate]);
}
