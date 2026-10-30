"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { BURN, burnField, igniteWhenSeen } from "./burnField";
import { HIDDEN_MASK, paintBurn, setMask } from "./burnMask";

/** Cells across the (square) burn mask; the round map it opens is about as tall as it is wide. */
const MASK_SIZE = 96;
const SEED = 7;

/**
 * The burn-in for content an SVG filter can't reach, such as a cross-origin iframe, which browsers composite apart
 * from any filter on its ancestors. It burns the block open through a CSS mask redrawn each frame from the same noise
 * front as BurnIn, with the ember rim on a canvas laid over it. It ignites with its parent block, at the same moment
 * and speed as a BurnIn filling that parent, so the two read as one fire.
 */
interface BurnRevealProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Where on the screen the parent block ignites, if not at BURN.igniteLine; match the BurnIn that fills it. */
  igniteLine?: number;
}

export function BurnReveal({ children, className = "", style, igniteLine }: BurnRevealProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const emberRef = useRef<HTMLCanvasElement>(null);

  useGSAP(() => {
    const box = boxRef.current;
    const ember = emberRef.current;
    const block = box?.parentElement;
    if (!box || !ember || !block) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setMask(box, "none");
      return;
    }
    const field = burnField(MASK_SIZE, MASK_SIZE, SEED);
    const mask = Object.assign(document.createElement("canvas"), { width: MASK_SIZE, height: MASK_SIZE });
    const progress = { value: 0 };
    const burn = gsap.to(progress, {
      value: 1,
      duration: BURN.seconds,
      ease: BURN.ease,
      paused: true,
      onUpdate: () => paintBurn(field, progress.value, mask, ember, box),
      onComplete: () => {
        setMask(box, "none");
        ember.getContext("2d")?.clearRect(0, 0, MASK_SIZE, MASK_SIZE);
      },
    });
    // ignite with the parent block, like BurnIn, then burn on its own clock
    return igniteWhenSeen(block, () => burn.play(), igniteLine);
  });

  // hidden from the first paint, so the content never shows before its burn
  const hidden: CSSProperties = { maskImage: HIDDEN_MASK, WebkitMaskImage: HIDDEN_MASK, maskSize: "100% 100%", WebkitMaskSize: "100% 100%" };
  return (
    <>
      <div ref={boxRef} className={className} style={{ ...style, ...hidden }}>
        {children}
      </div>
      {/* a canvas keeps its own size when positioned, so a box of the same shape stretches it */}
      <div aria-hidden className={`pointer-events-none ${className}`} style={style}>
        <canvas
          ref={emberRef}
          width={MASK_SIZE}
          height={MASK_SIZE}
          className="size-full"
          style={{ filter: `drop-shadow(0 0 6px ${BURN.emberColor})` }}
        />
      </div>
    </>
  );
}
