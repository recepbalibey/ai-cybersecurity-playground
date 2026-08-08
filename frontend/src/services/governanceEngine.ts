// governanceEngine.ts
// AI Risk Assessment & Governance Simulator - client engine.
//
// Architecture (ready for future LLM / local-model integration):
//    Project -> Architecture Analysis -> Threat Identification
//      -> Risk Scoring -> Control Evaluation -> Residual Risk
//      -> Governance Report
//
// Educational simulator. Uses fictional organizations and fictional AI
// systems. Not a compliance checklist; provides no legal advice.
//
// Future integration points: OpenAI, Ollama, and reference mappings for
// NIST AI RMF, ISO/IEC 42001, and the EU AI Act.
// Falls back to the local deterministic engine when the backend is offline.

import { GOVERNANCE_PROJECT_BY_ID, type GovernanceCriticality } from "../data/governance";
import { GOVERNANCE_CONTROLS, THREAT_CATEGORY_BY_ID } from "../knowledge/governance/knowledgeBase";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// ------------------------------------------------------------ types

export type RiskLevel = "Critical" | "High" | "Medium" | "Low" | "Informational";
export type RecommendationLabel =
  | "Ready for Deployment"
  | "Deploy with Controls"
  | "Further Testing Required"
  | "Deployment Not Recommended";

export interface AssessedThreat {
  id: string;
  category: string;
  category_name: string;
  name: string;
  description: string;
  business_consequences: string;
  likelihood: number;
  impact: number;
  base_weight: number;
  base_level: RiskLevel;
  residual_likelihood: number;
  residual_impact: number;
  residual_weight: number;
  residual_level: RiskLevel;
  controls_applied: string[];
}

export interface ControlResult {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  baseline: boolean;
  mitigates: string[];
  trade_offs: string;
}

export interface GovernanceRecommendation {
  label: RecommendationLabel;
  reason: string;
}

export interface GovernanceReview {
  executive_summary: string;
  business_risk: { summary: string; points: string[] };
  security_risk: { summary: string; points: string[] };
  privacy_risk: { summary: string; points: string[] };
  operational_risk: { summary: string; points: string[] };
  residual_risk: { score: number; level: RiskLevel; summary: string };
  deployment_recommendation: GovernanceRecommendation;
}

export interface GovernanceReport {
  project_overview: {
    title: string;
    business_goal: string;
    users: string;
    data_types: string[];
    model_type: string;
    criticality: string;
  };
  architecture_summary: string[];
  threat_assessment: { name: string; category: string; before: string; after: string; controls: string[] }[];
  selected_controls: { id: string; name: string }[];
  residual_risks: { name: string; level: RiskLevel; weight: number; consequences: string }[];
  recommended_improvements: { id: string; name: string; reason: string }[];
  security_checklist: string[];
  executive_summary: string;
  export: string;
}

export interface GovernanceTimelineStage {
  step: number;
  name: string;
  detail: string;
}

export interface GovernanceResult {
  project_id: string;
  project: {
    id: string;
    title: string;
    description: string;
    business_goal: string;
    users: string;
    data_types: string[];
    model_type: string;
    criticality: string;
    governance_stance: string;
  };
  architecture: { id: string; name: string; role: string; purpose: string; security_considerations: string[]; attack_surface: string }[];
  threats: AssessedThreat[];
  controls: ControlResult[];
  base_score: number;
  base_level: RiskLevel;
  residual_score: number;
  residual_level: RiskLevel;
  recommendation: GovernanceRecommendation;
  governance_review: GovernanceReview;
  report: GovernanceReport;
  timeline: GovernanceTimelineStage[];
  summary: string[];
  instructor_context: {
    teaching_points: { title: string; concept: string; explanation: string; key_takeaway: string }[];
    discussion_questions: string[];
  };
}

// ------------------------------------------------------------ scoring

const CRITICALITY_INDEX: Record<string, number> = { Critical: 0, High: 1, Medium: 2, Low: 3 };
const LEVEL_INDEX: Record<string, number> = { Critical: 0, High: 1, Medium: 2, Low: 3, Informational: 4 };

function weight(likelihood: number, impact: number): number {
  const v = 10 + ((likelihood * impact - 1) * 90) / 24 + 0.5;
  return Math.max(0, Math.min(100, Math.floor(v)));
}

