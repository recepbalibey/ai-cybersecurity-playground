"use client";

import React from "react";
import { Gavel, ShieldX, ShieldCheck, TriangleAlert } from "lucide-react";
import type { PolicyResult, PolicyStatus } from "@/services/privacyScanner";

const STATUS_STYLE: Record<PolicyStatus, string> = {
  blocked: "text-red-300 border-red-500/50 bg-red-950/30",
  pass: "text-emerald-300 border-emerald-500/40 bg-emerald-950/20",
  review: "text-amber-300 border-amber-500/50 bg-amber-950/30",
};

const STATUS_ICON: Record<PolicyStatus, React.ReactNode> = {
  blocked: <ShieldX className="w-3.5 h-3.5" />,
  pass: <ShieldCheck className="w-3.5 h-3.5" />,
  review: <TriangleAlert className="w-3.5 h-3.5" />,
};

export function PolicyPanel({ policies }: { policies: PolicyResult[] }) {
  const blocked = policies.filter((p) => p.status === "blocked").length;
  return (
    <div className="cyber-panel border border-cyber-border rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-cyber-border flex items-center gap-2">
        <Gavel className="w-4 h-4 text-cyan-400" />
        <h3 className="text-xs font-bold text-cyber-heading uppercase tracking-wider font-mono">Policy Engine</h3>
        {blocked > 0 && (
          <span className="ml-auto text-[10px] font-mono px-2 py-0.5 rounded border border-red-500/40 text-red-300">
            {blocked} blocked - do not send
          </span>
        )}
      </div>
      <ul className="divide-y divide-cyber-border">
        {policies.map((p) => (
          <li key={p.id} className="px-4 py-2.5 flex gap-3">
            <span className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${STATUS_STYLE[p.status]}`}>
              {STATUS_ICON[p.status]}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[12px] font-semibold text-cyber-heading">{p.name}</span>
                <span className={`text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border ${STATUS_STYLE[p.status]}`}>
                  {p.status}
                </span>
              </div>
              <div className="text-[11px] text-cyber-muted mt-0.5">{p.reason}</div>
              <div className="text-[11px] text-cyan-300/80 mt-0.5">{p.recommendation}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
