import { describe, it, expect } from "vitest";
import { AI_FAILURE_SCENARIOS } from "../data/aiFailures";
import {
  evaluateAiFailure,
  runAiFailureCapstone,
  aiFailureReliabilityBefore,
  aiFailureReliabilityAfter,
  aiFailureScorecard,
  aiFailureCalibration,
  askAiFailure,
  FAILURE_TYPES,
} from "./aiFailureEngine";

describe("AI Failure Lab engine", () => {
  it("has 13 scenarios with unique ids and full evidence", () => {
    const ids = AI_FAILURE_SCENARIOS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(AI_FAILURE_SCENARIOS.length).toBe(13);
    AI_FAILURE_SCENARIOS.forEach((s) => {
      expect(s.title).toBeTruthy();
      expect(s.input_data).toBeTruthy();
      expect(s.ai_output).toBeTruthy();
      expect(s.ai_confidence).toBeGreaterThan(0);
      expect(s.ai_confidence).toBeLessThanOrEqual(100);
      expect(s.ground_truth).toBeTruthy();
      expect(s.explanation).toBeTruthy();
      expect(s.security_impact).toBeTruthy();
      expect(s.learning_objective).toBeTruthy();
      expect(s.possible_mitigations.length).toBeGreaterThanOrEqual(3);
    });
  });

  it("has one capstone with six events", () => {
    const capstone = AI_FAILURE_SCENARIOS.find((s) => s.capstone_events);
    expect(capstone?.id).toBe("ai_soc_under_pressure");
    expect(capstone?.capstone_events?.length).toBe(6);
    capstone?.capstone_events?.forEach((ev) => {
      expect(["attack", "benign"]).toContain(ev.ground_truth);
      expect(["attack", "benign"]).toContain(ev.ai_verdict);
    });
  });

  it("every named scenario demonstrates an incorrect AI decision", () => {
    AI_FAILURE_SCENARIOS.filter((s) => !s.capstone_events).forEach((s) => {
      expect(s.ai_label).not.toBe(s.ground_truth_label);
    });
  });

  it("every failure type maps to a known failure name", () => {
    const ids = FAILURE_TYPES.map((f) => f.id);
    AI_FAILURE_SCENARIOS.forEach((s) => {
      expect(ids).toContain(s.failure_type);
    });
  });

  it("every mitigation prevents a real failure type or is general", () => {
    const ids = FAILURE_TYPES.map((f) => f.id);
    AI_FAILURE_SCENARIOS.forEach((s) => {
      s.possible_mitigations.forEach((m) => {
        expect(m.gain).toBeGreaterThan(0);
        m.prevents.forEach((p) => expect(ids).toContain(p));
      });
    });
  });

  it("evaluate produces correct verdict classes", () => {
    // AI is wrong, student correctly says incorrect -> true_negative
    const ok = evaluateAiFailure("soc_false_positive", "incorrect", [], 70);
    expect(ok.ai_correct).toBe(false);
    expect(ok.student_verdict_correct).toBe(true);
    expect(ok.student_verdict_class).toBe("true_negative");

    // AI is wrong, student says correct -> false_positive (trusted wrong AI)
    const fp = evaluateAiFailure("hallucination_security_report", "correct", [], 90);
    expect(fp.ai_correct).toBe(false);
    expect(fp.student_verdict_correct).toBe(false);
    expect(fp.student_verdict_class).toBe("false_positive");

    // uncertain always counts as uncertain
    const unc = evaluateAiFailure("soc_false_positive", "uncertain", [], 20);
    expect(unc.student_verdict_class).toBe("uncertain");
    expect(unc.student_verdict_correct).toBe(false);
  });

  it("reliability is low for a wrong confident AI and rises with catching mitigation", () => {
    const wrongHighConf = evaluateAiFailure("hallucination_security_report", "incorrect", []);
    expect(wrongHighConf.ai_confidence).toBe(97);
    expect(wrongHighConf.reliability.before).toBe(3);

    const withCatch = evaluateAiFailure(
      "hallucination_security_report",
      "incorrect",
      ["citation_requirement", "fabrication_check"]
    );
    expect(withCatch.reliability.caught).toBe(true);
    expect(withCatch.reliability.after).toBeGreaterThan(withCatch.reliability.before);

    const noCatch = evaluateAiFailure(
      "hallucination_security_report",
      "incorrect",
      ["human_read_before_share"]
    );
    expect(noCatch.reliability.caught).toBe(false);
    expect(noCatch.reliability.after).toBe(noCatch.reliability.before + 10);
  });

  it("capstone combined accuracy is at least each alone and is 100 when human is perfect", () => {
    const perfect = runAiFailureCapstone("ai_soc_under_pressure", {
      E1: "attack", E2: "benign", E3: "attack", E4: "benign", E5: "attack", E6: "benign",
    });
    expect(perfect.human_accuracy).toBe(100);
    expect(perfect.combined_accuracy).toBe(100);
    expect(perfect.ai_accuracy).toBeLessThan(perfect.combined_accuracy);

    const allAi = runAiFailureCapstone("ai_soc_under_pressure", {
      E1: "benign", E2: "attack", E3: "benign", E4: "attack", E5: "benign", E6: "attack",
    });
    expect(allAi.combined_accuracy).toBe(allAi.ai_accuracy);
  });

  it("capstone human catching a miss lifts the combined score", () => {
    // AI only: correct on E2 (benign) and E6 (benign) -> 2/6
    const blindAgreement = runAiFailureCapstone("ai_soc_under_pressure", {
      E1: "benign", E2: "attack", E3: "benign", E4: "attack", E5: "benign", E6: "attack",
    });
    expect(blindAgreement.ai_total).toBe(2);
    expect(blindAgreement.human_total).toBe(2);
    expect(blindAgreement.combined_total).toBe(2);

    // Human catches E1 and E3 -> combined lifts to 4
    const partial = runAiFailureCapstone("ai_soc_under_pressure", {
      E1: "attack", E2: "attack", E3: "attack", E4: "attack", E5: "benign", E6: "attack",
    });
    expect(partial.combined_total).toBeGreaterThan(partial.ai_total);
  });

  it("scorecard counts accuracy, false positives, false negatives, and uncertainty", () => {
    const s = aiFailureScorecard([
      { student_verdict_class: "true_negative", student_confidence: 80 },
      { student_verdict_class: "false_positive", student_confidence: 90 },
      { student_verdict_class: "uncertain", student_confidence: 20 },
    ]);
    expect(s.total).toBe(3);
    expect(s.correct).toBe(1);
    expect(s.false_positives).toBe(1);
    expect(s.uncertain).toBe(1);
    expect(s.accuracy).toBe(50);
  });

  it("calibration buckets map confidence to correctness", () => {
    const c = aiFailureCalibration([
      { student_verdict_class: "true_negative", student_confidence: 90 },
      { student_verdict_class: "true_negative", student_confidence: 85 },
      { student_verdict_class: "false_positive", student_confidence: 95 },
      { student_verdict_class: "true_negative", student_confidence: 10 },
    ]);
    expect(c.high.count).toBe(3);
    expect(c.high.correct_rate).toBe(67);
    expect(c.low.count).toBe(1);
    expect(c.low.correct_rate).toBe(100);
  });

  it("assistant answers every supported topic", () => {
    const qs = [
      "What is a false positive?", "false negative", "hallucination",
      "confidence calibration", "automation bias", "distribution shift",
      "class imbalance", "precision recall", "threshold", "mitigations",
      "what now",
    ];
    qs.forEach((q) => expect(askAiFailure(q).length).toBeGreaterThan(10));
  });

  it("reliability functions match the evaluate result", () => {
    const scenario = AI_FAILURE_SCENARIOS.find((s) => s.id === "automation_bias")!;
    expect(aiFailureReliabilityBefore("automation_bias")).toBe(100 - scenario.ai_confidence);
    const rel = aiFailureReliabilityAfter("automation_bias", ["forced_evidence_review"]);
    const evalRes = evaluateAiFailure("automation_bias", "incorrect", ["forced_evidence_review"], 50);
    expect(rel.after).toBe(evalRes.reliability.after);
  });
});
