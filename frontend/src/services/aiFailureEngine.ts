// aiFailureEngine.ts
// AI Failure Lab - client reliability and validation engine.
//
// Architecture (ready for future LLM / local-model integration):
//    Scenario -> Evidence presented to the model -> AI decision + confidence
//      -> Student verdict on the AI decision -> Ground truth reveal
//      -> Failure explanation -> Mitigation selection -> Reliability retest
//
// Educational simulator. Uses fictional security events and fictional AI
// outputs. Every scenario demonstrates a real reliability failure so learners
// learn that AI output is not automatically correct.
//
// Falls back to the local deterministic engine when the backend is offline.
// The local engine mirrors the backend scoring exactly.

import { AI_FAILURE_SCENARIOS, AI_FAILURE_SCENARIO_BY_ID } from "../data/aiFailures";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// ------------------------------------------------------------ types

export type StudentDecision = "correct" | "incorrect" | "uncertain";
export type VerdictClass =
  | "true_positive"
  | "true_negative"
  | "false_positive"
  | "false_negative"
  | "uncertain";

export interface MitigationResult {
  id: string;
  name: string;
  description: string;
  gain: number;
  prevents: string[];
}

export interface ReliabilityResult {
  before: number;
  after: number;
  caught: boolean;
  gain: number;
  selected: string[];
}

export interface AiFailureEvaluation {
  scenario_id: string;
  title: string;
  category: string;
  difficulty: string;
  input_data: string;
  ai_output: string;
  ai_confidence: number;
  ai_label: string;
  ai_correct: boolean;
  ground_truth: string;
  ground_truth_label: string;
  failure_type: string;
  failure_name: string;
  explanation: string;
  security_impact: string;
  recommended_validation: string;
  learning_objective: string;
  student_decision: StudentDecision;
  student_confidence: number;
  student_verdict_class: VerdictClass;
  student_verdict_correct: boolean;
  reliability: ReliabilityResult;
  mitigations: MitigationResult[];
  calibration_bucket: "high" | "medium" | "low";
  summary: string[];
  instructor_context: {
    teaching_points: string[];
    discussion_questions: string[];
  };
}

export interface AiFailureChallenge {
  scenario_id: string;
  title: string;
  student_predict: string;
  ai_label: string;
  ai_confidence: number;
  ground_truth_label: string;
  human_correct: boolean;
  ai_correct: boolean;
  both_correct: boolean;
  neither_correct: boolean;
  summary: string;
  calibration_insight: string;
}

export interface CapstoneEventResult {
  id: string;
  title: string;
  evidence: string;
  detail: string;
  student_verdict: string;
  ai_verdict: string;
  ground_truth: string;
  human_correct: boolean;
  ai_correct: boolean;
  combined_correct: boolean;
}

export interface AiFailureCapstone {
  scenario_id: string;
  title: string;
  events: CapstoneEventResult[];
  ai_accuracy: number;
  human_accuracy: number;
  combined_accuracy: number;
  ai_total: number;
  human_total: number;
  combined_total: number;
  total_events: number;
  insight: string;
  summary: string[];
}

export interface AiFailureScorecard {
  total: number;
  correct: number;
  incorrect: number;
  uncertain: number;
  false_positives: number;
  false_negatives: number;
  decided: number;
  accuracy: number;
  insight: string;
}

export interface AiFailureCalibration {
  high: { count: number; correct_rate: number | null };
  medium: { count: number; correct_rate: number | null };
  low: { count: number; correct_rate: number | null };
  insight: string;
}

export interface ScorecardEntry {
  student_verdict_class: VerdictClass;
  student_confidence: number;
}

