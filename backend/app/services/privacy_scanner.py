"""
AI Data Privacy Lab - privacy scanning engine.

Architecture (ready for future integration):

    Document
      -> PII Detection
      -> Secret Detection
      -> Classification
      -> Policy Engine
      -> Redaction
      -> Safe AI Prompt

Defensive and educational only. Detects simulated data patterns in bundled
scenarios; never connects to real AI services, cloud data, or production APIs.

Future integration points: Microsoft Presidio, OpenAI, Ollama, Azure AI
Content Safety. The ModelProvider class is the seam for those providers.
"""

import os
import json
import re
from typing import Dict, Any, List, Optional, Tuple

# Future integration point: plug in Presidio / OpenAI / Ollama / Azure.
class ModelProvider:
    """Abstraction over AI providers. Currently heuristic/rule-based."""

    def scan(self, document: str) -> str:
        return "Rule-based privacy scan"


DATASETS_DIR = os.path.join(
    os.path.dirname(__file__), "..", "..", "..", "datasets", "privacy"
)

KNOWLEDGE_PATH = os.path.join(
    os.path.dirname(__file__), "..", "..", "..", "knowledge", "privacy",
    "knowledge_base.json",
)

SEVERITY_INDEX = {
    "Critical": 0, "High": 1, "Medium": 2, "Low": 3, "Informational": 4,
}

# ------------------------------------------------------------ detectors

