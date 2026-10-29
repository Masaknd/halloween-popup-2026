/** The flame burn-in shared by every burning block: its timing, its noise front and its ember rim. */

import { createRandom } from "../../lib/random";

export const BURN = {
  /** A quick flash of flame; the ease follows the hero portrait's burn-in (GothicScene). */
  seconds: 0.8,
  ease: "power2.inOut",
  /** Share of the block that must be on screen before it ignites. */
  visibleShare: 0.35,
  /** Roughly how many noise blotches span the block, like the portrait's `fbm(uv * 5.0)`. */
  noiseCells: 4,
  emberColor: "#ff5c14",
  /** Edge softness of the revealed area and width of the ember rim, in normalised noise units. */
  edge: 0.04,
  rim: 0.15,
} as const;

/** Reveal progress 0..1 → the noise level the front has burnt through, as in the hero shader. */
export const burnFront = (reveal: number): number => reveal * 1.25 - 0.12;

const OCTAVES = 4;
const smooth = (t: number): number => t * t * (3 - 2 * t);

/** One octave of value noise: a seeded lattice of `cells` × `cells` squares, smoothly interpolated. */
function valueNoise(size: number, cells: number, seed: number): Float32Array {
  const rand = createRandom(seed);
  const side = cells + 1;
  const lattice = Array.from({ length: side * side }, () => rand());
  const at = (x: number, y: number) => lattice[y * side + x];
  return Float32Array.from({ length: size * size }, (_, index) => {
    const u = ((index % size) / size) * cells;
    const v = (Math.floor(index / size) / size) * cells;
    const [x, y] = [Math.floor(u), Math.floor(v)];
    const [tx, ty] = [smooth(u - x), smooth(v - y)];
    const top = at(x, y) + (at(x + 1, y) - at(x, y)) * tx;
    const bottom = at(x, y + 1) + (at(x + 1, y + 1) - at(x, y + 1)) * tx;
    return top + (bottom - top) * ty;
  });
}

/** A `size` × `size` fractal noise field rescaled to exactly 0..1, so the front sweeps the whole of it. */
export function burnField(size: number, seed: number): Float32Array {
  const layers = Array.from({ length: OCTAVES }, (_, octave) => valueNoise(size, BURN.noiseCells * 2 ** octave, seed * 31 + octave));
  const summed = Float32Array.from({ length: size * size }, (_, index) =>
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