export const FAILURE_TYPES: { id: string; name: string; definition: string }[] = [
  { id: "false_positive", name: "False Positive", definition: "The AI reports an attack where none exists." },
  { id: "false_negative", name: "False Negative", definition: "The AI reports no attack where one is present." },
  { id: "hallucination", name: "Hallucination", definition: "The AI fabricates indicators or facts that do not exist." },
  { id: "overconfidence", name: "Overconfidence", definition: "The AI states near-certainty the evidence cannot support." },
  { id: "incomplete_context", name: "Incomplete Context", definition: "The AI reasons without data it could not see and invents the gap." },
  { id: "ambiguous_input", name: "Ambiguous Input", definition: "The AI forces a binary verdict on data that is genuinely ambiguous." },
  { id: "poor_data_quality", name: "Poor Data Quality", definition: "Duplicated or corrupted events look like a real attack." },
  { id: "distribution_shift", name: "Distribution Shift", definition: "The model flags everything because the environment changed after training." },
  { id: "class_imbalance", name: "Class Imbalance", definition: "The model learns the majority 'benign' class and misses rare attacks." },
  { id: "automation_bias", name: "Automation Bias", definition: "A human accepts the machine's verdict without checking the evidence." },
  { id: "contradictory_evidence", name: "Contradictory Evidence", definition: "The AI lets louder but blind signals outvote a correct detector." },
  { id: "unsafe_recommendation", name: "Unsafe Recommendation", definition: "The AI suggests a response more damaging than the risk it targets." },
];

const FAILURE_BY_ID: Record<string, (typeof FAILURE_TYPES)[number]> = Object.fromEntries(
  FAILURE_TYPES.map((f) => [f.id, f])
);

const LABELS = ["benign", "attack", "insufficient_evidence", "ambiguous", "unsafe_recommendation"];

// ------------------------------------------------------------ scoring

export function aiFailureReliabilityBefore(scenarioId: string): number {
  const s = AI_FAILURE_SCENARIO_BY_ID[scenarioId];
  if (!s) return 0;
  const aiCorrect = s.ai_label === s.ground_truth_label;
  if (aiCorrect) return s.ai_confidence;
  return 100 - s.ai_confidence;
}

export function aiFailureReliabilityAfter(
  scenarioId: string,
  selected: string[]
): ReliabilityResult {
  const s = AI_FAILURE_SCENARIO_BY_ID[scenarioId];
  if (!s) {
    return { before: 0, after: 0, caught: false, gain: 0, selected: [] };
  }
  const chosen = s.possible_mitigations.filter((m) => selected.includes(m.id));
  const gain = chosen.reduce((sum, m) => sum + m.gain, 0);
  const caught = chosen.some((m) => m.prevents.includes(s.failure_type));
  const before = aiFailureReliabilityBefore(scenarioId);
  const after = Math.min(100, before + gain + (caught ? 20 : 0));
  return {
    before,
    after,
    caught,
    gain,
    selected: chosen.map((m) => m.id),
  };
}

export function verdictClass(decision: StudentDecision, aiCorrect: boolean): VerdictClass {
  if (decision === "uncertain") return "uncertain";
  if (decision === "correct") return aiCorrect ? "true_positive" : "false_positive";
  return aiCorrect ? "false_negative" : "true_negative";
}

export function verdictCorrect(decision: StudentDecision, aiCorrect: boolean): boolean {
  const cls = verdictClass(decision, aiCorrect);
  return cls === "true_positive" || cls === "true_negative";
}

export function calibrationBucket(confidence: number): "high" | "medium" | "low" {
  if (confidence >= 70) return "high";
  if (confidence >= 30) return "medium";
  return "low";
}

// ------------------------------------------------------------ engine

