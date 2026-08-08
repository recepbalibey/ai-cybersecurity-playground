"use client";

import React from "react";
import {
  FileText,
  Download,
  ShieldCheck,
  Search,
  CheckSquare,
  AlertTriangle,
} from "lucide-react";
import { ThreatHuntingReport } from "@/services/threatHunter";
import { ConceptChip } from "@/components/effects/ConceptChip";

interface ThreatHuntingReportViewProps {
  report: ThreatHuntingReport;
  qualityScore: number;
  onOpenTheory?: (topicId: string) => void;
}

export function ThreatHuntingReportView({
  report,
  qualityScore,
  onOpenTheory,
}: ThreatHuntingReportViewProps) {
  const handleExportJSON = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `${report.hunting_id}_Threat_Hunting_Report.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportMarkdown = () => {
    const mdContent = `# ${report.title}
**Hunting ID**: ${report.hunting_id}  
**Objective**: ${report.objective}  
**Quality Score**: ${qualityScore}%  

---

## 1. Threat Hypothesis
${report.hypothesis}

---

## 2. Telemetry & Data Sources Used
${report.data_sources_used.map((s) => `- ${s}`).join("\n")}

---

## 3. Detection Logic & MITRE ATT&CK
- **Tactic**: ${report.mitre_mapping.tactic}
- **Technique ID**: ${report.mitre_mapping.id}
- **Summary**: ${report.detection_logic_summary}

---

## 4. Recommended Containment Actions
${report.recommended_actions
  .map((a) => `- [ ] **${a.priority}** (${a.type}): ${a.action}`)
  .join("\n")}
`;

    const dataStr =
      "data:text/markdown;charset=utf-8," + encodeURIComponent(mdContent);
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `${report.hunting_id}_Threat_Hunting_Report.md`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="cyber-panel border border-cyber-border overflow-hidden">
      {/* Report Header */}
      <div className="p-4.5 border-b border-cyber-border bg-cyber-surface/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-cyan-400" />
          <div>
            <h2 className="text-base font-bold text-cyber-heading uppercase tracking-wider font-mono">
              AI Threat Hunting Investigation Report
            </h2>
            <div className="text-xs text-cyber-muted font-mono mt-0.5">
              {report.hunting_id} • Quality Score: {qualityScore}%
            </div>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportJSON}
            className="h-9 px-3.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-cyan-300 flex items-center gap-2 transition-all font-semibold"
          >
            <Download className="w-4 h-4" />
            <span>JSON</span>
          </button>
          <button
            onClick={handleExportMarkdown}
            className="h-9 px-3.5 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-mono font-semibold flex items-center gap-2 transition-all shadow-cyan-glow"
          >
            <Download className="w-4 h-4" />
            <span>Markdown Report</span>
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6 bg-cyber-base/40">
        {/* Section 1: Objective & Hypothesis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded">
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest font-mono flex items-center gap-2 mb-2">
              <Search className="w-4 h-4" />
              Hunting Objective
            </h3>
            <p className="text-xs text-cyber-text leading-relaxed">
              {report.objective}
            </p>
          </div>

          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded">
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest font-mono flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4" />
              Threat Hypothesis
            </h3>
            <p className="text-xs text-cyber-text leading-relaxed">
              {report.hypothesis}
            </p>
          </div>
        </div>

        {/* Section 2: Data Sources & MITRE Mapping */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded">
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest font-mono mb-2">
              Data Sources Used
            </h3>
            <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
              {report.data_sources_used.map((ds, idx) => (
                <li key={idx}>{ds}</li>
              ))}
            </ul>
          </div>

          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded">
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest font-mono mb-2">
              MITRE ATT&CK Correlation
            </h3>
            <div className="text-xs text-slate-200">
              <div className="font-mono text-cyan-300 font-bold mb-1">
                {report.mitre_mapping.id}: {report.mitre_mapping.name}
              </div>
              <div className="text-cyber-muted font-mono">
                Tactic: {report.mitre_mapping.tactic}
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Recommended Actions */}
        <div className="space-y-2.5">
          <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-widest font-mono flex items-center gap-2">
            <CheckSquare className="w-4.5 h-4.5" />
            Recommended Containment & Detection Rules
          </h3>
          <div className="space-y-2.5">
            {report.recommended_actions.map((act, idx) => (
              <div
                key={idx}
                className="p-4 bg-slate-950/80 border border-slate-800 rounded flex items-start gap-3.5"
              >
                <span className="font-mono text-xs px-2.5 py-1 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-500/40 shrink-0 font-bold">
                  {act.priority}
                </span>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-cyber-heading">
                    [{act.type}] {act.action}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Concepts to dig deeper into */}
        <div className="flex flex-wrap items-center gap-2 border-t border-cyber-border pt-4 text-sm text-cyber-muted">
          <span className="font-mono text-[10px] uppercase tracking-wider text-cyber-muted">
            Dig deeper:
          </span>
          <ConceptChip
            label="Threat Hunting"
            topicId="hunting"
            onOpenTheory={onOpenTheory}
            className="text-xs"
          />
          <ConceptChip
            label="Detection Engineering"
            topicId="detection"
            onOpenTheory={onOpenTheory}
            className="text-xs"
          />
        </div>
      </div>
    </div>
  );
}
