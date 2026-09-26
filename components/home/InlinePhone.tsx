import Image from "next/image";
import type { ReactNode } from "react";
import { PhoneFrame } from "@/components/phone/PhoneFrame";
import { CAPTURE_HEIGHT, CAPTURE_WIDTH, type StoryScreen } from "@/lib/story";

const INLINE_PHONE_WIDTH = "clamp(13.5rem, 62vw, 17rem)";
/** Matches INLINE_PHONE_WIDTH's upper bound, so the browser picks a suitable image size. */
const INLINE_CAPTURE_SIZES = "(max-width: 440px) 62vw, 272px";

const ALIGN_CLASSES = { center: "justify-center", end: "justify-end" } as const;

interface InlinePhoneProps {
  screen: StoryScreen;
  align?: keyof typeof ALIGN_CLASSES;
  /** Art drawn behind the phone. */
  backdrop?: ReactNode;
  className?: string;
}

/** Below the story breakpoint: a flat phone under the section's text, in place of the sticky one. */
export function InlinePhone({ screen, align = "center", backdrop, className }: InlinePhoneProps) {
  return (
    <figure className={`relative isolate mt-14 flex story:hidden ${ALIGN_CLASSES[align]} ${className ?? ""}`}>
      {backdrop}
      <div className="drop-shadow-[0_28px_36px_rgba(20,32,26,0.22)]">
        <PhoneFrame width={INLINE_PHONE_WIDTH}>
          <Image
            src={screen.src}
            width={CAPTURE_WIDTH}
            height={CAPTURE_HEIGHT}
            sizes={INLINE_CAPTURE_SIZES}
            alt={screen.alt}
            className="h-full w-full object-cover"
          />
        </PhoneFrame>
      </div>
    </figure>
  );
}
