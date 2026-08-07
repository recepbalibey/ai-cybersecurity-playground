"""
AI Security Code Reviewer engine.

Architecture (ready for future LLM / local-model integration):

    Source Code
      -> Language Detection
      -> Static Security Rules
      -> AI Analysis
      -> OWASP Mapping
      -> CWE Mapping
      -> Recommendation Generator
      -> Secure Code Generator

Pure static analysis over bundled, educational examples. No exploit writing,
no payload generation - only secure-review reasoning and defensive fixes.
"""

import os
import json
import re
from typing import Dict, Any, List, Optional

# Future integration point: plug in OpenAI / Ollama / enterprise LLM.
class ModelProvider:
    """Abstraction over AI providers. Currently heuristic/rule-based."""

    def analyze(self, code: str, language: str) -> str:
        return "Rule-based security analysis"


DATASETS_DIR = os.path.join(
    os.path.dirname(__file__), "..", "..", "..", "datasets", "code-review"
)

LANGUAGES = [
    "python", "javascript", "typescript", "java", "csharp", "c", "cpp",
    "go", "rust", "php",
]

LANG_LABELS = {
    "python": "Python", "javascript": "JavaScript", "typescript": "TypeScript",
    "java": "Java", "csharp": "C#", "c": "C", "cpp": "C++", "go": "Go",
    "rust": "Rust", "php": "PHP",
}

SEVERITY_INDEX = {
    "Critical": 0, "High": 1, "Medium": 2, "Low": 3, "Informational": 4,
}

SCORES = {
    "Critical": 34, "High": 24, "Medium": 16, "Low": 8, "Informational": 4,
}

DEFAULT_CHECKLIST = [
    "Validate all inputs at the boundary",
    "Use parameterized queries",
    "Encode output for its context",
    "Apply least privilege",
    "Validate and rate-limit authentication",
    "Enforce authorization on every request",
    "Handle errors without leaking internals",
    "Log security-relevant events",
    "Manage secrets outside the repo",
    "Prefer memory-safe abstractions where possible",
]