function level(weight: number): RiskLevel {
  if (weight >= 85) return "Critical";
  if (weight >= 65) return "High";
  if (weight >= 45) return "Medium";
  if (weight >= 25) return "Low";
  return "Informational";
}

export function assessThreats(projectId: string, enabledControls: string[]): AssessedThreat[] {
  const project = GOVERNANCE_PROJECT_BY_ID[projectId];
  if (!project) return [];
  const enabled = new Set(enabledControls);
  return project.threats.map((t) => {
    const lr = GOVERNANCE_CONTROLS.filter((c) => enabled.has(c.id) && c.mitigates.includes(t.category)).reduce(
      (s, c) => s + c.likelihood_reduction,
      0
    );
    const ir = GOVERNANCE_CONTROLS.filter((c) => enabled.has(c.id) && c.mitigates.includes(t.category)).reduce(
      (s, c) => s + c.impact_reduction,
      0
    );
    const resL = Math.max(1, t.likelihood - lr);
    const resI = Math.max(1, t.impact - ir);
    return {
      id: t.id,
      category: t.category,
      category_name: THREAT_CATEGORY_BY_ID[t.category]?.name ?? t.category,
      name: t.name,
      description: t.description,
      business_consequences: t.business_consequences,
      likelihood: t.likelihood,
      impact: t.impact,
      base_weight: weight(t.likelihood, t.impact),
      base_level: level(weight(t.likelihood, t.impact)),
      residual_likelihood: resL,
      residual_impact: resI,
      residual_weight: weight(resL, resI),
      residual_level: level(weight(resL, resI)),
      controls_applied: GOVERNANCE_CONTROLS.filter((c) => enabled.has(c.id) && c.mitigates.includes(t.category)).map((c) => c.id),
    };
  });
}

export function aggregateScore(threats: AssessedThreat[], key: "base_weight" | "residual_weight"): number {
  if (threats.length === 0) return 0;
  const weights = threats.map((t) => t[key]);
  const avg = weights.reduce((s, w) => s + w, 0) / weights.length;
  const worst = Math.max(...weights);
  return Math.max(0, Math.min(100, Math.round(0.55 * avg + 0.45 * worst)));
}

export function recommendationFor(
  residualScore: number,
  threats: AssessedThreat[],
  criticality: GovernanceCriticality
): GovernanceRecommendation {
  const worst = threats.length
    ? threats.reduce((a, b) => (LEVEL_INDEX[a.residual_level] <= LEVEL_INDEX[b.residual_level] ? a : b)).residual_level
    : "Low";

  let label: RecommendationLabel = "Ready for Deployment";
  let reason = "Residual risk is low and within the organization's accepted level.";
  if (residualScore >= 80) {
    label = "Deployment Not Recommended";
    reason = "Residual risk is critical and the organization should not accept it.";
  } else if (residualScore >= 60) {
    label = "Further Testing Required";
    reason = "Residual risk is high; more testing and controls are needed before deployment.";
  } else if (residualScore >= 35) {
    label = "Deploy with Controls";
    reason = "Residual risk is moderate and acceptable only with the selected controls enforced.";
  } else if (criticality === "Critical" || criticality === "High") {
    label = "Deploy with Controls";
    reason = "The system is high criticality; deploy only with the selected controls enforced.";
  }

  if (worst === "Critical" && label !== "Deployment Not Recommended" && label !== "Further Testing Required") {
    label = "Further Testing Required";
    reason = "At least one residual threat remains critical; resolve it before deployment.";
  } else if (worst === "High" && criticality === "Critical" && label !== "Deployment Not Recommended" && label !== "Further Testing Required") {
    label = "Further Testing Required";
    reason = "A high residual threat on a critical system requires further testing.";
  }
  return { label, reason };
}

