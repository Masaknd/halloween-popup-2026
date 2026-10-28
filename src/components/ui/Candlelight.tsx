/** Candlelit-soirée set dressing: cobweb gauze and velvet drapes. All CSS-animated, so they render on the server. */

import { useId } from "react";

// Pinned at even intervals, sagging by a different depth between each pin
const SAGS = [70, 120, 85, 140, 95, 125, 75, 110] as const;
const GAUZE_WIDTH = 1200;

/** Torn cheesecloth draped across the top of a section, with a few loose threads. */
export function Gauze({ className = "" }: { className?: string }) {
  const id = useId();
  const span = GAUZE_WIDTH / SAGS.length;
  const drape = SAGS.map((sag, index) => {
    const x = index * span;
    return `Q${x + span / 2} ${sag * 1.6} ${x + span} ${index % 2 === 0 ? 18 : 30}`;
  }).join(" ");

  return (
    <svg viewBox={`0 0 ${GAUZE_WIDTH} 240`} preserveAspectRatio="none" className={`mix-blend-screen ${className}`} aria-hidden>
      <defs>
        <linearGradient id={`${id}-cloth`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#eadbc0" stopOpacity="0.11" />
          <stop offset="100%" stopColor="#eadbc0" stopOpacity="0" />
        </linearGradient>
        <filter id={`${id}-tatter`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.004 0.05" numOctaves="2" seed="4" />
          <feDisplacementMap in="SourceGraphic" scale="16" />
        </filter>
      </defs>
      <path d={`M0 0 V24 ${drape} V0 Z`} fill={`url(#${id}-cloth)`} filter={`url(#${id}-tatter)`} />
      {SAGS.map((sag, index) => {
        const x = index * span;
        return (
          <path
            key={x}
            d={`M${x + span * 0.3} 10 C${x + span * 0.4} ${sag} ${x + span * 0.55} ${sag * 1.2} ${x + span * 0.62} ${sag * 1.45}`}
            stroke="#eadbc0"
            strokeOpacity="0.16"
            strokeWidth="0.8"
            fill="none"
            vectorEffect="non-scaling-stroke"
          />
        );
      })}
    </svg>
  );
}

const DRAPE = "velvet curtain-sway absolute inset-y-0 w-[30%] origin-top [mask-image:linear-gradient(to_right,black_45%,transparent)]";

/** Crimson velvet drapes gathered at both sides of a section; they sway slightly. */
export function Curtains({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <div className={`${DRAPE} -left-[4%]`} />
      <div className={`${DRAPE} -right-[4%] -scale-x-100 [animation-delay:-3s]`} />
    </div>
  );
}
