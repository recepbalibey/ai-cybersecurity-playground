// visionSecurity.ts
// Adversarial Face Recognition Lab - computer vision security simulation.
//
// Mirrors the pipeline of an adversarial-ML assessment harness so it can later be
// driven by a real model backend without changing the contract:
//    Image -> Preprocessing -> ML Model -> Prediction -> Robustness Evaluation
//
// Educational sandbox only. Simulated models, synthetic images, fictional subjects
// (Alpha / Beta / Gamma). No real identity data and no connection to any real
// person recognition system.

import { TeachingPoint } from "./aiAnalyst";

export type Difficulty = "beginner" | "intermediate" | "advanced";
export type AttackType = "noise" | "occlusion" | "transformation";
export type AnalysisMode = "clean" | "adversarial";
export type OutcomeType = "clean" | "misclassified" | "blocked" | "defended";

export interface VisionExperiment {
  key: string;
  title: string;
  difficulty: Difficulty;
  application: string;
  description: string;
  attack_type: string;
  robustness: number;
}

export interface Subject {
  id: string;
  name: string;
  class_index: number;
}

export interface Logit {
  subject: string;
  probability: number;
}

export interface Prediction {
  prediction: string;
  prediction_label: string;
  confidence: number;
  logits: Logit[];
}

export interface TimelineStage {
  stage: string;
  status: "complete";
  detail: string;
}

export interface ModelView {
  name: string;
  clean_accuracy: number;
  robustness: number;
  clean_prediction: string;
  clean_confidence: number;
  adversarial_prediction: string;
  adversarial_confidence: number;
}

export interface VisionAnalysisResult {
  experiment_key: string;
  mode: AnalysisMode;
  attack_type: AttackType;
  is_defense_comparison: boolean;
  before: Prediction;
  after: Prediction;
  outcome: OutcomeType;
  confidence: number;
  affected_pixels: number;
  robustness: number;
  explanation: string;
  why_failed: string;
  mitigations: string;
  teaching_points: TeachingPoint[];
  timeline: TimelineStage[];
  confidence_gap: number;
  vulnerable?: ModelView;
  protected?: ModelView;
  subjects?: Subject[];
}

export interface VisionConcept {
  key: string;
  name: string;
  summary: string;
  details: string;
  good_practice: string;
}

export interface AttackMethod {
  key: string;
  name: string;
  severity: string;
  description: string;
  detection_signals: string[];
  mitigations: string;
}

