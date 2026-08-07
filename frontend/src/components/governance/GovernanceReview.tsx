"use client";

import React from "react";
import {
  ClipboardList,
  Building2,
  ShieldCheck,
  EyeOff,
  Activity,
  Gauge,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
} from "lucide-react";
import type { GovernanceReview as GovernanceReviewData } from "@/services/governanceEngine";

interface GovernanceReviewProps {
  review: GovernanceReviewData;
}

function RiskSection({
  icon: Icon,
  title,
  accent,
  data,
}: {
  icon: typeof Building2;
  title: string;
  accent: string;
  data: { summary: string; points: string[] };
}) {
  return (
    <div className="rounded-md border border-cyber-border bg-slate-900/40 p-3">
      <div className="flex items-center gap-2 mb-1.5">
        <Icon className={`w-4 h-4 ${accent}`} />
        <h4 className="text-[11px] font-bold text-cyber-heading uppercase tracking-wider font-mono">{title}</h4>
      </div>
      <p className="text-[12px] text-cyber-muted leading-snug">{data.summary}</p>
      {data.points.length > 0 && (
        <ul className="mt-2 space-y-1">
          {data.points.map((p, i) => (
            <li key={i} className="text-[11px] text-slate-300 flex gap-2 leading-snug">
              <span className="text-cyan-400 shrink-0 font-mono">-</span>
              {p}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function GovernanceReview({ review }: GovernanceReviewProps) {
  const rec = review.deployment_recommendation;
  const approved = rec.label === "Ready for Deployment" || rec.label === "Deploy with Controls";

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/5 px-4 py-3 text-[13px] text-cyan-100/90 flex items-start gap-2.5">
        <ClipboardList className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
        <p>{review.executive_summary}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <RiskSection icon={Building2} title="Business Risk" accent="text-cyan-400" data={review.business_risk} />
        <RiskSection icon={ShieldCheck} title="Security Risk" accent="text-red-400" data={review.security_risk} />
        <RiskSection icon={EyeOff} title="Privacy Risk" accent="text-violet-400" data={review.privacy_risk} />
        <RiskSection icon={Activity} title="Operational Risk" accent="text-amber-400" data={review.operational_risk} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        <div className="lg:col-span-5">
          <div className="rounded-md border border-cyber-border bg-slate-900/40 p-3">
            <div className="flex items-center gap-2 mb-1.5">
              <Gauge className="w-4 h-4 text-cyan-400" />
              <h4 className="text-[11px] font-bold text-cyber-heading uppercase tracking-wider font-mono">Residual Risk</h4>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-3xl font-bold font-mono text-cyber-heading">{review.residual_risk.score}</div>
              <div>
                <div className="text-[11px] font-mono text-emerald-300">{review.residual_risk.level}</div>
                <div className="text-[10px] font-mono text-slate-500">/100</div>
              </div>
            </div>
            <p className="mt-2 text-[11px] text-cyber-muted leading-snug">{review.residual_risk.summary}</p>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div
            className={`rounded-md border p-3 h-full flex flex-col justify-center ${
              approved
                ? "border-emerald-500/50 bg-emerald-950/20"
                : "border-red-500/50 bg-red-950/20"
            }`}
          >
            <div className="flex items-center gap-2 mb-1.5">
              {approved ? (
                <ThumbsUp className="w-4 h-4 text-emerald-300" />
              ) : (
                <ThumbsDown className="w-4 h-4 text-red-300" />
              )}
              <h4 className="text-[11px] font-bold text-cyber-heading uppercase tracking-wider font-mono">
                Deployment Recommendation
              </h4>
            </div>
            <div className={`text-base font-bold font-mono ${approved ? "text-emerald-300" : "text-red-300"}`}>
              {rec.label}
            </div>
            <p className="mt-1 text-[12px] text-slate-300 leading-snug">{rec.reason}</p>
            <div className="mt-2 flex items-start gap-1.5 text-[11px] text-amber-300/80 leading-snug">
              <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              The recommendation applies to this simulated system only. Real decisions need legal, regulatory, and
              technical sign-off.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