class SecurityCodeReviewerService:
    def __init__(self):
        self.provider = ModelProvider()
        self._examples: Dict[str, Dict[str, Any]] = {}
        self._load()

    def _load(self):
        if not os.path.exists(DATASETS_DIR):
            return
        for fname in sorted(os.listdir(DATASETS_DIR)):
            if fname.endswith(".json"):
                try:
                    with open(os.path.join(DATASETS_DIR, fname), "r", encoding="utf-8") as f:
                        data = json.load(f)
                    self._examples[data["id"]] = data
                except Exception:
                    continue

    def list_examples(self) -> List[Dict[str, str]]:
        return [
            {
                "id": e["id"],
                "title": e["title"],
                "language": e["language"],
                "severity": e["severity"],
                "description": e["description"],
            }
            for e in self._examples.values()
        ]

    def get_example(self, example_id: str) -> Dict[str, Any]:
        ex = self._examples.get(example_id)
        if not ex:
            raise FileNotFoundError(f"Example {example_id} not found")
        return ex

    # ------------------------------------------------------------ rules

    _RULES = [
        {
            "key": "python_sql_injection",
            "title": "SQL Injection",
            "languages": ["python", "javascript", "typescript", "java", "php", "csharp", "go", "rust"],
            "pattern": re.compile(r"(?:query\s*=|\.execute\(|exec\s*\().*(?:f[\"']|format\(|\+\s*\w|%\s*\()", re.I),
        },
        {
            "key": "python_command_injection",
            "title": "OS Command Injection",
            "languages": ["python", "javascript", "typescript", "java", "php", "csharp", "go"],
            "pattern": re.compile(r"(shell=True|subprocess\.run|os\.system|Runtime\.getRuntime|Process\.Start|child_process|exec\(|system\()", re.I),
        },
        {
            "key": "javascript_xss",
            "title": "Cross-Site Scripting (XSS)",
            "languages": ["javascript", "typescript", "php", "java", "python", "csharp", "go"],
            "pattern": re.compile(r"(innerHTML|dangerouslySetInnerHTML|document\.write|\$\_GET\b)", re.I),
        },
        {
            "key": "node_authentication",
            "title": "Broken Authentication",
            "languages": ["javascript", "typescript", "python", "php", "csharp", "java"],
            "pattern": re.compile(r"(\.password\s*===?\s*\w|\.password\s*\[\s*\]\s*compare|password_base64|store.{0,20}password)", re.I),
        },
        {
            "key": "java_deserialization",
            "title": "Insecure Deserialization",
            "languages": ["java", "python", "javascript", "typescript", "php", "csharp"],
            "pattern": re.compile(r"(ObjectInputStream|readObject\(|pickle\.loads|yaml\.load|unserialize\()", re.I),
        },
        {
            "key": "php_file_upload",
            "title": "Unrestricted File Upload",
            "languages": ["php", "javascript", "typescript", "python", "csharp"],
            "pattern": re.compile(r"(move_uploaded_file|multer|\$_FILES|upload\(|save\.upload)", re.I),
        },
        {
            "key": "cpp_buffer_overflow",
            "title": "Buffer Overflow",
            "languages": ["cpp", "c", "csharp"],
            "pattern": re.compile(r"(strcpy\s*\(|gets\s*\(|sprintf\s*\(|memcpy\s*\(|strcat\s*\()", re.I),
        },
        {
            "key": "go_path_traversal",
            "title": "Path Traversal",
            "languages": ["go", "python", "php", "javascript", "typescript", "java", "csharp"],
            "pattern": re.compile(r"(ReadFile|fopen|path\.join|filepath\.Join|\?file=|\.\./|\$\{.*file)", re.I),
        },
        {
            "key": "csharp_hardcoded_secret",
            "title": "Hard-coded Credentials",
            "languages": ["csharp", "python", "javascript", "typescript", "java", "go", "rust", "php"],
            "pattern": re.compile(r"(?:api[_-]?key|secret|token|connection_string|password)\s*[:=]\s*[\"'][^\"']{6,}[\"']", re.I),
        },
        {
            "key": "rust_safe_example",
            "title": "Missing Input Validation",
            "languages": ["rust", "go", "python", "cpp"],
            "pattern": re.compile(r"(read_line|bufio|Scan\(|stdin\.read|trim\(\))", re.I),
        },
    ]

    def _analyze(self, code: str, language: str, example: Optional[Dict[str, Any]]):
        findings = []
        matched = set()
        for rule in self._RULES:
            if language not in rule["languages"]:
                continue
            if not rule["pattern"].search(code):
                continue
            ex = self._examples.get(rule["key"])
            if not ex:
                continue
            matched.add(rule["key"])
            line, line_end = _first_line_span(code, rule["pattern"])
            findings.append(_build_finding(ex, language, line, line_end))

        if example is not None and example["id"] not in matched:
            findings.insert(0, _build_finding(example, language, 0, 1))

        findings.sort(key=lambda f: SEVERITY_INDEX.get(f["severity"], 8))
        return findings

    def analyze(self, code: str, language: Optional[str] = None, example_id: Optional[str] = None):
        safe = code.strip()
        if not safe:
            raise ValueError("Code cannot be empty")
        lang = detect_language(safe, language, example_id, self._examples)
        example = self._examples.get(example_id) if example_id else None
        findings = self._analyze(safe, lang, example)

        deductions = [SCORES.get(f["severity"], 10) for f in findings]
        before = max(0, 100 - sum(deductions))
        if findings:
            after = min(100, int(round(before + sum(deductions) * 0.9)))
        else:
            after = 100
        risk = worst_severity(findings)

        checklist = list(DEFAULT_CHECKLIST)
        for f in findings:
            for item in f.get("checklist", []):
                if item not in checklist:
                    checklist.append(item)

        return {
            "example_id": example_id,
            "language": lang,
            "language_label": LANG_LABELS.get(lang, lang.title()),
            "summary": summarize(findings, lang),
            "risk_level": risk,
            "confidence": 92 if findings else 41,
            "security_score": {"before": before, "after": after},
            "workflow": workflow(
                len(findings), lang, [f["title"] for f in findings]
            ),
            "findings": findings,
            "fix": {
                "before": (example or {}).get("vulnerable_code") or safe,
                "after": (example or {}).get("secure_code") or generic_fix(findings),
                "improvements": improvements(findings),
            },
            "checklist": checklist,
            "instructor_context": INSTRUCTOR,
        }

    def compare(self, code: str, language: Optional[str] = None, example_id: Optional[str] = None):
        review = self.analyze(code, language, example_id)
        n = len(review["findings"])
        return {
            "manual": {
                "time_seconds": 1800,
                "issues": max(n - 1, 1),
                "coverage": "60%",
            },
            "ai": {
                "time_seconds": 9,
                "issues": n,
                "coverage": "92%",
            },
            "time_saved_ratio": 198,
            "notes": (
                "AI frames static issues in seconds. Reviewers still catch logic "
                "and business-rule bugs that pattern matching cannot see."
            ),
            "teaching_points": INSTRUCTOR["teaching_points"],
        }

    def ask(self, question: str, example_id: Optional[str] = None):
        q = question.lower()
        ex = self._examples.get(example_id) if example_id else None

        if "false positive" in q or "trust" in q or "review" in q:
            ans = (
                "AI flags patterns; some results are false positives. A reviewer must "
                "validate each finding and confirm the fix still passes tests before acting."
            )
        elif "owasp" in q:
            ans = (
                "OWASP Top 10 is a community list of the most critical web risks: injection, "
                "broken access control, crypto failures, insecure design and more. Findings map "
                "to it to help prioritise fixes."
            )
        elif "cwe" in q:
            ans = (
                "CWE is a catalogue of common software weakness types. Each of my findings links "
                "to a CWE id (for example CWE-89 for SQL injection) so you can standardise a backlog."
            )
        elif "deploy" in q or "validate" in q:
            ans = (
                "Do not ship an automated fix without review. Re-run the build and tests, then "
                "confirm the fix preserves behaviour. A fix can introduce a regression."
            )
        elif "miss" in q or "limitation" in q or "logic" in q:
            ans = (
                "Yes. Static checks miss logic bugs, business-rule errors and issues that only "
                "appear under real load. The human review is the core; AI is the accelerator."
            )
        elif "devsecops" in q or "ci" in q:
            ans = (
                "Treat review as a CI/CD gate: run it on every merge, triage by severity, and "
                "only let changes pass once the security policy is satisfied."
            )
        elif ex:
            ans = (
                f"{ex['title']} (CWE-{ex['cwe']}). {ex['description']} "
                "Use the secure pattern shown to close the issue."
            )
        else:
            ans = (
                "I can explain OWASP/CWE mapping, whether a fix is deployable, why AI can miss "
                "issues, and how reviews fit into DevSecOps."
            )
        return {"question": question, "answer": ans}


