"use client";

import { useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

const STRENGTH = 0.35;

/** Pulls its child toward the cursor while hovered. */
export function Magnetic({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const element = ref.current;
      if (!element || !window.matchMedia("(hover: hover)").matches) return;
      const toX = gsap.quickTo(element, "x", { duration: 0.6, ease: "elastic.out(1, 0.4)" });
      const toY = gsap.quickTo(element, "y", { duration: 0.6, ease: "elastic.out(1, 0.4)" });

      const onMove = (event: PointerEvent) => {
        const box = element.getBoundingClientRect();
        toX((event.clientX - (box.left + box.width / 2)) * STRENGTH);
        toY((event.clientY - (box.top + box.height / 2)) * STRENGTH);
      };
      const onLeave = () => {
        toX(0);
        toY(0);
      };

      element.addEventListener("pointermove", onMove);
      element.addEventListener("pointerleave", onLeave);
      return () => {
        element.removeEventListener("pointermove", onMove);
        element.removeEventListener("pointerleave", onLeave);
      };
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={`inline-block will-change-transform ${className}`}>
      {children}
    </div>
  );
}
