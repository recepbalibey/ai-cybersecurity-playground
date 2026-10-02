"use client";

import React from "react";
import { FileText, Download, CheckCircle2, ArrowRight } from "lucide-react";
import type { GovernanceReport } from "@/services/governanceEngine";

interface SecurityReportProps {
  report: GovernanceReport;
}

const LEVEL_STYLE: Record<string, string> = {
  Critical: "text-status-danger border-red-500/40 bg-status-danger/10",
  High: "text-status-warning border-amber-500/40 bg-status-warning/10",
  Medium: "text-accent border-cyan-500/40 bg-accent/10",
  Low: "text-status-success border-emerald-500/40 bg-status-success/10",
  Informational: "text-cyber-text border-cyber-border/40 bg-cyber-base/40",
};

export function SecurityReport({ report }: SecurityReportProps) {
  const print = () => {
    if (typeof window !== "undefined") window.print();
  };

  return (
    <div className="cyber-panel border border-cyber-border rounded-lg overflow-hidden">
      {/* Report toolbar */}
      <div className="px-4 py-3 border-b border-cyber-border bg-cyber-surface/60 flex items-center gap-2 print:hidden">
        <FileText className="w-4 h-4 text-accent" />
        <h3 className="text-xs font-bold text-cyber-heading">
          AI Governance Report
        </h3>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={print}
            className="px-3 h-8 rounded-md border border-cyber-border text-cyber-text hover:border-cyan-500/60 hover:text-accent text-[0.6875rem] font-semibold flex items-center gap-1.5 transition-all"
          >
            <Download className="w-3.5 h-3.5" /> Export / Print
          </button>
          <span className="text-[0.625rem] font-mono text-cyber-muted">Use browser print-to-PDF</span>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-4 bg-white text-cyber-heading print:bg-white print:text-cyber-heading">
        {/* Header */}
        <div className="border-b-2 border-cyber-border pb-3">
          <div className="text-[0.625rem] font-mono uppercase tracking-wider text-cyber-muted">
            AI Risk Assessment & Governance
          </div>
          <h4 className="text-lg font-bold">{report.project_overview.title}</h4>
          <p className="text-[0.75rem] text-cyber-muted">{report.executive_summary}</p>
        </div>

        {/* Project overview */}
        <div className="grid grid-cols-2 gap-3 text-[0.75rem]">
          <div>
            <div className="text-[0.625rem] font-mono uppercase tracking-wider text-cyber-muted">Business Goal</div>
            <div className="mt-0.5">{report.project_overview.business_goal}</div>
          </div>
          <div>
            <div className="text-[0.625rem] font-mono uppercase tracking-wider text-cyber-muted">Users</div>
            <div className="mt-0.5">{report.project_overview.users}</div>
          </div>
          <div>
            <div className="text-[0.625rem] font-mono uppercase tracking-wider text-cyber-muted">Data Types</div>
            <div className="mt-0.5">{report.project_overview.data_types.join(", ")}</div>
          </div>
          <div>
            <div className="text-[0.625rem] font-mono uppercase tracking-wider text-cyber-muted">Model / Criticality</div>
            <div className="mt-0.5">
              {report.project_overview.model_type} / {report.project_overview.criticality}
            </div>
          </div>
        </div>

        {/* Architecture summary */}
        <div>
          <div className="text-[0.625rem] font-mono uppercase tracking-wider text-cyber-muted mb-1">Architecture</div>
          <div className="flex flex-wrap gap-1.5">
            {report.architecture_summary.map((a, i) => (
              <span key={i} className="text-[0.625rem] font-mono border border-cyber-border rounded px-1.5 py-0.5">
                {a}
              </span>
            ))}
          </div>
        </div>

        {/* Threat assessment table */}
        <div>
          <div className="text-[0.625rem] font-mono uppercase tracking-wider text-cyber-muted mb-1.5">Threat Assessment</div>
          <div className="overflow-x-auto">
            <table className="w-full text-[0.6875rem] border border-cyber-border">
              <thead>
                <tr className="bg-slate-100 text-left">
                  <th className="px-2 py-1 border border-cyber-border font-semibold">Risk</th>
                  <th className="px-2 py-1 border border-cyber-border font-semibold">Category</th>
                  <th className="px-2 py-1 border border-cyber-border font-semibold">Before</th>
                  <th className="px-2 py-1 border border-cyber-border font-semibold">After</th>
                </tr>
              </thead>
              <tbody>
                {report.threat_assessment.map((t, i) => (
                  <tr key={i}>
                    <td className="px-2 py-1 border border-cyber-border">{t.name}</td>
                    <td className="px-2 py-1 border border-cyber-border">{t.category}</td>
                    <td className="px-2 py-1 border border-cyber-border">{t.before}</td>
                    <td className="px-2 py-1 border border-cyber-border">{t.after}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <div className="text-[0.625rem] font-mono uppercase tracking-wider text-cyber-muted mb-1">Selected Controls</div>
            <div className="flex flex-wrap gap-1.5">
              {report.selected_controls.map((c) => (
                <span key={c.id} className="text-[0.625rem] font-mono border border-emerald-500/50 text-status-success rounded px-1.5 py-0.5">
                  {c.name}
                </span>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[0.625rem] font-mono uppercase tracking-wider text-cyber-muted mb-1">Residual Risks</div>
            <ul className="space-y-1">
              {report.residual_risks.map((r, i) => (
                <li key={i} className="text-[0.6875rem] flex items-start gap-1.5">
                  <span className={`shrink-0 text-[0.625rem] font-mono border rounded px-1 ${LEVEL_STYLE[r.level] ?? ""}`}>
                    {r.level}
                  </span>
                  <span>{r.name}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Improvements + checklist */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <div className="text-[0.625rem] font-mono uppercase tracking-wider text-cyber-muted mb-1">
              Recommended Improvements
            </div>
            <ul className="space-y-1">
              {report.recommended_improvements.map((r, i) => (
                <li key={i} className="text-[0.6875rem] flex items-start gap-1.5">
                  <ArrowRight className="w-3 h-3 mt-0.5 shrink-0 text-accent" />
                  <span>
                    <span className="font-semibold">{r.name}</span> - {r.reason}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-[0.625rem] font-mono uppercase tracking-wider text-cyber-muted mb-1">Security Checklist</div>
            <ul className="space-y-1">
              {report.security_checklist.map((c, i) => (
                <li key={i} className="text-[0.6875rem] flex items-start gap-1.5">
                  <CheckCircle2 className="w-3 h-3 mt-0.5 shrink-0 text-status-success" />
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-cyber-border pt-3 text-[0.625rem] text-cyber-muted leading-snug">
          This report is an educational simulation using fictional systems. It is not legal advice and does not
          certify compliance with any regulation or standard.
        </div>
      </div>
    </div>
  );
}
