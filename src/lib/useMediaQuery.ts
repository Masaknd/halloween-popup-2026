"use client";

import { useSyncExternalStore } from "react";

export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export const useReducedMotion = (): boolean => useMediaQuery("(prefers-reduced-motion: reduce)");
/** A mouse or trackpad; anything else (phones, tablets) gets the lighter versions of the heavier effects. */
export const FINE_POINTER_QUERY = "(hover: hover) and (pointer: fine)";
export const useFinePointer = (): boolean => useMediaQuery(FINE_POINTER_QUERY);
