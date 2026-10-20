export interface Point {
  readonly x: number;
  readonly y: number;
}

const round = (value: number): number => Math.round(value * 10000) / 10000;

/** Closed smooth path through the points (Catmull-Rom converted to cubic Béziers). */
export function blobPath(points: readonly Point[]): string {
  if (points.length < 3) throw new Error("A blob needs at least 3 points");
  const at = (index: number): Point => points[(index + points.length) % points.length] as Point;
  const first = at(0);
  const segments = points.map((_, index) => {
    const p0 = at(index - 1);
    const p1 = at(index);
    const p2 = at(index + 1);
    const p3 = at(index + 2);
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    return `C${round(c1.x)} ${round(c1.y)} ${round(c2.x)} ${round(c2.y)} ${round(p2.x)} ${round(p2.y)}`;
  });
  return `M${round(first.x)} ${round(first.y)} ${segments.join(" ")} Z`;
}

export interface BlobOptions {
  readonly count: number;
  readonly cx: number;
  readonly cy: number;
  readonly radius: number;
  /** 0..1 — how far each point may wander from the radius */
  readonly wobble: number;
  readonly phases: readonly number[];
}

/** Points on a wobbling circle; animate by advancing `time`. */
export function blobPoints({ count, cx, cy, radius, wobble, phases }: BlobOptions, time: number): Point[] {
  return Array.from({ length: count }, (_, index) => {
    const angle = (index / count) * Math.PI * 2;
    const phase = phases[index % phases.length] ?? 0;
    const r = radius * (1 + wobble * (Math.sin(time + phase) * 0.6 + Math.sin(time * 1.7 + phase * 2.3) * 0.4));
    return { x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r };
  });
}
