"use client";

import React, { useState } from "react";
import { BookOpen, ChevronRight } from "lucide-react";
import { AI_FAILURE_TOPICS, FAILURE_TOPIC_ORDER } from "@/knowledge/ai-failures/knowledgeBase";

export function KnowledgeExplorer() {
  const [activeTopic, setActiveTopic] = useState(FAILURE_TOPIC_ORDER[0]);
  const items = AI_FAILURE_TOPICS[activeTopic] ?? [];

  return (
    <div className="cyber-panel border border-cyber-border rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <BookOpen className="w-4 h-4 text-cyan-400" />
        <h3 className="text-xs font-bold text-cyber-heading uppercase tracking-wider font-mono">
          Why AI output is not automatically correct
        </h3>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {FAILURE_TOPIC_ORDER.map((topic) => (
          <button
            key={topic}
            onClick={() => setActiveTopic(topic)}
            className={`text-[10px] px-2 py-1 rounded-full border transition-all flex items-center gap-1 ${
              activeTopic === topic
                ? "border-cyan-500/60 bg-cyan-950/40 text-cyan-300"
                : "border-slate-700 text-slate-400 hover:border-cyan-500/60 hover:text-cyan-300"
            }`}
          >
            {topic.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="rounded-md border border-cyber-border bg-slate-950/60 p-3">
            <div className="flex items-start gap-2">
              <ChevronRight className="w-3.5 h-3.5 text-cyan-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-[13px] font-bold text-cyber-heading leading-snug">{item.title}</p>
                <p className="text-[12px] text-cyber-muted leading-snug mt-1">{item.explanation}</p>
                <p className="text-[12px] text-cyan-200/80 leading-snug mt-1">
                  <span className="font-mono text-cyan-400">Practical: </span>
                  {item.practical}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
