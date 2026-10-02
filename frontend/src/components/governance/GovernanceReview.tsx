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
    <div className="rounded-md border border-cyber-border bg-cyber-base/40 p-3">
      <div className="flex items-center gap-2 mb-1.5">
        <Icon className={`w-4 h-4 ${accent}`} />
        <h4 className="text-[0.6875rem] font-bold text-cyber-heading">{title}</h4>
      </div>
      <p className="text-[0.75rem] text-cyber-muted leading-snug">{data.summary}</p>
      {data.points.length > 0 && (
        <ul className="mt-2 space-y-1">
          {data.points.map((p, i) => (
            <li key={i} className="text-[0.6875rem] text-cyber-text flex gap-2 leading-snug">
              <span className="text-accent shrink-0 font-mono">-</span>
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
      <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/5 px-4 py-3 text-[0.8125rem] text-cyber-text flex items-start gap-2.5">
        <ClipboardList className="w-4 h-4 text-accent mt-0.5 shrink-0" />
        <p>{review.executive_summary}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <RiskSection icon={Building2} title="Business Risk" accent="text-accent" data={review.business_risk} />
        <RiskSection icon={ShieldCheck} title="Security Risk" accent="text-status-danger" data={review.security_risk} />
        <RiskSection icon={EyeOff} title="Privacy Risk" accent="text-accent" data={review.privacy_risk} />
        <RiskSection icon={Activity} title="Operational Risk" accent="text-status-warning" data={review.operational_risk} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        <div className="lg:col-span-5">
          <div className="rounded-md border border-cyber-border bg-cyber-base/40 p-3">
            <div className="flex items-center gap-2 mb-1.5">
              <Gauge className="w-4 h-4 text-accent" />
              <h4 className="text-[0.6875rem] font-bold text-cyber-heading">Residual Risk</h4>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-3xl font-bold font-mono text-cyber-heading">{review.residual_risk.score}</div>
              <div>
                <div className="text-[0.6875rem] font-mono text-status-success">{review.residual_risk.level}</div>
                <div className="text-[0.625rem] font-mono text-cyber-muted">/100</div>
              </div>
            </div>
            <p className="mt-2 text-[0.6875rem] text-cyber-muted leading-snug">{review.residual_risk.summary}</p>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div
            className={`rounded-md border p-3 h-full flex flex-col justify-center ${
              approved
                ? "border-emerald-500/50 bg-status-success/10"
                : "border-red-500/50 bg-status-danger/10"
            }`}
          >
            <div className="flex items-center gap-2 mb-1.5">
              {approved ? (
                <ThumbsUp className="w-4 h-4 text-status-success" />
              ) : (
                <ThumbsDown className="w-4 h-4 text-status-danger" />
              )}
              <h4 className="text-[0.6875rem] font-bold text-cyber-heading">
                Deployment Recommendation
              </h4>
            </div>
            <div className={`text-base font-bold font-mono ${approved ? "text-status-success" : "text-status-danger"}`}>
              {rec.label}
            </div>
            <p className="mt-1 text-[0.75rem] text-cyber-text leading-snug">{rec.reason}</p>
            <div className="mt-2 flex items-start gap-1.5 text-[0.6875rem] text-status-warning leading-snug">
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
