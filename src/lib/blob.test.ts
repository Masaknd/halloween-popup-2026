import { describe, expect, test } from "vitest";
import { blobPath, blobPoints } from "./blob";

describe("blobPath", () => {
  test("draws one closed cubic segment per point", () => {
    const path = blobPath([
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 0, y: 1 },
    ]);
    expect(path.startsWith("M0 0")).toBe(true);
    expect(path.endsWith("Z")).toBe(true);
    expect(path.match(/C/g)).toHaveLength(4);
  });

  test("passes through every input point", () => {
    const path = blobPath([
      { x: 0.5, y: 0 },
      { x: 1, y: 1 },
      { x: 0, y: 1 },
    ]);
    expect(path).toContain(" 1 1 ");
    expect(path).toContain(" 0 1 ");
  });

  test("throws for fewer than three points", () => {
    expect(() => blobPath([{ x: 0, y: 0 }])).toThrow();
  });
});

describe("blobPoints", () => {
  const options = { count: 8, cx: 0.5, cy: 0.5, radius: 0.4, wobble: 0.1, phases: [0, 1, 2] };

  test("returns the requested number of points", () => {
    expect(blobPoints(options, 0)).toHaveLength(8);
  });

  test("keeps every point within the wobble band", () => {
    blobPoints(options, 3.2).forEach(({ x, y }) => {
      const distance = Math.hypot(x - 0.5, y - 0.5);
      expect(distance).toBeGreaterThanOrEqual(0.4 * 0.9 - 1e-9);
      expect(distance).toBeLessThanOrEqual(0.4 * 1.1 + 1e-9);
    });
  });

  test("moves over time", () => {
    expect(blobPoints(options, 0)).not.toEqual(blobPoints(options, 1));
  });
});
