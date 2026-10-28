"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ChaosText } from "@/components/ui/ChaosText";
import { OrnamentRule } from "@/components/ui/Ornaments";
import { EVENT, FULL_ADDRESS } from "@/lib/event";
import { onIntroDone } from "@/lib/scroll";
import { useInView } from "@/lib/useInView";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { LightPanel } from "./LightPanel";

const GothicScene = dynamic(() => import("./GothicScene"), { ssr: false });
const WebScene = dynamic(() => import("./WebScene"), { ssr: false });

/** Candle-lit portrait in drifting fog, with the title tearing itself into place. */
export function Hero() {
  const rootRef = useRef<HTMLElement>(null);
  const isVisible = useInView(rootRef);
  const isMobile = useMediaQuery("(max-width: 767px)");

  useGSAP(
    (_, contextSafe) => {
      const root = rootRef.current;
      if (!root || !contextSafe) return;
      const fades = root.querySelectorAll(".hero-fade");
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.set(fades, { opacity: 0, y: 16, filter: "blur(8px)" });
      return onIntroDone(
        contextSafe(() => {
          gsap.to(fades, { opacity: 1, y: 0, filter: "blur(0px)", duration: 1.4, ease: "power3.out", stagger: 0.12, delay: 1.1 });
        }),
      );
    },
    { scope: rootRef },
  );

  return (
    <section id="top" ref={rootRef} className="relative h-[100svh] min-h-[640px] overflow-hidden bg-void">
      <div className="absolute inset-0">
        <GothicScene isMobile={isMobile} isActive={isVisible} />
      </div>

      <div className="pointer-events-none absolute left-0 top-0 z-10 aspect-square w-[16.8rem] sm:w-96 lg:w-[31.2rem]">
        <WebScene isActive={isVisible} />
      </div>
      <LightPanel />
      {/* keeps the title legible where it crosses the portrait on phones */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[45%] bg-gradient-to-t from-void via-void/80 to-transparent md:hidden" />

      <p className="hero-fade label vertical-text pointer-events-none absolute right-3 top-1/2 z-20 hidden -translate-y-1/2 text-bone/60 md:block">
        {EVENT.shortDate} · {EVENT.timeLabel} · {EVENT.venue.street}
      </p>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 px-4 pb-8 sm:px-6 md:w-[62%] lg:w-[56%] lg:px-10 lg:pb-12">
        <p className="hero-fade label mb-4 text-candle/80">All Hallows&apos; Eve · MMXXVI</p>
        <h1 aria-label={`${EVENT.title}`} className="leading-[0.78]">
          <ChaosText
            text="Halloween"
            mode="intro"
            intensity={1.4}
            className="block font-display text-[19vw] italic text-bone md:text-[10.5vw]"
          />
          <ChaosText
            text="Party"
            mode="intro"
            intensity={1.2}
            delay={0.35}
            className="-mt-[0.08em] block pl-[18%] font-blackletter text-[19vw] text-blood md:text-[9.5vw]"
          />
        </h1>
        <OrnamentRule className="hero-fade my-5 w-64 text-candle/50 sm:w-80" />
        <div className="hero-fade flex flex-col gap-1 text-lg italic text-bone/85 sm:text-xl">
          <p>
            {EVENT.dateLabel}, from ten until five
          </p>
          <p className="text-bone/60">{FULL_ADDRESS}</p>
        </div>
        <p className="hero-fade label mt-5 text-bone/45">Carry the candle · click to wake the bats</p>
      </div>

      <div className="hero-fade pointer-events-none absolute bottom-6 right-4 z-20 hidden flex-col items-center gap-3 sm:right-8 md:flex">
        <span className="label text-bone/50">Descend</span>
        <span className="block h-14 w-px origin-top animate-pulse bg-gradient-to-b from-candle/80 to-transparent" />
      </div>
    </section>
  );
}
