"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { EVENT, slashZero } from "@/lib/event";
import { onScrollVelocity } from "@/lib/scroll";

const ITEMS = [
  EVENT.shortDate,
  slashZero(EVENT.timeLabel),
  EVENT.venue.street,
  `Advance CA$${EVENT.tickets[0].price}`,
  `Door CA$${EVENT.tickets[1].price}`,
  "Costumes encouraged",
];

/** Infinite ticker whose speed and direction follow the scroll velocity. */
export function Marquee({ tone = "dark" }: { tone?: "dark" | "orange" }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const tween = gsap.to(".marquee-track", { xPercent: -50, duration: 30, ease: "none", repeat: -1 });
      let direction = 1;
      const unsubscribe = onScrollVelocity((velocity) => {
        if (Math.abs(velocity) > 0.2) direction = Math.sign(velocity);
        gsap.to(tween, { timeScale: direction * (1 + Math.min(Math.abs(velocity) * 0.25, 6)), duration: 0.3, overwrite: true });
      });
      return unsubscribe;
    },
    { scope: rootRef },
  );

  const colors = tone === "dark" ? "bg-ink text-pumpkin" : "bg-pumpkin text-ink";
  const row = [...ITEMS, ...ITEMS];

  return (
    <div ref={rootRef} className={`${colors} overflow-hidden border-y border-ink py-3 sm:py-4`} aria-hidden>
      <div className="marquee-track flex w-max">
        {row.map((item, index) => (
          <span key={index} className="flex items-center font-display text-3xl uppercase sm:text-5xl lg:text-6xl">
            <span className="px-5 sm:px-8">{item}</span>
            <span className="text-bone">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
