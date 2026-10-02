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
        <BookOpen className="w-4 h-4 text-accent" />
        <h3 className="text-xs font-bold text-cyber-heading">
          Why AI output is not automatically correct
        </h3>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {FAILURE_TOPIC_ORDER.map((topic) => (
          <button
            key={topic}
            onClick={() => setActiveTopic(topic)}
            className={`text-[0.625rem] px-2 py-1 rounded-full border transition-all flex items-center gap-1 ${
              activeTopic === topic
                ? "border-cyan-500/60 bg-accent/10 text-accent"
                : "border-cyber-border text-cyber-muted hover:border-cyan-500/60 hover:text-accent"
            }`}
          >
            {topic.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="rounded-md border border-cyber-border bg-cyber-base/60 p-3">
            <div className="flex items-start gap-2">
              <ChevronRight className="w-3.5 h-3.5 text-accent mt-0.5 shrink-0" />
              <div>
                <p className="text-[0.8125rem] font-bold text-cyber-heading leading-snug">{item.title}</p>
                <p className="text-[0.75rem] text-cyber-muted leading-snug mt-1">{item.explanation}</p>
                <p className="text-[0.75rem] text-cyber-text leading-snug mt-1">
                  <span className="font-mono text-accent">Practical: </span>
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
