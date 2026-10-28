/** Hand-drawn gothic ornaments. Strokes use currentColor so they inherit the text colour. */

import advanceSeal from "@/assets/seals/seal-advance.webp";
import doorSeal from "@/assets/seals/seal-door.webp";
import { ACANTHUS_BOUNDS, ACANTHUS_PATH } from "@/components/ui/acanthusCorner";
import { DRIP_OUTLINE, DRIP_TILE } from "@/components/ui/dripOutline";
import { buildLiquidEdge, LIQUID_EDGE } from "@/components/ui/liquidEdge";

export { SpiderWeb } from "@/components/ui/SpiderWeb";

const { x: CORNER_X, y: CORNER_Y, width: CORNER_W, height: CORNER_H } = ACANTHUS_BOUNDS;
/** The art is drawn as a bottom-left corner; flipping it about its middle makes it a top-left one. */
const TOP_LEFT = `matrix(1 0 0 -1 0 ${2 * CORNER_Y + CORNER_H})`;

/** Baroque acanthus flourish for frame corners (top-left); mirror with CSS scale for the other corners. */
export function Filigree({ className = "" }: { className?: string }) {
  return (
    <svg viewBox={`${CORNER_X} ${CORNER_Y} ${CORNER_W} ${CORNER_H}`} className={className} aria-hidden>
      <path d={ACANTHUS_PATH} fill="currentColor" transform={TOP_LEFT} />
    </svg>
  );
}

/** Turns the corner art about its corner so the corner points down and both arms curl up and outward. */
const CREST_TURN = `rotate(-45) translate(${-CORNER_X} ${-(CORNER_Y + CORNER_H)})`;

const CREST_HALF_WIDTH = 107;
const CREST_HEIGHT = 120;

/** The divider's hairlines run out from a crest this many units either side of centre. */
const RULE_GAP = 52;
/** Size of the crest against the 400-unit-wide divider. */
const CREST_SCALE = 0.42;

/**
 * Divider to sit with the acanthus corners: hairlines either side of a crest made from the same flourish, turned so its
 * corner points down and both arms curl up and outward.
 */
export function AcanthusRule({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 96" className={className} aria-hidden>
      {/* hairlines stay one pixel wide at any divider size, so they don't vanish on the small gravestone dividers */}
      <path
        d={`M10 56 H${200 - RULE_GAP} M${200 + RULE_GAP} 56 H390`}
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
      />
      <circle cx="10" cy="56" r="1.6" fill="currentColor" />
      <circle cx="390" cy="56" r="1.6" fill="currentColor" />
      <g
        transform={`translate(200 92) scale(${CREST_SCALE}) ${CREST_TURN}`}
      >
        <path d={ACANTHUS_PATH} fill="currentColor" />
      </g>
    </svg>
  );
}

/** Four acanthus corners around a parent with `relative`. */
export function FiligreeFrame({ className = "text-candle/60" }: { className?: string }) {
  const corner = "pointer-events-none absolute size-12 sm:size-20";
  return (
    <div aria-hidden className={className}>
      <Filigree className={`${corner} left-2 top-2`} />
      <Filigree className={`${corner} right-2 top-2 -scale-x-100`} />
      <Filigree className={`${corner} bottom-2 left-2 -scale-y-100`} />
      <Filigree className={`${corner} bottom-2 right-2 -scale-100`} />
    </div>
  );
}

/** Seals cut from the user's wax-stamp sheet (rendered from their SVG, background keyed out). */
const SEAL_IMAGES = { advance: advanceSeal, door: doorSeal } as const;
export type SealVariant = keyof typeof SEAL_IMAGES;
const BAT_PATH =
  "M50 44 L47 39 L46 44 C40 41 32 42 26 47 C31 47 33 50 33 53 C36 50 40 51 42 54 C44 51 47 51 50 56 C53 51 56 51 58 54 C60 51 64 50 67 53 C67 50 69 47 74 47 C68 42 60 41 54 44 L53 39 Z";

/**
 * The divider's crest on its own, as a separator glyph in currentColor. Turned, the art's arms reach out to the
 * sides at mid-height, and the turned square's top corner is empty, so the view keeps only its lower half.
 */
export function AcanthusCrest({ className = "" }: { className?: string }) {
  return (
    <svg viewBox={`${-CREST_HALF_WIDTH} ${-CREST_HEIGHT} ${CREST_HALF_WIDTH * 2} ${CREST_HEIGHT}`} className={className} aria-hidden>
      <path d={ACANTHUS_PATH} fill="currentColor" transform={CREST_TURN} />
    </svg>
  );
}

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
/** How far the drips slide out of the marquee as you scroll, in tile units (the tile is 712 tall). */
const DRIP_TRAVEL = 520;

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

/** The uneven, pooling top of the paint the drips run from; stretched across its parent in currentColor. */
export function LiquidEdge({ seed = 1, className = "" }: { seed?: number; className?: string }) {
  return (
    <svg viewBox={`0 0 ${LIQUID_EDGE.width} ${LIQUID_EDGE.height}`} preserveAspectRatio="none" className={className} aria-hidden>
      <path d={buildLiquidEdge(seed)} fill="currentColor" />
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