FINDING_META: Dict[str, Dict[str, str]] = {
    "email": {
        "type": "Email Address",
        "severity": "Medium",
        "confidence": "0.95",
        "why_sensitive": "An email address is a direct personal identifier and a link to a person.",
        "attacker_value": "Used for phishing, credential stuffing, and account enumeration.",
        "ai_risk": "The model may repeat or memorize the address, and it is logged by the provider.",
        "protection": "Replace with a synthetic address or aggregate contact data.",
    },
    "phone": {
        "type": "Phone Number",
        "severity": "Medium",
        "confidence": "0.85",
        "why_sensitive": "A phone number can be linked to a person and used for tracking.",
        "attacker_value": "Enables SMS phishing (smishing) and social engineering.",
        "ai_risk": "Contact details are unnecessary for most prompts and may persist in tool history.",
        "protection": "Redact unless the task genuinely requires direct contact.",
    },
    "name": {
        "type": "Personal Name",
        "severity": "High",
        "confidence": "0.8",
        "why_sensitive": "A full name is the anchor that links records to a real person.",
        "attacker_value": "Enables targeted social engineering and identity fraud.",
        "ai_risk": "Names in prompts make the data directly attributable to a person.",
        "protection": "Use synthetic names or de-identified labels in examples.",
    },
    "address": {
        "type": "Address",
        "severity": "High",
        "confidence": "0.9",
        "why_sensitive": "A home or work address reveals where a person lives and works.",
        "attacker_value": "Supports physical threats, doxxing, and impersonation.",
        "ai_risk": "Location data is personal data and is rarely needed for the task.",
        "protection": "Reduce to city or region level, or remove entirely.",
    },
    "credit_card": {
        "type": "Credit Card",
        "severity": "Critical",
        "confidence": "0.97",
        "why_sensitive": "Payment card data is regulated and directly usable for fraud.",
        "attacker_value": "Stolen cards can be used for purchases or sold on dark markets.",
        "ai_risk": "Sending card numbers to a public service violates PCI DSS controls.",
        "protection": "Mask to the last four digits at most; use tokenization.",
    },
    "bank_account": {
        "type": "Bank Account",
        "severity": "Critical",
        "confidence": "0.9",
        "why_sensitive": "Bank account identifiers enable financial fraud if misused.",
        "attacker_value": "Can be used for unauthorized transfers or account takeover.",
        "ai_risk": "Financial identifiers must never cross the boundary to a public model.",
        "protection": "Redact fully and route through approved financial systems.",
    },
    "passport": {
        "type": "Passport Number",
        "severity": "Critical",
        "confidence": "0.7",
        "why_sensitive": "Government-issued identifiers are among the most protected data.",
        "attacker_value": "Enables identity theft and travel document fraud.",
        "ai_risk": "There is no legitimate reason to send a passport number to a chat model.",
        "protection": "Never send externally without a specific legal basis.",
    },
    "customer_id": {
        "type": "Customer ID",
        "severity": "Medium",
        "confidence": "0.85",
        "why_sensitive": "Internal identifiers link activity back to a specific customer record.",
        "attacker_value": "Enables targeted attacks against known customer accounts.",
        "ai_risk": "IDs let the model correlate and reproduce records it should not know.",
        "protection": "Synthesize or hash identifiers before external use.",
    },
    "api_key": {
        "type": "API Key",
        "severity": "Critical",
        "confidence": "0.96",
        "why_sensitive": "A live API key authenticates to a real service under your identity.",
        "attacker_value": "An attacker can use it to abuse the service or steal data.",
        "ai_risk": "Keys pasted to a public model may be echoed back or retained.",
        "protection": "Rotate the key and move secrets to a secrets manager.",
    },
    "password": {
        "type": "Password",
        "severity": "Critical",
        "confidence": "0.9",
        "why_sensitive": "Plain-text passwords grant direct access to accounts and systems.",
        "attacker_value": "Used to log in directly or to re-use against other services.",
        "ai_risk": "Credentials are the most dangerous thing to leak into a prompt.",
        "protection": "Remove immediately and rotate the exposed credential.",
    },
    "access_token": {
        "type": "Access Token",
        "severity": "Critical",
        "confidence": "0.92",
        "why_sensitive": "Tokens grant the bearer the permissions of the issuing account.",
        "attacker_value": "A stolen token is a standing credential that bypasses login.",
        "ai_risk": "Tokens in prompts or logs are a common source of real breaches.",
        "protection": "Rotate the token and enforce short-lived sessions.",
    },
    "certificate": {
        "type": "Private Certificate",
        "severity": "Critical",
        "confidence": "0.98",
        "why_sensitive": "A private key can impersonate the service and decrypt traffic.",
        "attacker_value": "Enables full TLS interception and service impersonation.",
        "ai_risk": "Key material must never leave the trusted environment.",
        "protection": "Remove and reissue the certificate; review who had access.",
    },
    "cloud_key": {
        "type": "Cloud Access Key",
        "severity": "Critical",
        "confidence": "0.96",
        "why_sensitive": "Cloud access keys grant administrative power over infrastructure.",
        "attacker_value": "An exposed key can be used to read or destroy entire environments.",
        "ai_risk": "Cloud keys in prompts are a leading cause of public cloud breaches.",
        "protection": "Rotate immediately and enable cloud key monitoring.",
    },
    "medical": {
        "type": "Medical Information",
        "severity": "Critical",
        "confidence": "0.9",
        "why_sensitive": "Health information is protected by law (HIPAA and similar).",
        "attacker_value": "Health data is highly valuable for insurance fraud and identity theft.",
        "ai_risk": "PHI must never reach a public AI service without approved tooling.",
        "protection": "Use approved clinical AI tools with audit logging only.",
    },
    "salary": {
        "type": "Salary Information",
        "severity": "Critical",
        "confidence": "0.9",
        "why_sensitive": "Compensation is confidential between the employee, manager, and HR.",
        "attacker_value": "Used for social engineering and insider coercion.",
        "ai_risk": "Pay data in prompts can be retained and later disclosed by the tool.",
        "protection": "Keep in approved HR systems; never share externally.",
    },
    "dob": {
        "type": "Date of Birth",
        "severity": "High",
        "confidence": "0.9",
        "why_sensitive": "A date of birth is a stable personal identifier used in verification.",
        "attacker_value": "Combined with other data, it enables identity theft.",
        "ai_risk": "Dates of birth are rarely needed for the task and persist in tool history.",
        "protection": "Remove or replace with a placeholder before external use.",
    },
    "internal_project": {
        "type": "Internal Project Name",
        "severity": "Medium",
        "confidence": "0.7",
        "why_sensitive": "Project codenames reveal strategy and internal roadmaps.",
        "attacker_value": "Helps attackers target high-value initiatives.",
        "ai_risk": "Internal naming conventions leak into model responses.",
        "protection": "Refer to projects with neutral labels outside the company.",
    },
    "internal_system": {
        "type": "Internal System / Account",
        "severity": "High",
        "confidence": "0.75",
        "why_sensitive": "Hostnames, IPs, and account names reveal the internal environment.",
        "attacker_value": "Aids lateral movement and targeted attacks during an incident.",
        "ai_risk": "Infrastructure detail in prompts is intelligence for the adversary.",
        "protection": "Strip identifiers or describe infrastructure generically.",
    },
    "source_code": {
        "type": "Source Code Content",
        "severity": "High",
        "confidence": "0.8",
        "why_sensitive": "Source code is proprietary and may embed internal logic and secrets.",
        "attacker_value": "Code reveals weaknesses, design, and secret patterns.",
        "ai_risk": "A public model may echo code and the secrets inside it.",
        "protection": "Send snippets only through approved, internal tooling.",
    },
}