export function evaluateAiFailure(
  scenarioId: string,
  decision: StudentDecision = "uncertain",
  mitigations: string[] = [],
  studentConfidence = 50
): AiFailureEvaluation {
  const s = AI_FAILURE_SCENARIO_BY_ID[scenarioId];
  if (!s) {
    throw new Error(`Scenario ${scenarioId} not found`);
  }
  const aiCorrect = s.ai_label === s.ground_truth_label;
  const vc = verdictClass(decision, aiCorrect);
  const correct = verdictCorrect(decision, aiCorrect);
  const reliability = aiFailureReliabilityAfter(scenarioId, mitigations);

  return {
    scenario_id: s.id,
    title: s.title,
    category: s.category,
    difficulty: s.difficulty,
    input_data: s.input_data,
    ai_output: s.ai_output,
    ai_confidence: s.ai_confidence,
    ai_label: s.ai_label,
    ai_correct: aiCorrect,
    ground_truth: s.ground_truth,
    ground_truth_label: s.ground_truth_label,
    failure_type: s.failure_type,
    failure_name: FAILURE_BY_ID[s.failure_type]?.name ?? s.failure_type,
    explanation: s.explanation,
    security_impact: s.security_impact,
    recommended_validation: s.recommended_validation,
    learning_objective: s.learning_objective,
    student_decision: decision,
    student_confidence: studentConfidence,
    student_verdict_class: vc,
    student_verdict_correct: correct,
    reliability,
    mitigations: s.possible_mitigations.map((m) => ({ ...m })),
    calibration_bucket: calibrationBucket(studentConfidence),
    summary: [
      `The AI reported '${s.ai_label}' with ${s.ai_confidence}% confidence.`,
      `The ground truth is '${s.ground_truth_label}', so the AI was ${aiCorrect ? "correct" : "incorrect"}.`,
      `Your verdict (${decision}) was ${correct ? "correct" : "not correct"}.`,
      `Reliability before mitigations: ${reliability.before}/100. After: ${reliability.after}/100.`,
    ],
    instructor_context: {
      teaching_points: s.teaching_points ?? [],
      discussion_questions: [
        "What evidence would you need before trusting this AI output?",
        "Which single mitigation would have caught this failure?",
        "How did the AI's confidence compare to how confident you felt?",
      ],
    },
  };
}

export function runAiFailureChallenge(scenarioId: string, studentPredict: string): AiFailureChallenge {
  const s = AI_FAILURE_SCENARIO_BY_ID[scenarioId];
  if (!s) throw new Error(`Scenario ${scenarioId} not found`);
  if (!LABELS.includes(studentPredict)) {
    throw new Error(`prediction must be one of ${LABELS.join(", ")}`);
  }
  const aiCorrect = s.ai_label === s.ground_truth_label;
  const humanCorrect = studentPredict === s.ground_truth_label;
  return {
    scenario_id: s.id,
    title: s.title,
    student_predict: studentPredict,
    ai_label: s.ai_label,
    ai_confidence: s.ai_confidence,
    ground_truth_label: s.ground_truth_label,
    human_correct: humanCorrect,
    ai_correct: aiCorrect,
    both_correct: humanCorrect && aiCorrect,
    neither_correct: !humanCorrect && !aiCorrect,
    summary: `You predicted '${studentPredict}' and the AI predicted '${s.ai_label}'. The ground truth is '${s.ground_truth_label}'. You were ${humanCorrect ? "correct" : "incorrect"} and the AI was ${aiCorrect ? "correct" : "incorrect"}.`,
    calibration_insight:
      "When you and the AI disagree, the ground truth decides. Trust calibration means knowing when your judgment adds value over the model.",
  };
}