export interface DefenseMechanism {
  key: string;
  name: string;
  description: string;
  effectiveness: string;
  tradeoff: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const SUBJECT_LABELS: Record<string, string> = {
  alpha: "Subject Alpha",
  beta: "Subject Beta",
  gamma: "Subject Gamma",
};

const SUBJECTS: Subject[] = [
  { id: "alpha", name: "Subject Alpha", class_index: 0 },
  { id: "beta", name: "Subject Beta", class_index: 1 },
  { id: "gamma", name: "Subject Gamma", class_index: 2 },
];

// ---------------------------------------------------------------------------
// Local experiment data (parity with datasets/adversarial-ml/*.json)
// ---------------------------------------------------------------------------
interface LocalExperiment {
  experiment_key: string;
  title: string;
  difficulty: Difficulty;
  application: string;
  description: string;
  attack_type: AttackType;
  robustness: number;
  before: { prediction: string; confidence: number };
  after: { prediction: string; confidence: number };
  explanation: string;
  why_failed: string;
  mitigations: string;
  teaching_points: TeachingPoint[];
  vulnerable?: ModelView;
  protected?: ModelView;
}

const LOCAL_EXPERIMENTS: Record<string, LocalExperiment> = {
  "1_noise_attack": {
    experiment_key: "1_noise_attack",
    title: "Perturbation (Noise) Attack",
    difficulty: "beginner",
    application: "Vision Recognition Model",
    description: "Tiny imperceptible noise is added to an image. A human sees no difference, but the model flips its prediction to another subject.",
    attack_type: "noise",
    robustness: 38,
    before: { prediction: "alpha", confidence: 98 },
    after: { prediction: "beta", confidence: 87 },
    explanation: "Humans see almost no difference, but a tiny perturbation pushes the image past the neural network's decision boundary. The model learned statistical patterns, not understanding; it can be flipped with noise the human eye filters out.",
    why_failed: "The decision boundary sits very close to the training samples. A small adversarial noise vector travels just enough distance to cross it and land in Subject Beta's region.",
    mitigations: "Projected Gradient Descent (PGD) adversarial training, input denoising, and perturbation-detection can push the boundary back.",
    teaching_points: [
      { title: "ML models learn patterns, not true understanding", concept: "Statistical, not semantic", explanation: "The network maps pixels to probabilities. It has no 'idea' of who a subject is, so imperceptible pixel edits can change its output dramatically.", key_takeaway: "High accuracy on clean data does not imply robustness." },
      { title: "Adversarial examples exploit decision boundaries", concept: "Decision boundary crossings", explanation: "A tiny perturbation travels just far enough in feature space to cross the boundary into another class's region, flipping the prediction while the image looks unchanged.", key_takeaway: "Small input changes can produce large output changes." },
    ],
  },
  "2_occlusion_attack": {
    experiment_key: "2_occlusion_attack",
    title: "Occlusion Attack",
    difficulty: "intermediate",
    application: "Vision Recognition Model",
    description: "A small opaque block covers the most identity-critical region (the eyes). The model's confidence in the true subject collapses.",
    attack_type: "occlusion",
    robustness: 52,
    before: { prediction: "alpha", confidence: 96 },
    after: { prediction: "gamma", confidence: 73 },
    explanation: "Models concentrate on a small set of highly informative regions. Blocking the eyes removes exactly the features the model relies on most, so confidence collapses and the prediction flips.",
    why_failed: "The model's attention is concentrated on the eye region. Occlusion removes that signal and the remaining features are ambiguous, shifting the prediction to the nearest wrong class.",
    mitigations: "Random-erasing augmentation, attention regularization to spread reliance, and checking for partial-input fragility.",
    teaching_points: [
      { title: "Occlusion removes the model's critical signal", concept: "Feature concentration", explanation: "A model often leans on a small region. Remove that region and confidence collapses, even though a human still recognizes the subject from context.", key_takeaway: "High attention concentration is a security weakness." },
      { title: "Attacks are not only digital", concept: "Physical-adjacent attacks", explanation: "Occlusion models real-world scenarios: a partial face, a mask, a shadow. These are realistic rather than purely theoretical threats.", key_takeaway: "Test models under realistic input distortions too." },
    ],
  },
  "3_input_transformation": {
    experiment_key: "3_input_transformation",
    title: "Input Transformation",
    difficulty: "intermediate",
    application: "Vision Recognition Model",
    description: "A subtle filter or brightness shift that does not change identity for a human, but redistributes the model's confidence.",
    attack_type: "transformation",
    robustness: 58,
    before: { prediction: "alpha", confidence: 95 },
    after: { prediction: "gamma", confidence: 81 },
    explanation: "Photometric and affine changes alter the pixel distribution in ways the model treats as meaningful and identity-altering, even though a human recognizes the subject instantly.",
    why_failed: "The model normalizes on the training-domain appearance. Deviations in brightness/contrast move it away from the learned region for Subject Alpha.",
    mitigations: "Augmentation diversity (photometric + geometric) during training, input normalization pipelines, and distribution-shift detection.",
    teaching_points: [
      { title: "Appearance statistics matter to models", concept: "Domain sensitivity", explanation: "Models implicitly rely on global appearance cues; altering brightness or contrast shifts features into another class's territory.", key_takeaway: "Robustness includes invariance to common transformations." },
      { title: "Preprocessing is part of the attack surface", concept: "Whole pipeline security", explanation: "The pipeline before the model (resizing, lighting) shapes predictions. Attackers can manipulate any step.", key_takeaway: "Security testing must cover the full inference pipeline." },
    ],
  },
  "4_defense_comparison": {
    experiment_key: "4_defense_comparison",
    title: "Defense Comparison",
    difficulty: "advanced",
    application: "Vision Recognition Model (Defense Evaluation)",
    description: "Run the same adversarial image against an unprotected model and a defended (adversarially trained) model to compare robustness and accuracy trade-offs.",
    attack_type: "noise",
    robustness: 78,
    before: { prediction: "alpha", confidence: 96 },
    after: { prediction: "beta", confidence: 22 },
    explanation: "The same input makes the base model misclassify, while the adversarially trained model stays correct. But the robust model's clean accuracy is slightly lower - a classic robustness vs accuracy trade-off.",
    why_failed: "The base model's decision boundary is close to the data. Adversarial training pushes the boundary into a smoother, more robust region at the cost of a little clean-data accuracy.",
    mitigations: "Adversarial training (PGD), defensive distillation, certified defenses, and continuous red-teaming to validate robustness without hurting accuracy.",
    teaching_points: [
      { title: "Security improvements may require trade-offs", concept: "Robustness vs accuracy", explanation: "Hardening the model reduces adversarial success, typically with a small clean-accuracy cost. Teams must decide the acceptable balance.", key_takeaway: "Robustness is a designed property with measurable costs." },
      { title: "The same input can behave differently per model", concept: "Model-independence of attacks", explanation: "An adversarial input crafted to fool one model may not fool a differently-trained one; robustness depends on training, not on the image alone.", key_takeaway: "Evaluate security across the actual model you will deploy." },
    ],
    vulnerable: { name: "Base VisionNet", clean_accuracy: 95, robustness: 34, clean_prediction: "alpha", clean_confidence: 96, adversarial_prediction: "beta", adversarial_confidence: 22 },
    protected: { name: "Robust VisionNet", clean_accuracy: 91, robustness: 78, clean_prediction: "alpha", clean_confidence: 94, adversarial_prediction: "alpha", adversarial_confidence: 85 },
  },
};

const CONCEPTS: VisionConcept[] = [
  { key: "adversarial_examples", name: "Adversarial Examples", summary: "Inputs designed to be misclassified by a model while looking unchanged to humans.", details: "Small, carefully chosen perturbations push the input across a model decision boundary. Because models learn statistical features rather than semantics, they can be flipped with imperceptible changes.", good_practice: "Always test a model with adversarial and clean inputs; never judge security by clean accuracy alone." },
  { key: "decision_boundaries", name: "Decision Boundaries", summary: "The regions in feature space that separate model predictions.", details: "The boundary can sit extremely close to training samples. A tiny perturbation that crosses it changes the prediction even though the visual content is unchanged.", good_practice: "Robust models keep smooth, well-separated boundaries, which is exactly what adversarial training encourages." },
  { key: "model_robustness", name: "Model Robustness", summary: "The ability of a model to keep correct predictions under perturbation, occlusion, or transformation.", details: "Robustness is measured with attack success rate and by comparing clean vs adversarial accuracy. It is a security property, separate from raw accuracy.", good_practice: "Track robustness as a first-class metric in every model eval." },
  { key: "adversarial_training", name: "Adversarial Training", summary: "Training on adversarial examples so the model learns to be resistant to them.", details: "Techniques like PGD generate adversarial inputs during training, flattening the decision landscape. This improves robustness, sometimes with a small accuracy cost.", good_practice: "Combine adversarial training with input preprocessing and detection guardrails for defense-in-depth." },
  { key: "trust_no_accuracy", name: "High Accuracy != High Security", summary: "A 95% accurate model can still be trivially fooled.", details: "Accuracy measures performance on a data distribution, not resilience to crafted inputs. An attacker only needs one successful perturbation.", good_practice: "Gate AI deployments on robustness and adversarial test results, not accuracy alone." },
  { key: "ml_security_testing", name: "ML Security Testing", summary: "Applying security testing (threat modeling, red teaming, fuzzing) to machine learning pipelines.", details: "Attacks can target any stage: input, preprocessing, model weights, or output. ML security requires testing the model itself, not only the surrounding application.", good_practice: "Adopt an AI-red-team cycle: craft attacks, measure failures, harden, and re-evaluate." },
];

const ATTACKS: AttackMethod[] = [
  { key: "noise", name: "Perturbation (Noise) Attack", severity: "High", description: "Tiny imperceptible pixel noise flips the prediction.", detection_signals: ["low L-infinity perturbation", "imperceptible change", "high decision flips"], mitigations: "PGD adversarial training, input denoising, perturbation detectors." },
  { key: "occlusion", name: "Occlusion Attack", severity: "Medium", description: "Blocking a critical region (eyes) removes the strongest identity features.", detection_signals: ["blocked region", "reduced true-class confidence", "feature concentration"], mitigations: "Random erasing augmentation, attention regularization, partial-input checking." },
  { key: "transformation", name: "Input Transformation", severity: "Medium", description: "Photometric or geometric changes shift the model's confidence.", detection_signals: ["brightness/contrast shift", "affine change", "distribution drift"], mitigations: "Augmentation diversity, input normalization, distribution-shift detection." },
  { key: "physical", name: "Physical Attacks", severity: "Critical", description: "Adversarial patches or patterns that fool models in the real world (beyond this lab's scope).", detection_signals: ["printed patch", "physical interference"], mitigations: "Robust training, patch detectors, multi-view verification." },
];

const DEFENSES: DefenseMechanism[] = [
  { key: "adv_training", name: "Adversarial Training", description: "Train on adversarial examples to flatten the decision landscape.", effectiveness: "High", tradeoff: "Small clean-accuracy cost." },
  { key: "preprocessing", name: "Input Preprocessing", description: "Denoise, normalize, and filter inputs before the model.", effectiveness: "Medium", tradeoff: "Can reduce legitimate signal if too aggressive." },
  { key: "detection", name: "Adversarial Detection", description: "A guardrail that flags inputs that deviate from expected statistics.", effectiveness: "Medium", tradeoff: "Attacker can adapt to evade the detector." },
  { key: "certified", name: "Certified Defenses", description: "Formally guaranteed robustness within a bounded perturbation.", effectiveness: "High (guaranteed)", tradeoff: "Often lower clean accuracy and higher compute." },
];

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------
export async function fetchVisionExperiments(): Promise<VisionExperiment[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/vision/experiments`);
    if (res.ok) return (await res.json()).experiments;
  } catch {
    console.warn("Backend API offline, using local vision experiments");
  }
  return Object.values(LOCAL_EXPERIMENTS).map((e) => ({
    key: e.experiment_key,
    title: e.title,
    difficulty: e.difficulty,
    application: e.application,
    description: e.description,
    attack_type: e.attack_type,
    robustness: e.robustness,
  }));
}

export async function fetchVisionConcepts(): Promise<VisionConcept[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/vision/concepts`);
    if (res.ok) return (await res.json()).concepts;
  } catch {
    console.warn("Backend API offline, using local vision concepts");
  }
  return CONCEPTS;
}

