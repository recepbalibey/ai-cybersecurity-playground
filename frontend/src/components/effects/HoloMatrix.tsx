"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";

/**
 * Cursor-reactive holographic lattice. Renders a matrix of small cells on a
 * canvas that wake up near the pointer (bright + slightly larger), ripple as
 * a wave behind it, then settle back to a faint static grid. Runs only while
 * the pointer is over the element; reduced-motion renders a static faint grid.
 */
export function HoloMatrix({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(2, window.devicePixelRatio || 1);

    // Resolve --cb-accent (e.g. "6 182 212") into a plain rgba() prefix;
    // canvas fillStyle cannot use CSS custom properties.
    const accent = getComputedStyle(wrap).getPropertyValue("--cb-accent").trim() || "6 182 212";
    const rgb = accent.replace(/\s+/g, ",");

    let w = 0;
    let h = 0;
    let cols = 0;
    let rows = 0;
    let cell = 0;
    let base: Float32Array = new Float32Array(0);

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // fit a grid of ~max 10 cells
      cols = Math.max(4, Math.floor(w / 34));
      rows = Math.max(3, Math.floor(h / 34));
      cell = Math.min(w / cols, h / rows);
      base = new Float32Array(cols * rows);
    };

    let raf = 0;
    let running = false;
    let mx = -1;
    let my = -1;

    const setPointer = (clientX: number, clientY: number) => {
      if (reduce) return;
      const rect = wrap.getBoundingClientRect();
      if (clientX < rect.left || clientX > rect.right ||
          clientY < rect.top || clientY > rect.bottom) {
        if (mx >= 0) { mx = -1; my = -1; tick(); }
        return;
      }
      mx = clientX - rect.left;
      my = clientY - rect.top;
      tick();
    };

    const draw = () => {
      raf = 0;
      ctx.clearRect(0, 0, w, h);
      const radius = cell * 1.9;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const i = r * cols + c;
          const cx = c * cell + cell / 2;
          const cy = r * cell + cell / 2;
          let b = base[i];
          if (mx >= 0) {
            const dx = cx - mx;
            const dy = cy - my;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const ring = dist <= cell * 1.5;
            const hot = 1 - Math.min(1, dist / radius);
            const target = ring ? Math.max(b * 0.4, hot) : b * 0.6;
            b = base[i] + (target - base[i]) * 0.35;
          } else {
            b *= 0.86;
          }
          base[i] = Math.max(0, b);
          if (b < 0.01) continue;
          const sz = cell * (0.22 + 0.16 * b);
          ctx.fillStyle = `rgba(${rgb},${(0.14 + b * 0.66).toFixed(2)})`;
          ctx.beginPath();
          ctx.arc(cx, cy, sz, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      if (running) raf = requestAnimationFrame(draw);
    };

    const tick = () => {
      if (!running) {
        running = true;
        draw();
      }
    };

    resize();
    if (reduce) {
      // static faint grid for reduced-motion users
      for (let i = 0; i < base.length; i++) base[i] = 0.16;
      draw();
    }

    const onDocMove = (e: PointerEvent) => setPointer(e.clientX, e.clientY);
    document.addEventListener("pointermove", onDocMove);
    window.addEventListener("resize", resize);
    return () => {
      document.removeEventListener("pointermove", onDocMove);
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
      running = false;
    };
  }, []);

  return (
    <div ref={wrapRef} className={cn("holo-matrix", className)}>
      <canvas ref={canvasRef} className="holo-matrix-canvas" aria-hidden />
    </div>
  );
}