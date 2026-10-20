"use client";

import { useRef, useState } from "react";
import { Lottie } from "lottie-react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { batAnimation } from "@/lottie/bat";
import { markIntroDone } from "@/lib/scroll";

const LOAD_SECONDS = 1.8;

export function Loader() {
  const rootRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const [isGone, setIsGone] = useState(false);

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const progress = { value: 0 };
      const timeline = gsap.timeline({
        onComplete: () => {
          setIsGone(true);
        },
      });

      timeline
        .to(progress, {
          value: 100,
          duration: reduced ? 0.2 : LOAD_SECONDS,
          ease: "power2.inOut",
          onUpdate: () => {
            if (countRef.current) countRef.current.textContent = String(Math.round(progress.value)).padStart(3, "0");
          },
        })
        .to(".loader-content", { yPercent: -40, opacity: 0, duration: 0.5, ease: "power3.in" })
        .add(markIntroDone)
        .to(rootRef.current, { yPercent: -100, duration: reduced ? 0.1 : 0.9, ease: "expo.inOut" }, "<");
    },
    { scope: rootRef },
  );

  if (isGone) return null;

  return (
    <div ref={rootRef} className="fixed inset-0 z-[80] flex items-center justify-center bg-ink text-bone" role="status">
      <div className="loader-content flex flex-col items-center gap-6">
        <div className="w-40 sm:w-56" aria-hidden>
          <Lottie src={batAnimation} loop autoplay className="aspect-[5/3] w-full" />
        </div>
        <p className="font-display text-6xl tracking-tight sm:text-8xl">
          <span ref={countRef}>000</span>
          <span className="text-pumpkin">%</span>
        </p>
        <p className="text-xs uppercase tracking-[0.4em] text-bone/60">Summoning the night</p>
      </div>
    </div>
  );
}
