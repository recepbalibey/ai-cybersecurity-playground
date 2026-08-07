import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, existsSync } from "node:fs";
import path from "node:path";

const repoRoot = path.resolve(process.cwd(), "..");
const datasetsDir = path.join(repoRoot, "datasets");
const knowledgeDir = path.join(repoRoot, "knowledge");

function walk(dir: string): string[] {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.name.endsWith(".json")) out.push(full);
  }
  return out;
}

// module directory (or root filename) -> required object keys
const DATASET_SCHEMA: Record<string, string[]> = {
  "bruteforce.json": ["dataset_name", "source", "target_system", "log_entries"],
  "powershell_attack.json": ["dataset_name", "source", "log_entries"],
  "malware_execution.json": ["dataset_name", "source", "log_entries"],
  "threat-hunting": ["scenario_key", "title", "objective", "telemetry_events"],
  pentest: ["scenario_key", "title", "target", "phases"],
  "prompt-injection": ["scenario_key", "title", "system_prompt"],
  jailbreak: ["scenario_key", "title", "attack_payloads"],
  "adversarial-ml": ["experiment_key", "title", "robustness", "teaching_points"],
  "agent-security": [
    "scenario_key",
    "title",
    "tools_allowed",
    "expected_outcome",
    "teaching_points",
  ],
  "malware-analysis": ["sample", "description", "behaviors", "indicators", "mitre"],
  "code-review": [
    "id",
    "title",
    "language",
    "description",
    "severity",
    "owasp",
    "cwe",
    "vulnerable_code",
    "secure_code",
    "finding",
    "checklist",
  ],
  privacy: [
    "id",
    "title",
    "category",
    "description",
    "classification",
    "risk_level",
    "handling",
    "document",
    "teaching_points",
  ],
  governance: [
    "id",
    "title",
    "description",
    "business_goal",
    "users",
    "data_types",
    "model_type",
    "criticality",
    "governance_stance",
    "architecture",
    "threats",
    "baseline_controls",
    "teaching_points",
  ],
  "ai-failures": [
    "id",
    "title",
    "category",
    "difficulty",
    "input_data",
    "ai_output",
    "ai_confidence",
    "ground_truth",
    "failure_type",
    "explanation",
    "security_impact",
    "recommended_validation",
    "possible_mitigations",
    "learning_objective",
  ],
};

const KNOWLEDGE_SCHEMA: Record<string, string[]> = {
  "detection_rules.json": ["rules"],
  "mitre_attack.json": ["techniques"],
  "security_patterns.json": ["patterns"],
  "adversarial-ml/concepts.json": ["concepts"],
  "adversarial-ml/attacks_defenses.json": [],
  "agent-security/knowledge_base.json": [
    "principles",
    "risk_factors",
    "controls",
    "teaching_points",
  ],
  "jailbreak/attack_methods.json": ["attack_categories", "models"],
  "jailbreak/safety_concepts.json": ["concepts"],
  "llm-security/attack_types.json": ["attack_types"],
  "llm-security/defense_layers.json": ["defense_layers"],
  "malware/knowledge_base.json": [
    "principles",
    "behaviors",
    "mitre",
    "detection_patterns",
    "incident_response",
  ],
  "secure-coding/knowledge_base.json": [
    "owasp",
    "cwe",
    "coding_principles",
    "input_validation",
    "authentication",
    "authorization",
    "cryptography",
    "secrets_management",
    "error_handling",
    "logging",
    "secure_apis",
    "checklist",
  ],
  "pentest/api_risks.json": ["risks"],
  "pentest/agent_security.json": ["concepts"],
  "pentest/common_misconfigurations.json": ["misconfigurations"],
  "pentest/iot_risks.json": ["risks"],
  "pentest/mitre_attack.json": ["techniques"],
  "pentest/owasp_top10.json": ["categories"],
  "privacy/knowledge_base.json": [
    "pii",
    "sensitive_personal_information",
    "secrets_detection",
    "api_keys",
    "data_classification",
    "data_loss_prevention",
    "privacy_principles",
    "enterprise_ai_policies",
    "prompt_hygiene",
    "least_disclosure_principle",
  ],
  "governance/knowledge_base.json": [
    "ai_risk_management",
    "threat_modeling",
    "defense_in_depth",
    "least_privilege",
    "zero_trust",
    "human_in_the_loop",
    "secure_ai_lifecycle",
    "model_monitoring",
    "incident_response_for_ai",
    "nist_ai_rmf",
    "owasp_llm_top10",
    "mitre_attack_concepts",
    "stride_concepts",
    "iso_iec_42001",
    "eu_ai_act",
  ],
  "ai-failures/knowledge_base.json": [
    "false_positives",
    "false_negatives",
    "hallucinations",
    "confidence_calibration",
    "uncertainty",
    "data_quality",
    "class_imbalance",
    "distribution_shift",
    "concept_drift",
    "automation_bias",
    "human_in_the_loop",
    "human_on_the_loop",
    "model_monitoring",
    "ai_evaluation",
    "security_evaluation",
    "decision_thresholds",
    "precision",
    "recall",
    "f1_score",
    "pr_auc",
    "confusion_matrix",
  ],
};
const KNOWLEDGE_ARRAY_ONLY = new Set([
  "pentest/api_security.json",
  "pentest/iot_security.json",
]);

