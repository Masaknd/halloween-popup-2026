/** The flame burn-in shared by every burning block: its timing, its noise front and its ember rim. */

import { createRandom } from "../../lib/random";

export const BURN = {
  /** A quick flash of flame, slow enough to catch mid-scroll; the ease follows the hero portrait's burn-in (GothicScene). */
  seconds: 1.2,
  ease: "power2.inOut",
  /**
   * How far down the screen (0 = top, 1 = bottom, past 1 = below it) a block's top must rise before it ignites, unless
   * the block sets its own: about where the eye rests while scrolling, so it burns where it is seen.
   */
  igniteLine: 0.65,
  /** Roughly how many noise blotches span the block, like the portrait's `fbm(uv * 5.0)`. */
  noiseCells: 4,
  emberColor: "#ff5c14",
  /** Edge softness of the revealed area and width of the ember rim, in normalised noise units. */
  edge: 0.04,
  rim: 0.15,
} as const;

/**
 * Calls `onIgnite` once, when the top of `element` first rises to `line` (a share of the screen's height from its top,
 * see BURN.igniteLine), or is already above it; the burn then runs on its own clock, independent of scrolling. Returns a
 * function that stops waiting.
 */
export function igniteWhenSeen(element: Element, onIgnite: () => void, line: number = BURN.igniteLine): () => void {
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry?.isIntersecting) return;
      observer.disconnect();
      onIgnite();
    },
    // the viewport's bottom edge moved up (or, past 1, down) to the line
    { rootMargin: `0px 0px ${Math.round((line - 1) * 100)}% 0px` },
  );
  observer.observe(element);
  return () => observer.disconnect();
}

/** Reveal progress 0..1 → the noise level the front has burnt through, as in the hero shader. */
export const burnFront = (reveal: number): number => reveal * 1.25 - 0.12;

const OCTAVES = 4;
const smooth = (t: number): number => t * t * (3 - 2 * t);

/**
 * One octave of value noise over a `columns` × `rows` grid: a seeded lattice `cellsAcross` squares wide and as many
 * squares tall as keep them square, smoothly interpolated.
 */
function valueNoise(columns: number, rows: number, cellsAcross: number, seed: number): Float32Array {
  const rand = createRandom(seed);
  const cellsDown = Math.max(1, Math.round((cellsAcross * rows) / columns));
  const width = cellsAcross + 1;
  const lattice = Array.from({ length: width * (cellsDown + 1) }, () => rand());
  const at = (x: number, y: number) => lattice[y * width + x];
  return Float32Array.from({ length: columns * rows }, (_, index) => {
    const u = ((index % columns) / columns) * cellsAcross;
    const v = (Math.floor(index / columns) / rows) * cellsDown;
    const [x, y] = [Math.floor(u), Math.floor(v)];
    const [tx, ty] = [smooth(u - x), smooth(v - y)];
    const top = at(x, y) + (at(x + 1, y) - at(x, y)) * tx;
    const bottom = at(x, y + 1) + (at(x + 1, y + 1) - at(x, y + 1)) * tx;
    return top + (bottom - top) * ty;
  });
}

/**
 * A `columns` × `rows` fractal noise field rescaled to exactly 0..1, so the front sweeps the whole of it. Its blotches
 * stay round whatever the shape, so a wide block burns like a square one.
 */
export function burnField(columns: number, rows: number, seed: number): Float32Array {
  const layers = Array.from({ length: OCTAVES }, (_, octave) =>
    valueNoise(columns, rows, BURN.noiseCells * 2 ** octave, seed * 31 + octave),
  );
  const summed = Float32Array.from({ length: columns * rows }, (_, index) =>
    layers.reduce((total, layer, octave) => total + layer[index] / 2 ** (octave + 1), 0),
  );
  const [low, high] = [Math.min(...summed), Math.max(...summed)];
  return summed.map((value) => (value - low) / Math.max(high - low, 1e-6));
}

/**
 * The burn at `reveal`: how opaque each cell of the block is (0..255, burnt open where the front has passed) and how
 * brightly the ember rim glows there (0..255, only in the thin band just behind the front).
 */
export function burnMasks(field: Float32Array, reveal: number): { shown: Uint8ClampedArray; rim: Uint8ClampedArray } {
  const front = burnFront(reveal);
  const shown = new Uint8ClampedArray(field.length);
  const rim = new Uint8ClampedArray(field.length);
  field.forEach((noise, index) => {
    const burnt = front - noise;
    const opacity = Math.min(Math.max(burnt / BURN.edge, 0), 1);
    shown[index] = Math.round(opacity * 255);
    // like BurnIn's filter, the rim is the revealed part of the band just behind the front
    rim[index] = burnt < BURN.rim ? Math.round(opacity * (1 - burnt / BURN.rim) * 255) : 0;
  });
  return { shown, rim };
}
