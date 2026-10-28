/** Hand-drawn gothic ornaments. Strokes use currentColor so they inherit the text colour. */

import advanceSeal from "@/assets/seals/seal-advance.webp";
import doorSeal from "@/assets/seals/seal-door.webp";
import { DRIP_OUTLINE, DRIP_TILE } from "@/components/ui/dripOutline";

export { SpiderWeb } from "@/components/ui/SpiderWeb";

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

/** Seals cut from the user's wax-stamp sheet (rendered from their SVG, background keyed out). */
const SEAL_IMAGES = { advance: advanceSeal, door: doorSeal } as const;
export type SealVariant = keyof typeof SEAL_IMAGES;
const BAT_PATH =
  "M50 44 L47 39 L46 44 C40 41 32 42 26 47 C31 47 33 50 33 53 C36 50 40 51 42 54 C44 51 47 51 50 56 C53 51 56 51 58 54 C60 51 64 50 67 53 C67 50 69 47 74 47 C68 42 60 41 54 44 L53 39 Z";

/** Real wax seal with a bat pressed into its face: a dark impression with light catching its lower lip. */
export function WaxSeal({ variant, className = "" }: { variant: SealVariant; className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none ${className}`}>
      <div
        className="aspect-square w-full bg-contain bg-center bg-no-repeat drop-shadow-[0_3px_3px_rgb(0_0_0/0.55)]"
        style={{ backgroundImage: `url(${SEAL_IMAGES[variant].src})` }}
      />
      <svg viewBox="0 0 100 100" className="absolute inset-0 size-full">
        <path d={BAT_PATH} fill="#ffb3b3" fillOpacity="0.22" transform="translate(0 1.2)" />
        <path d={BAT_PATH} fill="#2a0306" fillOpacity="0.62" />
      </svg>
    </div>
  );
}

/** Tiles across the view: plain, mirrored, plain. */
const DRIP_TILES = 3;
/** How far the drips slide out of the marquee as you scroll, in tile units. */
const DRIP_TRAVEL = 240;

/**
 * Flat paint dripping from the marquee in its own colour (currentColor), traced from a real drip silhouette.
 * The whole silhouette is one `.drip` group carrying its travel in `data-length`, so callers can pour it down on scroll.
 */
export function Drips({ className = "" }: { className?: string }) {
  const viewWidth = DRIP_TILE.width * DRIP_TILES;
  return (
    <svg
      viewBox={`0 0 ${viewWidth} ${DRIP_TILE.height}`}
      preserveAspectRatio="xMidYMin slice"
      className={`overflow-visible ${className}`}
      aria-hidden
    >
      <defs>
        <clipPath id="drip-clip">
          <rect x="0" y="0" width={viewWidth} height={DRIP_TILE.height * 2} />
        </clipPath>
      </defs>
      <g clipPath="url(#drip-clip)" fill="currentColor">
        <g className="drip" data-length={DRIP_TRAVEL}>
          {Array.from({ length: DRIP_TILES }, (_, index) => (
            <path
              key={index}
              d={DRIP_OUTLINE}
              transform={
                index % 2 === 0
                  ? `translate(${index * DRIP_TILE.width} 0)`
                  : `translate(${(index + 1) * DRIP_TILE.width} 0) scale(-1 1)`
              }
            />
          ))}
        </g>
      </g>
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