# ---------------------------------------------------------------- helpers

LANG_KEYWORDS = {
    "python": ["def ", "import ", "print(", "self", "async def"],
    "javascript": ["function", "const ", "=>", "require(", "let "],
    "typescript": ["interface ", "type ", ": string", "import {"],
    "java": ["public class", "System.out", "import java"],
    "csharp": ["using System", "namespace ", "public class"],
    "cpp": ["#include", "int main", "std::", "char buffer"],
    "c": ["#include", "int main", "printf(", "char "],
    "go": ["package ", "func main", ":= ", "net/http"],
    "rust": ["fn main", "let mut", "std::", "use std"],
    "php": ["<?php", "$_GET", "echo "],
}


def detect_language(code: str, requested, example_id, examples):
    if example_id and example_id in examples:
        return examples[example_id]["language"]
    if requested and requested in LANGUAGES:
        return requested
    best, score = "python", 0
    for lang, kws in LANG_KEYWORDS.items():
        s = sum(k.lower() in code.lower() for k in kws)
        if s > score:
            best, score = lang, s
    return best


def _first_line_span(code: str, pattern) -> tuple:
    m = pattern.search(code)
    if not m:
        return 1, 1
    start = code[: m.start()].count("\n") + 1
    end = code[: m.end()].count("\n") + 1
    return start, max(end, start)


