"use client";

import { useEffect, useRef } from "react";
import { blobPath, blobPoints } from "@/lib/blob";
import { TOMB_PATH } from "@/lib/shapes";

const BLOT = { count: 9, cx: 0.5, cy: 0.5, radius: 0.47, wobble: 0.06, phases: [0, 2.1, 4.4, 1.3, 3.7, 5.2, 0.8, 2.9, 4.9] };
const FRAME_MS = 1000 / 30;

/** Shared clip paths in objectBoundingBox units, so any element can wear them via CSS. */
export function OrganicDefs() {
  const blotRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const path = blotRef.current;
    if (!path || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    let last = 0;
    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      if (now - last < FRAME_MS) return;
      last = now;
      path.setAttribute("d", blobPath(blobPoints(BLOT, now / 1400)));
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <svg width="0" height="0" aria-hidden className="absolute">
      <defs>
        {/* weathered tombstone with chipped edges */}
        <clipPath id="clip-tomb" clipPathUnits="objectBoundingBox">
          <path d={TOMB_PATH} />
        </clipPath>
        <clipPath id="clip-blot" clipPathUnits="objectBoundingBox">
          <path ref={blotRef} d={blobPath(blobPoints(BLOT, 0))} />
        </clipPath>
      </defs>
    </svg>
  );
}
