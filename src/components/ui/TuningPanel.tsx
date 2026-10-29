"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { restoreSettings, type NumericSettings, type SettingControl } from "@/lib/tunedSettings";

const COPIED_MS = 1600;

const subscribeNever = () => () => {};

function loadSettings<T extends NumericSettings<T>>(storageKey: string, defaults: T, controls: readonly SettingControl<T>[]): T {
  if (typeof window === "undefined") return defaults;
  try {
    return restoreSettings(JSON.parse(window.localStorage.getItem(storageKey) ?? "null"), defaults, controls);
  } catch {
    return defaults;
  }
}

/** Stores only settings that differ from the defaults, so later changes to the defaults still reach this browser. */
function saveSettings<T extends NumericSettings<T>>(storageKey: string, settings: T, defaults: T) {
  try {
    const isDefault = (Object.keys(defaults) as (keyof T)[]).every((key) => settings[key] === defaults[key]);
    if (isDefault) window.localStorage.removeItem(storageKey);
    else window.localStorage.setItem(storageKey, JSON.stringify(settings));
  } catch {
    // storage can be blocked (private mode); the sliders still work for this visit
  }
}

export interface TuningPanelProps<T> {
  title: string;
  /** Where the settings persist in this browser. */
  storageKey: string;
  /** On the live site the panel only appears with this in the URL, e.g. `/?lights`. */
  queryFlag: string;
  defaults: T;
  controls: readonly SettingControl<T>[];
  /** Receives every change, starting with the settings restored from storage; keep it stable (module-level). */
  onChange: (settings: T) => void;
  /** Positions the panel. */
  className: string;
}

/** Folding slider panel for live-tuning a visual effect; changes apply at once and persist in this browser. */
export function TuningPanel<T extends NumericSettings<T>>({
  title,
  storageKey,
  queryFlag,
  defaults,
  controls,
  onChange,
  className,
}: TuningPanelProps<T>) {
  const isEnabled = useSyncExternalStore(
    subscribeNever,
    () => process.env.NODE_ENV === "development" || new URLSearchParams(window.location.search).has(queryFlag),
    () => false,
  );
  const [settings, setSettings] = useState<T>(() => loadSettings(storageKey, defaults, controls));
  // starts folded to its title bar so it doesn't cover the page; click it to open the sliders
  const [isOpen, setIsOpen] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");

  useEffect(() => {
    onChange(settings);
    saveSettings(storageKey, settings, defaults);
  }, [settings, onChange, storageKey, defaults]);

  useEffect(() => {
    if (copyState === "idle") return;
    const timer = window.setTimeout(() => setCopyState("idle"), COPIED_MS);
    return () => window.clearTimeout(timer);
  }, [copyState]);

  if (!isEnabled) return null;

  const copyValues = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(settings, null, 2));
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
  };

  return (
    <div className={`pointer-events-auto w-72 rounded-sm border border-candle/25 bg-void/80 text-bone shadow-2xl backdrop-blur-md ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        className="label flex w-full items-center justify-between px-4 py-3 text-candle/90"
      >
        <span>{title}</span>
        <span aria-hidden>{isOpen ? "−" : "+"}</span>
      </button>
      {isOpen ? (
        <div className="flex flex-col gap-4 border-t border-candle/15 px-4 pb-4 pt-3">
          {controls.map((control) => (
            <label key={control.key} className="flex flex-col gap-1.5">
              <span className="flex items-baseline justify-between text-sm italic text-bone/80">
                {control.label}
                <span className="font-label text-xs not-italic tabular-nums text-candle/80">
                  {settings[control.key].toFixed(2)}
                </span>
              </span>
              <input
                type="range"
                min={control.min}
                max={control.max}
                step={control.step}
                value={settings[control.key]}
                onChange={(event) => setSettings((current) => ({ ...current, [control.key]: Number(event.target.value) }))}
                className="w-full accent-[#e6b56a]"
              />
            </label>
          ))}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setSettings(defaults)}
              className="label flex-1 border border-bone/25 py-2 text-bone/70 hover:border-candle/60 hover:text-candle"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={copyValues}
              className="label flex-1 border border-bone/25 py-2 text-bone/70 hover:border-candle/60 hover:text-candle"
            >
              {copyState === "copied" ? "Copied" : copyState === "failed" ? "Copy failed" : "Copy values"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
