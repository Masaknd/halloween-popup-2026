"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { DEFAULT_LIGHT, LIGHT_CONTROLS, lightStore, type LightSettings } from "./lightSettings";

const STORAGE_KEY = "hero-light";
/** On the live site the panel only appears with this in the URL, e.g. `/?lights`. */
const QUERY_FLAG = "lights";
const COPIED_MS = 1600;

const subscribeNever = () => () => {};
const isPanelWanted = () =>
  process.env.NODE_ENV === "development" || new URLSearchParams(window.location.search).has(QUERY_FLAG);

function isLightSettings(value: unknown): value is LightSettings {
  if (typeof value !== "object" || value === null) return false;
  return LIGHT_CONTROLS.every(({ key }) => typeof (value as Record<string, unknown>)[key] === "number");
}

function loadSettings(): LightSettings {
  if (typeof window === "undefined") return DEFAULT_LIGHT;
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "null");
    return isLightSettings(parsed) ? parsed : DEFAULT_LIGHT;
  } catch {
    return DEFAULT_LIGHT;
  }
}

function saveSettings(settings: LightSettings) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // storage can be blocked (private mode); the sliders still work for this visit
  }
}

/** Sliders for the hero's cursor light; changes show live in the WebGL scene and persist in this browser. */
export function LightPanel() {
  const isEnabled = useSyncExternalStore(subscribeNever, isPanelWanted, () => false);
  const [settings, setSettings] = useState<LightSettings>(loadSettings);
  const [isOpen, setIsOpen] = useState(true);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");

  useEffect(() => {
    lightStore.current = settings;
    saveSettings(settings);
  }, [settings]);

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
    <div className="pointer-events-auto absolute right-4 top-20 z-30 w-72 rounded-sm border border-candle/25 bg-void/80 text-bone shadow-2xl backdrop-blur-md sm:right-8">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        className="label flex w-full items-center justify-between px-4 py-3 text-candle/90"
      >
        <span>Candle light</span>
        <span aria-hidden>{isOpen ? "−" : "+"}</span>
      </button>
      {isOpen ? (
        <div className="flex flex-col gap-4 border-t border-candle/15 px-4 pb-4 pt-3">
          {LIGHT_CONTROLS.map((control) => (
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
              onClick={() => setSettings(DEFAULT_LIGHT)}
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