EMAIL_RE = re.compile(r"[\w.+-]+@[\w-]+\.[A-Za-z]{2,}")
PHONE_RE = re.compile(r"(?:\+?\d{1,2}[\s-]?)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}")
CARD_RE = re.compile(r"\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b")
PASSPORT_RE = re.compile(r"\b[A-Z]{1,2}\d{6,9}\b")
IP_RE = re.compile(r"\b(?:\d{1,3}\.){3}\d{1,3}\b")
HOST_RE = re.compile(r"\b[A-Z]{2,5}-[A-Z0-9]{2,4}-\d{1,3}\b")
ACCOUNT_RE = re.compile(r"\b(?:vp|svc|app|sa)-[a-z0-9]+\b")
API_KEY_RE = re.compile(r"\bsk-(?:live|test)-[A-Za-z0-9]{10,}\b")
AWS_KEY_RE = re.compile(r"\bAKIA[0-9A-Z]{16}\b")
TOKEN_RE = re.compile(r"\bghp_[A-Za-z0-9]{20,}\b")
CERT_RE = re.compile(r"-----BEGIN [A-Z ]*(?:PRIVATE KEY|CERTIFICATE)-----")
PROJECT_RE = re.compile(r"\b[Pp]roject\s+([A-Z]{2,}[A-Za-z]*)\b")

PASSW_RE = re.compile(r"(?i)(?:password|passwd|pwd|secret)\s*[=:]\s*[\"']?([^\s\"',;]+)")
TOKVAL_RE = re.compile(r"(?i)(?:api[_-]?key|access[_-]?token|token|secret[_-]?key|aws[_-]?secret[_-]?access[_-]?key)\s*[=:]\s*[\"']?([^\s\"',;]+)")
NAME_RE = re.compile(
    r"(?i)(?:name|customer|patient|employee|contact|investigator|physician|manager|emergency contact)\s*[:.]\s*"
    r"([A-Z][A-Za-z]+(?: [A-Z][A-Za-z]+){1,3})"
)
ADDR_RE = re.compile(r"(?i)(?:home address|address)\s*[:.]\s*([^\n]+)")
CUSTID_RE = re.compile(
    r"(?i)(?:customer|cust|client|member|employee|emp|mrn|patient|insurance)\s*"
    r"(?:id|no|number|\([^)]*\))?\s*[:=]\s*"
    r"([A-Za-z0-9\-_]*\d[A-Za-z0-9\-_]{2,19})"
)
SALARY_RE = re.compile(r"(?i)(?:salary|base salary|compensation|bonus|equity)\s*[:=]?\s*\$?[\d,]+(?: [A-Za-z/]+)?")
DOB_RE = re.compile(r"(?i)(?:date of birth|dob|birthdate|birth date)\s*[:=]\s*(\d{4}-\d{2}-\d{2})")
MEDICAL_KEYWORDS = re.compile(
    r"(?i)\b(diagnos[a-z]*|icd-10|prescribed|medication|lisinopril|metformin|"
    r"diabetes|hypertension|hba1c|blood panel|mri|osteoarthritis|consult|pharmacy)\b"
)
CODE_RE = re.compile(
    r"^\s*(?:def |class |import |from |const |let |var |func |public |private |"
    r"#include|static |if |elif |else:|return |echo |print\(|SELECT |conn = )",
    re.M,
)


def _span(text: str, match: re.Match) -> Tuple[int, int]:
    return match.start(), match.end()


def _find_all(text: str, pattern: re.Pattern) -> List[Tuple[int, int, str]]:
    out = []
    for m in pattern.finditer(text):
        out.append((m.start(), m.end(), m.group(0).strip()))
    return out


