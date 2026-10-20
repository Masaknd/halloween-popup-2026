/** Candlelit-soirée set dressing: dripping tapers, cobweb gauze and velvet drapes. All CSS-animated, so they render on the server. */

import { useId } from "react";

// Relative taper heights, cycled — uneven like a real cluster that has burned for hours
const HEIGHTS = [0.62, 0.92, 0.5, 1, 0.74, 0.44, 0.84, 0.58] as const;
const BASE_Y = 236;
const MAX_HEIGHT = 170;
const SPACING = 26;
const WIDTH = 13;

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

interface Taper {
  x: number;
  top: number;
  drips: { x: number; length: number }[];
  delay: string;
}

function buildTapers(count: number): Taper[] {
  return Array.from({ length: count }, (_, index) => {
    const height = MAX_HEIGHT * HEIGHTS[index % HEIGHTS.length];
    const x = 14 + index * SPACING + ((index * 7) % 5) - 2;
    const drips = [
      { x: x + 1.5, length: round(height * (0.18 + ((index * 3) % 4) * 0.06)) },
      { x: x + WIDTH - 4, length: round(height * (0.1 + ((index * 5) % 3) * 0.08)) },
    ];
    return { x, top: round(BASE_Y - height), drips, delay: `${-((index * 0.37) % 1.6).toFixed(2)}s` };
  });
}

interface CandlesProps {
  count?: number;
  className?: string;
}

/** A cluster of dripping taper candles with flickering flames and a warm halo. */
export function Candles({ count = 5, className = "" }: CandlesProps) {
  const id = useId();
  const tapers = buildTapers(count);
  const width = 28 + (count - 1) * SPACING + WIDTH;

  return (
    <svg viewBox={`0 0 ${width} 240`} className={className} aria-hidden>
      <defs>
        <linearGradient id={`${id}-wax`} x1="0" x2="1">
          <stop offset="0%" stopColor="#6d5a48" />
          <stop offset="45%" stopColor="#eadbc0" />
          <stop offset="100%" stopColor="#8a735c" />
        </linearGradient>
        <radialGradient id={`${id}-flame`} cx="50%" cy="70%" r="60%">
          <stop offset="0%" stopColor="#fff6dc" />
          <stop offset="45%" stopColor="#ffc56a" />
          <stop offset="100%" stopColor="#c2541c" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-halo`}>
          <stop offset="0%" stopColor="#ffb75e" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#ffb75e" stopOpacity="0" />
        </radialGradient>
      </defs>

      {tapers.map((taper) => {
        const cx = taper.x + WIDTH / 2;
        const tip = taper.top - 26;
        return (
          <g key={taper.x}>
            <circle cx={cx} cy={taper.top - 10} r="30" fill={`url(#${id}-halo)`} className="candle-halo" style={{ animationDelay: taper.delay }} />
            <rect x={taper.x} y={taper.top} width={WIDTH} height={round(BASE_Y - taper.top)} rx="2" fill={`url(#${id}-wax)`} />
            {taper.drips.map((drip) => (
              <rect key={drip.x} x={drip.x} y={taper.top} width="3.2" height={drip.length} rx="1.6" fill="#eadbc0" opacity="0.85" />
            ))}
            <ellipse cx={cx} cy={taper.top + 1} rx={WIDTH / 2 + 1} ry="2.4" fill="#f3e6cc" />
            <path d={`M${cx} ${taper.top} v-6`} stroke="#1a0f0c" strokeWidth="1.2" />
            <path
              d={`M${cx} ${tip} C${cx + 6} ${tip + 10} ${cx + 6} ${tip + 19} ${cx} ${tip + 22} C${cx - 6} ${tip + 19} ${cx - 6} ${tip + 10} ${cx} ${tip}Z`}
              fill={`url(#${id}-flame)`}
              className="candle-flame"
              style={{ animationDelay: taper.delay }}
            />
          </g>
        );
      })}
    </svg>
  );
}

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
