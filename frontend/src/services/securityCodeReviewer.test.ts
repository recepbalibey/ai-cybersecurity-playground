import { describe, it, expect } from "vitest";
import {
  REVIEW_EXAMPLES,
  reviewCode,
  detectLanguage,
  compareReview,
  askReviewer,
} from "./securityCodeReviewer";

describe("AI Security Code Reviewer engine", () => {
  it("exposes the ten educational examples with unique ids", () => {
    expect(REVIEW_EXAMPLES.length).toBe(10);
    const ids = REVIEW_EXAMPLES.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("detects SQL injection and scores it", () => {
    const res = reviewCode(
      'cur.execute(f"SELECT * FROM users WHERE name=\'{u}\'")',
      "python"
    );
    expect(res.findings.length).toBeGreaterThan(0);
    expect(res.findings[0].title).toContain("SQL Injection");
    expect(res.risk_level).toBe("Critical");
    expect(res.security_score.before).toBeLessThan(res.security_score.after);
  });

  it("maps findings to OWASP and CWE", () => {
    const res = reviewCode('strcpy(buffer, data);', "cpp");
    expect(res.findings[0].owasp).toBeTruthy();
    expect(res.findings[0].cwe).toBeTruthy();
  });

  it("keeps a clean file at full score", () => {
    const res = reviewCode("def add(a, b):\n    return a + b\n", "python");
    expect(res.findings.length).toBe(0);
    expect(res.security_score.before).toBe(100);
  });

  it("detects language from keywords", () => {
    expect(detectLanguage("package main\nfunc main()", undefined)).toBe("go");
    expect(detectLanguage("public class Foo {}", undefined)).toBe("java");
  });

  it("uses a sample's secure_code as the fix", () => {
    const res = reviewCode("", "python", "python_sql_injection");
    expect(res.fix.before).toContain("SELECT");
    expect(res.fix.after).toContain("?");
  });

  it("returns a compare object", () => {
    const c = compareReview("strcpy(a,b);", "cpp");
    expect(c.manual.time_seconds).toBeGreaterThan(c.ai.time_seconds);
  });

  it("answers owasp questions", () => {
    expect(askReviewer("owasp").toLowerCase()).toContain("owasp");
  });
});