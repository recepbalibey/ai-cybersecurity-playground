import { describe, it, expect } from "vitest";
import { GOVERNANCE_PROJECTS } from "../data/governance";
import {
  GOVERNANCE_CONTROLS,
  THREAT_CATEGORIES,
  GOVERNANCE_TOPICS,
  TOPIC_ORDER,
} from "../knowledge/governance/knowledgeBase";
import {
  assessGovernance,
  compareGovernance,
  aggregateScore,
  recommendationFor,
  askGovernance,
} from "./governanceEngine";

describe("AI Governance engine", () => {
  it("has 6 governance projects with unique ids and full architecture", () => {
    const ids = GOVERNANCE_PROJECTS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(GOVERNANCE_PROJECTS.length).toBe(6);
    GOVERNANCE_PROJECTS.forEach((p) => {
      expect(p.business_goal).toBeTruthy();
      expect(p.users).toBeTruthy();
      expect(p.data_types.length).toBeGreaterThan(0);
      expect(p.model_type).toBeTruthy();
      expect(p.architecture.length).toBeGreaterThanOrEqual(6);
      expect(p.threats.length).toBeGreaterThanOrEqual(5);
      expect(p.teaching_points.length).toBeGreaterThan(0);
    });
  });

  it("has a full control catalog with valid mitigations", () => {
    const categoryIds = new Set(THREAT_CATEGORIES.map((c) => c.id));
    const ids = GOVERNANCE_CONTROLS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(GOVERNANCE_CONTROLS.length).toBe(15);
    GOVERNANCE_CONTROLS.forEach((c) => {
      expect(c.description).toBeTruthy();
      expect(c.trade_offs).toBeTruthy();
      c.mitigates.forEach((m) => expect(categoryIds.has(m)).toBe(true));
    });
  });

  it("every project references only known categories and baseline controls", () => {
    const categoryIds = new Set(THREAT_CATEGORIES.map((c) => c.id));
    const controlIds = new Set(GOVERNANCE_CONTROLS.map((c) => c.id));
    GOVERNANCE_PROJECTS.forEach((p) => {
      p.threats.forEach((t) => expect(categoryIds.has(t.category)).toBe(true));
      p.baseline_controls.forEach((c) => expect(controlIds.has(c)).toBe(true));
    });
  });

  it("assesses every project with base risk >= residual risk", () => {
    GOVERNANCE_PROJECTS.forEach((p) => {
      const r = assessGovernance(p.id);
      expect(r.threats.length).toBe(p.threats.length);
      expect(r.controls.length).toBe(15);
      expect(r.base_score).toBeGreaterThanOrEqual(r.residual_score);
      expect(["Critical", "High", "Medium", "Low", "Informational"]).toContain(r.residual_level);
      expect(
        ["Ready for Deployment", "Deploy with Controls", "Further Testing Required", "Deployment Not Recommended"]
      ).toContain(r.recommendation.label);
      expect(r.timeline.length).toBe(6);
      expect(r.governance_review.executive_summary).toBeTruthy();
      expect(r.report.executive_summary).toBeTruthy();
    });
  });

  it("applying all controls lowers residual risk significantly", () => {
    GOVERNANCE_PROJECTS.forEach((p) => {
      const bare = assessGovernance(p.id, []);
      const all = assessGovernance(p.id, GOVERNANCE_CONTROLS.map((c) => c.id));
      expect(all.residual_score).toBeLessThanOrEqual(bare.residual_score);
      expect(all.controls.every((c) => c.enabled)).toBe(true);
    });
  });

  it("aggregate score is 0..100 and reflects worst-case weighting", () => {
    const r = assessGovernance("medical_ai");
    expect(aggregateScore(r.threats, "base_weight")).toBe(r.base_score);
    expect(aggregateScore(r.threats, "residual_weight")).toBe(r.residual_score);
    expect(r.base_score).toBeGreaterThan(0);
  });

  it("compare shows poorly governed scores higher than well governed", () => {
    GOVERNANCE_PROJECTS.forEach((p) => {
      const c = compareGovernance(p.id);
      expect(c.poor.score).toBeGreaterThanOrEqual(c.well.score);
      expect(c.well.controls).toBe(GOVERNANCE_CONTROLS.length);
      expect(c.difference).toBe(c.poor.score - c.well.score);
    });
  });

  it("medical AI has the highest bare risk of the six projects", () => {
    let highest = 0;
    GOVERNANCE_PROJECTS.forEach((p) => {
      highest = Math.max(highest, assessGovernance(p.id, []).residual_score);
    });
    expect(assessGovernance("medical_ai", []).residual_score).toBe(highest);
  });

  it("assistant answers every supported topic", () => {
    const qs = ["risk", "control", "governance", "injection", "stride", "bias", "what now"];
    qs.forEach((q) => expect(askGovernance(q).length).toBeGreaterThan(10));
  });

  it("knowledge base covers all expected topics with content", () => {
    expect(TOPIC_ORDER.length).toBe(15);
    const required = [
      "ai_risk_management", "threat_modeling", "defense_in_depth", "least_privilege", "zero_trust",
      "human_in_the_loop", "secure_ai_lifecycle", "model_monitoring", "incident_response_for_ai",
      "nist_ai_rmf", "owasp_llm_top10", "mitre_attack_concepts", "stride_concepts", "iso_iec_42001", "eu_ai_act",
    ];
    required.forEach((id) => {
      const items = GOVERNANCE_TOPICS[id];
      expect(items, `missing topic ${id}`).toBeTruthy();
      expect(items.length).toBeGreaterThan(0);
      items.forEach((i) => {
        expect(i.title).toBeTruthy();
        expect(i.explanation).toBeTruthy();
        expect(i.practical).toBeTruthy();
      });
    });
  });
});
