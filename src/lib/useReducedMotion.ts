"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(callback: () => void) {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches;
}

function getServerSnapshot() {
  // No `window` during SSR — match the client's default assumption (motion
  // allowed) so the server-rendered HTML and the client's first hydration
  // pass agree, avoiding a hydration mismatch. useSyncExternalStore
  // re-renders with the real value immediately after hydration if it differs.
  return false;
}

/**
 * Reads the `prefers-reduced-motion` media query reactively (updates if the
 * user changes their OS setting while the page is open). This is the
 * React-recommended way to subscribe to external browser state — unlike a
 * plain useEffect + setState, it's hydration-safe and doesn't trip the
 * "don't setState synchronously in an effect" lint rule.
 */
export function useReducedMotion() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
