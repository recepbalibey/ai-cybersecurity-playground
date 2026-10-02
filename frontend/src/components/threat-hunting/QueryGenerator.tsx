"use client";

import React, { useState } from "react";
import { Copy, Check, Code2 } from "lucide-react";

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
          <Code2 className="w-4 h-4 text-accent" />
          <h2 className="text-base font-semibold text-cyber-heading">
            Detection Query Generator
          </h2>
        </div>

        {/* Copy Button */}
        <button
          onClick={handleCopy}
          className="h-8 px-3 rounded bg-cyber-base hover:bg-cyber-surface-hover border border-cyber-border text-xs font-mono text-accent flex items-center gap-1.5 transition-all"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-status-success" />
              <span className="text-status-success">Copied</span>
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
      <div className="flex border-b border-cyber-border bg-cyber-base/80 px-2 pt-2 gap-1 overflow-x-auto">
        {dialects.map((d) => (
          <button
            key={d.key}
            onClick={() => setActiveDialect(d.key)}
            className={`px-3 py-2 text-xs font-mono font-semibold rounded-t border-t border-x transition-all ${
              activeDialect === d.key
                ? "bg-cyber-surface border-cyan-500/50 text-accent border-b-cyber-surface"
                : "border-transparent text-cyber-muted hover:text-cyber-text hover:bg-cyber-base"
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* Query Terminal View */}
      <div className="p-4 flex-1 bg-cyber-base font-mono text-xs text-cyber-text overflow-auto leading-relaxed scanline-overlay min-h-[200px]">
        <pre className="whitespace-pre-wrap break-all font-mono">{currentQuery}</pre>
      </div>
    </div>
  );
}
