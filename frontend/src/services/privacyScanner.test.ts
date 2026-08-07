import { describe, it, expect } from "vitest";
import {
  scanDocument,
  detectPrivacyFindings,
  classifyDocument,
  assessRisk,
  evaluatePolicies,
  redactDocument,
  askPrivacy,
  PRIVACY_SCENARIOS,
} from "./privacyScanner";

describe("privacy scanner data", () => {
  it("exposes 5 educational scenarios", () => {
    expect(PRIVACY_SCENARIOS.length).toBe(5);
    const ids = PRIVACY_SCENARIOS.map((s) => s.id);
    expect(new Set(ids).size).toBe(5);
  });
});

describe("detectPrivacyFindings", () => {
  it("finds email, phone, card and name", () => {
    const doc = "Customer: Jane Roe\nEmail: jane@example.com\nPhone: (555) 123-4567\nCard: 4111 1111 1111 1111";
    const findings = detectPrivacyFindings(doc);
    const types = findings.map((f) => f.type);
    expect(types).toContain("Credit Card");
    expect(types).toContain("Email Address");
    expect(types).toContain("Phone Number");
    expect(types).toContain("Personal Name");
  });

  it("detects secrets in source code", () => {
    const doc =
      'DB_PASSWORD = "hunter2secret"\nMAILGUN_API_KEY = "sk-live-abc123456789"\nTOKEN = "ghp_0123456789abcdef0123456789abcdef"';
    const findings = detectPrivacyFindings(doc);
    const types = findings.map((f) => f.type);
    expect(types).toContain("Password");
    expect(types).toContain("API Key");
    expect(types).toContain("Access Token");
  });

  it("does not flag an uppercase constant as a password", () => {
    const findings = detectPrivacyFindings("password=DB_PASSWORD");
    expect(findings.some((f) => f.type === "Password")).toBe(false);
  });

  it("detects medical content", () => {
    const doc =
      "Diagnosis: diabetes\nPrescribed metformin\nHbA1c 8.1\nLisinopril 10 mg\nPatient blood panel showed low vitamin D";
    const types = detectPrivacyFindings(doc).map((f) => f.type);
    expect(types).toContain("Medical Information");
  });
});

describe("classifyDocument", () => {
  it("marks documents with critical findings as restricted", () => {
    const doc = "Customer: Jane Roe\nCard: 4111 1111 1111 1111";
    const cls = classifyDocument(detectPrivacyFindings(doc));
    expect(["Restricted", "Highly Restricted"]).toContain(cls.label);
  });

  it("classifies clean text as public", () => {
    const cls = classifyDocument(detectPrivacyFindings("Please help write a welcome email for our newsletter."));
    expect(cls.label).toBe("Public");
  });
});

describe("assessRisk", () => {
  it("reports a high score for a card-bearing document", () => {
    const doc = "Customer: Jane Roe\nEmail: jane@example.com\nCard: 4111 1111 1111 1111\nPhone: (555) 123-4567";
    const risk = assessRisk(detectPrivacyFindings(doc));
    expect(risk.score).toBeGreaterThan(45);
    expect(risk.level).toMatch(/Critical|High|Medium/);
  });
});

describe("evaluatePolicies", () => {
  it("blocks customer PII and financial policies", () => {
    const doc = "Customer: Jane Roe\nCard: 4111 1111 1111 1111";
    const policies = evaluatePolicies(detectPrivacyFindings(doc));
    const blocked = policies.filter((p) => p.status === "blocked");
    expect(blocked.some((p) => p.id === "pol-customer-pii")).toBe(true);
    expect(blocked.some((p) => p.id === "pol-financial")).toBe(true);
  });

  it("passes policies for clean text", () => {
    const policies = evaluatePolicies([]);
    expect(policies.every((p) => p.status === "pass")).toBe(true);
  });
});

describe("redactDocument", () => {
  it("replaces sensitive spans with [REDACTED]", () => {
    const doc = "Customer: Jane Roe\nEmail: jane@example.com\nCard: 4111 1111 1111 1111";
    const red = redactDocument(doc, detectPrivacyFindings(doc));
    expect(red.redacted).toContain("[REDACTED]");
    expect(red.redacted).not.toContain("jane@example.com");
    expect(red.redacted).not.toContain("4111");
    expect(red.redacted_count).toBeGreaterThan(0);
    expect(red.explanations.length).toBeGreaterThan(0);
  });
});

describe("scanDocument", () => {
  it("returns a full report for a known scenario", () => {
    const scenario = PRIVACY_SCENARIOS.find((s) => s.id === "customer_database")!;
    const result = scanDocument(scenario.document, scenario.id);
    expect(result.findings.length).toBeGreaterThan(5);
    expect(result.risk.score).toBeGreaterThan(50);
    expect(result.classification.label).not.toBe("Public");
    expect(result.safe_prompt).toContain("[REDACTED]");
    expect(result.timeline.length).toBe(6);
    expect(result.instructor_context.teaching_points.length).toBe(3);
  });

  it("flags secrets in the source code scenario", () => {
    const scenario = PRIVACY_SCENARIOS.find((s) => s.id === "source_code_secret")!;
    const result = scanDocument(scenario.document, scenario.id);
    const types = result.findings.map((f) => f.type);
    expect(types).toContain("Password");
    expect(types).toContain("Cloud Access Key");
  });
});

describe("askPrivacy", () => {
  it("answers questions about PII", () => {
    expect(askPrivacy("What is PII?")).toContain("PII");
  });
  it("answers questions about classification", () => {
    expect(askPrivacy("how do we classify documents")).toContain("Classify");
  });
  it("answers questions about policies", () => {
    expect(askPrivacy("what is a DLP policy")).toContain("Data loss prevention");
  });
});