def _detect(document: str) -> List[Dict[str, Any]]:
    findings: List[Dict[str, Any]] = []
    seen: List[Tuple[int, int]] = []

    def add(key: str, start: int, end: int, snippet: str, conf: str):
        # Skip exact duplicate spans (e.g. label regex and value regex both
        # matching the same secret). Do not skip overlapping spans of
        # different types - the redaction step merges those later.
        for (s, e) in seen:
            if s == start and e == end:
                return
        seen.append((start, end))
        meta = FINDING_META[key]
        findings.append({
            "id": f"{key}-{len(findings) + 1}",
            "type": meta["type"],
            "severity": meta["severity"],
            "confidence": conf,
            "start": start,
            "end": end,
            "snippet": snippet[:120],
            "explanation": meta["why_sensitive"],
            "why_sensitive": meta["why_sensitive"],
            "attacker_value": meta["attacker_value"],
            "ai_risk": meta["ai_risk"],
            "protection": meta["protection"],
        })

    # Credit cards first so lower-value matchers do not split them.
    for (s, e, snip) in _find_all(document, CARD_RE):
        add("credit_card", s, e, snip, "0.97")
    for (s, e, snip) in _find_all(document, EMAIL_RE):
        add("email", s, e, snip, "0.95")
    for (s, e, snip) in _find_all(document, PHONE_RE):
        add("phone", s, e, snip, "0.85")
    for (s, e, snip) in _find_all(document, PASSPORT_RE):
        add("passport", s, e, snip, "0.7")
    for (s, e, snip) in _find_all(document, API_KEY_RE):
        add("api_key", s, e, snip, "0.96")
    for (s, e, snip) in _find_all(document, AWS_KEY_RE):
        add("cloud_key", s, e, snip, "0.96")
    for (s, e, snip) in _find_all(document, TOKEN_RE):
        add("access_token", s, e, snip, "0.92")
    for (s, e, snip) in _find_all(document, CERT_RE):
        add("certificate", s, e, snip, "0.98")
    for (s, e, snip) in _find_all(document, PROJECT_RE):
        add("internal_project", s, e, snip, "0.7")
    for (s, e, snip) in _find_all(document, IP_RE):
        add("internal_system", s, e, snip, "0.8")
    for (s, e, snip) in _find_all(document, HOST_RE):
        add("internal_system", s, e, snip, "0.75")
    for (s, e, snip) in _find_all(document, ACCOUNT_RE):
        add("internal_system", s, e, snip, "0.8")

    # Labeled fields: names, addresses, ids, salaries.
    for m in NAME_RE.finditer(document):
        add("name", m.start(), m.end(), m.group(0), "0.8")
    for m in ADDR_RE.finditer(document):
        add("address", m.start(), m.end(), m.group(0), "0.9")
    for m in CUSTID_RE.finditer(document):
        add("customer_id", m.start(), m.end(), m.group(0), "0.85")
    for m in SALARY_RE.finditer(document):
        add("salary", m.start(), m.end(), m.group(0), "0.9")
    for m in DOB_RE.finditer(document):
        add("dob", m.start(), m.end(), m.group(0), "0.9")

    # Secrets by label: password / token values. Skip values that are
    # themselves uppercase identifier constants (e.g. DB_PASSWORD) - those
    # are variable names, not the actual secret.
    def _looks_like_identifier(val: str) -> bool:
        return bool(re.fullmatch(r"[A-Z][A-Z0-9_]{3,}", val))

    for m in PASSW_RE.finditer(document):
        val = m.group(1)
        if val and len(val) >= 4 and not _looks_like_identifier(val) and val.lower() not in ("none", "null", "true", "false"):
            add("password", m.start(1), m.end(1), val, "0.9")
    for m in TOKVAL_RE.finditer(document):
        val = m.group(1)
        if val and len(val) >= 8 and not _looks_like_identifier(val):
            label = m.group(0).upper()
            if "SECRET_ACCESS_KEY" in label or "AWS" in label:
                kind = "cloud_key"
            elif "KEY" in label or "SECRET" in label:
                kind = "api_key"
            else:
                kind = "access_token"
            add(kind, m.start(1), m.end(1), val, "0.92")

    # Medical content: many health keywords in one document.
    med_matches = list(MEDICAL_KEYWORDS.finditer(document))
    if len(med_matches) >= 3:
        first = med_matches[0].start()
        last = med_matches[-1].end()
        add("medical", first, last, document[first:last][:120], "0.9")

    # Source code content.
    code_matches = list(CODE_RE.finditer(document))
    if len(code_matches) >= 3:
        first = code_matches[0].start()
        last = code_matches[-1].end()
        add("source_code", first, last, document[first:last][:120], "0.8")

    findings.sort(key=lambda f: (SEVERITY_INDEX[f["severity"]], f["start"]))
    return findings


