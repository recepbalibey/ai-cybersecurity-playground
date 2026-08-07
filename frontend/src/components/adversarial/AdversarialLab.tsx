"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Activity, GitCompareArrows } from "lucide-react";
import {
  VisionExperiment,
  VisionConcept,
  AttackMethod,
  DefenseMechanism,
  VisionAnalysisResult,
  Difficulty,
  AnalysisMode,
  fetchVisionExperiments,
  fetchVisionConcepts,
  fetchVisionAttacksDefenses,
  runVisionAnalysis,
} from "@/services/visionSecurity";
import { ExperimentLibrary } from "@/components/adversarial/ExperimentLibrary";
import { ComparisonViewer } from "@/components/adversarial/ComparisonViewer";
import { RobustnessAnalysis } from "@/components/adversarial/RobustnessAnalysis";
import { KnowledgePane } from "@/components/adversarial/KnowledgePane";
import { ControlPanel } from "@/components/adversarial/ControlPanel";
import { ProgressPanel } from "@/components/adversarial/ProgressPanel";

interface AdversarialLabProps {
  instructorMode: boolean;
  onToggleInstructorMode: (val: boolean) => void;
  onStatusChange: (processing: boolean) => void;
}

export function AdversarialLab({
  onStatusChange,
}: AdversarialLabProps) {
  const [experiments, setExperiments] = useState<VisionExperiment[]>([]);
  const [concepts, setConcepts] = useState<VisionConcept[]>([]);
  const [attacks, setAttacks] = useState<AttackMethod[]>([]);
  const [defenses, setDefenses] = useState<DefenseMechanism[]>([]);

  const [experimentKey, setExperimentKey] = useState("1_noise_attack");
  const [difficulty, setDifficulty] = useState<Difficulty>("beginner");
  const [mode, setMode] = useState<AnalysisMode>("adversarial");

  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<VisionAnalysisResult | null>(null);
  const [results, setResults] = useState<VisionAnalysisResult[]>([]);

  useEffect(() => {
    let active = true;
    Promise.all([
      fetchVisionExperiments(),
      fetchVisionConcepts(),
      fetchVisionAttacksDefenses(),
    ]).then(([e, c, ad]) => {
      if (!active) return;
      setExperiments(e);
      setConcepts(c);
      setAttacks(ad.attacks);
      setDefenses(ad.defenses);
    });
    return () => {
      active = false;
    };
  }, []);

  const currentExperiment = experiments.find((e) => e.key === experimentKey);

  const setProcessing = useCallback(
    (val: boolean) => {
      setIsProcessing(val);
      onStatusChange(val);
    },
    [onStatusChange]
  );

  const handleRun = async () => {
    if (isProcessing) return;
    setProcessing(true);
    const res = await runVisionAnalysis(experimentKey, mode);
    setResult(res);
    setResults((prev) => {
      const next = [...prev, res];
      return next.slice(-40);
    });
    await new Promise((r) => setTimeout(r, 300));
    setProcessing(false);
  };

  const handleSelect = (key: string) => {
    setExperimentKey(key);
    setResult(null);
  };

  const handleDifficulty = (d: Difficulty) => {
    setDifficulty(d);
    setResult(null);
    const first = experiments.find((e) => e.difficulty === d);
    if (first) setExperimentKey(first.key);
  };

  return (
    <div className="space-y-6">
      {/* Lab control strip */}
      <div className="cyber-panel border border-cyber-border p-5 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <GitCompareArrows className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-cyber-heading uppercase tracking-wider font-mono">
              Adversarial Vision Lab - Active
            </h2>
          </div>
          <span className="text-[10px] font-mono px-2 py-1 rounded border border-cyan-500/40 text-cyan-300">
            {currentExperiment?.title ?? "-"}
          </span>
        </div>
        <div className="mt-3 flex items-center gap-2 text-[10px] font-mono text-cyber-muted">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Pipeline: Image → Preprocessing → ML Model → Prediction → Robustness Evaluation
        </div>
      </div>

      {/* Main 3-column grid: library / comparison / analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[640px]">
        <div className="lg:col-span-3 h-full">
          <ExperimentLibrary
            experiments={experiments}
            selectedKey={experimentKey}
            onSelect={handleSelect}
            difficulty={difficulty}
            onDifficultyChange={handleDifficulty}
          />
        </div>

        <div className="lg:col-span-6 h-full space-y-4">
          <ComparisonViewer result={result} isProcessing={isProcessing} />
          <RobustnessAnalysis result={result} isProcessing={isProcessing} />
        </div>

        <div className="lg:col-span-3 h-full space-y-4">
          <ControlPanel
            experiment={currentExperiment}
            mode={mode}
            onModeChange={setMode}
            onRun={handleRun}
            isProcessing={isProcessing}
            result={result}
          />
        </div>
      </div>

      {/* Secondary grid: knowledge + progress */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8 h-full">
          <KnowledgePane
            concepts={concepts}
            attacks={attacks}
            defenses={defenses}
            result={result}
          />
        </div>
        <div className="lg:col-span-4 h-full">
          <ProgressPanel results={results} experiments={results.length} />
        </div>
      </div>
    </div>
  );
}