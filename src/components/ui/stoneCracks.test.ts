import { describe, expect, test } from "vitest";
import { buildCracks, CRACK_BOX } from "./stoneCracks";

const numbers = (path: string): number[] => (path.match(/-?\d+(\.\d+)?/g) ?? []).map(Number);

describe("buildCracks", () => {
  test("returns identical cracks for the same seed so server and client markup match", () => {
    expect(buildCracks(3)).toEqual(buildCracks(3));
  });

  test("gives each stone its own cracks", () => {
    expect(buildCracks(0)).not.toEqual(buildCracks(1));
  });

  test("keeps every crack inside the stone", () => {
    [0, 1, 2, 3].forEach((seed) => {
      buildCracks(seed)
        .flatMap((segment) => numbers(segment.d))
        .forEach((value) => {
          expect(value).toBeGreaterThanOrEqual(0);
          expect(value).toBeLessThanOrEqual(CRACK_BOX);
        });
    });
  });

  test("branches into many jagged segments that taper towards their tips", () => {
    const segments = buildCracks(2);
    expect(segments.length).toBeGreaterThan(15);
    const widths = segments.map((segment) => segment.width);
    expect(Math.max(...widths)).toBeGreaterThan(Math.min(...widths) * 2);
  });
});
