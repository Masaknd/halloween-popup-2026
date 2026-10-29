/** Tunable cursor light for the hero; the panel writes these and the WebGL scene reads them every frame. */

import type { SettingControl } from "@/lib/tunedSettings";
export interface LightSettings {
  /** Radius of the warm pool in the mist behind the bats, in fog UV units. */
  readonly mistRadius: number;
  readonly mistBrightness: number;
  /** Radius of the candlelight on the portrait, in portrait UV units. */
  readonly portraitRadius: number;
  readonly portraitBrightness: number;
}

export const DEFAULT_LIGHT: LightSettings = {
  mistRadius: 0.58,
  mistBrightness: 0.3,
  portraitRadius: 0.54,
  portraitBrightness: 1,
};

export const LIGHT_CONTROLS: readonly SettingControl<LightSettings>[] = [
  { key: "mistRadius", label: "Mist glow width", min: 0.15, max: 1.5, step: 0.01 },
  { key: "mistBrightness", label: "Mist glow brightness", min: 0, max: 1, step: 0.01 },
  { key: "portraitRadius", label: "Portrait light width", min: 0.15, max: 1.2, step: 0.01 },
  { key: "portraitBrightness", label: "Portrait light brightness", min: 0, max: 2, step: 0.01 },
];

/** The shaders use a Gaussian `exp(-d² · falloff)`; a radius r maps to falloff 1 / r². */
export const toFalloff = (radius: number): number => 1 / Math.max(radius * radius, 1e-4);

/**
 * Current settings, replaced (never mutated) by the panel. A plain holder rather than React state so the render loop
 * can read it every frame without re-rendering the scene.
 */
export const lightStore: { current: LightSettings } = { current: DEFAULT_LIGHT };
