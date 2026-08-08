"use client";

import React from "react";
import { FileText, Download, CheckCircle2, ArrowRight } from "lucide-react";
import type { GovernanceReport } from "@/services/governanceEngine";

interface SecurityReportProps {
  report: GovernanceReport;
}

const LEVEL_STYLE: Record<string, string> = {
  Critical: "text-red-300 border-red-500/40 bg-red-950/20",
  High: "text-amber-300 border-amber-500/40 bg-amber-950/20",
  Medium: "text-cyan-300 border-cyan-500/40 bg-cyan-950/20",
  Low: "text-emerald-300 border-emerald-500/40 bg-emerald-950/20",
  Informational: "text-slate-300 border-slate-500/40 bg-slate-900/40",
};

export function SecurityReport({ report }: SecurityReportProps) {
  const print = () => {
    if (typeof window !== "undefined") window.print();
  };

  return (
    <div className="cyber-panel border border-cyber-border rounded-lg overflow-hidden">
      {/* Report toolbar */}
      <div className="px-4 py-3 border-b border-cyber-border bg-cyber-surface/60 flex items-center gap-2 print:hidden">
        <FileText className="w-4 h-4 text-cyan-400" />
        <h3 className="text-xs font-bold text-cyber-heading uppercase tracking-wider font-mono">
          AI Governance Report
        </h3>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={print}
            className="px-3 h-8 rounded-md border border-slate-700 text-slate-300 hover:border-cyan-500/60 hover:text-cyan-300 text-[11px] font-semibold flex items-center gap-1.5 transition-all"
          >
            <Download className="w-3.5 h-3.5" /> Export / Print
          </button>
          <span className="text-[10px] font-mono text-slate-500">Use browser print-to-PDF</span>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-4 bg-white text-slate-900 print:bg-white print:text-slate-900">
        {/* Header */}
        <div className="border-b-2 border-slate-300 pb-3">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
            AI Risk Assessment & Governance
          </div>
          <h4 className="text-lg font-bold">{report.project_overview.title}</h4>
          <p className="text-[12px] text-slate-600">{report.executive_summary}</p>
        </div>

        {/* Project overview */}
        <div className="grid grid-cols-2 gap-3 text-[12px]">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Business Goal</div>
            <div className="mt-0.5">{report.project_overview.business_goal}</div>
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Users</div>
            <div className="mt-0.5">{report.project_overview.users}</div>
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Data Types</div>
            <div className="mt-0.5">{report.project_overview.data_types.join(", ")}</div>
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Model / Criticality</div>
            <div className="mt-0.5">
              {report.project_overview.model_type} / {report.project_overview.criticality}
            </div>
          </div>
        </div>

        {/* Architecture summary */}
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1">Architecture</div>
          <div className="flex flex-wrap gap-1.5">
            {report.architecture_summary.map((a, i) => (
              <span key={i} className="text-[10px] font-mono border border-slate-300 rounded px-1.5 py-0.5">
                {a}
              </span>
            ))}
          </div>
        </div>

        {/* Threat assessment table */}
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1.5">Threat Assessment</div>
          <div className="overflow-x-auto">
            <table className="w-full text-[11px] border border-slate-300">
              <thead>
                <tr className="bg-slate-100 text-left">
                  <th className="px-2 py-1 border border-slate-300 font-semibold">Risk</th>
                  <th className="px-2 py-1 border border-slate-300 font-semibold">Category</th>
                  <th className="px-2 py-1 border border-slate-300 font-semibold">Before</th>
                  <th className="px-2 py-1 border border-slate-300 font-semibold">After</th>
                </tr>
              </thead>
              <tbody>
                {report.threat_assessment.map((t, i) => (
                  <tr key={i}>
                    <td className="px-2 py-1 border border-slate-300">{t.name}</td>
                    <td className="px-2 py-1 border border-slate-300">{t.category}</td>
                    <td className="px-2 py-1 border border-slate-300">{t.before}</td>
                    <td className="px-2 py-1 border border-slate-300">{t.after}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1">Selected Controls</div>
            <div className="flex flex-wrap gap-1.5">
              {report.selected_controls.map((c) => (
                <span key={c.id} className="text-[10px] font-mono border border-emerald-500/50 text-emerald-700 rounded px-1.5 py-0.5">
                  {c.name}
                </span>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1">Residual Risks</div>
            <ul className="space-y-1">
              {report.residual_risks.map((r, i) => (
                <li key={i} className="text-[11px] flex items-start gap-1.5">
                  <span className={`shrink-0 text-[10px] font-mono border rounded px-1 ${LEVEL_STYLE[r.level] ?? ""}`}>
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
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1">
              Recommended Improvements
            </div>
            <ul className="space-y-1">
              {report.recommended_improvements.map((r, i) => (
                <li key={i} className="text-[11px] flex items-start gap-1.5">
                  <ArrowRight className="w-3 h-3 mt-0.5 shrink-0 text-cyan-600" />
                  <span>
                    <span className="font-semibold">{r.name}</span> - {r.reason}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1">Security Checklist</div>
            <ul className="space-y-1">
              {report.security_checklist.map((c, i) => (
                <li key={i} className="text-[11px] flex items-start gap-1.5">
                  <CheckCircle2 className="w-3 h-3 mt-0.5 shrink-0 text-emerald-600" />
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-300 pt-3 text-[10px] text-slate-500 leading-snug">
          This report is an educational simulation using fictional systems. It is not legal advice and does not
          certify compliance with any regulation or standard.
        </div>
      </div>
    </div>
  );
}
