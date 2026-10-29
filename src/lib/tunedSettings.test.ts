import { describe, expect, test } from "vitest";
import { restoreSettings, type SettingControl } from "./tunedSettings";

interface Sample {
  readonly width: number;
  readonly glow: number;
}

const DEFAULTS: Sample = { width: 0.5, glow: 1 };
const CONTROLS: readonly SettingControl<Sample>[] = [
  { key: "width", label: "Width", min: 0, max: 1, step: 0.01 },
  { key: "glow", label: "Glow", min: 0, max: 2, step: 0.01 },
];

describe("restoreSettings", () => {
  test("keeps stored values that are numbers within their control's range", () => {
    expect(restoreSettings({ width: 0.2, glow: 1.5 }, DEFAULTS, CONTROLS)).toEqual({ width: 0.2, glow: 1.5 });
  });

  test("falls back to the defaults when nothing usable is stored", () => {
    expect(restoreSettings(null, DEFAULTS, CONTROLS)).toEqual(DEFAULTS);
    expect(restoreSettings("broken", DEFAULTS, CONTROLS)).toEqual(DEFAULTS);
  });

  test("keeps the good values and defaults only the missing or bad ones, such as a newly added control", () => {
    expect(restoreSettings({ width: 0.3, glow: "bright" }, DEFAULTS, CONTROLS)).toEqual({ width: 0.3, glow: 1 });
    expect(restoreSettings({ width: 0.3 }, DEFAULTS, CONTROLS)).toEqual({ width: 0.3, glow: 1 });
  });

  test("clamps stored values into their control's range", () => {
    expect(restoreSettings({ width: 4, glow: -1 }, DEFAULTS, CONTROLS)).toEqual({ width: 1, glow: 0 });
  });

  test("ignores keys no control knows about", () => {
    expect(restoreSettings({ width: 0.4, glow: 1, extra: 9 }, DEFAULTS, CONTROLS)).toEqual({ width: 0.4, glow: 1 });
  });
});
