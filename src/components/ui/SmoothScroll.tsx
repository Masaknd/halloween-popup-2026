"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { emitScrollVelocity, onIntroDone, setLenis } from "@/lib/scroll";

gsap.registerPlugin(ScrollTrigger);

export function SmoothScroll() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lenis = new Lenis({ lerp: reduced ? 1 : 0.1, smoothWheel: !reduced });
    setLenis(lenis);
    lenis.stop();
    const stopWaiting = onIntroDone(() => lenis.start());

    lenis.on("scroll", (instance: Lenis) => {
      ScrollTrigger.update();
      emitScrollVelocity(instance.velocity);
    });

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      stopWaiting();
      gsap.ticker.remove(tick);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  return null;
}