const datasetFiles = walk(datasetsDir);
const knowledgeFiles = walk(knowledgeDir);

describe("dataset JSON integrity (all modules)", () => {
  it(`found dataset files (${datasetFiles.length})`, () => {
    expect(datasetFiles.length).toBeGreaterThanOrEqual(12);
  });

  for (const file of datasetFiles) {
    const rel = path.relative(datasetsDir, file).split(path.sep).join("/");
    const moduleKey = rel.includes("/")
      ? rel.split("/")[0]
      : path.basename(file);
    // agent-security tools.json is a bare array, not an object scenario
    if (moduleKey === "agent-security" && path.basename(file) === "tools.json") {
      it(`[dataset] agent-security/tools.json exposes a non-empty tools array`, () => {
        const data = JSON.parse(readFileSync(file, "utf8"));
        expect(data).toBeInstanceOf(Object);
        expect(Array.isArray(data.tools)).toBe(true);
        expect(data.tools.length).toBeGreaterThan(0);
      });
      continue;
    }
    const required = DATASET_SCHEMA[moduleKey];
    it(`[dataset] ${rel} → keys: ${(required ?? []).join(",") || "(none)"}`, () => {
      expect(required, `no schema for module "${moduleKey}"`).toBeTruthy();
      const data = JSON.parse(readFileSync(file, "utf8"));
      expect(data).toBeInstanceOf(Object);
      required.forEach((k) => {
        expect(data).toHaveProperty(k);
        expect(data[k]).not.toBeNull();
        expect(data[k]).not.toBe("");
      });
      for (const arrKey of [
        "log_entries",
        "telemetry_events",
        "attack_payloads",
        "teaching_points",
        "plan",
        "experiment",
        "architecture",
        "threats",
        "baseline_controls",
        "data_types",
      ]) {
        if (arrKey in data) {
          expect(Array.isArray(data[arrKey])).toBe(true);
          expect((data[arrKey] as unknown[]).length).toBeGreaterThan(0);
        }
      }
    });
  }
});

describe("knowledge JSON integrity", () => {
  it(`found knowledge files (${knowledgeFiles.length})`, () => {
    expect(knowledgeFiles.length).toBeGreaterThanOrEqual(12);
  });

  for (const file of knowledgeFiles) {
    const rel = path.relative(knowledgeDir, file).split(path.sep).join("/");
    if (KNOWLEDGE_ARRAY_ONLY.has(rel)) {
      it(`[knowledge] ${rel} is a non-empty array`, () => {
        const data = JSON.parse(readFileSync(file, "utf8"));
        expect(Array.isArray(data)).toBe(true);
        expect(data.length).toBeGreaterThan(0);
      });
      continue;
    }
    const required = KNOWLEDGE_SCHEMA[rel];
    if (!required) continue;
    it(`[knowledge] ${rel} has required keys`, () => {
      const data = JSON.parse(readFileSync(file, "utf8"));
      expect(data).toBeInstanceOf(Object);
      required.forEach((k) => {
        expect(data).toHaveProperty(k);
        const v = (data as Record<string, unknown>)[k];
        if (Array.isArray(v)) expect(v.length).toBeGreaterThan(0);
      });
    });
  }
});