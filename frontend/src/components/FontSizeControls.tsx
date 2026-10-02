"use client";

import { useEffect, useState } from "react";

const SIZES = [100, 110, 120, 130, 140, 150];

export function FontSizeControls() {
  const [size, setSize] = useState(100);
  useEffect(() => {
    const saved = Number(localStorage.getItem("playground.fontSize"));
    if (SIZES.includes(saved)) setSize(saved);
  }, []);
  useEffect(() => {
    document.documentElement.style.fontSize = `${size}%`;
  }, [size]);
  function change(next: number) {
    setSize(next);
    localStorage.setItem("playground.fontSize", String(next));
  }
  return <div className="font-controls" role="group" aria-label="Text size">
    <button onClick={() => change(SIZES[SIZES.indexOf(size) - 1])} disabled={size === SIZES[0]} aria-label="Decrease text size" title="Decrease text size">A-</button>
    <button onClick={() => change(100)} aria-label="Reset text size" title="Reset text size"><output aria-live="polite">{size}%</output></button>
    <button onClick={() => change(SIZES[SIZES.indexOf(size) + 1])} disabled={size === SIZES[SIZES.length - 1]} aria-label="Increase text size" title="Increase text size">A+</button>
  </div>;
}
