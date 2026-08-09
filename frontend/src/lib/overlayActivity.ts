"use client";

import { useEffect } from "react";

type Listener = (open: boolean) => void;

let openCount = 0;
const listeners = new Set<Listener>();

function emit() {
  const open = openCount > 0;
  listeners.forEach((l) => l(open));
}

export function overlayOpen() {
  openCount += 1;
  emit();
}

export function overlayClose() {
  openCount = Math.max(0, openCount - 1);
  emit();
}

export function subscribeOverlay(cb: Listener) {
  listeners.add(cb);
  cb(openCount > 0);
  return () => {
    listeners.delete(cb);
  };
}

/** Suspends global keyboard navigation while any overlay claims a slot. */
export function useOverlaySignal(active: boolean) {
  useEffect(() => {
    if (!active) return;
    overlayOpen();
    return overlayClose;
  }, [active]);
}