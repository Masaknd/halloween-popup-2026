"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { FitText } from "@/components/ui/FitText";
import { EVENT, FULL_ADDRESS, slashZero } from "@/lib/event";
import { onIntroDone } from "@/lib/scroll";
import { useMediaQuery } from "@/lib/useMediaQuery";

gsap.registerPlugin(ScrollTrigger);

const HauntedScene = dynamic(() => import("./HauntedScene"), { ssr: false });

const splitChars = (word: string) =>
  word.split("").map((char, index) => (
    <span key={`${char}-${index}`} className="hero-char inline-block will-change-transform">
      {char}
    </span>
  ));

export function Hero() {
  const rootRef = useRef<HTMLElement>(null);
  const scrollRef = useRef(0);
  const [isVisible, setIsVisible] = useState(true);
  const isMobile = useMediaQuery("(max-width: 767px)");

  useEffect(() => {
    const element = rootRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setIsVisible(entry?.isIntersecting ?? true));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useGSAP(
    (_, contextSafe) => {
      if (!contextSafe) return;
      const root = rootRef.current;
      if (!root) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const chars = root.querySelectorAll(".hero-char");
      const fades = root.querySelectorAll(".hero-fade");
      gsap.set(chars, { yPercent: reduced ? 0 : 125 });
      gsap.set(fades, { opacity: reduced ? 1 : 0, y: reduced ? 0 : 24 });

      const playIntro = contextSafe(() => {
        gsap
          .timeline()
          .to(chars, { yPercent: 0, duration: 1.1, ease: "expo.out", stagger: 0.035 })
          .to(fades, { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.1 }, "-=0.7");
      });
      const stopWaiting = onIntroDone(playIntro);

      ScrollTrigger.create({
        trigger: rootRef.current,
        start: "top top",
        end: "bottom top",
        onUpdate: (self) => {
          scrollRef.current = self.progress;
        },
      });

      gsap.to(".hero-title-top", {
        xPercent: -12,
        ease: "none",
        scrollTrigger: { trigger: rootRef.current, start: "top top", end: "bottom top", scrub: true },
      });
      gsap.to(".hero-title-bottom", {
        xPercent: 10,
        ease: "none",
        scrollTrigger: { trigger: rootRef.current, start: "top top", end: "bottom top", scrub: true },
      });

      return stopWaiting;
    },
    { scope: rootRef },
  );

  return (
    <section
      id="top"
      ref={rootRef}
      className="relative flex min-h-[100svh] flex-col overflow-hidden bg-bone pt-16 lg:pt-14"
      aria-label="Halloween Party"
    >
      <h1 className="sr-only">
        Halloween Party — {EVENT.dateLabel}, {EVENT.timeLabel}
      </h1>

      <div aria-hidden className="hero-title-top relative z-0 overflow-hidden px-2 font-display leading-[0.82] sm:px-4">
        <FitText className="text-[20vw]">{splitChars("HALLOWEEN")}</FitText>
      </div>
      <div aria-hidden className="relative z-0 flex justify-end overflow-hidden px-2 sm:px-4">
        <div className="hero-title-bottom w-[62%] font-display leading-[0.82] md:w-[56%]">
          <FitText className="text-[20vw]">{splitChars("PARTY")}</FitText>
        </div>
      </div>

      {/* 3D scene floats over the type, like the house overlapping the poster headline */}
      <div className="absolute inset-x-0 bottom-28 top-[22vw] z-10 sm:bottom-24 md:top-[18vw] lg:bottom-16">
        <HauntedScene scrollRef={scrollRef} isMobile={isMobile} isActive={isVisible} />
      </div>

      <p className="hero-fade vertical-text absolute left-3 top-[46vw] z-20 text-[clamp(1rem,3.4vw,3rem)] font-medium uppercase leading-[1.05] sm:left-6 md:top-[24vw]">
        {EVENT.dateLabel}
        <br />
        AT {slashZero("22:00")}
      </p>

      <div className="relative z-20 mt-auto grid grid-cols-1 gap-4 px-4 pb-6 sm:grid-cols-2 sm:px-6 lg:px-10 lg:pb-8">
        <p className="hero-fade text-lg font-semibold uppercase leading-tight sm:text-xl lg:text-3xl">
          You are invited
          <br />
          to our Halloween party!
        </p>
        <div className="hero-fade text-sm uppercase leading-relaxed sm:text-right lg:text-lg">
          <p>{FULL_ADDRESS}</p>
          <p>
            {slashZero(EVENT.timeLabel)} · Adv CA${EVENT.tickets[0].price} · Door CA${EVENT.tickets[1].price}
          </p>
          <p className="mt-1 text-xs tracking-[0.3em] text-pumpkin">↓ Click the house · scroll down</p>
        </div>
      </div>
    </section>
  );
}
