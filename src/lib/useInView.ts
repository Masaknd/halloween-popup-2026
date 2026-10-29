"use client";

import { useEffect, useState, type RefObject } from "react";
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
 * Turns true, and stays true, once the element comes within a screen of the viewport after the intro, so heavy 3D
 * scenes download and build just ahead of being seen rather than all at once during the first load.
 */
export function useNearView(ref: RefObject<Element | null>): boolean {
  const [isNear, setIsNear] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || isNear) return;
    let observer: IntersectionObserver | null = null;
    const stopWaiting = onIntroDone(() => {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry?.isIntersecting) return;
          observer?.disconnect();
          setIsNear(true);
        },
        { rootMargin: NEAR_MARGIN },
      );
      observer.observe(element);
    });
    return () => {
      stopWaiting();
      observer?.disconnect();
    };
  }, [ref, isNear]);

  return isNear;
}
