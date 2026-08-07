"use client";

import React, { useState } from "react";
import { ClipboardCheck, Check, Square } from "lucide-react";
import { SECURE_DEV_CHECKLIST } from "@/knowledge/secure-coding/knowledgeBase";

export function SecureDevChecklist() {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const total = SECURE_DEV_CHECKLIST.length;
  const done = checked.size;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  const toggle = (key: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div className="cyber-panel border border-cyber-border rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-cyber-border flex items-center gap-2">
        <ClipboardCheck className="w-4 h-4 text-cyan-400" />
        <h3 className="text-xs font-bold text-cyber-heading uppercase tracking-wider font-mono">Secure Dev Checklist</h3>
        <span className="ml-auto text-[11px] font-mono text-cyan-300">{pct}%</span>
      </div>
      <div className="h-1.5 bg-slate-800">
        <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
      <ul className="max-h-80 overflow-auto divide-y divide-cyber-border/60">
        {SECURE_DEV_CHECKLIST.map((item) => {
          const on = checked.has(item);
          return (
            <li key={item}>
              <button
                onClick={() => toggle(item)}
                className="w-full text-left px-4 py-2 flex items-start gap-2 hover:bg-slate-800/40 transition-colors"
              >
                <span className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center shrink-0 border ${
                  on ? "bg-emerald-600 border-emerald-500 text-slate-950" : "border-slate-600 text-transparent"
                }`}>
                  {on ? <Check className="w-3 h-3" /> : <Square className="w-3 h-3" />}
                </span>
                <span className={`text-[12px] leading-snug ${on ? "text-cyber-muted line-through" : "text-cyber-heading"}`}>
                  {item}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}