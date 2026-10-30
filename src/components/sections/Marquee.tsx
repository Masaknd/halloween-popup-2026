"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { AcanthusCrest, Drips, LiquidEdge } from "@/components/ui/Ornaments";
import { EVENT } from "@/lib/event";
import { onScrollVelocity } from "@/lib/scroll";

gsap.registerPlugin(ScrollTrigger);

const ITEMS = [
  EVENT.shortDate,
  EVENT.timeLabel,
  EVENT.venue.street,
  "Free entry",
  "BYOB",
  "Costumes encouraged",
];

/** Share of each drip's travel still tucked inside the ticker before you scroll; most streams start out of sight. */
const DRIP_HIDDEN = 1;

/** Ticker that skews and races with scroll velocity; wine bleeds down from it as you scroll. */
export function Marquee({ tone = "wine" }: { tone?: "wine" | "soot" }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const track = rootRef.current?.querySelector(".marquee-track");
      if (!track) return;
      const tween = gsap.to(track, { xPercent: -50, duration: 40, ease: "none", repeat: -1 });
      const skew = gsap.quickTo(track, "skewX", { duration: 0.4, ease: "power3" });
      let direction = 1;
      const unsubscribe = onScrollVelocity((velocity) => {
        if (Math.abs(velocity) > 0.2) direction = Math.sign(velocity);
        gsap.to(tween, { timeScale: direction * (1 + Math.min(Math.abs(velocity) * 0.3, 8)), duration: 0.3, overwrite: true });
        skew(gsap.utils.clamp(-14, 14, -velocity * 0.6));
      });

      // each stream slides down out of the pool as you scroll, so its bulb stays round while it lengthens
      const drips = gsap.utils.toArray<SVGGElement>(".drip", rootRef.current);
      if (drips.length === 0) return unsubscribe; // the soot ticker has no drips
      gsap.fromTo(
        drips,
        { y: (_index: number, drip: SVGGElement) => -Number(drip.dataset.length ?? 0) * DRIP_HIDDEN },
        {
          y: 0,
          ease: "none",
          stagger: { each: 0.04, from: "random" },
          // clamp() keeps the start at scroll 0 when the ticker is already on screen, so the pour always begins retracted
          scrollTrigger: { trigger: rootRef.current, start: "clamp(top bottom)", end: "top 15%", scrub: 0.6 },
        },
      );
      return unsubscribe;
    },
    { scope: rootRef },
  );

  const isWine = tone === "wine";
  const row = [...ITEMS, ...ITEMS];

  return (
    <div ref={rootRef} className="relative z-10" aria-hidden>
      <div className={`${isWine ? "bg-wine text-bone" : "bg-soot text-candle/80"} overflow-hidden py-3 sm:py-4`}>
        <div className="marquee-track flex w-max will-change-transform">
          {row.map((item, index) => (
            <span key={index} className="flex items-center font-marquee text-3xl sm:text-5xl lg:text-6xl">
              <span className="px-6 sm:px-10">{item}</span>
              <AcanthusCrest className="h-6 w-auto shrink-0 text-candle/60 sm:h-10" />
            </span>
          ))}
        </div>
      </div>
      {/* both edges of the band swell and sag like a pool of the paint that drips from it (each overlaps a pixel to hide the seam) */}
      {isWine ? <LiquidEdge seed={1} className="pointer-events-none absolute inset-x-0 bottom-full h-7 w-full translate-y-px text-wine sm:h-12" /> : null}
      {isWine ? <Drips className="pointer-events-none absolute inset-x-0 top-full h-44 w-full text-wine sm:h-64" /> : null}
      {isWine ? (
        <LiquidEdge seed={2} className="pointer-events-none absolute inset-x-0 top-full h-6 w-full -translate-y-px -scale-y-100 text-wine sm:h-10" />
      ) : null}
    </div>
  );
}
