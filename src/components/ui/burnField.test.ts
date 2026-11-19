import { describe, expect, test } from "vitest";
import { burnField, burnMasks } from "./burnField";

const SIZE = 48;
const count = (values: Uint8ClampedArray, predicate: (value: number) => boolean): number =>
  values.reduce((total, value) => total + (predicate(value) ? 1 : 0), 0);

describe("burnField", () => {
  test("is the same for the same seed and differs between seeds", () => {
    expect(burnField(SIZE, SIZE, 7)).toEqual(burnField(SIZE, SIZE, 7));
    expect(burnField(SIZE, SIZE, 7)).not.toEqual(burnField(SIZE, SIZE, 8));
  });

  test("spreads evenly over 0..1, so the front burns as much of the block at every step", () => {
    const field = burnField(SIZE, SIZE, 7);
    [0.1, 0.5, 0.9].forEach((level) => {
      const below = field.filter((value) => value < level).length / field.length;
      expect(Math.abs(below - level)).toBeLessThan(0.02);
    });
  });

  test("covers the whole 0..1 range so the front sweeps from first spark to last ember", () => {
    const field = burnField(SIZE, SIZE, 7);
    expect(field).toHaveLength(SIZE * SIZE);
    expect(Math.min(...field)).toBe(0);
    expect(Math.max(...field)).toBe(1);
  });

  test("fills a wide block cell for cell, still spanning 0..1", () => {
    const field = burnField(SIZE, SIZE / 4, 7);
    expect(field).toHaveLength(SIZE * (SIZE / 4));
    expect(Math.min(...field)).toBe(0);
    expect(Math.max(...field)).toBe(1);
  });
});

describe("burnMasks", () => {
  const field = burnField(SIZE, SIZE, 7);

  test("shows nothing before the burn starts", () => {
    const { shown, rim } = burnMasks(field, 0);
    expect(count(shown, (value) => value > 0)).toBe(0);
    expect(count(rim, (value) => value > 0)).toBe(0);
  });

  test("shows everything once the burn is done", () => {
    expect(count(burnMasks(field, 1).shown, (value) => value < 255)).toBe(0);
  });

  test("burns open steadily, still taking new ground late in the burn rather than all at once midway", () => {
    const burntAt = (reveal: number): number =>
      burnMasks(field, reveal).shown.reduce((total, value) => total + value / 255, 0) / field.length;
    expect(burntAt(0.25)).toBeGreaterThan(0.15);
    expect(burntAt(0.25)).toBeLessThan(0.4);
    expect(burntAt(0.5)).toBeGreaterThan(0.4);
    expect(burntAt(0.5)).toBeLessThan(0.7);
    expect(burntAt(0.75)).toBeLessThan(0.95);
  });

  test("the last embers go out exactly as the burn ends, not before", () => {
    expect(count(burnMasks(field, 0.97).rim, (value) => value > 0)).toBeGreaterThan(0);
    expect(count(burnMasks(field, 1).rim, (value) => value > 0)).toBe(0);
  });

  test("midway, part is shown and an ember rim glows only along the revealed edge", () => {
    const { shown, rim } = burnMasks(field, 0.5);
    const shownCount = count(shown, (value) => value > 0);
    expect(shownCount).toBeGreaterThan(field.length * 0.1);
    expect(shownCount).toBeLessThan(field.length * 0.9);
    expect(count(rim, (value) => value > 0)).toBeGreaterThan(0);
    rim.forEach((value, index) => {
      if (value > 0) expect(shown[index]).toBeGreaterThan(0);
    });
  });
});
