"use client";

import { useEffect, useRef } from "react";
import { TuningPanel } from "@/components/ui/TuningPanel";
import { startFog } from "./fogRenderer";
import { DEFAULT_FOG, FOG_CONTROLS, fogStore, type FogSettings } from "./fogSettings";

const applyFog = (settings: FogSettings) => {
  fogStore.current = settings;
};

/**
 * Low fog drifting over the whole site, above the content but under the header and cursor. It never takes clicks, and
 * its opacity is capped so the text beneath stays readable. Tune it with the panel in development or with `/?fog`.
 */
export function Fog() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    return canvas ? startFog(canvas) : undefined;
  }, []);

  return (
    <>
      <canvas ref={canvasRef} aria-hidden className="pointer-events-none fixed inset-0 z-40 size-full" />
      <TuningPanel
        title="Fog"
        storageKey="site-fog"
        queryFlag="fog"
        defaults={DEFAULT_FOG}
        controls={FOG_CONTROLS}
        onChange={applyFog}
        className="fixed bottom-4 right-4 z-[65] sm:bottom-8 sm:right-8"
      />
    </>
  );
}
