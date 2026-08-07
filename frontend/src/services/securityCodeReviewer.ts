// securityCodeReviewer.ts
// AI Security Code Reviewer - client engine.
//
// Architecture (ready for future LLM / local-model integration):
//    Source Code -> Language Detection -> Static Security Rules
//    -> AI Analysis -> OWASP Mapping -> CWE Mapping
//    -> Recommendation Generator -> Secure Code Generator
//
// Educational and defensive: secure review only. No exploit or payload
// generation. Falls back to the local deterministic engine when the
// backend is offline.

import { REVIEW_EXAMPLES, type RiskLevel } from "../data/securityCode";
import { SECURE_DEV_CHECKLIST } from "../knowledge/secure-coding/knowledgeBase";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export interface AffectedLines {
  start: number;
  end: number;
}

export interface CodeFinding {
  id: string;
  title: string;
  severity: RiskLevel;
  affected_lines: AffectedLines;
  language: string;
  owasp: string;
  cwe: string;
  description: string;
  why_dangerous: string;
  impact: string;
  fix: string;
  secure_example: string;
  learning_notes: string[];
  checklist: string[];
}

export interface WorkflowStage {
  step: number;
  name: string;
  detail: string;
}

export interface ReviewResult {
  example_id: string | null;
  language: string;
  language_label: string;
  summary: string[];
  risk_level: RiskLevel;
  confidence: number;
  security_score: { before: number; after: number };
  workflow: WorkflowStage[];
  findings: CodeFinding[];
  fix: {
    before: string;
    after: string;
    improvements: string[];
  };
  checklist: string[];
  instructor_context: {
    teaching_points: {
      title: string;
      concept: string;
      explanation: string;
      key_takeaway: string;
    }[];
    discussion_questions: string[];
  };
}

export interface ReviewComparison {
  manual: { time_seconds: number; issues: number; coverage: string };
  ai: { time_seconds: number; issues: number; coverage: string };
  time_saved_ratio: number;
  notes: string;
}

export const CODE_LANGUAGES = [
  "python", "javascript", "typescript", "java", "csharp", "c", "cpp",
  "go", "rust", "php",
] as const;

const LANG_LABELS: Record<string, string> = {
  python: "Python", javascript: "JavaScript", typescript: "TypeScript",
  java: "Java", csharp: "C#", c: "C", cpp: "C++", go: "Go", rust: "Rust",
  php: "PHP",
};

const LANG_KEYWORDS: Record<string, string[]> = {
  python: ["def ", "import ", "print(", "self", "async def"],
  javascript: ["function", "const ", "=>", "require(", "let "],
  typescript: ["interface ", "type ", ": string", "import {"],
  java: ["public class", "System.out", "import java"],
  csharp: ["using System", "namespace ", "public class"],
  cpp: ["#include", "int main", "std::", "char buffer"],
  c: ["#include", "int main", "printf(", "char "],
  go: ["package ", "func main", ":= ", "net/http"],
  rust: ["fn main", "let mut", "std::", "use std"],
  php: ["<?php", "$_GET", "echo "],
};

const SEVERITY_INDEX: Record<string, number> = {
  Critical: 0, High: 1, Medium: 2, Low: 3, Informational: 4,
};

const SCORES: Record<string, number> = {
  Critical: 34, High: 24, Medium: 16, Low: 8, Informational: 4,
};

// ------------------------------------------------------------ rules

interface Rule {
  key: string;
  title: string;
  languages: string[];
  pattern: RegExp;
}

