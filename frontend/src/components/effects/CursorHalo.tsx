"use client";

import React, { useEffect, useRef, useState } from "react";

/**
 * A fixed, full-screen halo that softly follows the pointer through the
 * whole workspace. It is pointer-events:none and sits below the content
 * (z-index 1), giving cards and panels a subtle holographic under-glow.
 * Position is eased toward the cursor with rAF so it feels smooth, and
 * it fades out entirely when the pointer leaves the window.
 */
export function CursorHalo() {
  const haloRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    let raf = 0;
    let targetX = 0;
    let targetY = 0;
    let currentX = -200;
    let currentY = -200;
    let hasPointer = false;

    const easeHalo = () => {
      currentX += (targetX - currentX) * 0.14;
      currentY += (targetY - currentY) * 0.14;
      const el = haloRef.current;
      if (el) {
        el.style.setProperty("--halo-x", `${currentX.toFixed(1)}px`);
        el.style.setProperty("--halo-y", `${currentY.toFixed(1)}px`);
      }
      if (hasPointer) {
        raf = requestAnimationFrame(easeHalo);
      } else {
        raf = 0;
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!hasPointer) {
        hasPointer = true;
        setActive(true);
      }
      if (!raf) {
        raf = requestAnimationFrame(easeHalo);
      }
    };

    const onPointerLeave = () => {
      hasPointer = false;
      setActive(false);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onPointerLeave);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("mouseleave", onPointerLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={haloRef}
      aria-hidden="true"
      className={`cursor-halo${active ? " active" : ""}`}
    />
  );
}