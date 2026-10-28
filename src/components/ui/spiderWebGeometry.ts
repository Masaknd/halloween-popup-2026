import { createRandom, range } from "../../lib/random";

/** Procedural corner orb web, built the way an orb weaver spins one: frame, spokes, hub, then the capture spiral. */

export type Point = readonly [number, number];

export const WEB_SIZE = 200;
/** Where the spokes meet; set off the corner as in a real web. */
export const HUB: Point = [64, 60];
/** Frame threads, clockwise from the corner; edges along the top and left walls are the walls themselves. */
const FRAME: readonly Point[] = [
  [0, 0],
  [168, 0],
  [184, 88],
  [122, 158],
  [34, 184],
  [0, 150],
];
/** Frame corners that hang free are tied back to the walls or the view edge. */
const ANCHORS: readonly (readonly [Point, Point])[] = [
  [[184, 88], [200, 34]],
  [[122, 158], [200, 196]],
  [[34, 184], [70, 200]],
];
const SPOKES = 26;
const SPOKE_JITTER = 4;
/** Capture spiral: starts outside the free zone round the hub and steps outward this far per turn. */
const SPIRAL_START = 15;
const SPIRAL_GAP = 7;
/** The spiral stops short of the frame, as the spider never lays it right up to the frame threads. */
const SPIRAL_REACH = 0.93;
/** Spiral threads bow slightly toward the hub between spokes. */
const SAG = 0.08;
const BREAK_CHANCE = 0.05;
const DROP_CHANCE = 0.05;
const LOOSE_STRANDS = 3;

export interface WebGeometry {
  frame: string;
  anchors: string;
  spokes: string;
  hub: string;
  spiral: string;
  loose: string;
  drops: readonly Point[];
}

const round = (value: number): number => Math.round(value * 10) / 10;
const fmt = ([x, y]: Point): string => `${round(x)} ${round(y)}`;
const along = (from: Point, to: Point, t: number): Point => [from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t];

/** Distance from the hub along `angle` to the frame polygon. */
function frameDistance(angle: number): number {
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);
  let nearest = Infinity;
  FRAME.forEach((start, index) => {
    const end = FRAME[(index + 1) % FRAME.length] ?? start;
    const ex = end[0] - start[0];
    const ey = end[1] - start[1];
    const denominator = dx * ey - dy * ex;
    if (Math.abs(denominator) < 1e-9) return;
    const sx = start[0] - HUB[0];
    const sy = start[1] - HUB[1];
    const distance = (sx * ey - sy * ex) / denominator;
    const edgeT = (sx * dy - sy * dx) / denominator;
    if (distance > 0 && edgeT >= 0 && edgeT <= 1) nearest = Math.min(nearest, distance);
  });
  return nearest;
}

export function buildSpiderWeb(seed = 31): WebGeometry {
  const rand = createRandom(seed);
  const angles = Array.from(
    { length: SPOKES },
    (_, index) => ((index * 360) / SPOKES + range(rand, -SPOKE_JITTER, SPOKE_JITTER)) * (Math.PI / 180),
  );
  const lengths = angles.map(frameDistance);
  const onSpoke = (index: number, radius: number): Point => {
    const angle = angles[index] ?? 0;
    return [HUB[0] + Math.cos(angle) * radius, HUB[1] + Math.sin(angle) * radius];
  };

  const spokes = angles.map((_, index) => `M${fmt(HUB)} L${fmt(onSpoke(index, lengths[index] ?? 0))}`).join(" ");

  // the hub: a few tight, uneven loops of straight thread
  const hub = [3, 5.5, 8.5]
    .map((radius) =>
      angles
        .map((_, index) => `${index === 0 ? "M" : "L"}${fmt(onSpoke(index, radius + range(rand, -0.8, 0.8)))}`)
        .join(" ")
        .concat(" Z"),
    )
    .join(" ");

  // the capture spiral, one segment per pair of neighbouring spokes; it turns back where short spokes run out
  const spiral: string[] = [];
  const drops: Point[] = [];
  const longest = Math.max(...lengths);
  for (let step = 0; ; step += 1) {
    const index = step % SPOKES;
    const next = (index + 1) % SPOKES;
    const radius = SPIRAL_START + (step / SPOKES) * SPIRAL_GAP;
    const nextRadius = radius + SPIRAL_GAP / SPOKES;
    if (radius > longest) break;
    const fits =
      radius < (lengths[index] ?? 0) * SPIRAL_REACH && nextRadius < (lengths[next] ?? 0) * SPIRAL_REACH;
    if (!fits || rand() < BREAK_CHANCE) continue;
    const start = onSpoke(index, radius);
    const end = onSpoke(next, nextRadius);
    const control = along(HUB, along(start, end, 0.5), 1 - SAG);
    spiral.push(`M${fmt(start)} Q${fmt(control)} ${fmt(end)}`);
    if (rand() < DROP_CHANCE) drops.push(along(start, end, range(rand, 0.3, 0.7)));
  }

  // a few snapped threads hanging loose under their own weight
  const loose = Array.from({ length: LOOSE_STRANDS }, () => {
    const index = Math.floor(range(rand, 0, SPOKES));
    const start = onSpoke(index, range(rand, 0.45, 0.85) * (lengths[index] ?? 0));
    const drop = range(rand, 10, 22);
    const sway = range(rand, -6, 6);
    return `M${fmt(start)} Q${fmt([start[0] + sway, start[1] + drop * 0.6])} ${fmt([start[0] + sway * 0.4, start[1] + drop])}`;
  }).join(" ");

  const frame = FRAME.slice(1)
    .map((point, index) => `${index === 0 ? "M" : "L"}${fmt(point)}`)
    .join(" ");
  const anchors = ANCHORS.map(([from, to]) => `M${fmt(from)} L${fmt(to)}`).join(" ");

  return { frame, anchors, spokes, hub, spiral: spiral.join(" "), loose, drops: drops.map(([x, y]) => [round(x), round(y)]) };
}
