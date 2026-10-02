"use client";

import React from "react";
import { Gavel, ShieldX, ShieldCheck, TriangleAlert } from "lucide-react";
import type { PolicyResult, PolicyStatus } from "@/services/privacyScanner";

const STATUS_STYLE: Record<PolicyStatus, string> = {
  blocked: "text-status-danger border-red-500/50 bg-status-danger/10",
  pass: "text-status-success border-emerald-500/40 bg-status-success/10",
  review: "text-status-warning border-amber-500/50 bg-status-warning/10",
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
        <Gavel className="w-4 h-4 text-accent" />
        <h3 className="text-xs font-bold text-cyber-heading">Policy Engine</h3>
        {blocked > 0 && (
          <span className="ml-auto text-[0.625rem] font-mono px-2 py-0.5 rounded border border-red-500/40 text-status-danger">
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
                <span className="text-[0.75rem] font-semibold text-cyber-heading">{p.name}</span>
                <span className={`text-[0.625rem] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border ${STATUS_STYLE[p.status]}`}>
                  {p.status}
                </span>
              </div>
              <div className="text-[0.6875rem] text-cyber-muted mt-0.5">{p.reason}</div>
              <div className="text-[0.6875rem] text-accent mt-0.5">{p.recommendation}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
