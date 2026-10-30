/** Runs heavy one-off work (building 3D scenes, painting textures) in quiet moments, so it never lands mid-scroll. */

import { onIntroDone } from "./scroll";

/** The longest a job waits for the browser to go idle before it runs anyway. */
const IDLE_TIMEOUT_MS = 4000;
/** Safari has no idle callback: there jobs start this long after being queued, spaced apart so they don't bunch up. */
const IDLE_FALLBACK = { delayMs: 1200, spacingMs: 800 } as const;

let fallbackCount = 0;

/** Runs `callback` when the browser is next idle; returns a function that cancels it. */
export function whenIdle(callback: () => void): () => void {
  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(callback, { timeout: IDLE_TIMEOUT_MS });
    return () => window.cancelIdleCallback(id);
  }
  const id = window.setTimeout(callback, IDLE_FALLBACK.delayMs + IDLE_FALLBACK.spacingMs * fallbackCount++);
  return () => window.clearTimeout(id);
}

/** Runs `callback` in the first idle moment after the intro; returns a function that cancels it. */
export function afterIntroWhenIdle(callback: () => void): () => void {
  let cancelIdle = () => {};
  const stopWaiting = onIntroDone(() => {
    cancelIdle = whenIdle(callback);
  });
  return () => {
    stopWaiting();
    cancelIdle();
  };
}
