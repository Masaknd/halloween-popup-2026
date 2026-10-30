"use client";

import { useEffect, useRef } from "react";
import { prepareCandles, showCandles } from "@/components/hero/candleRenderer";
import { useBuildSoon, useInView } from "@/lib/useInView";

/**
 * The 3D candle cluster in a sized box. Every cluster on the page shares one renderer, which is built soon after the
 * intro, and a cluster only takes frames from it while it is on screen.
 */
export function Candles3D({ className = "" }: { className?: string }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isVisible = useInView(boxRef);
  const isDue = useBuildSoon(boxRef);

  useEffect(() => {
    if (isDue) void prepareCandles();
  }, [isDue]);

  useEffect(() => {
    const canvas = canvasRef.current;
    return canvas && isDue && isVisible ? showCandles(canvas) : undefined;
  }, [isDue, isVisible]);

  return (
    <div ref={boxRef} aria-hidden className={`relative ${className}`}>
      <div aria-hidden className="candle-glow pointer-events-none absolute -inset-[20%]" />
      <canvas ref={canvasRef} className="absolute inset-0 size-full" />
    </div>
  );
}
