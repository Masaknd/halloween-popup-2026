/** The clock every burning block runs on: the front sweeps it open, from the first spark to the last ember going out. */

import { gsap } from "gsap";
import { BURN } from "./burnField";

interface BurnTimelineOptions {
  /** Draws the burn at `reveal` (0..1). */
  paint: (reveal: number) => void;
  onStart?: () => void;
  /** Runs once the last ember is out, so whatever drew the burn can come off without a visible jump. */
  onComplete?: () => void;
}

/** A paused tween that burns the block fully open over BURN.seconds. */
export function burnTimeline({ paint, onStart, onComplete }: BurnTimelineOptions): gsap.core.Tween {
  const progress = { reveal: 0 };
  return gsap.to(progress, {
    reveal: 1,
    duration: BURN.seconds,
    ease: BURN.ease,
    paused: true,
    onStart,
    onComplete,
    onUpdate: () => paint(progress.reveal),
  });
}
