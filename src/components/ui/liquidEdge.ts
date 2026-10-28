import { createRandom, range } from "../../lib/random";

/** The outline is drawn in this box and stretched across the band's full width. */
export const LIQUID_EDGE = { width: 1000, height: 40 } as const;

/** Spacing between points; squaring the random draw makes short ripples common and long, slow swells rare. */
const SPACING = { min: 10, max: 150 } as const;
/** The surface level wanders slowly (a random walk) between these shares of the box's height, so swells and troughs run long. */
const LEVEL = { min: 0.08, max: 0.98, drift: 0.32 } as const;
/** Small ripples on top of the slow wander, and the odd blob that bulges well above its neighbours. */
const RIPPLE = 0.12;
const BLOB = { chance: 0.12, lift: 0.35 } as const;

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

const round = (value: number): number => Math.round(value * 10) / 10;

/**
 * The surface of a pool of paint: long uneven swells and troughs, small ripples and the odd bulging blob, joined by
 * smooth curves, then closed along the bottom of the box so it sits seamlessly on the band it edges.
 */
export function buildLiquidEdge(seed: number): string {
  const rand = createRandom(seed * 4099 + 3);
  const { width, height } = LIQUID_EDGE;
  let level = range(rand, 0.3, 0.7);
  const points: { x: number; y: number }[] = [{ x: 0, y: height * (1 - level) }];
  while (points[points.length - 1].x < width) {
    const x = Math.min(width, points[points.length - 1].x + SPACING.min + rand() ** 2 * (SPACING.max - SPACING.min));
    level = clamp(level + range(rand, -LEVEL.drift, LEVEL.drift), LEVEL.min, LEVEL.max);
    const blob = rand() < BLOB.chance ? BLOB.lift : 0;
    const rise = clamp(level + range(rand, -RIPPLE, RIPPLE) + blob, 0.02, 1);
    points.push({ x, y: height * (1 - rise) });
  }

  // a quadratic curve through each point's midpoints keeps the surface smooth, like liquid, with no corners
  const curve = points.slice(1).map((point, index) => {
    const previous = points[index];
    return `Q${round(previous.x)} ${round(previous.y)} ${round((previous.x + point.x) / 2)} ${round((previous.y + point.y) / 2)}`;
  });
  const last = points[points.length - 1];
  return `M0 ${round(points[0].y)} ${curve.join(" ")} L${round(last.x)} ${round(last.y)} L${width} ${height} L0 ${height} Z`;
}
