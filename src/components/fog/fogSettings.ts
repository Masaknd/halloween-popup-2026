/** Tunable site-wide fog; the panel writes these and the fog renderer reads them every frame. */

import type { SettingControl } from "@/lib/tunedSettings";

export interface FogSettings {
  /** How thick the ground fog is along the bottom of the screen. */
  readonly density: number;
  /** How far up the screen the ground fog reaches, as a share of its height. */
  readonly height: number;
  /** The thin haze left over the rest of the screen. */
  readonly haze: number;
  /** Noise frequency: higher gives smaller, busier wisps. */
  readonly detail: number;
  readonly speed: number;
  /** Radius of the clearing the cursor parts in the fog, as a share of the screen height. */
  readonly clearing: number;
  readonly brightness: number;
  /** A ceiling on the fog's opacity anywhere, so text beneath it always stays readable. */
  readonly maxOpacity: number;
}

export const DEFAULT_FOG: FogSettings = {
  density: 1.1,
  height: 0.55,
  haze: 0.08,
  detail: 2.2,
  speed: 0.06,
  clearing: 0.2,
  brightness: 1.3,
  maxOpacity: 0.45,
};

export const FOG_CONTROLS: readonly SettingControl<FogSettings>[] = [
  { key: "density", label: "Ground fog thickness", min: 0, max: 1.5, step: 0.01 },
  { key: "height", label: "Ground fog height", min: 0.1, max: 1, step: 0.01 },
  { key: "haze", label: "Haze over everything", min: 0, max: 0.3, step: 0.005 },
  { key: "detail", label: "Wisp detail", min: 0.5, max: 6, step: 0.05 },
  { key: "speed", label: "Drift speed", min: 0, max: 0.3, step: 0.005 },
  { key: "clearing", label: "Cursor clearing", min: 0.01, max: 0.6, step: 0.01 },
  { key: "brightness", label: "Brightness", min: 0.2, max: 2, step: 0.01 },
  { key: "maxOpacity", label: "Max opacity", min: 0, max: 0.8, step: 0.01 },
];

/** Current settings, replaced (never mutated) by the panel and read by the render loop without re-rendering React. */
export const fogStore: { current: FogSettings } = { current: DEFAULT_FOG };
