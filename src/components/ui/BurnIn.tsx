"use client";

import { useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { BURN, burnField, igniteWhenSeen } from "./burnField";
import { HIDDEN_MASK, paintBurn, setMask } from "./burnMask";
import { burnTimeline } from "./burnTimeline";

/** How long the block stays marked as burning after the last ember is out, so lighting that keys off it can linger. */
const LINGER_SECONDS = 1.2;
/** The burn mask's grid: cells across, and the fewest rows it keeps however wide the block is. */
const MASK_COLUMNS = 96;
const MASK_MIN_ROWS = 16;
const SEED = 7;

/**
 * Burns its children into view with a noise front and an ember rim, like the hero portrait, the first time the block
 * rises to BURN.igniteLine; the burn then runs on its own timer (BURN.seconds), from the first spark until the last ember
 * goes out. It burns through a CSS mask redrawn each frame (see burnMask), the same in every browser; the mask comes off
 * once the burn finishes so 3D tilts and hover effects inside work normally.
 * While it burns (and briefly after), the box carries `data-burning`, so a darkness laid over it can lift to let the flames show.
 */
interface BurnInProps {
  children: ReactNode;
  className?: string;
  /** Where on the screen the block ignites, if not at BURN.igniteLine. */
  igniteLine?: number;
}

export function BurnIn({ children, className = "", igniteLine }: BurnInProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const emberRef = useRef<HTMLCanvasElement>(null);

  useGSAP(
    () => {
      const box = boxRef.current;
      const ember = emberRef.current;
      if (!box || !ember) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setMask(box, "none");
        return;
      }
      const rows = Math.max(MASK_MIN_ROWS, Math.round((MASK_COLUMNS * box.offsetHeight) / Math.max(box.offsetWidth, 1)));
      const field = burnField(MASK_COLUMNS, rows, SEED);
      const mask = Object.assign(document.createElement("canvas"), { width: MASK_COLUMNS, height: rows });
      Object.assign(ember, { width: MASK_COLUMNS, height: rows });
      const burn = burnTimeline({
        paint: (reveal) => paintBurn(field, reveal, mask, ember, box),
        onStart: () => {
          box.dataset.burning = "";
        },
        onComplete: () => {
          setMask(box, "none");
          ember.hidden = true;
          gsap.delayedCall(LINGER_SECONDS, () => delete box.dataset.burning);
        },
      });
      return igniteWhenSeen(box, () => burn.play(), igniteLine);
    },
    { scope: boxRef },
  );

  // hidden from the first paint, so the content never shows before its burn
  return (
    <div ref={boxRef} className={className} style={{ maskImage: HIDDEN_MASK, WebkitMaskImage: HIDDEN_MASK, maskSize: "100% 100%", WebkitMaskSize: "100% 100%" }}>
      {children}
      {/* the ember rim, glowing like flame; the browser smooths it up to the block's size */}
      <canvas
        ref={emberRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 size-full"
        style={{ filter: `drop-shadow(0 0 6px ${BURN.emberColor})` }}
      />
    </div>
  );
}
