"use client";

import { TuningPanel } from "@/components/ui/TuningPanel";
import { DEFAULT_LIGHT, LIGHT_CONTROLS, lightStore, type LightSettings } from "./lightSettings";

const applyLight = (settings: LightSettings) => {
  lightStore.current = settings;
};

/** Sliders for the hero's cursor light; changes show live in the WebGL scene and persist in this browser. */
export function LightPanel() {
  return (
    <TuningPanel
      title="Candle light"
      storageKey="hero-light"
      queryFlag="lights"
      defaults={DEFAULT_LIGHT}
      controls={LIGHT_CONTROLS}
      onChange={applyLight}
      className="order-1"
    />
  );
}
