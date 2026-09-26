// The homepage "story": each section from the hero to the additive index shows
// one real app capture on the sticky phone (public/screens, made from the iOS
// repo's docs/appstore/raw captures of the fictional demo products).

export type StoryScreenId = "hero" | "one-tap" | "ask" | "score" | "sources" | "compare" | "additives";

/** Pixel size of every capture in public/screens (1206 × 2622 originals, scaled to 800 wide). */
export const CAPTURE_WIDTH = 800;
export const CAPTURE_HEIGHT = 1740;

/** The larger Home Screen crop for the one-tap section. */
export const WIDGET_CROP = { src: "/screens/widgets-home-crop.webp", width: 960, height: 1147 } as const;

/** Rotation of the 3D phone in degrees: a few degrees either way, never a spin. */
export interface PhonePose {
  rotateX: number;
  rotateY: number;
  rotateZ: number;
}

export interface StoryScreen {
  id: StoryScreenId;
  src: string;
  alt: string;
  pose: PhonePose;
}

export const STORY_SCREENS: readonly StoryScreen[] = [
  {
    id: "hero",
    src: "/screens/hero.webp",
    alt: "PureScan’s result for Fizzbrook Original Cola, a fictional product: 25 out of 100, rated Poor, capped at 40 for three ingredients of moderate concern.",
    pose: { rotateX: 6, rotateY: -16, rotateZ: 2 },
  },
  {
    id: "one-tap",
    src: "/screens/widgets-home.webp",
    alt: "An iPhone Home Screen with PureScan’s Scan widget and a widget listing recent scores.",
    pose: { rotateX: 5, rotateY: -10, rotateZ: 0.5 },
  },
  {
    id: "ask",
    src: "/screens/ask-followup.webp",
    alt: "Ask PureScan answering “Why is E150d flagged?” and “Is it banned anywhere?”, each answer linking an EFSA source.",
    pose: { rotateX: 5, rotateY: 13, rotateZ: -1.5 },
  },
  {
    id: "score",
    src: "/screens/nutrition.webp",
    alt: "The nutrition and processing parts of Original Cola’s score: sugars 10.6 g per 100 ml, high; NOVA 4, ultra-processed.",
    pose: { rotateX: 7, rotateY: -12, rotateZ: 1 },
  },
  {
    id: "sources",
    src: "/screens/detail.webp",
    alt: "The page for sulphite ammonia caramel (E150d): moderate concern, why it is flagged, and its EFSA source from 2011.",
    pose: { rotateX: 4, rotateY: 12, rotateZ: -1 },
  },
  {
    id: "compare",
    src: "/screens/compare.webp",
    alt: "This vs That comparing Original Cola, 25 and Poor, with Sparkling Lemon & Lime, 93 and Great, point by point.",
    pose: { rotateX: 6, rotateY: -13, rotateZ: 1.5 },
  },
  {
    id: "additives",
    src: "/screens/inside.webp",
    alt: "What’s inside Original Cola: three flagged ingredients, each rated moderate concern.",
    pose: { rotateX: 5, rotateY: 14, rotateZ: -1 },
  },
];

export const FIRST_STORY_SCREEN: StoryScreenId = "hero";

/** Story sections mark themselves with this attribute; its value is a StoryScreenId. */
export const STORY_SCREEN_ATTRIBUTE = "data-story-screen";

export function storyScreen(id: StoryScreenId): StoryScreen {
  const screen = STORY_SCREENS.find((candidate) => candidate.id === id);
  if (!screen) throw new Error(`Unknown story screen: ${id}`);
  return screen;
}

export function isStoryScreenId(value: string | undefined): value is StoryScreenId {
  return STORY_SCREENS.some((screen) => screen.id === value);
}

/** CSS transform for a pose, applied to the phone so only the compositor does the work. */
export function poseTransform(pose: PhonePose): string {
  return `rotateX(${pose.rotateX}deg) rotateY(${pose.rotateY}deg) rotateZ(${pose.rotateZ}deg)`;
}
