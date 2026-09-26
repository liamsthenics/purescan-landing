import type { ReactNode } from "react";
import { STORY_SCREEN_ATTRIBUTE, storyScreen, type StoryScreenId } from "@/lib/story";
import { InlinePhone } from "./InlinePhone";

interface StorySectionProps {
  /** Which capture the phone shows while this section is being read. */
  screen: StoryScreenId;
  id: string;
  headingId: string;
  /** Set false when the section already shows its capture another way. */
  showInlinePhone?: boolean;
  children: ReactNode;
}

/** One chapter of the story, with a hairline above it and its capture inline on small screens. */
export function StorySection({ screen, id, headingId, showInlinePhone = true, children }: StorySectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      {...{ [STORY_SCREEN_ATTRIBUTE]: screen }}
      className="border-t border-hairline py-[clamp(5rem,4rem+5vw,9.5rem)]"
    >
      {children}
      {showInlinePhone && <InlinePhone screen={storyScreen(screen)} />}
    </section>
  );
}
