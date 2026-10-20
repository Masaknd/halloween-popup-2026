/** Hand-drawn gothic ornaments. Strokes use currentColor so they inherit the text colour. */

import { blobPath, blobPoints } from "@/lib/blob";

/** Curling filigree for frame corners; mirror with CSS scale for the other corners. */
export function Filigree({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} fill="none" stroke="currentColor" strokeLinecap="round" aria-hidden>
      <path d="M4 116 V40 C4 18 18 4 40 4 H116" strokeWidth="1.2" />
      <path d="M12 116 V46 C12 26 26 12 46 12 H116" strokeWidth="0.6" opacity="0.6" />
      <path d="M22 60 C22 38 38 22 60 22 C48 26 40 34 38 46 C36 58 46 64 52 58 C57 53 53 45 46 47" strokeWidth="1" />
      <path d="M60 22 C74 22 82 30 80 40 C78 48 68 48 67 41 C66 36 71 34 74 37" strokeWidth="0.9" />
      <path d="M22 60 C22 74 30 82 40 80 C48 78 48 68 41 67 C36 66 34 71 37 74" strokeWidth="0.9" />
      <path d="M30 30 L40 40 M36 26 C40 30 41 34 40 40 C34 41 30 40 26 36" strokeWidth="0.8" />
      <circle cx="40" cy="40" r="2.2" fill="currentColor" stroke="none" />
      <path d="M88 4 C92 10 96 10 100 4 M4 88 C10 92 10 96 4 100" strokeWidth="0.8" />
    </svg>
  );
}

/** Four filigree corners around a parent with `relative`. */
export function FiligreeFrame({ className = "text-candle/60" }: { className?: string }) {
  const corner = "pointer-events-none absolute size-14 sm:size-20";
  return (
    <div aria-hidden className={className}>
      <Filigree className={`${corner} left-2 top-2`} />
      <Filigree className={`${corner} right-2 top-2 -scale-x-100`} />
      <Filigree className={`${corner} bottom-2 left-2 -scale-y-100`} />
      <Filigree className={`${corner} bottom-2 right-2 -scale-100`} />
    </div>
  );
}

/** Divider: a fine rule that blooms into a thorned rose knot in the middle. */
export function OrnamentRule({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 24" className={className} fill="none" stroke="currentColor" strokeLinecap="round" aria-hidden>
      <path d="M0 12 H160 M240 12 H400" strokeWidth="0.8" />
      <path d="M160 12 C170 4 178 4 184 10 C188 14 186 19 181 18 C177 17 178 12 182 12" strokeWidth="1" />
      <path d="M240 12 C230 4 222 4 216 10 C212 14 214 19 219 18 C223 17 222 12 218 12" strokeWidth="1" />
      <path d="M200 3 C206 8 206 16 200 21 C194 16 194 8 200 3 Z" strokeWidth="1" />
      <circle cx="200" cy="12" r="2" fill="currentColor" stroke="none" />
      <path d="M150 12 L146 8 M150 12 L146 16 M250 12 L254 8 M250 12 L254 16" strokeWidth="0.8" />
    </svg>
  );
}

const SEAL_EDGE = blobPath(
  blobPoints({ count: 14, cx: 50, cy: 50, radius: 44, wobble: 0.08, phases: [0, 1.7, 3.1, 0.6, 2.4, 4.2, 5.5, 1.1, 3.6, 0.3, 2.8, 4.8, 5.9, 1.9] }, 0.7),
);

/** Wax seal with a bat pressed into it. */
export function WaxSeal({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <defs>
        <radialGradient id="wax" cx="38%" cy="32%" r="70%">
          <stop offset="0%" stopColor="#b3303a" />
          <stop offset="55%" stopColor="#7d1621" />
          <stop offset="100%" stopColor="#3f0a12" />
        </radialGradient>
      </defs>
      <path d={SEAL_EDGE} fill="url(#wax)" />
      <circle cx="50" cy="50" r="30" fill="none" stroke="#2a060c" strokeOpacity="0.7" strokeWidth="2" />
      <circle cx="50" cy="50" r="27" fill="none" stroke="#c4525b" strokeOpacity="0.35" strokeWidth="0.8" />
      <path
        d="M50 44 L47 39 L46 44 C40 41 32 42 26 47 C31 47 33 50 33 53 C36 50 40 51 42 54 C44 51 47 51 50 56 C53 51 56 51 58 54 C60 51 64 50 67 53 C67 50 69 47 74 47 C68 42 60 41 54 44 L53 39 Z"
        fill="#2a060c"
        fillOpacity="0.8"
      />
      <ellipse cx="38" cy="30" rx="10" ry="5" fill="#fff" fillOpacity="0.12" transform="rotate(-25 38 30)" />
    </svg>
  );
}

