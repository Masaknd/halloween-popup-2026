"use client";

import { useEffect, useState, type RefObject } from "react";

/** True while the element intersects the viewport; used to pause off-screen WebGL. */
export function useInView(ref: RefObject<Element | null>): boolean {
  const [isInView, setIsInView] = useState(true);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setIsInView(entry?.isIntersecting ?? true));
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);

  return isInView;
}
