/** Seeded geometry for torn cheesecloth pinned along the top of a section: swags, a ragged hem, folds, holes and fraying. */

import { createRandom, range } from "../../lib/random";

export const GAUZE_BOX = { width: 1200, height: 240 } as const;

export interface GauzeFold {
  d: string;
  width: number;
  tone: "light" | "dark";
  opacity: number;
}

export interface GauzeHole {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  angle: number;
}

export interface GauzeDrape {
  /** The cloth's outline: the top edge, then the torn hem from left to right. */
  cloth: string;
  folds: GauzeFold[];
  holes: GauzeHole[];
  /** Short frayed threads along the hem. */
  fringe: string[];
  /** A few long threads hanging loose from the hem. */
  threads: string[];
}

type Random = () => number;
interface Pin {
  x: number;
  /** How far below the top edge the hem sits at this pin. */
  drop: number;
}

const PIN_SPACING = 200;
const PIN_JITTER = 55;
/** Each swag hangs either short or long, so the drape never settles into an even scallop. */
const SAG_SHORT = { min: 35, max: 80 } as const;
const SAG_LONG = { min: 125, max: 180 } as const;
const HEM_STEP = 5;
/** Chances, per hem step, that a strip of cloth hangs lower or a bite is torn out of it. */
const TONGUE_CHANCE = 0.05;
const BITE_CHANCE = 0.04;
/** Room kept clear at the foot of the box so fraying never runs off it. */
const FOOT = 2;

const fmt = (value: number): string => String(Math.round(value * 10) / 10);
const clampY = (y: number): number => Math.min(GAUZE_BOX.height - FOOT, Math.max(0, y));

/** Pins from just off the left edge to just off the right, unevenly spaced. */
function placePins(rand: Random): Pin[] {
  const count = Math.ceil(GAUZE_BOX.width / PIN_SPACING) + 1;
  return Array.from({ length: count + 1 }, (_, index) => ({
    x: index * PIN_SPACING - 20 + (index === 0 || index === count ? 0 : range(rand, -PIN_JITTER, PIN_JITTER)),
    drop: range(rand, 10, 32),
  }));
}

/** How far each swag sags: short or long at random, but never the same three times running. */
function pickSags(rand: Random, count: number): number[] {
  return Array.from({ length: count }).reduce<{ sags: number[]; longs: boolean[] }>(
    ({ sags, longs }) => {
      const [before, last] = longs.slice(-2);
      const isLong = longs.length >= 2 && before === last ? !last : rand() < 0.5;
      const tier = isLong ? SAG_LONG : SAG_SHORT;
      return { sags: [...sags, range(rand, tier.min, tier.max)], longs: [...longs, isLong] };
    },
    { sags: [], longs: [] },
  ).sags;
}

/** The untorn hem: sagging between each pair of pins, deepest midway. */
function swagHem(pins: Pin[], sags: number[], x: number): number {
  const index = Math.max(0, pins.findIndex((pin, i) => i + 1 < pins.length && x <= pins[i + 1].x));
  const [a, b] = [pins[index], pins[index + 1]];
  const t = (x - a.x) / (b.x - a.x);
  return a.drop + (b.drop - a.drop) * t + sags[index] * 4 * t * (1 - t);
}

/** Tears the hem: a wandering rag, single loose strands, strips hanging lower and bites torn out. */
function tearHem(rand: Random, base: (x: number) => number): number[] {
  const steps = GAUZE_BOX.width / HEM_STEP;
  let wander = 0;
  let extra: number[] = [];
  return Array.from({ length: steps + 1 }, (_, step) => {
    wander = wander * 0.8 + range(rand, -3, 3);
    if (extra.length === 0 && rand() < TONGUE_CHANCE) {
      const width = Math.round(range(rand, 2, 6));
      const depth = range(rand, 14, 38);
      extra = Array.from({ length: width }, (_, i) => depth * Math.sin((Math.PI * (i + 0.5)) / width));
    } else if (extra.length === 0 && rand() < BITE_CHANCE) {
      const width = Math.round(range(rand, 2, 4));
      extra = Array.from({ length: width }, () => -range(rand, 8, 22));
    }
    const torn = extra.shift() ?? 0;
    return clampY(Math.max(6, base(step * HEM_STEP) + wander + range(rand, -2.5, 2.5) + torn));
  });
}