# ------------------------------------------------------------ classification

CLASS_LEVELS = [
    {"label": "Public", "impact": "No confidentiality impact if exposed", "handling": "May be shared freely"},
    {"label": "Internal", "impact": "Low to moderate impact if exposed", "handling": "Only within the organization"},
    {"label": "Confidential", "impact": "Significant impact if exposed", "handling": "Approved recipients and tools only"},
    {"label": "Restricted", "impact": "Severe impact if exposed", "handling": "Access on a need-to-know basis"},
    {"label": "Highly Restricted", "impact": "Critical legal or regulatory impact", "handling": "Strict controls, audit required"},
]


def classify(findings: List[Dict[str, Any]]) -> Dict[str, Any]:
    sevs = {f["severity"] for f in findings}
    types = {f["type"] for f in findings}
    label = "Public"
    if "Critical" in sevs:
        label = "Highly Restricted" if ("Medical Information" in types or "Salary Information" in types) else "Restricted"
    elif "High" in sevs:
        label = "Confidential"
    elif "Medium" in sevs:
        label = "Internal"
    level = next((c for c in CLASS_LEVELS if c["label"] == label), CLASS_LEVELS[-1])
    basis = ", ".join(sorted(types)) or "No sensitive patterns detected"
    return {
        "label": label,
        "impact": level["impact"],
        "handling": level["handling"],
        "basis": basis,
    }


# ------------------------------------------------------------ risk

def risk_assessment(findings: List[Dict[str, Any]]) -> Dict[str, Any]:
    crit = sum(1 for f in findings if f["severity"] == "Critical")
    high = sum(1 for f in findings if f["severity"] == "High")
    med = sum(1 for f in findings if f["severity"] == "Medium")
    types = {f["type"] for f in findings}
    bonus = 0
    if "Medical Information" in types:
        bonus += 15
    if types.intersection({"API Key", "Password", "Access Token", "Cloud Access Key", "Private Certificate"}):
        bonus += 10
    if types.intersection({"Credit Card", "Bank Account"}):
        bonus += 6
    score = min(100, 30 + crit * 8 + high * 4 + med * 2 + bonus)
    if score >= 85:
        level = "Critical"
    elif score >= 65:
        level = "High"
    elif score >= 45:
        level = "Medium"
    elif score >= 25:
        level = "Low"
    else:
        level = "Informational"
    return {
        "score": score,
        "level": level,
        "business_impact": "Legal liability, loss of customer trust, and regulatory fines." if crit else
                           "Reputational damage and internal exposure." if high else "Minor internal exposure.",
        "compliance_impact": "GDPR, HIPAA, PCI DSS, or equivalent obligations may apply." if crit else
                             "Possible obligations depending on the data category.",
        "likelihood": "High - sensitive patterns were found in plain text." if findings else "Low - no patterns found.",
        "overall": "Send the document only after redaction and approval." if findings else "Document appears safe to send.",
    }


# ------------------------------------------------------------ policies

POLICIES = [
    {
        "id": "pol-customer-pii",
        "name": "No customer PII to public AI",
        "types": {"Personal Name", "Email Address", "Phone Number", "Address", "Customer ID"},
    },
    {
        "id": "pol-credentials",
        "name": "No credentials or secrets",
        "types": {"API Key", "Password", "Access Token", "Cloud Access Key", "Private Certificate"},
    },
    {
        "id": "pol-financial",
        "name": "No financial records",
        "types": {"Credit Card", "Bank Account"},
    },
    {
        "id": "pol-medical",
        "name": "No medical records",
        "types": {"Medical Information"},
    },
    {
        "id": "pol-source-code",
        "name": "No source code",
        "types": {"Source Code Content"},
    },
    {
        "id": "pol-confidential",
        "name": "No confidential contracts",
        "types": {"Internal Project Name", "Internal System / Account"},
    },
]