export function runAiFailureCapstone(
  scenarioId: string,
  studentPicks: Record<string, string>
): AiFailureCapstone {
  const s = AI_FAILURE_SCENARIO_BY_ID[scenarioId];
  if (!s) throw new Error(`Scenario ${scenarioId} not found`);
  const events = s.capstone_events ?? [];
  if (events.length === 0) throw new Error("Scenario is not a capstone");

  const rows = events.map((ev) => {
    const pick = studentPicks[ev.id];
    const humanCorrect = pick === ev.ground_truth;
    const aiCorrect = ev.ai_verdict === ev.ground_truth;
    return {
      id: ev.id,
      title: ev.title,
      evidence: ev.evidence,
      detail: ev.detail,
      student_verdict: pick,
      ai_verdict: ev.ai_verdict,
      ground_truth: ev.ground_truth,
      human_correct: humanCorrect,
      ai_correct: aiCorrect,
      combined_correct: humanCorrect || aiCorrect,
    };
  });

  const n = events.length;
  const aiTotal = rows.filter((r) => r.ai_correct).length;
  const humanTotal = rows.filter((r) => r.human_correct).length;
  const combinedTotal = rows.filter((r) => r.combined_correct).length;
  const aiAccuracy = Math.round((aiTotal / n) * 100);
  const humanAccuracy = Math.round((humanTotal / n) * 100);
  const combinedAccuracy = Math.round((combinedTotal / n) * 100);

  return {
    scenario_id: s.id,
    title: s.title,
    events: rows,
    ai_accuracy: aiAccuracy,
    human_accuracy: humanAccuracy,
    combined_accuracy: combinedAccuracy,
    ai_total: aiTotal,
    human_total: humanTotal,
    combined_total: combinedTotal,
    total_events: n,
    insight: `The AI alone was right on ${aiTotal} of ${n} events (${aiAccuracy}%). You were right on ${humanTotal} (${humanAccuracy}%). Combined, ${combinedTotal} of ${n} events were caught (${combinedAccuracy}%). The combined score is higher than either alone because each catches what the other missed.`,
    summary: [
      `AI alone: ${aiTotal}/${n} (${aiAccuracy}%).`,
      `Human alone: ${humanTotal}/${n} (${humanAccuracy}%).`,
      `Combined: ${combinedTotal}/${n} (${combinedAccuracy}%).`,
    ],
  };
}

export function aiFailureScorecard(entries: ScorecardEntry[]): AiFailureScorecard {
  const total = entries.length;
  let correct = 0;
  let fp = 0;
  let fn = 0;
  let uncertain = 0;
  for (const e of entries) {
    if (e.student_verdict_class === "uncertain") uncertain += 1;
    else if (e.student_verdict_class === "true_positive" || e.student_verdict_class === "true_negative") correct += 1;
    else if (e.student_verdict_class === "false_positive") fp += 1;
    else if (e.student_verdict_class === "false_negative") fn += 1;
  }
  const decided = total - uncertain;
  const accuracy = decided ? Math.round((correct / decided) * 100) : 0;
  return {
    total,
    correct,
    incorrect: fp + fn,
    uncertain,
    false_positives: fp,
    false_negatives: fn,
    decided,
    accuracy,
    insight: `Over ${total} verdict(s), you were correct on ${correct}, you trusted a wrong AI ${fp} time(s), distrusted a correct AI ${fn} time(s), and stayed uncertain ${uncertain} time(s). Accuracy on decided cases: ${accuracy}%.`,
  };
}

export function aiFailureCalibration(entries: ScorecardEntry[]): AiFailureCalibration {
  const buckets: Record<"high" | "medium" | "low", boolean[]> = { high: [], medium: [], low: [] };
  for (const e of entries) {
    const b = calibrationBucket(e.student_confidence);
    buckets[b].push(e.student_verdict_class === "true_positive" || e.student_verdict_class === "true_negative");
  }
  const out = { high: { count: 0, correct_rate: null as number | null }, medium: { count: 0, correct_rate: null as number | null }, low: { count: 0, correct_rate: null as number | null } };
  for (const b of ["high", "medium", "low"] as const) {
    const flags = buckets[b];
    out[b].count = flags.length;
    out[b].correct_rate = flags.length ? Math.round((flags.filter(Boolean).length / flags.length) * 100) : null;
  }
  return {
    ...out,
    insight:
      "A well calibrated reviewer is right in the same proportion of cases as their stated confidence. If you are often confident but often wrong, your trust in your own judgment is misaligned with reality.",
  };
}

// ------------------------------------------------------------ assistant

