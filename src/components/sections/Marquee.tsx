"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Drips } from "@/components/ui/Ornaments";
import { EVENT } from "@/lib/event";
import { onScrollVelocity } from "@/lib/scroll";

gsap.registerPlugin(ScrollTrigger);

const ITEMS = [
  EVENT.shortDate,
  EVENT.timeLabel,
  EVENT.venue.street,
  `Advance CA$${EVENT.tickets[0].price}`,
  `Door CA$${EVENT.tickets[1].price}`,
  "Costumes encouraged",
];

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

      gsap.fromTo(
        gsap.utils.toArray<SVGGElement>(".drip", rootRef.current),
        { scaleY: 0.15, transformOrigin: "50% 0%" },
        {
          scaleY: 1,
          ease: "none",
          stagger: { each: 0.04, from: "random" },
          scrollTrigger: { trigger: rootRef.current, start: "top 80%", end: "bottom 10%", scrub: 1 },
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
            <span key={index} className="flex items-center font-display text-3xl font-light italic sm:text-5xl lg:text-6xl">
              <span className="px-6 sm:px-10">{item}</span>
              <span className="text-2xl not-italic text-candle/60 sm:text-4xl">❦</span>
            </span>
          ))}
        </div>
      </div>
      {isWine ? <Drips className="pointer-events-none absolute inset-x-0 top-full h-16 w-full text-wine sm:h-24" /> : null}
    </div>
  );
}
