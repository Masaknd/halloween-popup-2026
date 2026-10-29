"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import { useInView, useNearView } from "@/lib/useInView";

const CandleScene = dynamic(() => import("@/components/hero/CandleScene"), { ssr: false });

/** The 3D candle cluster in a sized box; it is built once the box nears the screen and only renders frames while on it. */
export function Candles3D({ className = "" }: { className?: string }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const isVisible = useInView(boxRef);
  const isNear = useNearView(boxRef);
  return (
    <div ref={boxRef} aria-hidden className={`relative ${className}`}>
      <div aria-hidden className="candle-glow pointer-events-none absolute -inset-[20%]" />
      {isNear ? <CandleScene isActive={isVisible} /> : null}
    </div>
  );
}