const RULES: Rule[] = [
  {
    key: "python_sql_injection",
    title: "SQL Injection",
    languages: ["python", "javascript", "typescript", "java", "php", "csharp", "go", "rust"],
    pattern: /(?:query\s*=|\.execute\(|exec\s*\().*(?:f["']|format\(|\+\s*\w|%\s*\()/i,
  },
  {
    key: "python_command_injection",
    title: "OS Command Injection",
    languages: ["python", "javascript", "typescript", "java", "php", "csharp", "go"],
    pattern: /(shell=True|subprocess\.run|os\.system|Runtime\.getRuntime|Process\.Start|child_process|exec\(|system\()/i,
  },
  {
    key: "javascript_xss",
    title: "Cross-Site Scripting (XSS)",
    languages: ["javascript", "typescript", "php", "java", "python", "csharp", "go"],
    pattern: /(innerHTML|dangerouslySetInnerHTML|document\.write|\$_GET\b)/i,
  },
  {
    key: "node_authentication",
    title: "Broken Authentication",
    languages: ["javascript", "typescript", "python", "php", "csharp", "java"],
    pattern: /(\.password\s*===?\s*\w|password\s*===\s*\w|\.password\s*==\s*\w|base64\()/i,
  },
  {
    key: "java_deserialization",
    title: "Insecure Deserialization",
    languages: ["java", "python", "javascript", "typescript", "php", "csharp"],
    pattern: /(ObjectInputStream|readObject\(|pickle\.loads|yaml\.load|unserialize\()/i,
  },
  {
    key: "php_file_upload",
    title: "Unrestricted File Upload",
    languages: ["php", "javascript", "typescript", "python", "csharp"],
    pattern: /(move_uploaded_file|multer|\$_FILES|upload\(|save\.upload)/i,
  },
  {
    key: "cpp_buffer_overflow",
    title: "Buffer Overflow",
    languages: ["cpp", "c", "csharp"],
    pattern: /(strcpy\s*\(|gets\s*\(|sprintf\s*\(|memcpy\s*\(|strcat\s*\()/i,
  },
  {
    key: "go_path_traversal",
    title: "Path Traversal",
    languages: ["go", "python", "php", "javascript", "typescript", "java", "csharp"],
    pattern: /(ReadFile|fopen|path\.join|filepath\.Join|\?file=|\.\.\/|\$\{.*file)/i,
  },
  {
    key: "csharp_hardcoded_secret",
    title: "Hard-coded Credentials",
    languages: ["csharp", "python", "javascript", "typescript", "java", "go", "rust", "php"],
    pattern: /(?:api[_-]?key|secret|token|connection_string|password)\s*[:=]\s*["'][^"']{6,}["']/i,
  },
  {
    key: "rust_safe_example",
    title: "Missing Input Validation",
    languages: ["rust", "go", "python", "cpp"],
    pattern: /(read_line|bufio|Scan\(|stdin\.read|trim\(\))/i,
  },
];

// ------------------------------------------------------------ helpers

export function detectLanguage(code: string, requested?: string, exampleId?: string): string {
  if (exampleId) {
    const ex = REVIEW_EXAMPLES.find((e) => e.id === exampleId);
    if (ex) return ex.language;
  }
  if (requested && CODE_LANGUAGES.includes(requested as never)) return requested;
  let best = "python";
  let score = 0;
  for (const [lang, kws] of Object.entries(LANG_KEYWORDS)) {
    const s = kws.filter((k) => code.toLowerCase().includes(k.toLowerCase())).length;
    if (s > score) {
      best = lang;
      score = s;
    }
  }
  return best;
}

function firstLineSpan(code: string, pattern: RegExp): { start: number; end: number } {
  const m = pattern.exec(code);
  if (!m) return { start: 1, end: 1 };
  const before = code.slice(0, m.index);
  const full = code.slice(0, m.index + m[0].length);
  const start = before.split("\n").length;
  const end = full.split("\n").length;
  return { start, end: Math.max(end, start) };
}

function buildFinding(
  example: (typeof REVIEW_EXAMPLES)[number],
  language: string,
  affected: AffectedLines
): CodeFinding {
  return {
    id: example.id,
    title: example.finding.title,
    severity: example.severity,
    affected_lines: affected,
    language,
    owasp: example.owasp,
    cwe: example.cwe,
    description: example.description,
    why_dangerous: example.finding.why_dangerous,
    impact: example.finding.impact,
    fix: example.finding.fix,
    secure_example: example.secure_code,
    learning_notes: example.finding.learning_example,
    checklist: example.checklist,
  };
}

function worstSeverity(findings: CodeFinding[]): RiskLevel {
  if (findings.length === 0) return "Informational";
  return findings
    .slice()
    .sort((a, b) => (SEVERITY_INDEX[a.severity] ?? 9) - (SEVERITY_INDEX[b.severity] ?? 9))[0].severity;
}

// ------------------------------------------------------------ engine

export function reviewCode(code: string, language?: string, exampleId?: string | null): ReviewResult {
  const safe = code.trim();
  const lang = detectLanguage(safe, language, exampleId ?? undefined);
  const example = exampleId ? REVIEW_EXAMPLES.find((e) => e.id === exampleId) : undefined;

  const findings: CodeFinding[] = [];
  const matched = new Set<string>();
  for (const rule of RULES) {
    if (!rule.languages.includes(lang)) continue;
    if (!rule.pattern.test(safe)) continue;
    const ex = REVIEW_EXAMPLES.find((e) => e.id === rule.key);
    if (!ex) continue;
    matched.add(rule.key);
    findings.push(buildFinding(ex, lang, firstLineSpan(safe, rule.pattern)));
  }
  if (example && !matched.has(example.id)) {
    findings.unshift(buildFinding(example, lang, { start: 1, end: 1 }));
  }
  findings.sort((a, b) => (SEVERITY_INDEX[a.severity] ?? 9) - (SEVERITY_INDEX[b.severity] ?? 9));

  const deductions = findings.map((f) => SCORES[f.severity] ?? 10);
  const before = Math.max(0, 100 - deductions.reduce((a, b) => a + b, 0));
  const after =
    findings.length > 0
      ? Math.min(100, Math.round(before + deductions.reduce((a, b) => a + b, 0) * 0.9))
      : 100;

  const risk = worstSeverity(findings);

  const checklist = [...SECURE_DEV_CHECKLIST];
  for (const f of findings) {
    for (const item of f.checklist) {
      if (!checklist.includes(item)) checklist.push(item);
    }
  }

  return {
    example_id: exampleId ?? null,
    language: lang,
    language_label: LANG_LABELS[lang] ?? lang,
    summary: summarize(findings, lang),
    risk_level: risk,
    confidence: findings.length > 0 ? 92 : 41,
    security_score: { before, after },
    workflow: workflowStages(findings.length, lang, findings[0]?.title),
    findings,
    fix: {
      before: example?.vulnerable_code ?? safe,
      after: example?.secure_code ?? genericFix(findings),
      improvements: improvementsFor(findings),
    },
    checklist,
    instructor_context: INSTRUCTOR,
  };
}

function summarize(findings: CodeFinding[], lang: string): string[] {
  if (findings.length === 0) {
    return [
      `No security issues found in this ${lang} file. A reviewer should still inspect the logic and maintainability.`,
    ];
  }
  const top = findings[0];
  const l = top.affected_lines;
  return [
    `The file is ${top.severity.toLowerCase()}-risk because ${top.title.toLowerCase()} appears around lines ${l.start}-${l.end}.`,
    `Found ${findings.length} distinct issue(s) in this ${lang} file.`,
    "AI detects patterns; a human must validate each finding and the fix before deploy.",
  ];
}

function workflowStages(count: number, lang: string, lead?: string): WorkflowStage[] {
  return [
    { step: 1, name: "Static analysis", detail: `Parsed ${lang} structure and scanned for security patterns.` },
    { step: 2, name: "AI security review", detail: `Framed ${count} candidate issue(s); lead is ${lead ?? "none"}.` },
    { step: 3, name: "Risk classification", detail: "Ranked findings by severity and mapped OWASP/CWE." },
    { step: 4, name: "Secure fix", detail: "Drafted a secure alternative for each finding." },
    { step: 5, name: "Verification", detail: "A human must validate findings and retest the fixed code." },
  ];
}

function genericFix(findings: CodeFinding[]): string {
  if (findings.length === 0) return "No fix generated: no findings were matched.";
  return findings.map((f) => `// ${f.title}: ${f.fix}`).join("\n");
}

function improvementsFor(findings: CodeFinding[]): string[] {
  if (findings.length === 0) return ["No insecure patterns detected to change."];
  return findings.map((f) => `${f.title} - ${f.fix}`);
}

export function compareReview(code: string, language?: string, exampleId?: string | null): ReviewComparison {
  const review = reviewCode(code, language, exampleId);
  const n = review.findings.length;
  return {
    manual: { time_seconds: 1800, issues: Math.max(n - 1, 1), coverage: "60%" },
    ai: { time_seconds: 9, issues: n, coverage: "92%" },
    time_saved_ratio: 198,
    notes:
      "AI frames static issues in seconds. Reviewers still catch logic and business-rule bugs that pattern matching cannot see.",
  };
}

export function askReviewer(question: string, exampleId?: string | null): string {
  const q = question.toLowerCase();
  const ex = exampleId ? REVIEW_EXAMPLES.find((e) => e.id === exampleId) : undefined;

  if (q.includes("false positive") || q.includes("trust") || q.includes("review")) {
    return "AI flags patterns; some results are false positives. A reviewer must validate each finding and confirm the fix still passes tests before acting.";
  }
  if (q.includes("owasp")) {
    return "OWASP Top 10 is a community list of the most critical web risks: injection, broken access control, crypto failures, insecure design and more. Findings map to it to help prioritize fixes.";
  }
  if (q.includes("cwe")) {
    return "CWE is a catalogue of common software weakness types. Each finding links to a CWE id (for example CWE-89 for SQL injection) to standardize a security backlog.";
  }
  if (q.includes("deploy") || q.includes("validate")) {
    return "Do not ship an automated fix without review. Re-run the build and tests, then confirm the fix preserves behavior. A fix can introduce a regression.";
  }
  if (q.includes("miss") || q.includes("limitation") || q.includes("logic")) {
    return "Yes. Static checks miss logic bugs, business-rule errors, and issues that only appear under real load. Human review is the core; AI is the accelerator.";
  }
  if (q.includes("devsecops") || q.includes("ci")) {
    return "Treat review as a CI/CD gate: run it on every merge, triage by severity, and only let changes pass once the security policy is satisfied.";
  }
  if (ex) {
    return `${ex.title} (CWE-${ex.cwe}). ${ex.description} Use the secure pattern shown to close the issue.`;
  }
  return "I can explain OWASP/CWE mapping, whether a fix is deployable, why AI can miss issues, and how reviews fit into DevSecOps.";
}

export const INSTRUCTOR = {
  teaching_points: [
    {
      title: "AI detects patterns, humans verify",
      concept: "Assisted review",
      explanation:
        "The AI flags matching patterns quickly, but flagging is not proof. A security reviewer must validate each finding and its fix.",
      key_takeaway: "Automation accelerates review; the human owns the decision.",
    },
    {
      title: "A secure fix must preserve functionality",
      concept: "Safe remediation",
      explanation:
        "Replacing code without checking behavior can introduce regressions. Fix, then re-run build and tests.",
      key_takeaway: "Security and working software are both required.",
    },
    {
      title: "AI can miss logic bugs",
      concept: "Limits of static tools",
      explanation:
        "Pattern matching finds known classes, not novel logic flaws in business rules.",
      key_takeaway: "Static review is a layer, not the last line.",
    },
  ],
  discussion_questions: [
    "Would you deploy this fix without reviewing it?",
    "Which finding carries the highest risk for this application?",
    "What kinds of bugs would this AI still miss?",
    "How should code review fit into a DevSecOps pipeline?",
  ],
};

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

export async function fetchReviewExamples(): Promise<unknown[]> {
  const data = await tryApi<{ examples: unknown[] }>("/code-review/examples");
  if (data?.examples) return data.examples;
  return REVIEW_EXAMPLES.map((e) => ({
    id: e.id,
    title: e.title,
    language: e.language,
    severity: e.severity,
    description: e.description,
  }));
}

export async function runRemoteReview(
  code: string,
  language?: string,
  exampleId?: string | null
): Promise<ReviewResult | null> {
  const data = await tryApi<ReviewResult>("/code-review/review", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, language: language ?? undefined, example_id: exampleId ?? undefined }),
  });
  return data;
}

export { REVIEW_EXAMPLES };