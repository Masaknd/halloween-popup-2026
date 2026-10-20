"use client";

import { useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

const MAX_TILT_DEG = 12;

/** 3D card that tilts toward the pointer, with a moving glare highlight. */
export function TiltCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const element = ref.current;
      if (!element || !window.matchMedia("(hover: hover)").matches) return;
      const glare = element.querySelector<HTMLElement>(".tilt-glare");
      const rotateX = gsap.quickTo(element, "rotationX", { duration: 0.5, ease: "power3" });
      const rotateY = gsap.quickTo(element, "rotationY", { duration: 0.5, ease: "power3" });

      const onMove = (event: PointerEvent) => {
        const box = element.getBoundingClientRect();
        const x = (event.clientX - box.left) / box.width - 0.5;
        const y = (event.clientY - box.top) / box.height - 0.5;
        rotateY(x * MAX_TILT_DEG * 2);
        rotateX(-y * MAX_TILT_DEG * 2);
        if (glare) {
          glare.style.background = `radial-gradient(circle at ${(x + 0.5) * 100}% ${(y + 0.5) * 100}%, rgb(255 216 74 / 0.35), transparent 55%)`;
        }
      };
      const onLeave = () => {
        rotateX(0);
        rotateY(0);
        if (glare) glare.style.background = "transparent";
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
    <div className="[perspective:900px]">
      <div ref={ref} className={`relative [transform-style:preserve-3d] will-change-transform ${className}`}>
        {children}
        <div aria-hidden className="tilt-glare pointer-events-none absolute inset-0 rounded-[inherit]" />
      </div>
    </div>
  );
}
