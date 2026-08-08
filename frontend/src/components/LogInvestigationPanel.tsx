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
  logContent: string;
  onLogContentChange: (content: string) => void;
  onSelectDataset: (key: string) => void;
  onStartAnalysis: () => void;
  isAnalyzing: boolean;
  selectedDatasetName: string;
}

export function LogInvestigationPanel({
  logContent,
  onLogContentChange,
  onSelectDataset,
  onStartAnalysis,
  isAnalyzing,
  selectedDatasetName,
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

  const sampleDatasets = [
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
      <div className="p-4 border-b border-cyber-border bg-cyber-surface/60 flex items-center justify-between holo-scan">
        <div className="flex items-center gap-2.5">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <h2 className="text-base font-semibold text-cyber-heading uppercase tracking-wider font-mono">
            Log Investigation Panel
          </h2>
        </div>
        <span className="flex items-center gap-1.5 text-xs text-cyber-muted font-mono uppercase">
          {isAnalyzing && <span className="live-dot" aria-hidden="true" />}
          {selectedDatasetName}
        </span>
      </div>

      <div className="p-4 flex-1 flex flex-col gap-4 overflow-y-auto">
        {/* Upload & Sample Datasets Bar */}
        <div className="flex flex-col gap-3">
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
              className="flex-1 h-10 px-3.5 bg-cyber-surface-hover hover:bg-slate-800 border border-cyber-border-light rounded text-xs font-medium text-cyber-text flex items-center justify-center gap-2 transition-all"
            >
              <Upload className="w-4 h-4 text-cyan-400" />
              <span>Upload Security Logs (.json, .log, .txt)</span>
            </button>
          </div>

          {/* Quick Load Dataset Buttons */}
          <div>
            <div className="text-xs text-cyber-muted font-mono uppercase mb-2">
              Sample Datasets (Live Classroom Demos)
            </div>
            <div className="grid grid-cols-1 gap-2">
              {sampleDatasets.map((ds) => (
                <button
                  key={ds.key}
                  onClick={() => onSelectDataset(ds.key)}
                  className="chip-holo px-3.5 py-2.5 bg-slate-950/60 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/40 rounded text-left transition-all group flex items-center justify-between"
                >
                  <div>
                    <div className="text-sm font-semibold text-cyber-text group-hover:text-cyan-300">
                      {ds.label}
                    </div>
                    <div className="text-xs text-cyber-muted mt-0.5">
                      {ds.desc}
                    </div>
                  </div>
                  <FileCode className="w-4 h-4 text-slate-600 group-hover:text-cyan-400" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Supported Format Tags */}
        <div className="flex flex-wrap gap-2 py-1">
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
            Windows EVTX
          </span>
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
            Syslog / Auth
          </span>
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
            Zeek Telemetry
          </span>
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
            Suricata NIDS
          </span>
        </div>

        {/* Raw Log Terminal Viewer */}
        <div className="flex-1 flex flex-col min-h-[240px] bg-cyber-base border border-cyber-border rounded overflow-hidden relative">
          <div className="px-3.5 py-2 bg-slate-950 border-b border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Raw Log Stream Viewer</span>
            <span>{logLines.length} Lines</span>
          </div>

          <div className="flex-1 p-3.5 overflow-auto font-mono text-sm text-slate-200 leading-relaxed scanline-overlay">
            {logLines.length > 0 ? (
              logLines.map((line, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 hover:bg-slate-900/60 py-0.5 rounded ${
                    isAnalyzing && idx === 0 ? "log-scan-line" : ""
                  }`}
                >
                  <span className="text-slate-600 select-none w-7 text-right shrink-0">
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
              <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-2 font-sans text-sm">
                <FileText className="w-8 h-8 opacity-40 text-cyan-400" />
                <span>Upload a log file or click a sample dataset above</span>
              </div>
            )}
          </div>
        </div>

        {/* Primary Action Button */}
        <button
          onClick={onStartAnalysis}
          disabled={isAnalyzing || !logContent.trim()}
          className={`h-12 px-4 rounded text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
            isAnalyzing || !logContent.trim()
              ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
              : "bg-cyan-600 hover:bg-cyan-500 text-slate-950 shadow-cyan-glow cursor-pointer"
          }`}
        >
          {isAnalyzing ? (
            <>
              <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
              <span>AI Analyst Processing Telemetry...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Start AI Security Investigation</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
