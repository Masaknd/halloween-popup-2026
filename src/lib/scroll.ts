import type Lenis from "lenis";

type VelocityListener = (velocity: number) => void;

const listeners = new Set<VelocityListener>();
let lenis: Lenis | null = null;

export const setLenis = (instance: Lenis | null): void => {
  lenis = instance;
};

export const scrollToTarget = (target: string | number): void => {
  if (lenis) {
    lenis.scrollTo(target, { offset: 0, duration: 1.4 });
    return;
  }
  if (typeof target === "string") document.querySelector(target)?.scrollIntoView({ behavior: "smooth" });
};

export const onScrollVelocity = (listener: VelocityListener): (() => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const emitScrollVelocity = (velocity: number): void => {
  listeners.forEach((listener) => listener(velocity));
};

/** Intro handshake between the loader and the rest of the page. */
export const INTRO_EVENT = "intro:done";
export const isIntroDone = (): boolean => document.documentElement.dataset.intro === "done";
export const markIntroDone = (): void => {
  document.documentElement.dataset.intro = "done";
  window.dispatchEvent(new Event(INTRO_EVENT));
};

export const onIntroDone = (callback: () => void): (() => void) => {
  if (isIntroDone()) {
    callback();
    return () => undefined;
  }
  window.addEventListener(INTRO_EVENT, callback, { once: true });
  return () => window.removeEventListener(INTRO_EVENT, callback);
};

/** Lets the 3D scene drive the custom cursor label. */
export const CURSOR_EVENT = "cursor:label";
export const setCursorLabel = (label: string | null): void => {
  window.dispatchEvent(new CustomEvent<string | null>(CURSOR_EVENT, { detail: label }));
};
