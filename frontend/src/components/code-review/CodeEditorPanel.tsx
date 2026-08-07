"use client";

import React, { useState, useRef } from "react";
import { Code2, Play, RotateCcw, BookOpenCheck } from "lucide-react";
import { REVIEW_EXAMPLES } from "@/data/securityCode";
import { highlightHtml } from "./highlight";
import type { CodeFinding, ReviewResult } from "@/services/securityCodeReviewer";

const SEVERITY_TAG: Record<string, string> = {
  Critical: "border-red-500/50 text-red-300 bg-red-950/30",
  High: "border-orange-500/50 text-orange-300 bg-orange-950/30",
  Medium: "border-yellow-500/50 text-yellow-300 bg-yellow-950/30",
  Low: "border-sky-500/50 text-sky-300 bg-sky-950/30",
  Informational: "border-slate-600 text-slate-300 bg-slate-800/30",
};

interface Props {
  code: string;
  onCodeChange: (v: string) => void;
  language: string;
  onLanguageChange: (v: string) => void;
  exampleId: string;
  onExampleChange: (v: string) => void;
  onSelectExample: (id: string) => void;
  onRun: () => void;
  onReset: () => void;
  isRunning: boolean;
  teaching: boolean;
  onToggleTeaching: () => void;
  findings: CodeFinding[];
  result?: ReviewResult;
}

const LANG_OPTIONS = [
  ["python", "Python"], ["javascript", "JavaScript"], ["typescript", "TypeScript"],
  ["java", "Java"], ["csharp", "C#"], ["c", "C"], ["cpp", "C++"],
  ["go", "Go"], ["rust", "Rust"], ["php", "PHP"],
];

function affectedLines(findings: CodeFinding[]): Set<number> {
  const set = new Set<number>();
  for (const f of findings) {
    for (let i = f.affected_lines.start; i <= f.affected_lines.end; i++) set.add(i);
  }
  return set;
}

const LINE_HEIGHT = 19.5; // 13px * 1.5 leading

export function CodeEditorPanel({
  code, onCodeChange, language, onLanguageChange, exampleId, onExampleChange,
  onSelectExample, onRun, onReset, isRunning, teaching, onToggleTeaching, findings,
  result,
}: Props) {
  const [scrollTop, setScrollTop] = useState(0);
  const preRef = useRef<HTMLPreElement>(null);

  const lineCount = code.split("\n").length;
  const lineSet = affectedLines(findings);
  const selection = REVIEW_EXAMPLES.find((e) => e.id === exampleId);

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    const v = e.currentTarget.scrollTop;
    setScrollTop(v);
    if (preRef.current) preRef.current.scrollTop = v;
  };

  return (
    <div className="cyber-panel border border-cyber-border rounded-lg flex flex-col h-full overflow-hidden">
      {/* toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-cyber-border flex-wrap">
        <Code2 className="w-4 h-4 text-cyan-400 shrink-0" />
        <select
          value={language}
          onChange={(e) => onLanguageChange(e.target.value)}
          className="h-8 px-2 bg-slate-950 border border-slate-700/80 rounded-md text-xs text-cyber-heading focus:outline-none focus:border-cyan-500"
        >
          {LANG_OPTIONS.map(([v, label]) => (
            <option key={v} value={v}>{label}</option>
          ))}
        </select>

        <div className="flex-1 flex items-center gap-1.5 min-w-0">
          <BookOpenCheck className="w-4 h-4 text-slate-500 shrink-0" />
          <select
            value={exampleId}
            onChange={(e) => onExampleChange(e.target.value)}
            className="flex-1 h-8 min-w-0 px-2 bg-slate-950 border border-slate-700/80 rounded-md text-xs text-cyber-heading focus:outline-none focus:border-cyan-500"
          >
            <option value="">Custom / paste code</option>
            {REVIEW_EXAMPLES.map((e) => (
              <option key={e.id} value={e.id}>{e.title}</option>
            ))}
          </select>
          <button
            onClick={() => selection && onSelectExample(selection.id)}
            disabled={!selection || isRunning}
            className="h-8 px-2 border border-slate-700 rounded-md text-[11px] font-mono text-slate-300 hover:border-cyan-500/60 hover:text-cyan-300 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Load
          </button>
        </div>

        <button
          onClick={onRun}
          disabled={isRunning || !code.trim()}
          className="h-8 px-3 rounded-md bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-cyan-glow"
        >
          <Play className="w-3.5 h-3.5" />
          {isRunning ? "Reviewing..." : "Run Review"}
        </button>
        <button
          onClick={onReset}
          disabled={isRunning}
          className="h-8 px-2.5 rounded-md border border-slate-700 text-slate-300 hover:border-cyan-500/60 hover:text-cyan-300 flex items-center gap-1.5 text-xs disabled:opacity-40"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onToggleTeaching}
          disabled={isRunning}
          className={`h-8 px-2.5 rounded-md border text-xs flex items-center gap-1.5 disabled:opacity-40 transition-all ${
            teaching ? "border-cyan-500/60 text-cyan-300 bg-cyan-950/30" : "border-slate-700 text-slate-300 hover:border-cyan-500/60"
          }`}
        >
          <BookOpenCheck className="w-3.5 h-3.5" />
          Teaching
        </button>
      </div>

      {/* editor body */}
      <div className="flex flex-1 min-h-0">
        {/* gutter */}
        <div className="w-12 shrink-0 overflow-hidden border-r border-cyber-border bg-slate-950/40 py-3 text-right">
          {Array.from({ length: lineCount }).map((_, i) => (
            <div
              key={i}
              style={{ height: LINE_HEIGHT }}
              className={`pr-2 text-[11px] leading-none font-mono ${
                lineSet.has(i + 1) ? "bg-red-950/40 text-red-300" : "text-slate-600"
              }`}
            >
              {i + 1}
            </div>
          ))}
        </div>

        {/* overlay + textarea */}
        <div className="relative flex-1 min-w-0">
          <pre
            ref={preRef}
            aria-hidden
            className="absolute inset-0 p-4 pointer-events-none font-mono text-[13px] leading-[1.5] whitespace-pre overflow-hidden text-cyan-100"
            dangerouslySetInnerHTML={{ __html: highlightHtml(code || "\n") }}
          />
          <textarea
            value={code}
            onChange={(e) => onCodeChange(e.target.value)}
            onScroll={handleScroll}
            spellCheck={false}
            className="relative w-full h-full resize-none bg-transparent text-transparent caret-cyan-300 font-mono text-[13px] leading-[1.5] p-4 focus:outline-none overflow-auto"
            placeholder="Paste source code here, or load an educational example from the selector above."
          />
        </div>
      </div>

      {/* footer */}
      <div className="px-3 py-2 border-t border-cyber-border flex items-center gap-2 text-[11px]">
        <span className="text-slate-500 font-mono uppercase tracking-wider text-[10px]">Is this code secure?</span>
        {result ? (
          <span className="text-cyber-muted truncate">
            {result.risk_level} risk - {result.findings.length} finding(s), score {result.security_score.before}/100
          </span>
        ) : (
          <span className="text-cyber-muted truncate">Run a review to find out.</span>
        )}
      </div>
    </div>
  );
}