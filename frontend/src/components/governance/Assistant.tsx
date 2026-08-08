"use client";

import React from "react";
import { Sparkles } from "lucide-react";

interface AssistantQA {
  q: string;
  a: string;
}

interface AssistantProps {
  qa: AssistantQA[];
  question: string;
  onQuestion: (v: string) => void;
  onAsk: (q: string) => void;
  examples: string[];
}

export function Assistant({ qa, question, onQuestion, onAsk, examples }: AssistantProps) {
  return (
    <div className="cyber-panel border border-cyan-500/30 rounded-lg overflow-hidden flex flex-col h-full">
      <div className="px-4 py-3 border-b border-cyber-border flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-cyan-400" />
        <h3 className="text-xs font-bold text-cyber-heading uppercase tracking-wider font-mono">Governance Assistant</h3>
      </div>
      <div className="flex-1 min-h-[120px] max-h-64 overflow-auto p-3 space-y-2">
        {qa.length === 0 && (
          <p className="text-[11px] text-cyber-muted">
            Ask about risk scoring, controls, threat modeling frameworks, or AI governance reviews.
          </p>
        )}
        {qa.map((x, i) => (
          <div key={i} className="space-y-1">
            <div className="text-[11px] font-mono text-cyan-300 ml-auto w-fit max-w-[85%] rounded-md bg-slate-800/60 px-2 py-1">
              {x.q}
            </div>
            <div className="text-[11px] text-cyber-muted rounded-md bg-slate-900/60 px-2 py-1 leading-snug">
              {x.a}
            </div>
          </div>
        ))}
      </div>
      <div className="p-2 border-t border-cyber-border space-y-2">
        <div className="flex gap-1 flex-wrap">
          {examples.map((e) => (
            <button
              key={e}
              onClick={() => onAsk(e)}
              className="chip-holo text-[10px] px-2 py-1 rounded-full border border-slate-700 text-slate-300 hover:border-cyan-500/60 hover:text-cyan-300"
            >
              {e}
            </button>
          ))}
        </div>
        <form
          className="flex gap-1.5"
          onSubmit={(ev) => {
            ev.preventDefault();
            onAsk(question);
          }}
        >
          <input
            value={question}
            onChange={(e) => onQuestion(e.target.value)}
            placeholder="Ask a question..."
            className="flex-1 h-8 min-w-0 px-2 bg-slate-950 border border-slate-700 rounded-md text-xs text-cyber-heading focus:outline-none focus:border-cyan-500"
          />
          <button
            type="submit"
            disabled={!question.trim()}
            className="h-8 px-3 rounded-md bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-slate-950 text-xs font-bold"
          >
            Ask
          </button>
        </form>
      </div>
    </div>
  );
}