def evaluate_policies(findings: List[Dict[str, Any]]) -> List[Dict[str, str]]:
    types = {f["type"] for f in findings}
    out = []
    for p in POLICIES:
        matched = types.intersection(p["types"])
        if matched:
            out.append({
                "id": p["id"],
                "name": p["name"],
                "status": "blocked",
                "reason": f"Found: {', '.join(sorted(matched))}.",
                "recommendation": "Remove these fields or use an approved internal AI tool.",
            })
        else:
            out.append({
                "id": p["id"],
                "name": p["name"],
                "status": "pass",
                "reason": "No matching sensitive data detected.",
                "recommendation": "Keep the policy enforced for all outbound prompts.",
            })
    if findings:
        out.append({
            "id": "pol-least-disclosure",
            "name": "Least disclosure (minimum data)",
            "status": "review",
            "reason": "Sensitive data was present and has been redacted.",
            "recommendation": "Reconsider whether any of the redacted data was needed at all.",
        })
    return out


# ------------------------------------------------------------ redaction

def redact(document: str, findings: List[Dict[str, Any]]) -> Dict[str, Any]:
    spans = sorted(
        [(f["start"], f["end"], f["type"], f["snippet"]) for f in findings],
        key=lambda x: x[0],
    )
    merged: List[Tuple[int, int, str, str]] = []
    for s, e, t, snip in spans:
        if merged and s < merged[-1][1]:
            merged[-1] = (merged[-1][0], max(merged[-1][1], e), merged[-1][2], merged[-1][3])
        else:
            merged.append((s, e, t, snip))

    out = []
    cursor = 0
    explanations = []
    for s, e, t, snip in merged:
        out.append(document[cursor:s])
        out.append("[REDACTED]")
        cursor = e
        explanations.append({
            "type": t,
            "snippet": snip,
            "reason": FINDING_META[next(k for k, v in FINDING_META.items() if v["type"] == t)]["protection"],
        })
    out.append(document[cursor:])
    redacted = "".join(out)
    return {
        "original": document,
        "redacted": redacted,
        "redacted_count": len(merged),
        "explanations": explanations,
    }


# ------------------------------------------------------------ service

