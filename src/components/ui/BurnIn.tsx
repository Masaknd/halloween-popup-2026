"use client";

import { useId, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { BURN, burnField, burnFront, igniteWhenSeen } from "./burnField";
import { HIDDEN_MASK, paintBurn, setMask } from "./burnMask";

/** How long the block stays marked as burning after the flames finish, so lighting that keys off it can linger. */
const LINGER_SECONDS = 1.2;
/** feTurbulence's alpha channel (the one free of premultiplication) only spans about this range; rescale it to 0..1. */
const NOISE_LOW = 0.25;
const NOISE_SPAN = 0.3;
/** The mask burn's grid: cells across, and the fewest rows it keeps however wide the block is. */
const MASK_COLUMNS = 96;
const MASK_MIN_ROWS = 16;
const SEED = 7;

/** Draws one moment of the burn (reveal 0..1), and clears away whatever drew it once the burn is done. */
interface BurnPainter {
  paint: (reveal: number) => void;
  finish: () => void;
}

/**
 * WebKit (Safari, and every browser on iPhone) draws SVG filters in software and redraws them every frame, which made
 * the page stutter while blocks burnt; there the block burns through a mask instead.
 */
const burnsThroughMask = (): boolean => {
  const agent = navigator.userAgent;
  return /AppleWebKit/.test(agent) && !/(Chrome|Chromium|Edg)\//.test(agent);
};

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

/** Burns through the SVG filter the block is rendered with; the filter comes off once the burn is done. */
function filterPainter(box: HTMLElement, filter: SVGFilterElement | null): BurnPainter {
  const [shown, rim] = filter ? Array.from(filter.querySelectorAll("feColorMatrix")) : [];
  filter?.querySelector("feTurbulence")?.setAttribute("baseFrequency", String(BURN.noiseCells / Math.max(box.offsetWidth, 1)));
  return {
    paint: (reveal) => {
      const rows = frontRows(reveal);
      shown?.setAttribute("values", rows.shown);
      rim?.setAttribute("values", rows.rim);
    },
    finish: () => {
      box.style.filter = "none";
    },
  };
}

/** Swaps the filter for a mask shaped like the block, and the filter's ember rim for one painted on `ember`. */
function maskPainter(box: HTMLElement, ember: HTMLCanvasElement): BurnPainter {
  const rows = Math.max(MASK_MIN_ROWS, Math.round((MASK_COLUMNS * box.offsetHeight) / Math.max(box.offsetWidth, 1)));
  const field = burnField(MASK_COLUMNS, rows, SEED);
  const mask = Object.assign(document.createElement("canvas"), { width: MASK_COLUMNS, height: rows });
  Object.assign(ember, { width: MASK_COLUMNS, height: rows, hidden: false });
  box.style.setProperty("mask-size", "100% 100%");
  box.style.setProperty("-webkit-mask-size", "100% 100%");
  setMask(box, HIDDEN_MASK);
  box.style.filter = "none";
  return {
    paint: (reveal) => paintBurn(field, reveal, mask, ember, box),
    finish: () => {
      setMask(box, "none");
      ember.hidden = true;
    },
  };
}

/**
 * Burns its children into view with a noise front and an ember rim, like the hero portrait, the first time the block
 * rises to BURN.igniteLine; the burn then runs on its own timer (BURN.seconds). The filter (or mask) is removed once the burn
 * finishes so 3D tilts and hover effects inside work normally.
 * While it burns (and briefly after), the box carries `data-burning`, so a darkness laid over it can lift to let the flames show.
 */
interface BurnInProps {
  children: ReactNode;
  className?: string;
  /** Where on the screen the block ignites, if not at BURN.igniteLine. */
  igniteLine?: number;
}

export function BurnIn({ children, className = "", igniteLine }: BurnInProps) {
  const filterId = `burn-${useId().replace(/[^a-zA-Z0-9-]/g, "")}`;
  const boxRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<SVGFilterElement>(null);
  const emberRef = useRef<HTMLCanvasElement>(null);

  useGSAP(
    () => {
      const box = boxRef.current;
      const ember = emberRef.current;
      if (!box || !ember) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        box.style.filter = "none";
        return;
      }
      const painter = burnsThroughMask() ? maskPainter(box, ember) : filterPainter(box, filterRef.current);
      const progress = { value: 0 };
      const burn = gsap.to(progress, {
        value: 1,
        duration: BURN.seconds,
        ease: BURN.ease,
        paused: true,
        onUpdate: () => painter.paint(progress.value),
        onStart: () => {
          box.dataset.burning = "";
        },
        onComplete: () => {
          painter.finish();
          gsap.delayedCall(LINGER_SECONDS, () => delete box.dataset.burning);
        },
      });
      return igniteWhenSeen(box, () => burn.play(), igniteLine);
    },
    { scope: boxRef },
  );

  const hidden = frontRows(0);
  return (
    <div ref={boxRef} className={className} style={{ filter: `url(#${filterId})` }}>
      <svg aria-hidden className="pointer-events-none absolute size-0">
        <filter ref={filterRef} id={filterId} x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.004" numOctaves="4" seed="7" result="noise" />
          <feColorMatrix in="noise" values={hidden.shown} result="shown" />
          <feColorMatrix in="noise" values={hidden.rim} result="near" />
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
      {/* the mask burn's ember rim; the browser smooths it up to the block's size */}
      <canvas ref={emberRef} aria-hidden hidden className="pointer-events-none absolute inset-0 size-full" />
    </div>
  );
}
