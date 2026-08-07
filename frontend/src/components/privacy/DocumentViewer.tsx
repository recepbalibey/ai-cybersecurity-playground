"use client";

import React, { useState } from "react";
import { FileText, ShieldOff, ScanSearch } from "lucide-react";
import type { PrivacyFinding } from "@/services/privacyScanner";
import { escapeHtml, SEVERITY_CLASS } from "./privacyHighlight";

interface Span {
  start: number;
  end: number;
  severity: string;
}

function mergeSpans(findings: PrivacyFinding[]): Span[] {
  const spans = findings
    .map((f) => ({ start: f.start, end: f.end, severity: f.severity }))
    .sort((a, b) => a.start - b.start || a.end - b.end);
  const out: Span[] = [];
  for (const s of spans) {
    const last = out[out.length - 1];
    if (last && s.start < last.end) {
      last.end = Math.max(last.end, s.end);
      const order = ["Critical", "High", "Medium", "Low", "Informational"];
      last.severity = order.indexOf(last.severity) <= order.indexOf(s.severity) ? last.severity : s.severity;
    } else {
      out.push({ ...s });
    }
  }
  return out;
}

interface LineHighlightProps {
  text: string;
  lineStart: number;
  spans: Span[];
}

function HighlightedLine({ text, lineStart, spans }: LineHighlightProps) {
  const local = spans
    .map((s) => ({
      start: Math.max(s.start - lineStart, 0),
      end: Math.min(s.end - lineStart, text.length),
      severity: s.severity,
    }))
    .filter((s) => s.start < s.end && s.start < text.length)
    .sort((a, b) => a.start - b.start);

  if (local.length === 0) {
    return <>{escapeHtml(text)}</>;
  }
  let html = "";
  let cursor = 0;
  for (const s of local) {
    html += escapeHtml(text.slice(cursor, s.start));
    html += `<mark class="${SEVERITY_CLASS[s.severity] ?? "privacy-hl"}">${escapeHtml(text.slice(s.start, s.end))}</mark>`;
    cursor = s.end;
  }
  html += escapeHtml(text.slice(cursor));
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

function RedactedLine({ text }: { text: string }) {
  const parts = text.split("[REDACTED]");
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

interface DocumentViewerProps {
  document: string;
  findings: PrivacyFinding[];
  redacted: string;
  title: string;
  subtitle: string;
}

export function DocumentViewer({ document, findings, redacted, title, subtitle }: DocumentViewerProps) {
  const [mode, setMode] = useState<"scan" | "protected">("scan");
  const spans = mergeSpans(findings);
  const source = mode === "scan" ? document : redacted;

  const lines = React.useMemo(() => {
    const out: { start: number; text: string }[] = [];
    let start = 0;
    for (const part of source.split("\n")) {
      out.push({ start, text: part });
      start += part.length + 1;
    }
    return out;
  }, [source]);

  return (
    <div className="cyber-panel border border-cyber-border rounded-lg flex flex-col overflow-hidden h-full">
      {/* header */}
      <div className="px-4 py-3 border-b border-cyber-border flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2.5 min-w-0">
          {mode === "scan" ? (
            <ScanSearch className="w-4 h-4 text-cyan-400 shrink-0" />
          ) : (
            <ShieldOff className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-cyber-heading truncate">{title}</h3>
            <p className="text-[11px] font-mono text-cyber-muted truncate">{subtitle}</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-1 rounded-md border border-cyber-border bg-slate-900/50 p-0.5">
          <button
            onClick={() => setMode("scan")}
            className={`px-3 py-1.5 rounded text-[11px] font-mono transition-colors ${
              mode === "scan" ? "bg-cyan-600/20 text-cyan-300 border border-cyan-500/40" : "text-cyber-muted hover:text-cyber-heading"
            }`}
          >
            Sensitive Data
          </button>
          <button
            onClick={() => setMode("protected")}
            className={`px-3 py-1.5 rounded text-[11px] font-mono transition-colors ${
              mode === "protected" ? "bg-emerald-600/20 text-emerald-300 border border-emerald-500/40" : "text-cyber-muted hover:text-cyber-heading"
            }`}
          >
            Protected
          </button>
        </div>
      </div>

      {/* body */}
      <div className="flex flex-1 min-h-[420px] bg-slate-950/40">
        <div className="w-11 shrink-0 border-r border-cyber-border text-right text-[11px] leading-[1.55] font-mono select-none py-3 overflow-hidden">
          {lines.map((l, i) => (
            <div key={i} className="pr-2 text-slate-600" style={{ height: 17 }}>
              {i + 1}
            </div>
          ))}
        </div>
        <div className="relative flex-1 overflow-auto">
          <pre className="p-4 font-mono text-[13px] leading-[1.55] text-cyan-100/90 whitespace-pre-wrap min-w-full">
            {lines.map((l, i) => (
              <div key={i} className="min-h-[17px]">
                {mode === "scan" ? <HighlightedLine text={l.text} lineStart={l.start} spans={spans} /> : <RedactedLine text={l.text} />}
              </div>
            ))}
          </pre>
        </div>
      </div>

      {/* footer */}
      <div className="px-4 py-2 border-t border-cyber-border flex items-center gap-2 text-[11px]">
        <FileText className="w-3.5 h-3.5 text-slate-500" />
        {mode === "scan" ? (
          findings.length > 0 ? (
            <span className="text-cyber-muted">
              <span className="text-red-300 font-semibold">{findings.length}</span> sensitive item(s) highlighted in the heatmap.
            </span>
          ) : (
            <span className="text-cyber-muted">No sensitive patterns detected in this document.</span>
          )
        ) : (
          <span className="text-cyber-muted">
            Protected version - sensitive spans replaced with <span className="text-emerald-300 font-mono">[REDACTED]</span>.
          </span>
        )}
      </div>
    </div>
  );
}