class PrivacyScannerService:
    def __init__(self):
        self.provider = ModelProvider()
        self._scenarios: Dict[str, Dict[str, Any]] = {}
        self._knowledge: Dict[str, Any] = {}
        self._load_scenarios()
        self._load_knowledge()

    def _load_scenarios(self):
        if not os.path.exists(DATASETS_DIR):
            return
        for fname in sorted(os.listdir(DATASETS_DIR)):
            if fname.endswith(".json"):
                try:
                    with open(os.path.join(DATASETS_DIR, fname), "r", encoding="utf-8") as f:
                        data = json.load(f)
                    self._scenarios[data["id"]] = data
                except Exception:
                    continue

    def _load_knowledge(self):
        if os.path.exists(KNOWLEDGE_PATH):
            try:
                with open(KNOWLEDGE_PATH, "r", encoding="utf-8") as f:
                    self._knowledge = json.load(f)
            except Exception:
                self._knowledge = {}

    def list_scenarios(self) -> List[Dict[str, str]]:
        return [
            {
                "id": s["id"],
                "title": s["title"],
                "category": s["category"],
                "description": s["description"],
                "risk_level": s["risk_level"],
                "classification": s["classification"],
            }
            for s in self._scenarios.values()
        ]

    def get_scenario(self, scenario_id: str) -> Dict[str, Any]:
        s = self._scenarios.get(scenario_id)
        if not s:
            raise FileNotFoundError(f"Scenario {scenario_id} not found")
        return s

    def scan(self, document: str, scenario_id: Optional[str] = None) -> Dict[str, Any]:
        findings = _detect(document)
        classification = classify(findings)
        risk = risk_assessment(findings)
        policies = evaluate_policies(findings)
        redaction = redact(document, findings)
        safe_prompt = (
            "[De-identified for external AI. Review before sending.]\n\n"
            + redaction["redacted"]
        )
        summary = _summarize(findings, classification)
        return {
            "scenario_id": scenario_id,
            "document": document,
            "findings": findings,
            "classification": classification,
            "risk": risk,
            "policies": policies,
            "redaction": redaction,
            "safe_prompt": safe_prompt,
            "timeline": [
                {"step": 1, "name": "Document loaded", "detail": "Content accepted for inspection."},
                {"step": 2, "name": "Sensitive data detection", "detail": f"{len(findings)} pattern(s) matched PII or secret rules."},
                {"step": 3, "name": "Classification", "detail": f"Document classified as {classification['label']}."},
                {"step": 4, "name": "Policy evaluation", "detail": f"{len([p for p in policies if p['status'] == 'blocked'])} policy block(s)."},
                {"step": 5, "name": "Redaction", "detail": f"{redaction['redacted_count']} segment(s) replaced with [REDACTED]."},
                {"step": 6, "name": "Safe prompt generated", "detail": "De-identified prompt ready for the approved AI tool."},
            ],
            "summary": summary,
            "instructor_context": {
                "teaching_points": [
                    {
                        "title": "Employees leak by accident",
                        "concept": "Human error",
                        "explanation": "Most leaks are not malicious. An employee pastes a document to get help and does not realize how much personal or secret data it carries.",
                        "key_takeaway": "Protection should happen automatically before data reaches the model.",
                    },
                    {
                        "title": "AI is not the problem",
                        "concept": "Controls at the boundary",
                        "explanation": "The model is a tool. The risk is sending sensitive data to a service that is outside the organization's control without safeguards.",
                        "key_takeaway": "AI security includes protecting the data, not only protecting the model.",
                    },
                    {
                        "title": "Redact the minimum",
                        "concept": "Least disclosure",
                        "explanation": "Remove only what the task does not need, so the model still has enough to answer usefully.",
                        "key_takeaway": "The safe prompt must stay useful, or employees will work around the controls.",
                    },
                ],
                "discussion_questions": [
                    "Which information should never reach a public AI service?",
                    "Should source code be uploaded to public LLMs?",
                    "How should organizations balance productivity and privacy?",
                ],
            },
        }

    def ask(self, question: str, scenario_id: Optional[str] = None) -> Dict[str, str]:
        q = question.lower()
        kb = self._knowledge

        if any(k in q for k in ("pii", "personally identif", "sensitive personal")):
            return {"answer": "PII is any data that can identify a person. Sensitive personal information adds categories like health, finance, government IDs, and biometrics. Every category has stricter handling rules before external AI use."}
        if any(k in q for k in ("classif", "public", "confidential", "restricted")):
            return {"answer": "Classify data when it is created. Public, Internal, Confidential, Restricted, and Highly Restricted map to impact and handling. Classification decides which AI tools may process the data."}
        if any(k in q for k in ("secret", "api key", "token", "password", "key")):
            return {"answer": "Secrets are credentials that authenticate to services. Detect, never log, rotate on exposure, and keep them in a secrets manager. Secrets must never appear in a prompt."}
        if any(k in q for k in ("redact", "mask", "anonymiz", "de-identif")):
            return {"answer": "Redaction replaces sensitive spans with placeholders so the task still works. Combined with classification and policies, it produces a safe prompt that a human approves."}
        if any(k in q for k in ("policy", "dlp", "data loss", "blocked")):
            return {"answer": "Data loss prevention scans outbound channels and blocks or warns before sensitive data leaves. Policies encode rules like: no customer PII, no credentials, no source code to public AI."}
        if any(k in q for k in ("why", "risk", "leak", "dangerous")):
            return {"answer": "The risk is not the AI itself. It is sending sensitive data to a service outside your control. Once pasted, data may be logged, retained, or echoed back - without a clear path to deletion."}
        if any(k in q for k in ("prompt", "hygiene", "send", "least disclosure")):
            return {"answer": "Practice prompt hygiene: strip identifiers, use synthetic examples, and share only the minimum that accomplishes the task. Least disclosure keeps prompts both safe and useful."}
        return {"answer": "This lab teaches data protection before the model. Ask about PII, secrets, classification, DLP policies, redaction, or prompt hygiene."}


def _summarize(findings: List[Dict[str, Any]], classification: Dict[str, Any]) -> List[str]:
    if not findings:
        return [
            "No sensitive patterns were detected in this document.",
            "A human should still confirm the content before sending it to an AI service.",
        ]
    top = findings[0]
    return [
        f"{len(findings)} sensitive item(s) detected; highest severity is {top['severity']} ({top['type']}).",
        f"Document is classified as {classification['label']}.",
        "Policy blocks apply - this document must be redacted before any external AI use.",
    ]
