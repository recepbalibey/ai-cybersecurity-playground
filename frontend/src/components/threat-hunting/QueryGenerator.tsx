"use client";

import React, { useState } from "react";
import { Terminal, Copy, Check, Code2 } from "lucide-react";

interface QueryGeneratorProps {
  queries: {
    sigma: string;
    kql: string;
    splunk: string;
    sql: string;
  };
}

export function QueryGenerator({ queries }: QueryGeneratorProps) {
  const [activeDialect, setActiveDialect] = useState<
    "sigma" | "kql" | "splunk" | "sql"
  >("kql");
  const [copied, setCopied] = useState(false);

  const dialects = [
    { key: "kql", label: "KQL (Sentinel / Defender)" },
    { key: "sigma", label: "Sigma Rule (YAML)" },
    { key: "splunk", label: "Splunk SPL" },
    { key: "sql", label: "SQL Telemetry Query" },
  ] as const;

  const currentQuery = queries[activeDialect] || "Query generation pending...";

  const handleCopy = () => {
    navigator.clipboard.writeText(currentQuery);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="cyber-panel holo-panel border border-cyber-border overflow-hidden flex flex-col h-full">
      {/* Panel Header */}
      <div className="p-4 border-b border-cyber-border bg-cyber-surface/60 flex items-center justify-between holo-scan">
        <div className="flex items-center gap-2.5">
          <Code2 className="w-4 h-4 text-cyan-400" />
          <h2 className="text-base font-semibold text-cyber-heading uppercase tracking-wider font-mono">
            Detection Query Generator
          </h2>
        </div>

        {/* Copy Button */}
        <button
          onClick={handleCopy}
          className="h-8 px-3 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-cyan-300 flex items-center gap-1.5 transition-all"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Query</span>
            </>
          )}
        </button>
      </div>

      {/* Dialect Switcher Tabs */}
      <div className="flex border-b border-cyber-border bg-slate-950/80 px-2 pt-2 gap-1 overflow-x-auto">
        {dialects.map((d) => (
          <button
            key={d.key}
            onClick={() => setActiveDialect(d.key)}
            className={`px-3 py-2 text-xs font-mono font-semibold rounded-t border-t border-x transition-all ${
              activeDialect === d.key
                ? "bg-cyber-surface border-cyan-500/50 text-cyan-300 border-b-cyber-surface"
                : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* Query Terminal View */}
      <div className="p-4 flex-1 bg-cyber-base font-mono text-xs text-slate-200 overflow-auto leading-relaxed scanline-overlay min-h-[200px]">
        <pre className="whitespace-pre-wrap break-all font-mono">{currentQuery}</pre>
      </div>
    </div>
  );
}
