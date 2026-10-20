"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { CURSOR_EVENT } from "@/lib/scroll";
import { useFinePointer } from "@/lib/useMediaQuery";

/** Orange dot + trailing ring. Elements with data-cursor="Label" grow the ring and show text. */
export function Cursor() {
  const isFine = useFinePointer();
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    if (!isFine || !dotRef.current || !ringRef.current) return;
    const root = document.documentElement;
    root.classList.add("has-custom-cursor");

    const dotX = gsap.quickTo(dotRef.current, "x", { duration: 0.08, ease: "power3" });
    const dotY = gsap.quickTo(dotRef.current, "y", { duration: 0.08, ease: "power3" });
    const ringX = gsap.quickTo(ringRef.current, "x", { duration: 0.45, ease: "power3" });
    const ringY = gsap.quickTo(ringRef.current, "y", { duration: 0.45, ease: "power3" });

    const onMove = (event: PointerEvent) => {
      dotX(event.clientX);
      dotY(event.clientY);
      ringX(event.clientX);
      ringY(event.clientY);
    };
    const onOver = (event: MouseEvent) => {
      const target = (event.target as HTMLElement | null)?.closest<HTMLElement>("[data-cursor], a, button");
      setLabel(target ? (target.dataset.cursor ?? "") : null);
    };
    const onSceneLabel = (event: Event) => setLabel((event as CustomEvent<string | null>).detail);

    window.addEventListener("pointermove", onMove);
    document.addEventListener("mouseover", onOver);
    window.addEventListener(CURSOR_EVENT, onSceneLabel);
    return () => {
      root.classList.remove("has-custom-cursor");
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("mouseover", onOver);
      window.removeEventListener(CURSOR_EVENT, onSceneLabel);
    };
  }, [isFine]);

  if (!isFine) return null;

  const isActive = label !== null;
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[70]">
      <div ref={dotRef} className="absolute left-0 top-0 -ml-1 -mt-1 size-2 rounded-full bg-pumpkin" />
      <div ref={ringRef} className="absolute left-0 top-0">
        <div
          className={`flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-pumpkin text-[10px] font-bold uppercase tracking-widest text-bone transition-all duration-300 ${
            isActive ? "size-24 bg-pumpkin/90" : "size-9 bg-transparent"
          }`}
        >
          {isActive && label ? <span className="px-2 text-center leading-tight">{label}</span> : null}
        </div>
      </div>
    </div>
  );
}