/** Folds fan out from each pin into the swags either side, where the cloth hangs from it. */
function buildFolds(rand: Random, pins: Pin[], hemAt: (x: number) => number): GauzeFold[] {
  return pins.slice(0, -1).flatMap((pin, index) => {
    const next = pins[index + 1];
    const fan = [0.12, 0.27, 0.42, 0.58, 0.73, 0.88];
    return fan.map((t, k) => {
      const from = t < 0.5 ? pin.x : next.x;
      const x = pin.x + (next.x - pin.x) * (t + range(rand, -0.04, 0.04));
      const y = clampY(hemAt(x) - range(rand, 3, 12));
      const bend = (x - from) * 0.3;
      return {
        d: `M${fmt(from)} 0 Q${fmt(from + bend)} ${fmt(y * 0.75)} ${fmt(x)} ${fmt(y)}`,
        width: range(rand, 3, 9),
        tone: k % 2 === 0 ? "light" : "dark",
        opacity: range(rand, 0.35, 0.75),
      } satisfies GauzeFold;
    });
  });
}

/** Slits and holes torn through the cloth, mostly running across the weave, kept well inside it. */
function buildHoles(rand: Random, hemAt: (x: number) => number): GauzeHole[] {
  const count = Math.round(range(rand, 3, 5));
  return Array.from({ length: count }, () => {
    const cx = range(rand, 40, GAUZE_BOX.width - 40);
    const room = Math.max(24, hemAt(cx) - 18);
    return {
      cx,
      cy: range(rand, 14, room),
      rx: range(rand, 7, 18),
      ry: range(rand, 1.5, 4.5),
      angle: range(rand, -20, 20),
    };
  });
}

/** Short curling ends of the weave all along the torn hem. */
function buildFringe(rand: Random, hem: number[]): string[] {
  return hem.flatMap((y, step) => {
    const count = rand() < 0.75 ? Math.round(range(rand, 1, 2)) : 0;
    return Array.from({ length: count }, () => {
      const x = step * HEM_STEP + range(rand, -2.5, 2.5);
      const end = clampY(y + range(rand, 3, 15));
      const lean = range(rand, -3, 3);
      return `M${fmt(x)} ${fmt(y - 1)} Q${fmt(x + lean)} ${fmt((y + end) / 2)} ${fmt(x + lean * 0.4)} ${fmt(end)}`;
    });
  });
}

/** Long loose threads drifting down from the hem. */
function buildThreads(rand: Random, hem: number[]): string[] {
  const count = Math.round(range(rand, 6, 9));
  return Array.from({ length: count }, () => {
    const step = Math.floor(range(rand, 2, hem.length - 2));
    const [x, y] = [step * HEM_STEP, hem[step]];
    const length = Math.min(range(rand, 28, 80), GAUZE_BOX.height - FOOT - y);
    const sway = range(rand, 4, 12) * (rand() < 0.5 ? -1 : 1);
    return `M${fmt(x)} ${fmt(y - 1)} C${fmt(x + sway)} ${fmt(y + length * 0.35)} ${fmt(x - sway * 0.8)} ${fmt(y + length * 0.7)} ${fmt(x + sway * 0.4)} ${fmt(y + length)}`;
  });
}

export function buildGauze(seed: number): GauzeDrape {
  const rand = createRandom(seed);
  const pins = placePins(rand);
  const sags = pickSags(rand, pins.length - 1);
  const hem = tearHem(rand, (x) => swagHem(pins, sags, x));
  const hemAt = (x: number): number => hem[Math.min(hem.length - 1, Math.max(0, Math.round(x / HEM_STEP)))];
  const outline = hem.map((y, step) => `L${step * HEM_STEP} ${fmt(y)}`).join(" ");

  return {
    cloth: `M0 0 ${outline} L${GAUZE_BOX.width} 0 Z`,
    folds: buildFolds(rand, pins, hemAt),
    holes: buildHoles(rand, hemAt),
    fringe: buildFringe(rand, hem),
    threads: buildThreads(rand, hem),
  };
}