const DRIPS = [
  { x: 4, w: 3, h: 26 },
  { x: 11, w: 2, h: 12 },
  { x: 19, w: 4, h: 44 },
  { x: 31, w: 2.5, h: 18 },
  { x: 42, w: 3.5, h: 60 },
  { x: 55, w: 2, h: 14 },
  { x: 63, w: 3, h: 34 },
  { x: 74, w: 4.5, h: 72 },
  { x: 86, w: 2.5, h: 22 },
  { x: 94, w: 3, h: 40 },
] as const;

/** Blood dripping from the top edge of a section; each drip is a scalable group. */
export function Drips({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 80" preserveAspectRatio="none" className={className} aria-hidden>
      <path d="M0 0 H100 V5 C90 7 80 4 70 6 C60 8 50 4 40 6 C30 8 20 5 10 7 C6 7 3 6 0 7 Z" fill="currentColor" />
      {DRIPS.map((drip) => (
        <g key={drip.x} className="drip">
          <path
            d={`M${drip.x - drip.w / 2} 4 C${drip.x - drip.w / 2} ${drip.h * 0.6} ${drip.x - drip.w * 0.35} ${drip.h - drip.w} ${drip.x - drip.w * 0.7} ${drip.h - drip.w * 0.2} A${drip.w * 0.7} ${drip.w * 0.8} 0 1 0 ${drip.x + drip.w * 0.7} ${drip.h - drip.w * 0.2} C${drip.x + drip.w * 0.35} ${drip.h - drip.w} ${drip.x + drip.w / 2} ${drip.h * 0.6} ${drip.x + drip.w / 2} 4 Z`}
            fill="currentColor"
          />
        </g>
      ))}
    </svg>
  );
}

/** Irregular, sagging spider web anchored in a corner. */
export function SpiderWeb({ className = "" }: { className?: string }) {
  const spokes = [0, 13, 29, 44, 58, 73, 90];
  const rings = [26, 52, 80, 112, 150, 192];
  // rounded so server and client render identical markup
  const point = (radius: number, degrees: number) => {
    const radians = (degrees * Math.PI) / 180;
    return [Math.round(radius * Math.cos(radians) * 100) / 100, Math.round(radius * Math.sin(radians) * 100) / 100] as const;
  };

  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth="0.7">
      {spokes.map((angle) => {
        const [x, y] = point(220, angle);
        return <line key={angle} x1="0" y1="0" x2={x} y2={y} />;
      })}
      {rings.map((radius, ringIndex) => (
        <path
          key={radius}
          d={spokes
            .slice(1)
            .map((angle, index) => {
              const previous = spokes[index] ?? 0;
              const [sx, sy] = point(radius, previous);
              const [ex, ey] = point(radius * (1 + ((index + ringIndex) % 3) * 0.04), angle);
              const [cx, cy] = point(radius * 0.8, (angle + previous) / 2);
              return `${index === 0 ? `M${sx} ${sy}` : ""} Q${cx} ${cy} ${ex} ${ey}`;
            })
            .join(" ")}
        />
      ))}
      <path d="M150 0 V58" strokeWidth="0.5" />
      <path d="M150 58 c-5 0 -7 6 -4 10 c-4 2 -4 9 4 10 c8 -1 8 -8 4 -10 c3 -4 1 -10 -4 -10 Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Inset engraved outline that follows an organic frame shape. */
export function FrameLine({ path, className = "" }: { path: string; className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute ${className}`}>
      <svg viewBox="0 0 1 1" preserveAspectRatio="none" className="size-full overflow-visible">
        <path d={path} fill="none" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
}