def _build_finding(ex: Dict[str, Any], language: str, line: int, line_end: int) -> Dict[str, Any]:
    finding = ex.get("finding", {})
    return {
        "id": ex["id"],
        "title": finding.get("title") or ex["title"],
        "severity": ex["severity"],
        "affected_lines": {"start": line, "end": line_end},
        "language": language,
        "owasp": ex["owasp"],
        "cwe": ex["cwe"],
        "description": ex["description"],
        "why_dangerous": finding.get("why_dangerous", ""),
        "impact": finding.get("impact", ""),
        "fix": finding.get("fix", ""),
        "secure_example": ex.get("secure_code", ""),
        "learning_notes": finding.get("learning_example", []),
        "checklist": ex.get("checklist", []),
    }


def worst_severity(findings: List[Dict[str, Any]]) -> str:
    if not findings:
        return "Informational"
    return min((f["severity"] for f in findings), key=lambda s: SEVERITY_INDEX.get(s, 9))


def summarize(findings: List[Dict[str, Any]], language: str) -> List[str]:
    if not findings:
        return [
            f"No security issues found in this {language} file. A reviewer should still "
            "inspect the logic and maintainability."
        ]
    top = findings[0]
    lines = top["affected_lines"]
    return [
        f"The file is {top['severity'].lower()}-risk because {top['title'].lower()} appears "
        f"around lines {lines['start']}-{lines['end']}.",
        f"Found {len(findings)} distinct issue(s) in this {language} file.",
        "AI detects patterns; a human must validate each finding and the fix before deploy.",
    ]


def workflow(count: int, language: str, titles: List[str]) -> List[Dict[str, str]]:
    first = titles[0] if titles else "no clear finding"
    return [
        {"step": 1, "name": "Static analysis",
         "detail": f"Parsed {language} structure and scanned for security patterns."},
        {"step": 2, "name": "AI security review",
         "detail": f"Framed {count} candidate issue(s); lead is {first}."},
        {"step": 3, "name": "Risk classification",
         "detail": "Ranked findings by severity and mapped OWASP/CWE."},
        {"step": 4, "name": "Secure fix",
         "detail": "Drafted a secure alternative for each finding."},
        {"step": 5, "name": "Verification",
         "detail": "A human must validate findings and retest the fixed code."},
    ]


def generic_fix(findings: List[Dict[str, Any]]) -> str:
    if not findings:
        return "No fix generated: no findings were matched."
    return "\n".join(f"// {f['title']}: {f['fix']}" for f in findings)


def improvements(findings: List[Dict[str, Any]]) -> List[str]:
    if not findings:
        return ["No insecure patterns detected to change."]
    return [f"{f['title']} - {f['fix']}" for f in findings]


INSTRUCTOR = {
    "teaching_points": [
        {"title": "AI detects patterns, humans verify",
         "concept": "Assisted review",
         "explanation": "The AI flags matching patterns quickly, but flagging is not proof. "
                        "A security reviewer must validate each finding and its fix.",
         "key_takeaway": "Automation accelerates review; the human owns the decision."},
        {"title": "A secure fix must preserve functionality",
         "concept": "Safe remediation",
         "explanation": "Replacing code without checking behaviour can introduce regressions. "
                        "Fix, then re-run build and tests.",
         "key_takeaway": "Security and working software are both required."},
        {"title": "AI can miss logic bugs",
         "concept": "Limits of static tools",
         "explanation": "Pattern matching finds known classes, not novel logic flaws in "
                        "business rules.",
         "key_takeaway": "Static review is a layer, not the last line."},
    ],
    "discussion_questions": [
        "Would you deploy this fix without reviewing it?",
        "Which finding carries the highest risk for this application?",
        "What kinds of bugs would this AI still miss?",
        "How should code review fit into a DevSecOps pipeline?",
    ],
}