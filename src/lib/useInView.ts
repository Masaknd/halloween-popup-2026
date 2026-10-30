"use client";

import { useEffect, useState, type RefObject } from "react";
import { whenIdle } from "./idle";
import { onIntroDone } from "./scroll";

/** How far ahead of the viewport heavy content starts mounting: a screen's height, so it is ready before it scrolls in. */
const NEAR_MARGIN = "100% 0px";

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

/**
 * Turns true, and stays true, once it is time to build a heavy 3D scene: the first moment the browser is idle after the
 * intro, or as soon as the element comes within a screen of the viewport, whichever is first. Scenes then build while
 * the visitor is still reading above them, instead of all at once during the first load or in the middle of a scroll.
 */
export function useBuildSoon(ref: RefObject<Element | null>): boolean {
  const [isDue, setIsDue] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || isDue) return;
    const due = () => setIsDue(true);
    let observer: IntersectionObserver | null = null;
    let cancelIdle = () => {};
    const stopWaiting = onIntroDone(() => {
      cancelIdle = whenIdle(due);
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry?.isIntersecting) due();
        },
        { rootMargin: NEAR_MARGIN },
      );
      observer.observe(element);
    });
    return () => {
      stopWaiting();
      cancelIdle();
      observer?.disconnect();
    };
  }, [ref, isDue]);

  return isDue;
}
