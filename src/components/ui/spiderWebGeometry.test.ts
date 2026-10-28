import { describe, expect, test } from "vitest";
import { buildSpiderWeb, WEB_SIZE } from "./spiderWebGeometry";

const numbers = (path: string): number[] => (path.match(/-?\d+(\.\d+)?/g) ?? []).map(Number);

describe("buildSpiderWeb", () => {
  test("returns identical geometry for the same seed so server and client markup match", () => {
    expect(buildSpiderWeb(31)).toEqual(buildSpiderWeb(31));
  });

  test("keeps every thread inside the view box", () => {
    const web = buildSpiderWeb();
    const coordinates = [web.frame, web.anchors, web.spokes, web.hub, web.spiral].flatMap(numbers);
    expect(coordinates.length).toBeGreaterThan(0);
    coordinates.forEach((value) => {
      expect(value).toBeGreaterThanOrEqual(-0.1);
      expect(value).toBeLessThanOrEqual(WEB_SIZE + 0.1);
    });
  });

  test("lays a dense capture spiral rather than a handful of rings", () => {
    const segments = buildSpiderWeb().spiral.split("M").length - 1;
    expect(segments).toBeGreaterThan(200);
  });
});