export function assessGovernance(projectId: string, extraControls: string[] = []): GovernanceResult {
  const project = GOVERNANCE_PROJECT_BY_ID[projectId];
  const baseline = new Set(project?.baseline_controls ?? []);
  const requested = new Set(extraControls);
  const enabled = new Set(Array.from(baseline).concat(Array.from(requested)));

  const threats = assessThreats(projectId, Array.from(enabled));
  const baseScore = aggregateScore(threats, "base_weight");
  const residualScore = aggregateScore(threats, "residual_weight");
  const criticality = project?.criticality ?? "Medium";
  const rec = recommendationFor(residualScore, threats, criticality);

  const controls: ControlResult[] = GOVERNANCE_CONTROLS.map((c) => ({
    id: c.id,
    name: c.name,
    description: c.description,
    enabled: enabled.has(c.id),
    baseline: baseline.has(c.id),
    mitigates: c.mitigates.map((m) => THREAT_CATEGORY_BY_ID[m]?.name ?? m),
    trade_offs: c.trade_offs,
  }));

  const review = buildGovernanceReview(project, threats, baseScore, residualScore, enabled.size, rec);

  return {
    project_id: projectId,
    project: {
      id: project.id,
      title: project.title,
      description: project.description,
      business_goal: project.business_goal,
      users: project.users,
      data_types: project.data_types,
      model_type: project.model_type,
      criticality: criticality,
      governance_stance: project.governance_stance,
    },
    architecture: project.architecture,
    threats,
    controls,
    base_score: baseScore,
    base_level: level(baseScore),
    residual_score: residualScore,
    residual_level: level(residualScore),
    recommendation: rec,
    governance_review: review,
    report: buildReport(project, project.architecture, threats, enabled, residualScore, rec),
    timeline: [
      { step: 1, name: "Project loaded", detail: "Business goal, users, data, and model type accepted." },
      { step: 2, name: "Architecture analysis", detail: `${project.architecture.length} component(s) mapped with trust boundaries.` },
      { step: 3, name: "Threat identification", detail: `${threats.length} risk(s) mapped to threat categories.` },
      { step: 4, name: "Risk scoring", detail: `Base risk scored at ${baseScore}/100.` },
      { step: 5, name: "Control evaluation", detail: `${enabled.size} control(s) applied; residual risk is ${residualScore}/100.` },
      { step: 6, name: "Governance review", detail: `Recommendation: ${rec.label}.` },
    ],
    summary: [
      `Base risk is ${baseScore}/100 (${level(baseScore)}).`,
      `With ${enabled.size} control(s) applied, residual risk is ${residualScore}/100 (${level(residualScore)}).`,
      `Deployment recommendation: ${rec.label}.`,
    ],
    instructor_context: {
      teaching_points: [
        {
          title: "Security is one part of governance",
          concept: "Holistic review",
          explanation: "Governance balances business goals, security, privacy, and operations. A secure system can still fail governance if it is unfair or hard to operate.",
          key_takeaway: "The best decision is the one the organization can stand behind, not just the most secure one.",
        },
        {
          title: "Risk cannot be eliminated",
          concept: "Residual risk",
          explanation: "Controls reduce risk to a level the organization accepts. Some risk always remains and must be accepted, transferred, or mitigated further.",
          key_takeaway: "Governance is about managing and accepting risk, not removing it entirely.",
        },
        {
          title: "Governance shapes architecture",
          concept: "Decisions and design",
          explanation: "A requirement for human approval or scoped retrieval changes how the system is built, not only how it is reviewed.",
          key_takeaway: "Governance decisions made early are cheaper and more effective than retrofits.",
        },
      ],
      discussion_questions: [
        "Would you approve deployment of this system as configured?",
        "Which of the identified risks is acceptable for this organization, and why?",
        "Which controls provide the highest value for the effort they cost?",
        "What risks remain after mitigation, and who accepts them?",
      ],
    },
  };
}

function buildGovernanceReview(
  project: { title: string; data_types: string[] } | undefined,
  threats: AssessedThreat[],
  baseScore: number,
  residualScore: number,
  controlCount: number,
  rec: GovernanceRecommendation
): GovernanceReview {
  const worst = threats.length
    ? threats.reduce((a, b) => (LEVEL_INDEX[a.residual_level] <= LEVEL_INDEX[b.residual_level] ? a : b)).residual_level
    : "Low";
  const criticalCount = threats.filter((t) => t.residual_level === "Critical").length;
  const highCount = threats.filter((t) => t.residual_level === "High").length;
  const title = project?.title ?? "This AI system";
  const dataTypes = project?.data_types.slice(0, 3).join(", ") ?? "sensitive data";

  return {
    executive_summary: `${title} shows a base risk of ${baseScore}/100 which falls to ${residualScore}/100 with the selected controls. The assessment recommends: ${rec.label}.`,
    business_risk: {
      summary: `Deploying ${title} targets a specific business goal. The dominant business risk is ${worst.toLowerCase()} residual exposure across ${criticalCount} critical and ${highCount} high threat(s).`,
      points: threats.slice(0, 4).map((t) => t.business_consequences),
    },
    security_risk: {
      summary: `Security risk is driven by model-specific threats such as injection, jailbreak, and data leakage. With ${controlCount} control(s) active, residual security risk is ${residualScore}/100.`,
      points: threats.filter((t) => t.residual_level === "Critical" || t.residual_level === "High").map((t) => t.name),
    },
    privacy_risk: {
      summary: `The system handles ${dataTypes}. Privacy risk depends on whether sensitive data is filtered, scoped, and logged before it reaches the model.`,
      points: threats.filter((t) => t.category === "data_privacy" || t.category === "data_leakage").map((t) => t.name),
    },
    operational_risk: {
      summary: "Operational risk covers availability, monitoring, and the ability to respond to incidents. Operators depend on the system, so downtime and drift are operational risks, not only security ones.",
      points: threats.filter((t) => ["denial_of_service", "supply_chain", "third_party_dependency"].includes(t.category)).map((t) => t.name),
    },
    residual_risk: {
      score: residualScore,
      level: level(residualScore),
      summary: `Residual risk is ${residualScore}/100 (${level(residualScore)}). ${criticalCount} threat(s) remain critical and ${highCount} remain high.`,
    },
    deployment_recommendation: { label: rec.label, reason: rec.reason },
  };
}

