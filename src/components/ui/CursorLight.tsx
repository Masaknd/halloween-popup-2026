"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

/** How long the light lags behind the cursor, like a candle carried by hand (seconds). */
const FOLLOW = 0.45;
/** Where the light rests before the cursor arrives and after it leaves, as fractions of the section. */
const REST = { x: 0.82, y: 0.12 } as const;

/**
 * Darkens its parent section except for a warm, flickering pool of candlelight that follows the cursor, echoing the
 * hero's WebGL light. The parent needs `relative`; the veil sits above the content but never takes pointer events.
 * Touch screens have no hover, so they skip the veil (see `.cursor-light` in globals.css) and the content stays lit.
 */
export function CursorLight() {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      const section = root?.parentElement;
      if (!root || !section) return;

      const restAt = () => ({ x: section.clientWidth * REST.x, y: section.clientHeight * REST.y });
      // GSAP eases a plain point; each frame writes it into the CSS variables the gradients read
      const light = restAt();
      const paint = () => {
        root.style.setProperty("--light-x", `${light.x}px`);
        root.style.setProperty("--light-y", `${light.y}px`);
      };
      paint();
      const moveX = gsap.quickTo(light, "x", { duration: FOLLOW, ease: "power3", onUpdate: paint });
      const moveY = gsap.quickTo(light, "y", { duration: FOLLOW, ease: "power3", onUpdate: paint });

      const onMove = (event: PointerEvent) => {
        const bounds = section.getBoundingClientRect();
        moveX(event.clientX - bounds.left);
        moveY(event.clientY - bounds.top);
      };
      const onLeave = () => {
        const { x, y } = restAt();
        moveX(x);
        moveY(y);
      };

      section.addEventListener("pointermove", onMove);
      section.addEventListener("pointerleave", onLeave);
      return () => {
        section.removeEventListener("pointermove", onMove);
        section.removeEventListener("pointerleave", onLeave);
      };
    },
    { scope: rootRef },
  );

  return (
    <div ref={rootRef} aria-hidden className="cursor-light pointer-events-none absolute inset-0 z-20">
      <div className="cursor-light-veil absolute inset-0" />
      <div className="cursor-light-glow absolute inset-0" />
    </div>
  );
}
