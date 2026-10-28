"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import { useInView } from "@/lib/useInView";

const CandleScene = dynamic(() => import("@/components/hero/CandleScene"), { ssr: false });

/** The 3D candle cluster in a sized box; it only renders frames while on screen. */
export function Candles3D({ className = "" }: { className?: string }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const isVisible = useInView(boxRef);
  return (
    <div ref={boxRef} aria-hidden className={`relative ${className}`}>
      <div aria-hidden className="candle-glow pointer-events-none absolute -inset-[20%]" />
      <CandleScene isActive={isVisible} />
    </div>
  );
}