export function askAiFailure(question: string): string {
  const q = question.toLowerCase();
  if (/false positive|false alarm/.test(q)) {
    return "A false positive is when the AI reports an attack that does not exist. It is costly when the response is destructive, so verify high-impact actions before executing them.";
  }
  if (/false negative|miss/.test(q)) {
    return "A false negative is when the AI reports no attack while one is present. It is the silent failure because no alert is raised and the intrusion continues. Volume is a weak signal, so weight data sensitivity and behavior quality.";
  }
  if (/hallucin|fabricat/.test(q)) {
    return "A hallucination is confident fabricated content. In security reports it looks like a real indicator, so every claimed domain or IP must be traceable to the source data before it is acted on.";
  }
  if (/calibrat|confidence|overconfid/.test(q)) {
    return "Calibration matches stated confidence to actual correctness. A calibrated model is right 90% of the time when it says 90%. Overconfidence is saying 98% while being right half the time; track the gap.";
  }
  if (/bias|automation/.test(q)) {
    return "Automation bias is accepting the machine's verdict without reading the evidence. The human is part of the failure, so require the analyst to reconcile the AI verdict against raw evidence before closing a case.";
  }
  if (/drift|distribution|shift/.test(q)) {
    return "Distribution shift is when the input data no longer matches what the model was trained on. The model then flags everything as abnormal. Build per-environment baselines and detect drift before it erodes trust.";
  }
  if (/imbalance|rare|majority/.test(q)) {
    return "Class imbalance biases a model toward the majority class. In security the rare class is the attack, so validate on balanced test sets and use recall and precision instead of overall accuracy.";
  }
  if (/precision|recall|f1/.test(q)) {
    return "Precision is the share of alerts that are real, recall is the share of attacks caught, and F1 balances the two. For imbalanced data, accuracy lies and precision-recall is the honest view.";
  }
  if (/threshold/.test(q)) {
    return "A threshold decides the trade-off between false positives and false negatives. Lower thresholds catch more attacks but raise more false alarms. Set the threshold from the cost of a miss versus the cost of a false alarm.";
  }
  if (/human.*loop|loop.*human/.test(q)) {
    return "Human-in-the-loop means a person approves before high-impact actions. Human-on-the-loop means a person supervises and intervenes on exception. Both only work when the human actually challenges the machine.";
  }
  if (/mitigat|control|defense|fix/.test(q)) {
    return "Mitigations raise the reliability of an AI decision. Pick controls that would catch the specific failure: evidence citations stop hallucination, ticket correlation fixes missing context, and calibration tracking exposes overconfidence.";
  }
  if (/confusion|matrix/.test(q)) {
    return "A confusion matrix splits results into true positives, false positives, true negatives, and false negatives. Every other metric derives from it, so read the matrix before trusting a headline accuracy number.";
  }
  if (/recommend|action|response/.test(q)) {
    return "AI recommendations can be unsafe: a response that disables a team or wipes a machine can be worse than the risk it targets. Map every recommended action to the evidence and gate disruptive actions behind a human.";
  }
  return "This lab teaches why AI output is not automatically correct. Ask about false positives, false negatives, hallucinations, confidence calibration, distribution shift, class imbalance, automation bias, or mitigations.";
}

/**
 * Backend-first assistant. Prefers POST /api/ai-failures/assistant, falling
 * back to the local rule engine when the API is unreachable or rejects.
 */
export async function askAiFailureSmart(question: string): Promise<string> {
  try {
    const res = await fetch(`${API_BASE_URL}/ai-failures/assistant`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });
    if (res.ok) {
      const data = (await res.json()) as { answer?: string };
      if (data.answer) return data.answer;
    }
  } catch (err) {
    console.warn("Backend API offline, using local AI-failure assistant");
  }
  return askAiFailure(question);
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

