"use client";

import React, { useState } from "react";
import {
  FileText,
  Download,
  ShieldAlert,
  Clock,
  CheckSquare,
  AlertTriangle,
} from "lucide-react";
import { IncidentReport } from "@/services/aiAnalyst";
import { ConceptChip } from "@/components/effects/ConceptChip";

interface IncidentReportViewProps {
  report: IncidentReport;
  onOpenTheory?: (topicId: string) => void;
}

export function IncidentReportView({ report, onOpenTheory }: IncidentReportViewProps) {

  const handleExportJSON = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `${report.incident_id}_SOC_Incident_Report.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportMarkdown = () => {
    const mdContent = `# ${report.title}
**Incident ID**: ${report.incident_id}  
**Severity**: ${report.severity}  
**Generated At**: ${report.generated_at}  

---

## 1. Executive Incident Summary
${report.summary}

---

## 2. Attack Timeline
${report.attack_timeline
  .map((t) => `### ${t.step}\n- **Detail**: ${t.detail}\n- **Evidence**: \`${t.evidence}\``)
  .join("\n\n")}

---

## 3. Evidence Summary & IOCs
- **Target Hosts**: ${report.evidence_summary.compromised_hosts.join(", ")}
- **Origin IPs**: ${report.evidence_summary.origin_ips.join(", ")}
- **Target Users**: ${report.evidence_summary.target_users.join(", ")}

---

## 4. Recommended Actions
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
      `${report.incident_id}_SOC_Incident_Report.md`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="cyber-panel holo-panel border border-cyber-border overflow-hidden">
      {/* Report Header */}
      <div className="p-4.5 border-b border-cyber-border bg-cyber-surface/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-cyan-400" />
          <div>
            <h2 className="text-base font-bold text-cyber-heading uppercase tracking-wider font-mono">
              AI Generated SOC Incident Report
            </h2>
            <div className="text-xs text-cyber-muted font-mono mt-0.5">
              {report.incident_id} • Generated {report.generated_at}
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
        {/* Section 1: Executive Summary */}
        <div className="space-y-2.5">
          <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-widest font-mono flex items-center gap-2">
            <ShieldAlert className="w-4.5 h-4.5" />
            Executive Incident Summary
          </h3>
          <div className="p-4.5 bg-slate-950/80 border border-slate-800 rounded text-sm text-cyber-text leading-relaxed">
            {report.summary}
          </div>
        </div>

        {/* Section 2: Attack Timeline */}
        <div className="space-y-2.5">
          <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-widest font-mono flex items-center gap-2">
            <Clock className="w-4.5 h-4.5" />
            Attack Timeline & Progression
          </h3>
          <div className="space-y-2.5">
            {report.attack_timeline.map((item, idx) => (
              <div
                key={idx}
                className="p-4 bg-slate-950/60 border border-slate-800 rounded flex flex-col gap-1.5"
              >
                <div className="text-sm font-semibold text-cyber-heading">
                  {item.step}
                </div>
                <p className="text-xs text-slate-300">{item.detail}</p>
                <div className="font-mono text-xs p-2 bg-slate-900 border border-slate-800 text-slate-300 rounded break-all mt-1">
                  Evidence: {item.evidence}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Risk Assessment */}
        <div className="space-y-2.5">
          <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-widest font-mono flex items-center gap-2">
            <AlertTriangle className="w-4.5 h-4.5" />
            Risk & Impact Assessment
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded">
              <div className="text-xs text-cyber-muted font-mono uppercase">
                Business Impact
              </div>
              <div className="text-sm text-slate-200 mt-1 leading-normal">
                {report.risk_assessment.business_impact}
              </div>
            </div>
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded">
              <div className="text-xs text-cyber-muted font-mono uppercase">
                AI Confidence Score
              </div>
              <div className="text-base font-mono font-bold text-emerald-400 mt-1">
                {report.risk_assessment.ai_confidence_score}
              </div>
            </div>
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded">
              <div className="text-xs text-cyber-muted font-mono uppercase">
                False Positive Likelihood
              </div>
              <div className="text-base font-mono font-bold text-cyan-400 mt-1">
                {report.risk_assessment.false_positive_likelihood}
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Recommended Actions & Playbook */}
        <div className="space-y-2.5">
          <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-widest font-mono flex items-center gap-2">
            <CheckSquare className="w-4.5 h-4.5" />
            Recommended Containment & Response Playbook
          </h3>
          <div className="space-y-2.5">
            {report.recommended_actions.map((act, idx) => (
              <div
                key={idx}
                className="p-4 bg-slate-950/80 border border-slate-800 rounded flex items-start gap-3.5"
              >
                <span className="font-mono text-xs px-2.5 py-1 rounded bg-red-950/60 text-red-400 border border-red-500/40 shrink-0 font-bold">
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
            label="Machine Learning"
            topicId="ml"
            onOpenTheory={onOpenTheory}
            className="text-xs"
          />
          <ConceptChip
            label="IOC analysis"
            topicId="detection"
            onOpenTheory={onOpenTheory}
            className="text-xs"
          />
        </div>
      </div>
    </div>
  );
}
