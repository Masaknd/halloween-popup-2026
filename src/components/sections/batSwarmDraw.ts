import { createRandom, range } from "@/lib/random";

export interface SwarmBat {
  x: number; // 0..1 of width
  offset: number; // vertical offset from the horizon, in viewport heights
  size: number;
  flapSpeed: number;
  phase: number;
  drift: number;
  dx: number;
  dy: number;
  vx: number;
  vy: number;
}

export const COLORS = { void: "#0b090a", soot: "#141015", blood: "#8c1d27", ember: "#a5531f", wine: "#561220" } as const;

export function createSwarm(count: number): SwarmBat[] {
  const rand = createRandom(31);
  return Array.from({ length: count }, () => {
    // bias bats to cluster just above and below the horizon, like the reference
    const offset = (rand() - 0.62) * 0.9 * rand();
    return {
      x: rand(),
      offset,
      size: range(rand, 10, 34) * (1 - Math.abs(offset) * 1.4),
      flapSpeed: range(rand, 6, 12),
      phase: rand() * Math.PI * 2,
      drift: range(rand, 0.004, 0.02),
      dx: 0,
      dy: 0,
      vx: 0,
      vy: 0,
    };
  });
}

/** Bat silhouette centred on (x, y); flap in [-1, 1] moves the wingtips. */
export function drawBat(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, flap: number): void {
  const tipY = y - size * 0.45 * flap;
  const s = size;
  ctx.beginPath();
  ctx.moveTo(x, y - s * 0.12);
  ctx.lineTo(x - s * 0.07, y - s * 0.3);
  ctx.lineTo(x - s * 0.1, y - s * 0.08);
  ctx.quadraticCurveTo(x - s * 0.5, y - s * 0.25 - s * 0.2 * flap, x - s, tipY);
  ctx.quadraticCurveTo(x - s * 0.82, tipY + s * 0.2, x - s * 0.72, y + s * 0.12);
  ctx.quadraticCurveTo(x - s * 0.55, y, x - s * 0.42, y + s * 0.18);
  ctx.quadraticCurveTo(x - s * 0.28, y + s * 0.05, x - s * 0.12, y + s * 0.2);
  ctx.lineTo(x, y + s * 0.32);
  ctx.lineTo(x + s * 0.12, y + s * 0.2);
  ctx.quadraticCurveTo(x + s * 0.28, y + s * 0.05, x + s * 0.42, y + s * 0.18);
  ctx.quadraticCurveTo(x + s * 0.55, y, x + s * 0.72, y + s * 0.12);
  ctx.quadraticCurveTo(x + s * 0.82, tipY + s * 0.2, x + s, tipY);
  ctx.quadraticCurveTo(x + s * 0.5, y - s * 0.25 - s * 0.2 * flap, x + s * 0.1, y - s * 0.08);
  ctx.lineTo(x + s * 0.07, y - s * 0.3);
  ctx.closePath();
  ctx.fill();
}

/** Ragged orange rising from the bottom. */
export function drawHorizon(ctx: CanvasRenderingContext2D, width: number, height: number, horizon: number, time: number): void {
  // a blood moon rising: wine at the rim deepening to ember below
  const gradient = ctx.createLinearGradient(0, horizon, 0, height);
  gradient.addColorStop(0, COLORS.blood);
  gradient.addColorStop(0.35, COLORS.wine);
  gradient.addColorStop(0.7, "#2b0a10");
  // the lowest band matches the next section so the hand-off is seamless
  gradient.addColorStop(1, COLORS.soot);
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.moveTo(0, height);
  for (let x = 0; x <= width; x += 16) {
    const wave = Math.sin(x * 0.012 + time * 0.8) * 10 + Math.sin(x * 0.041 - time * 1.3) * 5;
    ctx.lineTo(x, horizon + wave);
  }
  ctx.lineTo(width, height);
  ctx.closePath();
  ctx.fill();
}
