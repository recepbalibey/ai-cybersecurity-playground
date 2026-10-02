"use client";

import React, { useState } from "react";
import { ShieldOff, BadgeX, BadgeCheck, Copy, Check } from "lucide-react";
import type { RedactionResult } from "@/services/privacyScanner";
import { escapeHtml } from "./privacyHighlight";

function RedactedBlock({ redacted }: { redacted: string }) {
  const parts = redacted.split("[REDACTED]");
  return (
    <>
      {parts.map((p, i) => (
        <React.Fragment key={i}>
          {escapeHtml(p)}
          {i < parts.length - 1 && <mark className="privacy-redacted">[REDACTED]</mark>}
        </React.Fragment>
      ))}
    </>
  );
}

export function RedactionPanel({ redaction, safePrompt }: { redaction: RedactionResult; safePrompt: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(safePrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* redaction explanations */}
      <div className="cyber-panel border border-cyber-border rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-cyber-border flex items-center gap-2">
          <ShieldOff className="w-4 h-4 text-status-success" />
          <h3 className="text-xs font-bold text-cyber-heading">Automatic Redaction</h3>
          <span className="ml-auto text-[0.625rem] font-mono text-cyber-muted">
            {redaction.redacted_count} segment(s) replaced
          </span>
        </div>
        <ul className="divide-y divide-cyber-border max-h-56 overflow-auto">
          {redaction.explanations.map((x, i) => (
            <li key={i} className="px-4 py-2 flex gap-3 text-[0.75rem]">
              <span className="shrink-0 px-1.5 py-0.5 rounded border border-cyber-border font-mono text-[0.625rem] text-accent bg-cyber-base/50 self-start">
                {x.type}
              </span>
              <div className="min-w-0">
                <div className="text-cyber-muted line-through decoration-red-400/60 truncate font-mono">{x.snippet}</div>
                <div className="text-status-success font-mono">→ [REDACTED]</div>
                <p className="text-cyber-muted mt-0.5 leading-snug">{x.reason}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* prompt gate */}
      <div className="cyber-panel border border-cyber-border rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-cyber-border flex items-center gap-2">
          <BadgeX className="w-4 h-4 text-status-danger" />
          <h3 className="text-xs font-bold text-cyber-heading">AI Assistant Preview</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-cyber-border/60">
          <div>
            <div className="px-3 py-1.5 bg-status-danger/10 text-[0.625rem] font-mono uppercase tracking-wider text-status-danger border-b border-cyber-border flex items-center gap-2">
              <BadgeX className="w-3.5 h-3.5" /> Unsafe prompt
            </div>
            <pre className="p-3 text-[0.75rem] font-mono text-cyber-muted whitespace-pre-wrap max-h-64 overflow-auto">
              {escapeHtml(redaction.original)}
            </pre>
            <div className="px-3 py-1.5 border-t border-cyber-border bg-status-danger/10 text-[0.6875rem] font-mono text-status-danger flex items-center gap-2">
              <BadgeX className="w-3.5 h-3.5" /> Blocked - contains sensitive data
            </div>
          </div>
          <div>
            <div className="px-3 py-1.5 bg-status-success/10 text-[0.625rem] font-mono uppercase tracking-wider text-status-success border-b border-cyber-border flex items-center gap-2">
              <BadgeCheck className="w-3.5 h-3.5" /> Safe prompt
            </div>
            <pre className="p-3 text-[0.75rem] font-mono text-status-success whitespace-pre-wrap max-h-64 overflow-auto">
              <RedactedBlock redacted={redaction.redacted} />
            </pre>
            <div className="px-3 py-1.5 border-t border-cyber-border bg-status-success/10 text-[0.6875rem] font-mono text-status-success flex items-center gap-2">
              <BadgeCheck className="w-3.5 h-3.5" /> Allowed - de-identified for the approved tool
            </div>
          </div>
        </div>

        <div className="px-4 py-2.5 border-t border-cyber-border flex items-center gap-2">
          <button
            onClick={copy}
            className="ml-auto h-8 px-3 rounded-md border border-cyber-border text-cyber-text hover:border-emerald-500/60 hover:text-status-success text-xs font-mono flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-status-success" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied" : "Copy safe prompt"}
          </button>
        </div>
      </div>
    </div>
  );
}
