"use client";

import React, { useCallback, useRef } from "react";
import { cn } from "@/lib/cn";

interface HoloTiltProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  glow?: boolean;
}

export function HoloTilt({
  children,
  className,
  maxTilt = 6,
  glow = true,
}: HoloTiltProps) {
  const ref = useRef<HTMLDivElement>(null);
  const raf = useRef<number | null>(null);

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      if (raf.current) cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => {
        el.style.setProperty("--tilt-x", `${-py * maxTilt}deg`);
        el.style.setProperty("--tilt-y", `${px * maxTilt}deg`);
      });
    },
    [maxTilt]
  );

  const onPointerLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--tilt-x", "0deg");
    el.style.setProperty("--tilt-y", "0deg");
  }, []);

  return (
    <div
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className={cn("tilt-card", glow && "holo-panel", className)}
    >
      {children}
    </div>
  );
}