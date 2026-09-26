"use client";

import Image from "next/image";
import { useState } from "react";
import { PhoneFrame } from "@/components/phone/PhoneFrame";
import { CAPTURE_HEIGHT, CAPTURE_WIDTH, STORY_SCREENS, poseTransform, storyScreen, type StoryScreenId } from "@/lib/story";
import styles from "./Story.module.css";

/** How far the screen glare slides per degree of turn, as a percentage of its width. */
const GLARE_SHIFT_PER_DEGREE = 0.9;
/** The sticky phone is never wider than this, so the browser can pick a suitable image size. */
const CAPTURE_DISPLAY_SIZES = "312px";

interface StoryPhoneProps {
  activeScreen: StoryScreenId;
}

/** The sticky 3D phone: eases to each section's pose and cross-fades to its capture. */
export function StoryPhone({ activeScreen }: StoryPhoneProps) {
  // The outgoing screen stays visible underneath while the new one fades in.
  const [screens, setScreens] = useState({ current: activeScreen, previous: activeScreen });
  if (screens.current !== activeScreen) setScreens({ current: activeScreen, previous: screens.current });

  const pose = storyScreen(activeScreen).pose;

  return (
    <div className={styles.stage}>
      <div className={styles.floorShadow} aria-hidden="true" />
      <div className={styles.device} style={{ transform: poseTransform(pose) }}>
        <span className={`${styles.depth} ${styles.depthFar}`} aria-hidden="true" />
        <span className={`${styles.depth} ${styles.depthNear}`} aria-hidden="true" />
        <PhoneFrame width="var(--story-phone-width)" className={styles.face}>
          {STORY_SCREENS.map((screen) => {
            const isActive = screen.id === activeScreen;
            const isPrevious = !isActive && screen.id === screens.previous;
            return (
              <Image
                key={screen.id}
                src={screen.src}
                width={CAPTURE_WIDTH}
                height={CAPTURE_HEIGHT}
                sizes={CAPTURE_DISPLAY_SIZES}
                alt={isActive ? screen.alt : ""}
                aria-hidden={!isActive}
                data-state={isActive ? "active" : isPrevious ? "previous" : undefined}
                className={styles.capture}
              />
            );
          })}
          <span
            className={styles.glare}
            style={{ transform: `translateX(${pose.rotateY * GLARE_SHIFT_PER_DEGREE}%)` }}
            aria-hidden="true"
          />
        </PhoneFrame>
      </div>
    </div>
  );
}
