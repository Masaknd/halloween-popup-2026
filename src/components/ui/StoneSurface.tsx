import { useId, useMemo } from "react";
import { buildCracks, CRACK_BOX } from "./stoneCracks";

/**
 * Noise is read from feTurbulence's alpha channel (it is not premultiplied, unlike the colour channels); it spans
 * roughly 0.25–0.55, so each threshold below is a slope and an offset on that range.
 */
const alphaRow = (slope: number, offset: number): string => `0 0 0 ${slope} ${offset}`;
const colorMatrix = (rgb: readonly [number, number, number], alpha: string): string =>
  `0 0 0 0 ${rgb[0]}  0 0 0 0 ${rgb[1]}  0 0 0 0 ${rgb[2]}  ${alpha}`;

const STAIN = [0.07, 0.055, 0.045] as const;
const WEAR = [0.62, 0.58, 0.53] as const;
const STREAK = [0.05, 0.045, 0.04] as const;
const LICHEN = [0.66, 0.66, 0.55] as const;
const MOSS = [0.3, 0.33, 0.2] as const;
const GRAIN_DARK = [0.04, 0.03, 0.03] as const;
const GRAIN_PALE = [0.8, 0.76, 0.7] as const;

/** The relief is lit from the top left, like the candle on the crown, and soft-lit over the stone below. */
const LIGHT = { azimuth: 225, elevation: 45, surfaceScale: 1.6 } as const;

/**
 * Weathered granite for a tombstone card: a pitted, lit relief under a soft grain, mottled stains and paler wear,
 * rain streaks running down from the crown, crusts of pale lichen, moss creeping up from the foot, branching cracks,
 * candlelight on the crown and grime at the base. `seed` varies the stone per card.
 */
