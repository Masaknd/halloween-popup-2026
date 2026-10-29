"use client";

import { useId, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { BURN, burnFront } from "./burnField";

/** How long the block stays marked as burning after the flames finish, so lighting that keys off it can linger. */
const LINGER_SECONDS = 1.2;
/** feTurbulence's alpha channel (the one free of premultiplication) only spans about this range; rescale it to 0..1. */
const NOISE_LOW = 0.25;
const NOISE_SPAN = 0.3;

/**
 * Reveal progress 0..1 → colour-matrix rows that threshold the noise alpha, as in the hero shader:
 * front = reveal * 1.25 - 0.12 - noise, shown where front > 0, ember rim where 0 < front < BURN.rim.
 */
function frontRows(reveal: number): { shown: string; rim: string } {
  // n = (alpha - NOISE_LOW) / NOISE_SPAN, so front - n is linear in alpha
  const front = burnFront(reveal) + NOISE_LOW / NOISE_SPAN;
  const perAlpha = 1 / NOISE_SPAN;
  return {
    shown: `0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 ${-perAlpha / BURN.edge} ${front / BURN.edge}`,
    rim: `0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 ${perAlpha / BURN.rim} ${1 - front / BURN.rim}`,
  };
}

/**
 * Burns its children into view with a noise front and an ember rim, like the hero portrait, the first time the block
 * comes into view; the burn then runs on a timer at the hero's speed. The filter is removed once the burn finishes so 3D tilts and hover effects inside work normally.
 * While it burns (and briefly after), the box carries `data-burning`, so a darkness laid over it can lift to let the flames show.
 */
export function BurnIn({ children, className = "" }: { children: ReactNode; className?: string }) {
  const filterId = `burn-${useId().replace(/[^a-zA-Z0-9-]/g, "")}`;
  const boxRef = useRef<HTMLDivElement>(null);
  const noiseRef = useRef<SVGFETurbulenceElement>(null);
  const shownRef = useRef<SVGFEColorMatrixElement>(null);
  const rimRef = useRef<SVGFEColorMatrixElement>(null);

  useGSAP(
    () => {
      const box = boxRef.current;
      if (!box) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        box.style.filter = "none";
        return;
      }
      noiseRef.current?.setAttribute("baseFrequency", String(BURN.noiseCells / Math.max(box.offsetWidth, 1)));
      const progress = { value: 0 };
      const apply = () => {
        const rows = frontRows(progress.value);
        shownRef.current?.setAttribute("values", rows.shown);
        rimRef.current?.setAttribute("values", rows.rim);
      };
      const burn = gsap.to(progress, {
        value: 1,
        duration: BURN.seconds,
        ease: BURN.ease,
        paused: true,
        onUpdate: apply,
        onStart: () => {
          box.dataset.burning = "";
        },
        onComplete: () => {
          box.style.filter = "none";
          gsap.delayedCall(LINGER_SECONDS, () => delete box.dataset.burning);
        },
      });
      // ignite once when the block is in view, then burn on its own clock, independent of scrolling
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry?.isIntersecting) return;
          observer.disconnect();
          burn.play();
        },
        { threshold: BURN.visibleShare },
      );
      observer.observe(box);
      return () => observer.disconnect();
    },
    { scope: boxRef },
  );

  const hidden = frontRows(0);
  return (
    <div ref={boxRef} className={className} style={{ filter: `url(#${filterId})` }}>
      <svg aria-hidden className="pointer-events-none absolute size-0">
        <filter id={filterId} x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
          <feTurbulence ref={noiseRef} type="fractalNoise" baseFrequency="0.004" numOctaves="4" seed="7" result="noise" />
          <feColorMatrix ref={shownRef} in="noise" values={hidden.shown} result="shown" />
          <feColorMatrix ref={rimRef} in="noise" values={hidden.rim} result="near" />
          {/* the rim is the thin band just behind the front: revealed and still near it */}
          <feComposite in="shown" in2="near" operator="arithmetic" k1="1" result="rimBand" />
          <feFlood floodColor={BURN.emberColor} />
          <feComposite in2="rimBand" operator="in" />
          <feComposite in2="SourceAlpha" operator="in" result="ember" />
          <feGaussianBlur in="ember" stdDeviation="4" result="glow" />
          <feComposite in="SourceGraphic" in2="shown" operator="in" result="content" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="content" />
            <feMergeNode in="ember" />
          </feMerge>
        </filter>
      </svg>
      {children}
    </div>
  );
}
