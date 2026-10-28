import { useId } from "react";

/**
 * Noise is read from feTurbulence's alpha channel (it is not premultiplied, unlike the colour channels); it spans
 * roughly 0.25–0.55, so each threshold below is a slope and an offset on that range.
 */
const alphaRow = (slope: number, offset: number): string => `0 0 0 ${slope} ${offset}`;
const colorMatrix = (rgb: readonly [number, number, number], alpha: string): string =>
  `0 0 0 0 ${rgb[0]}  0 0 0 0 ${rgb[1]}  0 0 0 0 ${rgb[2]}  ${alpha}`;

const STAIN = [0.07, 0.055, 0.045] as const;
const WEAR = [0.62, 0.58, 0.53] as const;
const LICHEN = [0.55, 0.55, 0.33] as const;
const PIT = [0.04, 0.03, 0.03] as const;
const FLECK = [0.8, 0.76, 0.7] as const;

/** Hairline cracks in a 0..100 box, one set per stone so no two match. */
const CRACKS = [
  "M8 64 L14 61 L17 66 L24 63 L27 69",
  "M90 22 L84 27 L86 31 L80 36 L81 41 L76 44",
  "M30 96 L33 89 L31 84 L36 79",
  "M70 74 L76 71 L79 75 L86 73 L88 78 L94 77",
] as const;

/**
 * Weathered granite for a tombstone card: pale flecks and dark specks, dark stains and paler wear, lichen creeping up from the foot,
 * pits, a hairline crack, candlelight on the crown and grime at the base. `seed` varies the stone per card.
 */
export function StoneSurface({ seed }: { seed: number }) {
  const id = useId().replace(/[^a-zA-Z0-9-]/g, "");
  const ref = (name: string) => `stone-${name}-${id}`;
  const crack = CRACKS[seed % CRACKS.length] ?? CRACKS[0];

  return (
    <svg aria-hidden className="pointer-events-none absolute inset-0 size-full">
      <defs>
        {/* granite grain: fine pale feldspar flecks and dark mica specks */}
        <filter id={ref("flecks")} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={seed * 7 + 1} />
          <feColorMatrix values={colorMatrix(FLECK, alphaRow(9, -4.1))} />
        </filter>
        <filter id={ref("specks")} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.95" numOctaves="2" seed={seed * 7 + 6} />
          <feColorMatrix values={colorMatrix(PIT, alphaRow(-9, 3.6))} />
        </filter>
        <filter id={ref("stain")} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.009 0.016" numOctaves="4" seed={seed * 7 + 2} />
          <feColorMatrix values={colorMatrix(STAIN, alphaRow(-5, 2.05))} />
        </filter>
        <filter id={ref("wear")} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.014" numOctaves="4" seed={seed * 7 + 3} />
          <feColorMatrix values={colorMatrix(WEAR, alphaRow(5, -2.15))} />
        </filter>
        <filter id={ref("lichen")} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="3" seed={seed * 7 + 4} />
          <feColorMatrix values={colorMatrix(LICHEN, alphaRow(10, -4.6))} />
        </filter>
        <filter id={ref("pits")} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.45" numOctaves="1" seed={seed * 7 + 5} />
          <feColorMatrix values={colorMatrix(PIT, alphaRow(14, -7.3))} />
        </filter>
        <linearGradient id={ref("foot")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.35" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#fff" stopOpacity="1" />
        </linearGradient>
        <mask id={ref("foot-mask")} maskContentUnits="objectBoundingBox">
          <rect width="1" height="1" fill={`url(#${ref("foot")})`} />
        </mask>
        <radialGradient id={ref("candle")} cx="0.35" cy="0.05" r="0.9">
          <stop offset="0" stopColor="#e6b56a" stopOpacity="0.22" />
          <stop offset="0.6" stopColor="#e6b56a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={ref("grime")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.5" stopColor="#0a0706" stopOpacity="0" />
          <stop offset="1" stopColor="#0a0706" stopOpacity="0.78" />
        </linearGradient>
        <radialGradient id={ref("edge")} cx="0.5" cy="0.45" r="0.75">
          <stop offset="0.55" stopColor="#0a0706" stopOpacity="0" />
          <stop offset="1" stopColor="#0a0706" stopOpacity="0.6" />
        </radialGradient>
      </defs>

      <rect width="100%" height="100%" fill="#4a4540" />
      <rect width="100%" height="100%" filter={`url(#${ref("wear")})`} opacity="0.35" />
      <rect width="100%" height="100%" filter={`url(#${ref("stain")})`} opacity="0.55" />
      <rect width="100%" height="100%" filter={`url(#${ref("lichen")})`} opacity="0.45" mask={`url(#${ref("foot-mask")})`} />
      <rect width="100%" height="100%" filter={`url(#${ref("flecks")})`} opacity="0.35" />
      <rect width="100%" height="100%" filter={`url(#${ref("specks")})`} opacity="0.45" />
      <rect width="100%" height="100%" filter={`url(#${ref("pits")})`} opacity="0.6" />
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" width="100%" height="100%" overflow="visible">
        <path d={crack} fill="none" stroke="#d8ccb8" strokeOpacity="0.16" strokeWidth="1" vectorEffect="non-scaling-stroke" transform="translate(0.4 0.3)" />
        <path d={crack} fill="none" stroke="#0d0a08" strokeOpacity="0.85" strokeWidth="1.1" vectorEffect="non-scaling-stroke" />
      </svg>
      <rect width="100%" height="100%" fill={`url(#${ref("candle")})`} />
      <rect width="100%" height="100%" fill={`url(#${ref("grime")})`} />
      <rect width="100%" height="100%" fill={`url(#${ref("edge")})`} />
    </svg>
  );
}