export function StoneSurface({ seed }: { seed: number }) {
  const id = useId().replace(/[^a-zA-Z0-9-]/g, "");
  const ref = (name: string) => `stone-${name}-${id}`;
  const cracks = useMemo(() => buildCracks(seed), [seed]);
  const noiseSeed = (offset: number) => seed * 9 + offset;

  return (
    <svg aria-hidden className="pointer-events-none absolute inset-0 size-full">
      <defs>
        {/* the stone's surface as a height map, lit so its pits and bumps throw soft shade and catch light */}
        <filter id={ref("relief")} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves="4" seed={noiseSeed(1)} />
          <feDiffuseLighting surfaceScale={LIGHT.surfaceScale} diffuseConstant="1" lightingColor="#fff">
            <feDistantLight azimuth={LIGHT.azimuth} elevation={LIGHT.elevation} />
          </feDiffuseLighting>
        </filter>
        {/* fine-grained stone: a faint salt-and-pepper of pale and dark grains, not a pattern you can pick out */}
        <filter id={ref("grain")} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="1" seed={noiseSeed(2)} result="noise" />
          <feColorMatrix in="noise" values={colorMatrix(GRAIN_PALE, alphaRow(4, -1.75))} result="pale" />
          <feColorMatrix in="noise" values={colorMatrix(GRAIN_DARK, alphaRow(-4, 1.45))} result="dark" />
          <feMerge>
            <feMergeNode in="pale" />
            <feMergeNode in="dark" />
          </feMerge>
        </filter>
        <filter id={ref("stain")} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.009 0.016" numOctaves="4" seed={noiseSeed(3)} />
          <feColorMatrix values={colorMatrix(STAIN, alphaRow(-5, 2.05))} />
        </filter>
        <filter id={ref("wear")} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.014" numOctaves="4" seed={noiseSeed(4)} />
          <feColorMatrix values={colorMatrix(WEAR, alphaRow(5, -2.15))} />
        </filter>
        {/* rainwater runs off the crown: noise stretched tall makes dark vertical streaks */}
        <filter id={ref("streaks")} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.05 0.003" numOctaves="3" seed={noiseSeed(5)} />
          <feColorMatrix values={colorMatrix(STREAK, alphaRow(-7, 2.8))} />
        </filter>
        {/* crustose lichen: scattered pale rosettes with crisp edges */}
        <filter id={ref("lichen")} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="4" seed={noiseSeed(6)} />
          <feColorMatrix values={colorMatrix(LICHEN, alphaRow(24, -16))} />
        </filter>
        <filter id={ref("moss")} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="3" seed={noiseSeed(7)} />
          <feColorMatrix values={colorMatrix(MOSS, alphaRow(10, -4.6))} />
        </filter>
        <linearGradient id={ref("crown")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="1" />
          <stop offset="0.75" stopColor="#fff" stopOpacity="0.15" />
        </linearGradient>
        <mask id={ref("crown-mask")} maskContentUnits="objectBoundingBox">
          <rect width="1" height="1" fill={`url(#${ref("crown")})`} />
        </mask>
        <linearGradient id={ref("foot")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.45" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#fff" stopOpacity="1" />
        </linearGradient>
        <mask id={ref("foot-mask")} maskContentUnits="objectBoundingBox">
          <rect width="1" height="1" fill={`url(#${ref("foot")})`} />
        </mask>
        <radialGradient id={ref("candle")} cx="0.35" cy="0.05" r="0.9">
          <stop offset="0" stopColor="#e6b56a" stopOpacity="0.2" />
          <stop offset="0.6" stopColor="#e6b56a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={ref("grime")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.5" stopColor="#0a0706" stopOpacity="0" />
          <stop offset="1" stopColor="#0a0706" stopOpacity="0.7" />
        </linearGradient>
        <radialGradient id={ref("edge")} cx="0.5" cy="0.45" r="0.75">
          <stop offset="0.55" stopColor="#0a0706" stopOpacity="0" />
          <stop offset="1" stopColor="#0a0706" stopOpacity="0.6" />
        </radialGradient>
      </defs>

      <rect width="100%" height="100%" fill="#3f3a35" />
      <rect width="100%" height="100%" filter={`url(#${ref("wear")})`} opacity="0.3" />
      <rect width="100%" height="100%" filter={`url(#${ref("stain")})`} opacity="0.5" />
      <rect width="100%" height="100%" filter={`url(#${ref("streaks")})`} opacity="0.4" mask={`url(#${ref("crown-mask")})`} />
      <rect width="100%" height="100%" filter={`url(#${ref("relief")})`} opacity="0.9" style={{ mixBlendMode: "soft-light" }} />
      <rect width="100%" height="100%" filter={`url(#${ref("grain")})`} opacity="0.22" />
      <rect width="100%" height="100%" filter={`url(#${ref("lichen")})`} opacity="0.4" />
      <rect width="100%" height="100%" filter={`url(#${ref("moss")})`} opacity="0.5" mask={`url(#${ref("foot-mask")})`} />
      {/* each crack is a dark groove with light catching its lower lip, drawn piece by piece so it tapers */}
      <svg viewBox={`0 0 ${CRACK_BOX} ${CRACK_BOX}`} preserveAspectRatio="none" width="100%" height="100%" overflow="visible">
        <g stroke="#d8ccb8" strokeOpacity="0.14" strokeLinecap="round" fill="none" transform="translate(0.3 0.35)">
          {cracks.map((segment, index) => (
            <path key={index} d={segment.d} strokeWidth={segment.width} vectorEffect="non-scaling-stroke" />
          ))}
        </g>
        <g stroke="#0d0a08" strokeOpacity="0.85" strokeLinecap="round" fill="none">
          {cracks.map((segment, index) => (
            <path key={index} d={segment.d} strokeWidth={segment.width} vectorEffect="non-scaling-stroke" />
          ))}
        </g>
      </svg>
      <rect width="100%" height="100%" fill={`url(#${ref("candle")})`} />
      <rect width="100%" height="100%" fill={`url(#${ref("grime")})`} />
      <rect width="100%" height="100%" fill={`url(#${ref("edge")})`} />
    </svg>
  );
}