export async function fetchVisionAttacksDefenses(): Promise<{ attacks: AttackMethod[]; defenses: DefenseMechanism[] }> {
  try {
    const res = await fetch(`${API_BASE_URL}/vision/attacks-defenses`);
    if (res.ok) return await res.json();
  } catch {
    console.warn("Backend API offline, using local vision attacks/defenses");
  }
  return { attacks: ATTACKS, defenses: DEFENSES };
}

export async function runVisionAnalysis(
  experimentKey: string,
  mode: AnalysisMode = "clean"
): Promise<VisionAnalysisResult> {
  try {
    const res = await fetch(`${API_BASE_URL}/vision/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ experiment_key: experimentKey, mode }),
    });
    if (res.ok) return await res.json();
  } catch {
    console.warn("Backend API offline, running local vision analyzer");
  }
  return fallbackAnalyze(experimentKey, mode);
}

// ---------------------------------------------------------------------------
// Local heuristics (mirror of backend app/services/vision_security.py)
// ---------------------------------------------------------------------------
function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 2147483647;
  return h;
}

function logits(exp: LocalExperiment, prediction: string, confidence: number): Logit[] {
  const names = SUBJECTS.map((s) => s.id);
  const seed = hashString(`${exp.experiment_key}::${prediction}`);
  const main = confidence / 100;
  let remaining = 1 - main;
  const allocation: Record<string, number> = { [prediction]: main };
  for (let i = 0; i < names.length; i++) {
    const n = names[i];
    if (n === prediction) continue;
    const frac = Math.min(remaining, remaining * (0.4 + (0.3 * ((seed + i) % 3)) / 2));
    allocation[n] = frac;
    remaining -= frac;
  }
  const total = Object.values(allocation).reduce((a, b) => a + b, 0);
  return names.map((n) => ({ subject: n, probability: Math.round((allocation[n] / total) * 10000) / 10000 }));
}

const AFFECTED_PIXELS: Record<AttackType, number> = { noise: 0.06, occlusion: 0.32, transformation: 0.42 };

function timeline(attackType: AttackType, outcome: OutcomeType): TimelineStage[] {
  return [
    { stage: "Image received", status: "complete", detail: "Input passed into the pipeline" },
    { stage: "Preprocessing", status: "complete", detail: "Normalized and resized" },
    { stage: "Features extracted", status: "complete", detail: "Latent vector computed" },
    { stage: "Prediction generated", status: "complete", detail: "Class probabilities produced" },
    { stage: "Adversarial check", status: "complete", detail: `Guardrail: ${outcome}` },
  ];
}

function fallbackAnalyze(experimentKey: string, mode: AnalysisMode): VisionAnalysisResult {
  const exp = LOCAL_EXPERIMENTS[experimentKey] ?? LOCAL_EXPERIMENTS["1_noise_attack"];
  const isDefense = experimentKey.startsWith("4_");

  if (isDefense && exp.vulnerable && exp.protected) {
    return {
      experiment_key: experimentKey,
      mode,
      attack_type: exp.attack_type,
      is_defense_comparison: true,
      before: buildPrediction(exp, exp.before.prediction, exp.before.confidence),
      after: buildPrediction(exp, exp.after.prediction, exp.after.confidence),
      outcome: "defended",
      confidence: exp.protected.adversarial_confidence,
      affected_pixels: AFFECTED_PIXELS[exp.attack_type],
      robustness: exp.protected.robustness,
      explanation: exp.explanation,
      why_failed: exp.why_failed,
      mitigations: exp.mitigations,
      teaching_points: exp.teaching_points,
      timeline: timeline(exp.attack_type, "defended"),
      confidence_gap: Math.max(0, exp.before.confidence - exp.protected.adversarial_confidence),
      vulnerable: exp.vulnerable,
      protected: exp.protected,
      subjects: SUBJECTS,
    };
  }

  const clean = buildPrediction(exp, exp.before.prediction, exp.before.confidence);
  const adversarial = buildPrediction(exp, exp.after.prediction, exp.after.confidence);

  const seed = hashString(`${experimentKey}::${mode}`);
  let outcome: OutcomeType;
  let confidence: number;
  if (mode === "clean") {
    outcome = "clean";
    confidence = clean.confidence;
  } else {
    const blocked = seed % 100 < exp.robustness;
    if (blocked) {
      outcome = "blocked";
      confidence = clean.confidence;
    } else {
      outcome = "misclassified";
      confidence = adversarial.confidence;
    }
  }

  return {
    experiment_key: experimentKey,
    mode,
    attack_type: exp.attack_type,
    is_defense_comparison: false,
    before: clean,
    after: adversarial,
    outcome,
    confidence,
    affected_pixels: AFFECTED_PIXELS[exp.attack_type],
    robustness: exp.robustness,
    explanation: exp.explanation,
    why_failed: exp.why_failed,
    mitigations: exp.mitigations,
    teaching_points: exp.teaching_points,
    timeline: timeline(exp.attack_type, outcome),
    confidence_gap: Math.max(0, clean.confidence - adversarial.confidence),
    subjects: SUBJECTS,
  };
}

function buildPrediction(exp: LocalExperiment, prediction: string, confidence: number): Prediction {
  return {
    prediction,
    prediction_label: SUBJECT_LABELS[prediction] ?? prediction,
    confidence,
    logits: logits(exp, prediction, confidence),
  };
}

export const VISION_CONCEPTS = CONCEPTS;
export const VISION_ATTACKS = ATTACKS;
export const VISION_DEFENSES = DEFENSES;
