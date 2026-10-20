"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";

const PROBE_SIZE = 100;

/** Scales its text so a single line exactly fills the parent's width. */
export function FitText({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const element = ref.current;
    const parent = element?.parentElement;
    if (!element || !parent) return;

    const fit = () => {
      element.style.fontSize = `${PROBE_SIZE}px`;
      const ratio = parent.clientWidth / element.scrollWidth;
      element.style.fontSize = `${PROBE_SIZE * ratio}px`;
    };

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(parent);
    document.fonts?.ready.then(fit).catch(() => undefined);
    return () => observer.disconnect();
  }, []);

  return (
    <span ref={ref} className={`block w-max whitespace-nowrap ${className}`}>
      {children}
    </span>
  );
}