function buildReport(
  project: { title: string; business_goal: string; users: string; data_types: string[]; model_type: string; criticality: string },
  architecture: { id: string; name: string; role: string }[],
  threats: AssessedThreat[],
  enabled: Set<string>,
  residualScore: number,
  rec: GovernanceRecommendation
): GovernanceReport {
  const highThreats = threats.filter((t) => t.residual_level === "Critical" || t.residual_level === "High");
  const missing = GOVERNANCE_CONTROLS.filter(
    (c) =>
      !enabled.has(c.id) &&
      highThreats.some((t) => c.mitigates.includes(t.category))
  );

  return {
    project_overview: {
      title: project.title,
      business_goal: project.business_goal,
      users: project.users,
      data_types: project.data_types,
      model_type: project.model_type,
      criticality: project.criticality,
    },
    architecture_summary: architecture.map((c) => `${c.name} - ${c.role}`),
    threat_assessment: threats.map((t) => ({
      name: t.name,
      category: t.category_name,
      before: `${t.base_level} (${t.base_weight}/100)`,
      after: `${t.residual_level} (${t.residual_weight}/100)`,
      controls: t.controls_applied,
    })),
    selected_controls: GOVERNANCE_CONTROLS.filter((c) => enabled.has(c.id)).map((c) => ({ id: c.id, name: c.name })),
    residual_risks: threats
      .filter((t) => ["Critical", "High", "Medium"].includes(t.residual_level))
      .map((t) => ({ name: t.name, level: t.residual_level, weight: t.residual_weight, consequences: t.business_consequences })),
    recommended_improvements: missing.slice(0, 5).map((c) => ({
      id: c.id,
      name: c.name,
      reason: `Reduces residual ${highThreats[0]?.name ?? "risk"}.`,
    })),
    security_checklist: [
      "Input validation and prompt filtering are enabled at the gateway.",
      "Sensitive data is classified, scoped, and logged with controls.",
      "Human approval is required before high-impact actions.",
      "Model outputs are validated and monitored for drift and fairness.",
      "Access follows least privilege and roles are audited.",
    ],
    executive_summary: `${project.title} reaches a residual risk of ${residualScore}/100 after controls. The governance recommendation is: ${rec.label}. ${rec.reason}`,
    export: "PDF export is a future extension placeholder.",
  };
}

// ------------------------------------------------------------ comparison

export interface GovernanceComparison {
  project_id: string;
  project_title: string;
  poor: { label: string; score: number; level: RiskLevel; recommendation: string; controls: number };
  well: { label: string; score: number; level: RiskLevel; recommendation: string; controls: number };
  difference: number;
  notes: string;
}

export function compareGovernance(projectId: string): GovernanceComparison {
  const poor = assessGovernance(projectId, []);
  const allIds = GOVERNANCE_CONTROLS.map((c) => c.id);
  const well = assessGovernance(projectId, allIds);
  return {
    project_id: projectId,
    project_title: poor.project.title,
    poor: { label: "Poorly Governed", score: poor.residual_score, level: poor.residual_level, recommendation: poor.recommendation.label, controls: 0 },
    well: { label: "Well Governed", score: well.residual_score, level: well.residual_level, recommendation: well.recommendation.label, controls: allIds.length },
    difference: poor.residual_score - well.residual_score,
    notes: `A poorly governed deployment of ${poor.project.title} scores ${poor.residual_score}/100 with no controls, while a well governed one scores ${well.residual_score}/100 with all controls enforced. Governance choices change the outcome more than the model does.`,
  };
}

