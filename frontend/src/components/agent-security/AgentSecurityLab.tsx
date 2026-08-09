"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Bot, Cpu } from "lucide-react";
import {
  AgentScenario,
  AgentTool,
  SecurityControl,
  AgentKnowledge,
  MissionResult,
  fetchAgentScenarios,
  fetchAgentTools,
  fetchAgentControls,
  fetchAgentKnowledge,
  runAgentMission,
} from "@/services/agentSecurity";
import { MissionConsole } from "@/components/agent-security/MissionConsole";
import { AgentBrain } from "@/components/agent-security/AgentBrain";
import { ToolSandbox } from "@/components/agent-security/ToolSandbox";
import { SecurityMonitor } from "@/components/agent-security/SecurityMonitor";
import { PolicyEnginePanel } from "@/components/agent-security/PolicyEnginePanel";
import { AttackPanel } from "@/components/agent-security/AttackPanel";
import { EducationPanel } from "@/components/agent-security/EducationPanel";
import { useLabBrief } from "@/components/lab-brief/LabBriefContext";

interface AgentSecurityLabProps {
  onStatusChange: (processing: boolean) => void;
}

const DEFAULT_CONTROLS = new Set([
  "least_privilege",
  "human_approval",
  "prompt_sanitization",
  "memory_validation",
  "tool_allowlist",
  "policy_engine",
]);

export function AgentSecurityLab({ onStatusChange }: AgentSecurityLabProps) {
  const { markStarted, markCompleted } = useLabBrief();
  const [scenarios, setScenarios] = useState<AgentScenario[]>([]);
  const [tools, setTools] = useState<AgentTool[]>([]);
  const [controlsList, setControlsList] = useState<SecurityControl[]>([]);
  const [knowledge, setKnowledge] = useState<AgentKnowledge | null>(null);

  const [selectedKey, setSelectedKey] = useState("1_safe_investigation");
  const [goal, setGoal] = useState("");
  const [activeControls, setActiveControls] = useState<Set<string>>(DEFAULT_CONTROLS);

  const [isProcessing, setIsProcessing] = useState(false);
  const [activeStage, setActiveStage] = useState<string | null>(null);
  const [result, setResult] = useState<MissionResult | null>(null);
  const [protectedResult, setProtectedResult] = useState<MissionResult | null>(null);
  const [compare, setCompare] = useState(false);
  const [totalMissions, setTotalMissions] = useState(0);

  useEffect(() => {
    let active = true;
    Promise.all([
      fetchAgentScenarios(),
      fetchAgentTools(),
      fetchAgentControls(),
      fetchAgentKnowledge(),
    ]).then(([s, t, c, k]) => {
      if (!active) return;
      setScenarios(s);
      setTools(t);
      setControlsList(c);
      setKnowledge(k);
    });
    return () => {
      active = false;
    };
  }, []);

  const setProcessing = useCallback(
    (val: boolean) => {
      setIsProcessing(val);
      onStatusChange(val);
    },
    [onStatusChange]
  );

  const runToken = useRef(0);
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const animate = async (result: MissionResult) => {
    const nodes = result.graph ?? [];
    for (let i = 0; i < nodes.length; i++) {
      if (!mountedRef.current) return;
      setActiveStage(`graph_${i}`);
      await new Promise((r) => setTimeout(r, 380));
    }
    setActiveStage(null);
  };

  const handleRun = async () => {
    if (isProcessing) return;
    const token = ++runToken.current;
    setProcessing(true);
    setResult(null);
    setProtectedResult(null);
    setCompare(false);
    markStarted("agent-security");
    const res = await runAgentMission(goal, selectedKey, Array.from(activeControls));
    if (runToken.current !== token) return;
    setResult(res);
    await animate(res);
    if (runToken.current !== token) return;
    setTotalMissions((n) => n + 1);
    setProcessing(false);
    markCompleted("agent-security");
  };

  const handleRunProtected = async () => {
    if (isProcessing) return;
    const token = ++runToken.current;
    setProcessing(true);
    setCompare(true);
    markStarted("agent-security");
    const allControls = controlsList.map((c) => c.key);
    const res = await runAgentMission(goal, selectedKey, allControls);
    if (runToken.current !== token) return;
    setProtectedResult(res);
    await animate(res);
    if (runToken.current !== token) return;
    setProcessing(false);
    markCompleted("agent-security");
  };

  const handleReset = () => {
    runToken.current += 1;
    setResult(null);
    setProtectedResult(null);
    setCompare(false);
    setGoal("");
    setActiveStage(null);
    setProcessing(false);
  };

  const toggleControl = (key: string) => {
    setActiveControls((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {/* Lab status strip */}
      <div className="cyber-panel corner-frame border border-cyber-border p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Bot className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-cyber-heading uppercase tracking-wider font-mono">
              Agent Runtime Active
            </h2>
          </div>
          <span className="text-[10px] font-mono px-2 py-1 rounded border border-emerald-500/40 text-emerald-300 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            SANDBOX SIMULATION
          </span>
        </div>
        <div className="mt-2 flex items-center gap-2 text-[10px] font-mono text-cyber-muted">
          <Cpu className="w-3.5 h-3.5 text-cyan-500" />
          Goal → Planner → Memory → Tool Selection → Tool Execution → Observation → Decision → Final Response
        </div>
      </div>

      {/* Four-column main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[640px]">
        <div className="lg:col-span-3 h-full">
          <MissionConsole
            scenarios={scenarios}
            selectedKey={selectedKey}
            onSelect={setSelectedKey}
            goal={goal}
            onGoalChange={setGoal}
            onRun={handleRun}
            onReset={handleReset}
            isProcessing={isProcessing}
          />
        </div>

        <div className="lg:col-span-3 h-full">
          <AgentBrain result={result} isProcessing={isProcessing} activeStage={activeStage} />
        </div>

        <div className="lg:col-span-3 h-full">
          <ToolSandbox tools={tools} result={result} isProcessing={isProcessing} />
        </div>

        <div className="lg:col-span-3 h-full">
          <SecurityMonitor result={result} isProcessing={isProcessing} />
        </div>
      </div>

      {/* Secondary grid: policy engine + attack + education */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-4 h-full">
          <PolicyEnginePanel
            controls={controlsList}
            activeControls={activeControls}
            onToggle={toggleControl}
            result={result}
          />
        </div>
        <div className="lg:col-span-4 h-full">
          <AttackPanel
            result={result}
            protectedResult={protectedResult}
            compare={compare}
            onToggleCompare={compare ? () => setCompare(false) : handleRunProtected}
            isProcessing={isProcessing}
          />
        </div>
        <div className="lg:col-span-4 h-full">
          <EducationPanel
            principles={knowledge?.principles ?? []}
            riskFactors={knowledge?.risk_factors ?? []}
            result={result}
            totalMissions={totalMissions}
          />
        </div>
      </div>
    </div>
  );
}