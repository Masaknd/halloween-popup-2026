import { createRandom, range } from "../../lib/random";

/** Cracks are drawn in a square box this size, stretched over the stone. */
export const CRACK_BOX = 100;

/** One straight piece of a crack; `width` is its stroke in screen pixels, so a crack can taper piece by piece. */
export interface CrackSegment {
  d: string;
  width: number;
}

interface Point {
  x: number;
  y: number;
}

interface Run {
  start: Point;
  heading: number;
  width: number;
  steps: number;
  depth: number;
}

const MARGIN = 1;
/** The main fracture's stroke where it opens at the stone's edge, and the finest hairline it narrows to. */
const OPENING_WIDTH = 2.4;
const TIP_WIDTH = 0.35;
/** How far each piece runs, and how sharply a crack can turn between pieces (radians). */
const STEP = { min: 1.2, max: 4.2 } as const;
const MAX_TURN = 0.75;
/** Cracks keep a loose memory of where they set out for, so they wander instead of curling back. */
const HEADING_PULL = 0.25;
const BRANCH_CHANCE = 0.22;
const MAX_DEPTH = 2;

const CENTRE = CRACK_BOX / 2;

const round = (value: number): number => Math.round(value * 100) / 100;
const isInside = ({ x, y }: Point): boolean =>
  x >= MARGIN && x <= CRACK_BOX - MARGIN && y >= MARGIN && y <= CRACK_BOX - MARGIN;

const advance = (point: Point, heading: number, length: number): Point => ({
  x: point.x + Math.cos(heading) * length,
  y: point.y + Math.sin(heading) * length,
});

/** Where the main fracture starts: low on a side or along the foot, where stones crack from frost and settling. */
function openingOf(rand: () => number): Pick<Run, "start" | "heading"> {
  const side = Math.floor(rand() * 3);
  if (side === 0) return { start: { x: MARGIN, y: range(rand, 35, 90) }, heading: range(rand, -0.7, 0.4) };
  if (side === 1) return { start: { x: CRACK_BOX - MARGIN, y: range(rand, 35, 90) }, heading: Math.PI + range(rand, -0.4, 0.7) };
  return { start: { x: range(rand, 15, 85), y: CRACK_BOX - MARGIN }, heading: -Math.PI / 2 + range(rand, -0.8, 0.8) };
}

/** Walks one crack piece by piece, narrowing as it goes, and forks off thinner side cracks along the way. */
function walk(run: Run, rand: () => number, segments: CrackSegment[]): void {
  let point = run.start;
  let heading = run.heading;
  for (let step = 0; step < run.steps; step += 1) {
    heading += range(rand, -MAX_TURN, MAX_TURN) + (run.heading - heading) * HEADING_PULL;
    const length = range(rand, STEP.min, STEP.max);
    let next = advance(point, heading, length);
    if (!isInside(next)) {
      // a crack meeting the stone's edge veers back across the face rather than stopping short
      heading = Math.atan2(CENTRE - point.y, CENTRE - point.x) + range(rand, -MAX_TURN, MAX_TURN);
      next = advance(point, heading, length);
      if (!isInside(next)) return;
    }
    const width = Math.max(TIP_WIDTH, run.width * (1 - step / run.steps));
    segments.push({ d: `M${round(point.x)} ${round(point.y)} L${round(next.x)} ${round(next.y)}`, width: round(width) });
    if (run.depth < MAX_DEPTH && rand() < BRANCH_CHANCE) {
      const side = rand() < 0.5 ? -1 : 1;
      walk(
        {
          start: next,
          heading: heading + side * range(rand, 0.5, 1.2),
          width: width * 0.55,
          steps: Math.max(2, Math.round((run.steps - step) * range(rand, 0.3, 0.6))),
          depth: run.depth + 1,
        },
        rand,
        segments,
      );
    }
    point = next;
  }
}

/**
 * A weathered stone's cracks for one seed: a main fracture running in from an edge, forking into thinner cracks,
 * plus a couple of loose hairlines crazing the face.
 */
export function buildCracks(seed: number): CrackSegment[] {
  const rand = createRandom(seed * 7919 + 17);
  const segments: CrackSegment[] = [];
  walk({ ...openingOf(rand), width: OPENING_WIDTH, steps: Math.round(range(rand, 18, 28)), depth: 0 }, rand, segments);

  const hairlines = 1 + Math.floor(rand() * 2);
  for (let index = 0; index < hairlines; index += 1) {
    walk(
      {
        start: { x: range(rand, 10, 90), y: range(rand, 15, 90) },
        heading: range(rand, 0, Math.PI * 2),
        width: 0.7,
        steps: Math.round(range(rand, 4, 8)),
        depth: MAX_DEPTH - 1,
      },
      rand,
      segments,
    );
  }
  return segments;
}
