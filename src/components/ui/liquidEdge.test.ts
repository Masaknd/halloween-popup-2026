import { describe, expect, test } from "vitest";
import { buildLiquidEdge, LIQUID_EDGE } from "./liquidEdge";

const numbers = (path: string): number[] => (path.match(/-?\d+(\.\d+)?/g) ?? []).map(Number);

describe("buildLiquidEdge", () => {
  test("returns the same outline for the same seed so server and client markup match", () => {
    expect(buildLiquidEdge(4)).toEqual(buildLiquidEdge(4));
  });

  test("varies the outline by seed", () => {
    expect(buildLiquidEdge(1)).not.toEqual(buildLiquidEdge(2));
  });

  test("stays inside its box and closes along the bottom so it joins the band below", () => {
    const path = buildLiquidEdge(7);
    numbers(path).forEach((value) => {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(LIQUID_EDGE.width);
    });
    expect(path.endsWith(`L${LIQUID_EDGE.width} ${LIQUID_EDGE.height} L0 ${LIQUID_EDGE.height} Z`)).toBe(true);
  });

  test("rises and falls irregularly rather than as an even wave", () => {
    const crests = numbers(buildLiquidEdge(3))
      .filter((_, index) => index % 2 === 1)
      .slice(1, -2);
    const spread = Math.max(...crests) - Math.min(...crests);
    expect(spread).toBeGreaterThan(LIQUID_EDGE.height * 0.4);
  });
});