// ------------------------------------------------------------ assistant

export function askGovernance(question: string): string {
  const q = question.toLowerCase();
  if (/risk|assess|accept|appetite/.test(q)) {
    return "Risk is likelihood times impact. Organizations set an appetite, then use controls to bring risk to an acceptable residual level. Risk is managed, never fully removed.";
  }
  if (/control|mitigat|defense/.test(q)) {
    return "Controls reduce the likelihood or impact of specific threats. Choose controls that match the threats you found, and stack them in layers. Each control also has a trade-off.";
  }
  if (/govern|review|deploy/.test(q)) {
    return "Governance decides whether a system may deploy. It balances business, security, privacy, and operational risk, and it shapes the architecture before launch.";
  }
  if (/injection|jailbreak|poison|hallucin/.test(q)) {
    return "Model-specific threats: prompt injection redirects behavior, jailbreaks bypass rules, poisoning corrupts training data, and hallucination produces confident falsehoods. Each needs its own control.";
  }
  if (/stride|mitre|owasp/.test(q)) {
    return "STRIDE names six threat classes, MITRE ATT&CK names attacker behaviors, and OWASP Top 10 for LLMs lists common LLM weaknesses. Use them as checklists during threat modeling.";
  }
  if (/nist|iso|eu|42001|ai act/.test(q)) {
    return "NIST AI RMF (govern, map, measure, manage), ISO/IEC 42001, and the EU AI Act organize AI governance. This lab teaches the concepts educationally and does not certify compliance.";
  }
  if (/bias|fair/.test(q)) {
    return "Bias comes from data and design. Controls like continuous evaluation, human approval, and monitoring detect unfair patterns before they become decisions.";
  }
  return "This simulator teaches AI risk assessment and governance. Ask about risk scoring, controls, threat modeling frameworks, governance reviews, or model-specific threats.";
}

/**
 * Backend-first assistant. Prefers POST /api/governance/assistant, falling
 * back to the local rule engine when the API is unreachable or rejects.
 */
export async function askGovernanceSmart(question: string): Promise<string> {
  try {
    const res = await fetch(`${API_BASE_URL}/governance/assistant`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });
    if (res.ok) {
      const data = (await res.json()) as { answer?: string };
      if (data.answer) return data.answer;
    }
  } catch (err) {
    console.warn("Backend API offline, using local governance assistant");
  }
  return askGovernance(question);
}

// ------------------------------------------------------------ backend

async function tryApi<T>(path: string, init?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, init);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function fetchGovernanceProjects(): Promise<unknown[]> {
  const data = await tryApi<{ projects: unknown[] }>("/governance/projects");
  if (data?.projects) return data.projects;
  return GOVERNANCE_PROJECT_BY_ID ? Object.values(GOVERNANCE_PROJECT_BY_ID).map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    model_type: p.model_type,
    criticality: p.criticality,
    governance_stance: p.governance_stance,
  })) : [];
}

export async function runRemoteAssessment(
  projectId: string,
  controls: string[]
): Promise<GovernanceResult | null> {
  return tryApi<GovernanceResult>("/governance/assess", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ project_id: projectId, controls }),
  });
}

export async function runRemoteCompare(projectId: string): Promise<GovernanceComparison | null> {
  return tryApi<GovernanceComparison>("/governance/compare", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ project_id: projectId }),
  });
}

/**
 * Backend-first assessment. Prefers POST /api/governance/assess, falling
 * back to the local deterministic engine when the API is unreachable so the
 * lab keeps working offline.
 */
export async function assessGovernanceSmart(
  projectId: string,
  controls: string[] = []
): Promise<GovernanceResult> {
  const remote = await runRemoteAssessment(projectId, controls);
  if (remote) return remote;
  return assessGovernance(projectId, controls);
}

/**
 * Backend-first comparison. Prefers POST /api/governance/compare, falling
 * back to the local engine when the API is unreachable.
 */
export async function compareGovernanceSmart(projectId: string): Promise<GovernanceComparison> {
  const remote = await runRemoteCompare(projectId);
  if (remote) return remote;
  return compareGovernance(projectId);
}
