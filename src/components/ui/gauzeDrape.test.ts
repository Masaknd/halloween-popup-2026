import { describe, expect, test } from "vitest";
import { buildGauze, GAUZE_BOX } from "./gauzeDrape";

const numbers = (path: string): number[] => (path.match(/-?\d+(\.\d+)?/g) ?? []).map(Number);
const ys = (path: string): number[] => numbers(path).filter((_, index) => index % 2 === 1);

describe("buildGauze", () => {
  test("returns the same drape for the same seed so server and client markup match", () => {
    expect(buildGauze(4)).toEqual(buildGauze(4));
  });

  test("varies the drape by seed", () => {
    expect(buildGauze(1).cloth).not.toEqual(buildGauze(2).cloth);
  });

  test("hangs the cloth from the top edge and keeps every part inside the box", () => {
    const drape = buildGauze(7);
    expect(drape.cloth.startsWith("M0 0")).toBe(true);
    const paths = [drape.cloth, ...drape.folds.map((fold) => fold.d), ...drape.fringe, ...drape.threads];
    paths.forEach((path) => {
      ys(path).forEach((y) => {
        expect(y).toBeGreaterThanOrEqual(0);
        expect(y).toBeLessThanOrEqual(GAUZE_BOX.height);
      });
    });
  });

  test("tears the hem raggedly, sagging deep between pins and rising near them", () => {
    const hem = ys(buildGauze(3).cloth).slice(1, -1);
    expect(hem.length).toBeGreaterThan(150);
    expect(Math.max(...hem) - Math.min(...hem)).toBeGreaterThan(GAUZE_BOX.height * 0.4);
    const jumps = hem.slice(1).filter((y, index) => Math.abs(y - hem[index]) > 2);
    expect(jumps.length).toBeGreaterThan(hem.length * 0.3);
  });

  test("hangs some swags long and others short", () => {
    [1, 3, 9].forEach((seed) => {
      const hem = ys(buildGauze(seed).cloth).slice(1, -1);
      const window = 40;
      const deepest = Array.from({ length: Math.floor(hem.length / window) }, (_, index) =>
        Math.max(...hem.slice(index * window, (index + 1) * window)),
      );
      expect(Math.max(...deepest) - Math.min(...deepest)).toBeGreaterThan(70);
    });
  });

  test("frays the hem with many short threads, a few long ones, folds and holes", () => {
    const drape = buildGauze(5);
    expect(drape.fringe.length).toBeGreaterThan(80);
    expect(drape.threads.length).toBeGreaterThanOrEqual(5);
    expect(drape.folds.length).toBeGreaterThanOrEqual(12);
    expect(drape.holes.length).toBeGreaterThanOrEqual(3);
  });
});
