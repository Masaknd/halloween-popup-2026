/** Number-only settings edited live by a tuning panel and kept in the browser between visits. */

export type NumericSettings<T> = { readonly [K in keyof T]: number };

export interface SettingControl<T> {
  readonly key: keyof T & string;
  readonly label: string;
  readonly min: number;
  readonly max: number;
  readonly step: number;
}

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

/**
 * Rebuilds settings from whatever was stored: each control keeps its stored value when it is a finite number (clamped
 * into the control's range) and falls back to its default otherwise, so a newly added control never drops the rest.
 */
export function restoreSettings<T extends NumericSettings<T>>(
  stored: unknown,
  defaults: T,
  controls: readonly SettingControl<T>[],
): T {
  const source = typeof stored === "object" && stored !== null ? (stored as Record<string, unknown>) : {};
  return controls.reduce<T>((settings, { key, min, max }) => {
    const value = source[key];
    return typeof value === "number" && Number.isFinite(value) ? { ...settings, [key]: clamp(value, min, max) } : settings;
  }, defaults);
}