export async function fetchAiFailureScenarios(): Promise<unknown[]> {
  const data = await tryApi<{ scenarios: unknown[] }>("/ai-failures/scenarios");
  if (data?.scenarios) return data.scenarios;
  return AI_FAILURE_SCENARIOS.map((s) => ({
    id: s.id,
    title: s.title,
    category: s.category,
    difficulty: s.difficulty,
    failure_type: s.failure_type,
    failure_name: FAILURE_BY_ID[s.failure_type]?.name ?? s.failure_type,
    is_capstone: Array.isArray(s.capstone_events),
    learning_objective: s.learning_objective,
  }));
}

export async function runRemoteAiFailureEvaluation(
  scenarioId: string,
  decision: string,
  mitigations: string[],
  confidence: number
): Promise<AiFailureEvaluation | null> {
  return tryApi<AiFailureEvaluation>("/ai-failures/evaluate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ scenario_id: scenarioId, decision, mitigations, confidence }),
  });
}

export async function runRemoteAiFailureChallenge(
  scenarioId: string,
  prediction: string
): Promise<AiFailureChallenge | null> {
  return tryApi<AiFailureChallenge>("/ai-failures/challenge", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ scenario_id: scenarioId, prediction }),
  });
}

export async function runRemoteAiFailureCapstone(
  scenarioId: string,
  picks: Record<string, string>
): Promise<AiFailureCapstone | null> {
  return tryApi<AiFailureCapstone>("/ai-failures/capstone", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ scenario_id: scenarioId, picks }),
  });
}

export async function runRemoteAiFailureScorecard(
  entries: ScorecardEntry[]
): Promise<AiFailureScorecard | null> {
  return tryApi<AiFailureScorecard>("/ai-failures/scorecard", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ entries }),
  });
}

/**
 * Backend-first evaluation. Prefers POST /api/ai-failures/evaluate, falling
 * back to the local deterministic engine when the API is unreachable so the
 * lab keeps working offline.
 */
export async function evaluateAiFailureSmart(
  scenarioId: string,
  decision: StudentDecision,
  mitigations: string[] = [],
  studentConfidence = 50
): Promise<AiFailureEvaluation> {
  const remote = await runRemoteAiFailureEvaluation(scenarioId, decision, mitigations, studentConfidence);
  if (remote) return remote;
  return evaluateAiFailure(scenarioId, decision, mitigations, studentConfidence);
}

/**
 * Backend-first capstone. Prefers POST /api/ai-failures/capstone, falling
 * back to the local engine when the API is unreachable.
 */
export async function runAiFailureCapstoneSmart(
  scenarioId: string,
  picks: Record<string, string>
): Promise<AiFailureCapstone> {
  const remote = await runRemoteAiFailureCapstone(scenarioId, picks);
  if (remote) return remote;
  return runAiFailureCapstone(scenarioId, picks);
}

/**
 * Backend-first scorecard. Prefers POST /api/ai-failures/scorecard, falling
 * back to the local engine when the API is unreachable.
 */
export async function aiFailureScorecardSmart(
  entries: ScorecardEntry[]
): Promise<AiFailureScorecard> {
  const remote = await runRemoteAiFailureScorecard(entries);
  if (remote) return remote;
  return aiFailureScorecard(entries);
}

export interface AiFailureHistoryEntry {
  id: number;
  timestamp: string;
  scenario_id: string;
  student_decision: string;
  ai_correct: number;
  student_verdict_correct: number;
  student_confidence: number;
  reliability_before: number;
  reliability_after: number;
  mitigations_count: number;
}

/**
 * Backend-first recent reviews list. Prefers GET /api/ai-failures/history
 * (SQLite-persisted), returning an empty list when the API is unreachable.
 */
export async function fetchReviewHistory(limit = 5): Promise<AiFailureHistoryEntry[]> {
  const data = await tryApi<{ history?: AiFailureHistoryEntry[] }>(
    `/ai-failures/history${limit != null ? `?limit=${limit}` : ""}`
  );
  if (data?.history) return data.history.slice(0, limit);
  return [];
}
