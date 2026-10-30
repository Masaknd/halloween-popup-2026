"use client";

import { useId, useRef, type ElementType } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { onIntroDone } from "@/lib/scroll";
import { FINE_POINTER_QUERY } from "@/lib/useMediaQuery";

gsap.registerPlugin(ScrollTrigger);

type Tag = "h1" | "h2" | "h3" | "p" | "span" | "div";

interface ChaosTextProps {
  text: string;
  as?: Tag;
  className?: string;
  /** "scroll" scrubs the melt with scroll position; "intro" plays once after the loader. */
  mode?: "scroll" | "intro";
  /** Peak distortion; big display type can take more. */
  intensity?: number;
  delay?: number;
}

const FLASH_STEPS = 7;
const FLASH_SPREAD_EM = 1.6;
const FLASH_DURATION = 0.7;
const MAX_BLUR = 10;
/**
 * The phone melt, drawn only with what the GPU moves and blurs on its own: each letter hangs below its place,
 * stretched and blurred, and drips back up as the heading scrolls in. Values are at full melt, before each letter's
 * own random share (DRIP_SPREAD) is applied.
 */
const DRIP = { fallPercent: 45, stretch: 0.7, blurShare: 0.5 } as const;
const DRIP_SPREAD = { min: 0.4, max: 1.3 } as const;

/**
 * Text that arrives out of chaos: each letter flashes at random offsets
 * (opacity climbing with every jump) before snapping home, while an SVG
 * goo + turbulence filter melts and tears the word until it settles.
 */
export function ChaosText({ text, as = "span", className = "", mode = "scroll", intensity = 1, delay = 0 }: ChaosTextProps) {
  const rootRef = useRef<HTMLElement>(null);
  const filterId = `chaos-${useId().replace(/[^a-zA-Z0-9-]/g, "")}`;
  const words = text.split(" ");

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const blur = root.querySelector("feGaussianBlur");
      const displace = root.querySelector("feDisplacementMap");
      const turbulence = root.querySelector("feTurbulence");
      const chars = gsap.utils.toArray<HTMLElement>(".chaos-char", root);
      const fontSize = parseFloat(getComputedStyle(root).fontSize) || 16;
      const spread = fontSize * FLASH_SPREAD_EM;
      const state = { melt: 1 };

      const meltWithFilter = () => {
        const melt = state.melt;
        blur?.setAttribute("stdDeviation", String(melt * MAX_BLUR * intensity));
        displace?.setAttribute("scale", String(melt * 140 * intensity));
        turbulence?.setAttribute("baseFrequency", `${0.01 + melt * 0.02} ${0.25 + melt * 0.5}`);
        root.style.filter = melt < 0.01 ? "none" : `url(#${filterId})`;
      };
      const drips = chars.map(() => gsap.utils.random(DRIP_SPREAD.min, DRIP_SPREAD.max));
      const meltWithDrip = () => {
        const melt = state.melt;
        chars.forEach((char, index) => {
          const share = melt * drips[index];
          gsap.set(char, {
            yPercent: share * DRIP.fallPercent,
            scaleY: 1 + share * DRIP.stretch,
            transformOrigin: "50% 0%",
            filter: melt < 0.01 ? "none" : `blur(${share * MAX_BLUR * intensity * DRIP.blurShare}px)`,
          });
        });
      };
      // phones scroll the headings in with the drip: re-running the SVG melt filter on a big heading every scroll frame
      // is drawn in software on iPhones and made them stutter (the intro plays before any scrolling, so it keeps the filter)
      const applyMelt = mode === "intro" || window.matchMedia(FINE_POINTER_QUERY).matches ? meltWithFilter : meltWithDrip;

      const flash = () => {
        const timeline = gsap.timeline({ delay });
        chars.forEach((char) => {
          const start = Math.random() * 0.35;
          for (let step = 0; step < FLASH_STEPS; step += 1) {
            timeline.set(
              char,
              {
                x: gsap.utils.random(-spread, spread),
                y: gsap.utils.random(-spread * 0.6, spread * 0.6),
                opacity: (step + 1) / FLASH_STEPS,
              },
              start + (step * FLASH_DURATION) / FLASH_STEPS,
            );
          }
          timeline.set(char, { x: 0, y: 0, opacity: 1 }, start + FLASH_DURATION);
        });
        return timeline;
      };

      gsap.set(chars, { opacity: 0 });
      applyMelt();

      if (mode === "intro") {
        return onIntroDone(() => {
          flash();
          gsap.to(state, { melt: 0, duration: 1.8, delay, ease: "power3.out", onUpdate: applyMelt });
        });
      }

      ScrollTrigger.create({
        trigger: root,
        start: "clamp(top 92%)",
        onEnter: () => flash(),
        onLeaveBack: () => gsap.set(chars, { opacity: 0 }),
      });
      gsap.to(state, {
        melt: 0,
        ease: "none",
        onUpdate: applyMelt,
        // clamp() so headings near the end of the page still fully resolve
        scrollTrigger: { trigger: root, start: "clamp(top 95%)", end: "clamp(top 45%)", scrub: 0.6 },
      });
    },
    { scope: rootRef },
  );

  const Tag = as as ElementType;
  return (
    <Tag ref={rootRef} className={`relative ${className}`} aria-label={text}>
      <svg width="0" height="0" aria-hidden className="absolute">
        <filter id={filterId} x="-20%" y="-40%" width="140%" height="180%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="0" result="blur" />
          <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
          <feTurbulence type="fractalNoise" baseFrequency="0.01 0.25" numOctaves="2" seed="3" result="noise" />
          <feDisplacementMap in="goo" in2="noise" scale="0" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
      {words.map((word, wordIndex) => (
        <span key={`${word}-${wordIndex}`} aria-hidden className="inline-block whitespace-nowrap">
          {word.split("").map((char, charIndex) => (
            <span key={charIndex} className="chaos-char inline-block will-change-transform">
              {char}
            </span>
          ))}
          {wordIndex < words.length - 1 ? <span className="inline-block">&nbsp;</span> : null}
        </span>
      ))}
    </Tag>
  );
}
