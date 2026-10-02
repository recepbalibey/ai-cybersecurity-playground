"use client";

import React, { useRef } from "react";
import {
  Upload,
  FileCode,
  Terminal,
  FileText,
  Sparkles,
} from "lucide-react";

interface LogInvestigationPanelProps {
  isLoadingDataset?: boolean;
  logContent: string;
  onLogContentChange: (content: string) => void;
  onSelectDataset: (key: string) => void;
  onStartAnalysis: () => void;
  isAnalyzing: boolean;
  selectedDatasetName: string;
  sampleDatasets?: { key: string; label: string; desc: string }[];
}

export function LogInvestigationPanel({
  isLoadingDataset = false,
  logContent,
  onLogContentChange,
  onSelectDataset,
  onStartAnalysis,
  isAnalyzing,
  selectedDatasetName,
  sampleDatasets,
}: LogInvestigationPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        onLogContentChange(text);
      };
      reader.readAsText(file);
    }
  };

  const datasets = sampleDatasets ?? [
    {
      key: "bruteforce",
      label: "Load Brute Force Attack",
      desc: "SSH authentication surge & escalation",
    },
    {
      key: "powershell_attack",
      label: "Load Suspicious PowerShell",
      desc: "Obfuscated scriptblock & Mimikatz dump",
    },
    {
      key: "malware_execution",
      label: "Load Malware Execution",
      desc: "Process injection, registry & C2 beacon",
    },
  ];

  const logLines = logContent ? logContent.split("\n") : [];

  return (
    <div className="cyber-panel flex flex-col h-full overflow-hidden border border-cyber-border">
      {/* Panel Header */}
      <div className="p-4 border-b border-cyber-border bg-cyber-surface/60 flex flex-wrap items-center gap-2 justify-between">
        <div className="flex items-center gap-2.5">
          <Terminal className="w-4 h-4 text-accent" />
          <h2 className="text-base font-semibold text-cyber-heading">
            Security logs
          </h2>
        </div>
        <span className="flex items-center gap-1.5 text-xs text-cyber-muted font-mono uppercase">
          {isAnalyzing && <span className="live-dot" aria-hidden="true" />}
          {selectedDatasetName}
        </span>
      </div>

      <div className="p-4 flex-1 flex flex-col gap-4 overflow-y-auto">
        {/* Upload & Sample Datasets Bar */}
        <div className="holo-reticle flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".txt,.json,.log"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 h-10 px-3.5 bg-cyber-surface-hover hover:bg-cyber-surface-hover border border-cyber-border-light rounded text-xs font-medium text-cyber-text flex items-center justify-center gap-2 transition-all"
            >
              <Upload className="w-4 h-4 text-accent" />
              <span>Upload a log file</span>
            </button>
          </div>

          {/* Quick Load Dataset Buttons */}
          <div>
            <div className="text-xs text-cyber-muted font-mono uppercase mb-2">
              Choose a sample
            </div>
            <div className="grid grid-cols-1 gap-2">
              {datasets.map((ds) => (
                <button
                  key={ds.key}
                  onClick={() => onSelectDataset(ds.key)}
                  className="chip-holo px-3.5 py-2.5 bg-cyber-base/60 hover:bg-cyber-base border border-cyber-border hover:border-cyan-500/40 rounded text-left transition-all group flex items-center justify-between"
                >
                  <div>
                    <div className="text-sm font-semibold text-cyber-text group-hover:text-accent">
                      {ds.label}
                    </div>
                    <div className="text-xs text-cyber-muted mt-0.5">
                      {ds.desc}
                    </div>
                  </div>
                  <FileCode className="w-4 h-4 text-cyber-muted group-hover:text-accent" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Supported Format Tags */}
        <div className="flex flex-wrap gap-2 py-1">
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-cyber-base border border-cyber-border text-cyber-text">
            Windows EVTX
          </span>
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-cyber-base border border-cyber-border text-cyber-text">
            Syslog / Auth
          </span>
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-cyber-base border border-cyber-border text-cyber-text">
            Zeek Telemetry
          </span>
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-cyber-base border border-cyber-border text-cyber-text">
            Suricata NIDS
          </span>
        </div>

        {/* Raw Log Terminal Viewer */}
        <div className="flex-1 flex flex-col min-h-[240px] bg-cyber-base border border-cyber-border rounded overflow-hidden relative">
          <div className="px-3.5 py-2 bg-cyber-base border-b border-cyber-border/80 flex items-center justify-between text-xs font-mono text-cyber-muted">
            <span>Log preview</span>
            <span>{logLines.length} Lines</span>
          </div>

          <div className="flex-1 p-3.5 overflow-auto font-mono text-sm text-cyber-text leading-relaxed scanline-overlay">
            {isLoadingDataset ? <div role="status" aria-label="Loading logs" className="space-y-3"><span className="sr-only">Loading logs...</span>{[0, 1, 2, 3, 4].map(i => <div key={i} className="skeleton h-4 w-full" aria-hidden="true" />)}</div> : logLines.length > 0 ? (
              logLines.map((line, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 hover:bg-cyber-base/60 py-0.5 rounded ${
                    isAnalyzing && idx === 0 ? "log-scan-line" : ""
                  }`}
                >
                  <span className="text-cyber-muted select-none w-7 text-right shrink-0">
                    {idx + 1}
                  </span>
                  <span className="break-all whitespace-pre-wrap">
                    {line}
                    {isAnalyzing && idx === logLines.length - 1 && (
                      <span className="caret-blink" />
                    )}
                  </span>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-cyber-muted gap-2 font-sans text-sm">
                <FileText className="w-8 h-8 opacity-40 text-accent" />
                <span>Upload a log file or click a sample dataset above</span>
              </div>
            )}
          </div>
        </div>

        {/* Primary Action Button */}
        <button
          onClick={onStartAnalysis}
          disabled={isLoadingDataset || isAnalyzing || !logContent.trim()}
          className={`h-12 px-4 rounded text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
            isLoadingDataset || isAnalyzing || !logContent.trim()
              ? "bg-cyber-surface-hover text-cyber-muted cursor-not-allowed border border-cyber-border"
              : "bg-cyan-600 hover:bg-cyan-500 text-on-accent shadow-cyan-glow cursor-pointer"
          }`}
        >
          {isAnalyzing ? (
            <>
              <span className="electron mr-1" style={{ "--orb-size": "18px" } as React.CSSProperties}>
                <i />
                <i />
              </span>
              <span>Analyzing logs...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Analyze logs</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
