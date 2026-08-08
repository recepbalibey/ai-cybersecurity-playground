// privacyScanner.ts
// AI Data Privacy Lab - client engine.
//
// Architecture (ready for future LLM / local-model integration):
//    Document -> PII Detection -> Secret Detection -> Classification
//    -> Policy Engine -> Redaction -> Safe AI Prompt
//
// Defensive and educational: scans simulated documents for sensitive
// patterns. Never connects to real AI services, cloud data, or production
// APIs. Falls back to the local deterministic engine when the backend is
// offline.
//
// Future integration points: Microsoft Presidio, OpenAI, Ollama, Azure AI
// Content Safety.

import { PRIVACY_SCENARIOS, type ClassificationLabel } from "../data/privacy";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// ------------------------------------------------------------ types

export type PrivacySeverity = "Critical" | "High" | "Medium" | "Low" | "Informational";
export type PolicyStatus = "blocked" | "pass" | "review";

export interface PrivacyFinding {
  id: string;
  type: string;
  severity: PrivacySeverity;
  confidence: string;
  start: number;
  end: number;
  snippet: string;
  explanation: string;
  why_sensitive: string;
  attacker_value: string;
  ai_risk: string;
  protection: string;
}

export interface ClassificationResult {
  label: ClassificationLabel;
  impact: string;
  handling: string;
  basis: string;
}

export interface RiskResult {
  score: number;
  level: PrivacySeverity;
  business_impact: string;
  compliance_impact: string;
  likelihood: string;
  overall: string;
}

export interface PolicyResult {
  id: string;
  name: string;
  status: PolicyStatus;
  reason: string;
  recommendation: string;
}

export interface RedactionExplanation {
  type: string;
  snippet: string;
  reason: string;
}

export interface RedactionResult {
  original: string;
  redacted: string;
  redacted_count: number;
  explanations: RedactionExplanation[];
}

export interface TimelineStage {
  step: number;
  name: string;
  detail: string;
}

export interface InstructorContext {
  teaching_points: { title: string; concept: string; explanation: string; key_takeaway: string }[];
  discussion_questions: string[];
}

export interface PrivacyScanResult {
  scenario_id: string | null;
  document: string;
  findings: PrivacyFinding[];
  classification: ClassificationResult;
  risk: RiskResult;
  policies: PolicyResult[];
  redaction: RedactionResult;
  safe_prompt: string;
  timeline: TimelineStage[];
  summary: string[];
  instructor_context: InstructorContext;
}

// ------------------------------------------------------------ metadata

interface FindingMeta {
  type: string;
  severity: PrivacySeverity;
  confidence: string;
  why_sensitive: string;
  attacker_value: string;
  ai_risk: string;
  protection: string;
}

const FINDING_META: Record<string, FindingMeta> = {
  email: {
    type: "Email Address", severity: "Medium", confidence: "0.95",
    why_sensitive: "An email address is a direct personal identifier and a link to a person.",
    attacker_value: "Used for phishing, credential stuffing, and account enumeration.",
    ai_risk: "The model may repeat or memorize the address, and it is logged by the provider.",
    protection: "Replace with a synthetic address or aggregate contact data.",
  },
  phone: {
    type: "Phone Number", severity: "Medium", confidence: "0.85",
    why_sensitive: "A phone number can be linked to a person and used for tracking.",
    attacker_value: "Enables SMS phishing (smishing) and social engineering.",
    ai_risk: "Contact details are unnecessary for most prompts and may persist in tool history.",
    protection: "Redact unless the task genuinely requires direct contact.",
  },
  name: {
    type: "Personal Name", severity: "High", confidence: "0.8",
    why_sensitive: "A full name is the anchor that links records to a real person.",
    attacker_value: "Enables targeted social engineering and identity fraud.",
    ai_risk: "Names in prompts make the data directly attributable to a person.",
    protection: "Use synthetic names or de-identified labels in examples.",
  },
  address: {
    type: "Address", severity: "High", confidence: "0.9",
    why_sensitive: "A home or work address reveals where a person lives and works.",
    attacker_value: "Supports physical threats, doxxing, and impersonation.",
    ai_risk: "Location data is personal data and is rarely needed for the task.",
    protection: "Reduce to city or region level, or remove entirely.",
  },
  credit_card: {
    type: "Credit Card", severity: "Critical", confidence: "0.97",
    why_sensitive: "Payment card data is regulated and directly usable for fraud.",
    attacker_value: "Stolen cards can be used for purchases or sold on dark markets.",
    ai_risk: "Sending card numbers to a public service violates PCI DSS controls.",
    protection: "Mask to the last four digits at most; use tokenization.",
  },
  bank_account: {
    type: "Bank Account", severity: "Critical", confidence: "0.9",
    why_sensitive: "Bank account identifiers enable financial fraud if misused.",
    attacker_value: "Can be used for unauthorized transfers or account takeover.",
    ai_risk: "Financial identifiers must never cross the boundary to a public model.",
    protection: "Redact fully and route through approved financial systems.",
  },
  passport: {
    type: "Passport Number", severity: "Critical", confidence: "0.7",
    why_sensitive: "Government-issued identifiers are among the most protected data.",
    attacker_value: "Enables identity theft and travel document fraud.",
    ai_risk: "There is no legitimate reason to send a passport number to a chat model.",
    protection: "Never send externally without a specific legal basis.",
  },
  customer_id: {
    type: "Customer ID", severity: "Medium", confidence: "0.85",
    why_sensitive: "Internal identifiers link activity back to a specific customer record.",
    attacker_value: "Enables targeted attacks against known customer accounts.",
    ai_risk: "IDs let the model correlate and reproduce records it should not know.",
    protection: "Synthesize or hash identifiers before external use.",
  },
  api_key: {
    type: "API Key", severity: "Critical", confidence: "0.96",
    why_sensitive: "A live API key authenticates to a real service under your identity.",
    attacker_value: "An attacker can use it to abuse the service or steal data.",
    ai_risk: "Keys pasted to a public model may be echoed back or retained.",
    protection: "Rotate the key and move secrets to a secrets manager.",
  },
  password: {
    type: "Password", severity: "Critical", confidence: "0.9",
    why_sensitive: "Plain-text passwords grant direct access to accounts and systems.",
    attacker_value: "Used to log in directly or to re-use against other services.",
    ai_risk: "Credentials are the most dangerous thing to leak into a prompt.",
    protection: "Remove immediately and rotate the exposed credential.",
  },
  access_token: {
    type: "Access Token", severity: "Critical", confidence: "0.92",
    why_sensitive: "Tokens grant the bearer the permissions of the issuing account.",
    attacker_value: "A stolen token is a standing credential that bypasses login.",
    ai_risk: "Tokens in prompts or logs are a common source of real breaches.",
    protection: "Rotate the token and enforce short-lived sessions.",
  },
  certificate: {
    type: "Private Certificate", severity: "Critical", confidence: "0.98",
    why_sensitive: "A private key can impersonate the service and decrypt traffic.",
    attacker_value: "Enables full TLS interception and service impersonation.",
    ai_risk: "Key material must never leave the trusted environment.",
    protection: "Remove and reissue the certificate; review who had access.",
  },
  cloud_key: {
    type: "Cloud Access Key", severity: "Critical", confidence: "0.96",
    why_sensitive: "Cloud access keys grant administrative power over infrastructure.",
    attacker_value: "An exposed key can be used to read or destroy entire environments.",
    ai_risk: "Cloud keys in prompts are a leading cause of public cloud breaches.",
    protection: "Rotate immediately and enable cloud key monitoring.",
  },
  medical: {
    type: "Medical Information", severity: "Critical", confidence: "0.9",
    why_sensitive: "Health information is protected by law (HIPAA and similar).",
    attacker_value: "Health data is highly valuable for insurance fraud and identity theft.",
    ai_risk: "PHI must never reach a public AI service without approved tooling.",
    protection: "Use approved clinical AI tools with audit logging only.",
  },
  salary: {
    type: "Salary Information", severity: "Critical", confidence: "0.9",
    why_sensitive: "Compensation is confidential between the employee, manager, and HR.",
    attacker_value: "Used for social engineering and insider coercion.",
    ai_risk: "Pay data in prompts can be retained and later disclosed by the tool.",
    protection: "Keep in approved HR systems; never share externally.",
  },
  dob: {
    type: "Date of Birth", severity: "High", confidence: "0.9",
    why_sensitive: "A date of birth is a stable personal identifier used in verification.",
    attacker_value: "Combined with other data, it enables identity theft.",
    ai_risk: "Dates of birth are rarely needed for the task and persist in tool history.",
    protection: "Remove or replace with a placeholder before external use.",
  },
  internal_project: {
    type: "Internal Project Name", severity: "Medium", confidence: "0.7",
    why_sensitive: "Project codenames reveal strategy and internal roadmaps.",
    attacker_value: "Helps attackers target high-value initiatives.",
    ai_risk: "Internal naming conventions leak into model responses.",
    protection: "Refer to projects with neutral labels outside the company.",
  },
  internal_system: {
    type: "Internal System / Account", severity: "High", confidence: "0.75",
    why_sensitive: "Hostnames, IPs, and account names reveal the internal environment.",
    attacker_value: "Aids lateral movement and targeted attacks during an incident.",
    ai_risk: "Infrastructure detail in prompts is intelligence for the adversary.",
    protection: "Strip identifiers or describe infrastructure generically.",
  },
  source_code: {
    type: "Source Code Content", severity: "High", confidence: "0.8",
    why_sensitive: "Source code is proprietary and may embed internal logic and secrets.",
    attacker_value: "Code reveals weaknesses, design, and secret patterns.",
    ai_risk: "A public model may echo code and the secrets inside it.",
    protection: "Send snippets only through approved, internal tooling.",
  },
};

// ------------------------------------------------------------ detectors

const EMAIL_RE = /[\w.+-]+@[\w-]+\.[A-Za-z]{2,}/g;
const PHONE_RE = /(?:\+?\d{1,2}[\s-]?)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}/g;
const CARD_RE = /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g;
const PASSPORT_RE = /\b[A-Z]{1,2}\d{6,9}\b/g;
const IP_RE = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;
const HOST_RE = /\b[A-Z]{2,5}-[A-Z0-9]{2,4}-\d{1,3}\b/g;
const ACCOUNT_RE = /\b(?:vp|svc|app|sa)-[a-z0-9]+\b/g;
const API_KEY_RE = /\bsk-(?:live|test)-[A-Za-z0-9]{10,}\b/g;
const AWS_KEY_RE = /\bAKIA[0-9A-Z]{16}\b/g;
const TOKEN_RE = /\bghp_[A-Za-z0-9]{20,}\b/g;
const CERT_RE = /-----BEGIN [A-Z ]*(?:PRIVATE KEY|CERTIFICATE)-----/g;
const PROJECT_RE = /\b[Pp]roject\s+([A-Z]{2,}[A-Za-z]*)\b/g;
const PASSW_RE = /(?:password|passwd|pwd|secret)\s*[=:]\s*["']?([^\s"',;]+)/gi;
const TOKVAL_RE =
  /(?:api[_-]?key|access[_-]?token|token|secret[_-]?key|aws[_-]?secret[_-]?access[_-]?key)\s*[=:]\s*["']?([^\s"',;]+)/gi;
const NAME_RE =
  /(?:name|customer|patient|employee|contact|investigator|physician|manager|emergency contact)\s*[:.]\s*([A-Z][A-Za-z]+(?: [A-Z][A-Za-z]+){1,3})/gi;
const ADDR_RE = /(?:home address|address)\s*[:.]\s*([^\n]+)/gi;
const CUSTID_RE =
  /(?:customer|cust|client|member|employee|emp|mrn|patient|insurance)\s*(?:id|no|number|\([^)]*\))?\s*[:=]\s*([A-Za-z0-9\-_]*\d[A-Za-z0-9\-_]{2,19})/gi;
const SALARY_RE = /(?:salary|base salary|compensation|bonus|equity)\s*[:=]?\s*\$?[\d,]+(?: [A-Za-z/]+)?/gi;
const DOB_RE = /(?:date of birth|dob|birthdate|birth date)\s*[:=]\s*(\d{4}-\d{2}-\d{2})/gi;
const MEDICAL_RE =
  /\b(diagnos[a-z]*|icd-10|prescribed|medication|lisinopril|metformin|diabetes|hypertension|hba1c|blood panel|mri|osteoarthritis|consult|pharmacy)\b/gi;
const CODE_RE =
  /^\s*(?:def |class |import |from |const |let |var |func |public |private |#include|static |if |elif |else:|return |echo |print\(|SELECT |conn = )/gim;

function findRanges(text: string, re: RegExp): { start: number; end: number; text: string }[] {
  const out: { start: number; end: number; text: string }[] = [];
  re.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    out.push({ start: m.index, end: m.index + m[0].length, text: m[0].trim() });
    if (m[0].length === 0) re.lastIndex++;
  }
  re.lastIndex = 0;
  return out;
}

function looksLikeIdentifier(val: string): boolean {
  return /^[A-Z][A-Z0-9_]{3,}$/.test(val);
}

export function detectPrivacyFindings(document: string): PrivacyFinding[] {
  const findings: PrivacyFinding[] = [];
  const seen: { start: number; end: number }[] = [];
  let counter = 0;

  function add(key: string, start: number, end: number, snippet: string, conf: string) {
    for (const s of seen) {
      if (s.start === start && s.end === end) return;
    }
    seen.push({ start, end });
    const meta = FINDING_META[key];
    findings.push({
      id: `${key}-${++counter}`,
      type: meta.type,
      severity: meta.severity,
      confidence: conf,
      start,
      end,
      snippet: snippet.slice(0, 120),
      explanation: meta.why_sensitive,
      why_sensitive: meta.why_sensitive,
      attacker_value: meta.attacker_value,
      ai_risk: meta.ai_risk,
      protection: meta.protection,
    });
  }

  for (const r of findRanges(document, CARD_RE)) add("credit_card", r.start, r.end, r.text, "0.97");
  for (const r of findRanges(document, EMAIL_RE)) add("email", r.start, r.end, r.text, "0.95");
  for (const r of findRanges(document, PHONE_RE)) add("phone", r.start, r.end, r.text, "0.85");
  for (const r of findRanges(document, PASSPORT_RE)) add("passport", r.start, r.end, r.text, "0.7");
  for (const r of findRanges(document, API_KEY_RE)) add("api_key", r.start, r.end, r.text, "0.96");
  for (const r of findRanges(document, AWS_KEY_RE)) add("cloud_key", r.start, r.end, r.text, "0.96");
  for (const r of findRanges(document, TOKEN_RE)) add("access_token", r.start, r.end, r.text, "0.92");
  for (const r of findRanges(document, CERT_RE)) add("certificate", r.start, r.end, r.text, "0.98");
  for (const r of findRanges(document, PROJECT_RE)) add("internal_project", r.start, r.end, r.text, "0.7");
  for (const r of findRanges(document, IP_RE)) add("internal_system", r.start, r.end, r.text, "0.8");
  for (const r of findRanges(document, HOST_RE)) add("internal_system", r.start, r.end, r.text, "0.75");
  for (const r of findRanges(document, ACCOUNT_RE)) add("internal_system", r.start, r.end, r.text, "0.8");

  NAME_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = NAME_RE.exec(document)) !== null) add("name", m.index, m.index + m[0].length, m[0], "0.8");
  NAME_RE.lastIndex = 0;
  ADDR_RE.lastIndex = 0;
  while ((m = ADDR_RE.exec(document)) !== null) add("address", m.index, m.index + m[0].length, m[0], "0.9");
  ADDR_RE.lastIndex = 0;
  CUSTID_RE.lastIndex = 0;
  while ((m = CUSTID_RE.exec(document)) !== null) add("customer_id", m.index, m.index + m[0].length, m[0], "0.85");
  CUSTID_RE.lastIndex = 0;
  SALARY_RE.lastIndex = 0;
  while ((m = SALARY_RE.exec(document)) !== null) add("salary", m.index, m.index + m[0].length, m[0], "0.9");
  SALARY_RE.lastIndex = 0;
  DOB_RE.lastIndex = 0;
  while ((m = DOB_RE.exec(document)) !== null) add("dob", m.index, m.index + m[0].length, m[0], "0.9");
  DOB_RE.lastIndex = 0;

  PASSW_RE.lastIndex = 0;
  while ((m = PASSW_RE.exec(document)) !== null) {
    const val = m[1];
    if (val && val.length >= 4 && !looksLikeIdentifier(val) && !["none", "null", "true", "false"].includes(val.toLowerCase())) {
      add("password", m.index + m[0].indexOf(val), m.index + m[0].indexOf(val) + val.length, val, "0.9");
    }
  }
  PASSW_RE.lastIndex = 0;
  TOKVAL_RE.lastIndex = 0;
  while ((m = TOKVAL_RE.exec(document)) !== null) {
    const val = m[1];
    if (val && val.length >= 8 && !looksLikeIdentifier(val)) {
      const label = m[0].toUpperCase();
      const kind = label.includes("SECRET_ACCESS_KEY") || label.includes("AWS") ? "cloud_key" : label.includes("KEY") || label.includes("SECRET") ? "api_key" : "access_token";
      add(kind, m.index + m[0].indexOf(val), m.index + m[0].indexOf(val) + val.length, val, "0.92");
    }
  }
  TOKVAL_RE.lastIndex = 0;

  const medMatches = findRanges(document, MEDICAL_RE);
  if (medMatches.length >= 3) {
    const first = medMatches[0].start;
    const last = medMatches[medMatches.length - 1].end;
    add("medical", first, last, document.slice(first, last), "0.9");
  }

  const codeMatches = findRanges(document, CODE_RE);
  if (codeMatches.length >= 3) {
    const first = codeMatches[0].start;
    const last = codeMatches[codeMatches.length - 1].end;
    add("source_code", first, last, document.slice(first, last), "0.8");
  }

  const order: Record<PrivacySeverity, number> = { Critical: 0, High: 1, Medium: 2, Low: 3, Informational: 4 };
  findings.sort((a, b) => order[a.severity] - order[b.severity] || a.start - b.start);
  return findings;
}

// ------------------------------------------------------------ classification

const CLASS_LEVELS: ClassificationResult[] = [
  { label: "Public", impact: "No confidentiality impact if exposed", handling: "May be shared freely", basis: "" },
  { label: "Internal", impact: "Low to moderate impact if exposed", handling: "Only within the organization", basis: "" },
  { label: "Confidential", impact: "Significant impact if exposed", handling: "Approved recipients and tools only", basis: "" },
  { label: "Restricted", impact: "Severe impact if exposed", handling: "Access on a need-to-know basis", basis: "" },
  { label: "Highly Restricted", impact: "Critical legal or regulatory impact", handling: "Strict controls, audit required", basis: "" },
];

export function classifyDocument(findings: PrivacyFinding[]): ClassificationResult {
  const sevs = new Set(findings.map((f) => f.severity));
  const types = new Set(findings.map((f) => f.type));
  let label: ClassificationLabel = "Public";
  if (sevs.has("Critical")) {
    label = types.has("Medical Information") || types.has("Salary Information") ? "Highly Restricted" : "Restricted";
  } else if (sevs.has("High")) {
    label = "Confidential";
  } else if (sevs.has("Medium")) {
    label = "Internal";
  }
  const level = CLASS_LEVELS.find((c) => c.label === label) ?? CLASS_LEVELS[CLASS_LEVELS.length - 1];
  const basis = Array.from(types).sort().join(", ") || "No sensitive patterns detected";
  return { ...level, basis };
}

// ------------------------------------------------------------ risk

export function assessRisk(findings: PrivacyFinding[]): RiskResult {
  const crit = findings.filter((f) => f.severity === "Critical").length;
  const high = findings.filter((f) => f.severity === "High").length;
  const med = findings.filter((f) => f.severity === "Medium").length;
  const types = new Set(findings.map((f) => f.type));
  let bonus = 0;
  if (types.has("Medical Information")) bonus += 15;
  if (["API Key", "Password", "Access Token", "Cloud Access Key", "Private Certificate"].some((t) => types.has(t))) bonus += 10;
  if (["Credit Card", "Bank Account"].some((t) => types.has(t))) bonus += 6;
  const score = Math.min(100, 30 + crit * 8 + high * 4 + med * 2 + bonus);
  const level: PrivacySeverity =
    score >= 85 ? "Critical" : score >= 65 ? "High" : score >= 45 ? "Medium" : score >= 25 ? "Low" : "Informational";
  return {
    score,
    level,
    business_impact:
      crit > 0
        ? "Legal liability, loss of customer trust, and regulatory fines."
        : high > 0
          ? "Reputational damage and internal exposure."
          : "Minor internal exposure.",
    compliance_impact: crit > 0 ? "GDPR, HIPAA, PCI DSS, or equivalent obligations may apply." : "Possible obligations depending on the data category.",
    likelihood: findings.length > 0 ? "High - sensitive patterns were found in plain text." : "Low - no patterns found.",
    overall: findings.length > 0 ? "Send the document only after redaction and approval." : "Document appears safe to send.",
  };
}

// ------------------------------------------------------------ policies

interface PolicyRule {
  id: string;
  name: string;
  types: Set<string>;
}

const POLICY_RULES: PolicyRule[] = [
  { id: "pol-customer-pii", name: "No customer PII to public AI", types: new Set(["Personal Name", "Email Address", "Phone Number", "Address", "Customer ID"]) },
  { id: "pol-credentials", name: "No credentials or secrets", types: new Set(["API Key", "Password", "Access Token", "Cloud Access Key", "Private Certificate"]) },
  { id: "pol-financial", name: "No financial records", types: new Set(["Credit Card", "Bank Account"]) },
  { id: "pol-medical", name: "No medical records", types: new Set(["Medical Information"]) },
  { id: "pol-source-code", name: "No source code", types: new Set(["Source Code Content"]) },
  { id: "pol-confidential", name: "No confidential contracts", types: new Set(["Internal Project Name", "Internal System / Account"]) },
];

export function evaluatePolicies(findings: PrivacyFinding[]): PolicyResult[] {
  const types = new Set(findings.map((f) => f.type));
  const out: PolicyResult[] = POLICY_RULES.map((p) => {
    const matched = Array.from(types).filter((t) => p.types.has(t));
    if (matched.length > 0) {
      return {
        id: p.id,
        name: p.name,
        status: "blocked" as const,
        reason: `Found: ${matched.sort().join(", ")}.`,
        recommendation: "Remove these fields or use an approved internal AI tool.",
      };
    }
    return {
      id: p.id,
      name: p.name,
      status: "pass" as const,
      reason: "No matching sensitive data detected.",
      recommendation: "Keep the policy enforced for all outbound prompts.",
    };
  });
  if (findings.length > 0) {
    out.push({
      id: "pol-least-disclosure",
      name: "Least disclosure (minimum data)",
      status: "review",
      reason: "Sensitive data was present and has been redacted.",
      recommendation: "Reconsider whether any of the redacted data was needed at all.",
    });
  }
  return out;
}

// ------------------------------------------------------------ redaction

export function redactDocument(document: string, findings: PrivacyFinding[]): RedactionResult {
  const spans = findings.map((f) => ({ start: f.start, end: f.end, type: f.type, snippet: f.snippet }));
  spans.sort((a, b) => a.start - b.start);
  const merged: { start: number; end: number; type: string; snippet: string }[] = [];
  for (const s of spans) {
    const last = merged[merged.length - 1];
    if (last && s.start < last.end) {
      last.end = Math.max(last.end, s.end);
    } else {
      merged.push({ ...s });
    }
  }

  let out = "";
  let cursor = 0;
  const explanations: RedactionExplanation[] = [];
  for (const s of merged) {
    out += document.slice(cursor, s.start);
    out += "[REDACTED]";
    cursor = s.end;
    explanations.push({
      type: s.type,
      snippet: s.snippet,
      reason: FINDING_META[Object.keys(FINDING_META).find((k) => FINDING_META[k].type === s.type) ?? ""]?.protection ?? "Sensitive data.",
    });
  }
  out += document.slice(cursor);
  return { original: document, redacted: out, redacted_count: merged.length, explanations };
}

// ------------------------------------------------------------ scan

const INSTRUCTOR: InstructorContext = {
  teaching_points: [
    {
      title: "Employees leak by accident",
      concept: "Human error",
      explanation: "Most leaks are not malicious. An employee pastes a document to get help and does not realize how much personal or secret data it carries.",
      key_takeaway: "Protection should happen automatically before data reaches the model.",
    },
    {
      title: "AI is not the problem",
      concept: "Controls at the boundary",
      explanation: "The model is a tool. The risk is sending sensitive data to a service that is outside the organization's control without safeguards.",
      key_takeaway: "AI security includes protecting the data, not only protecting the model.",
    },
    {
      title: "Redact the minimum",
      concept: "Least disclosure",
      explanation: "Remove only what the task does not need, so the model still has enough to answer usefully.",
      key_takeaway: "The safe prompt must stay useful, or employees will work around the controls.",
    },
  ],
  discussion_questions: [
    "Which information should never reach a public AI service?",
    "Should source code be uploaded to public LLMs?",
    "How should organizations balance productivity and privacy?",
  ],
};

export function scanDocument(document: string, scenarioId: string | null = null): PrivacyScanResult {
  const findings = detectPrivacyFindings(document);
  const classification = classifyDocument(findings);
  const risk = assessRisk(findings);
  const policies = evaluatePolicies(findings);
  const redaction = redactDocument(document, findings);
  const safePrompt = "[De-identified for external AI. Review before sending.]\n\n" + redaction.redacted;
  const blocked = policies.filter((p) => p.status === "blocked").length;
  return {
    scenario_id: scenarioId,
    document,
    findings,
    classification,
    risk,
    policies,
    redaction,
    safe_prompt: safePrompt,
    timeline: [
      { step: 1, name: "Document loaded", detail: "Content accepted for inspection." },
      { step: 2, name: "Sensitive data detection", detail: `${findings.length} pattern(s) matched PII or secret rules.` },
      { step: 3, name: "Classification", detail: `Document classified as ${classification.label}.` },
      { step: 4, name: "Policy evaluation", detail: `${blocked} policy block(s).` },
      { step: 5, name: "Redaction", detail: `${redaction.redacted_count} segment(s) replaced with [REDACTED].` },
      { step: 6, name: "Safe prompt generated", detail: "De-identified prompt ready for the approved AI tool." },
    ],
    summary:
      findings.length === 0
        ? ["No sensitive patterns were detected in this document.", "A human should still confirm the content before sending it to an AI service."]
        : [
            `${findings.length} sensitive item(s) detected; highest severity is ${findings[0].severity} (${findings[0].type}).`,
            `Document is classified as ${classification.label}.`,
            "Policy blocks apply - this document must be redacted before any external AI use.",
          ],
    instructor_context: INSTRUCTOR,
  };
}

// ------------------------------------------------------------ assistant

export function askPrivacy(question: string): string {
  const q = question.toLowerCase();
  if (/pii|personally identif|sensitive personal/.test(q)) {
    return "PII is any data that can identify a person. Sensitive personal information adds categories like health, finance, government IDs, and biometrics. Every category has stricter handling rules before external AI use.";
  }
  if (/classif|public|confidential|restricted/.test(q)) {
    return "Classify data when it is created. Public, Internal, Confidential, Restricted, and Highly Restricted map to impact and handling. Classification decides which AI tools may process the data.";
  }
  if (/secret|api key|token|password|credential/.test(q)) {
    return "Secrets are credentials that authenticate to services. Detect, never log, rotate on exposure, and keep them in a secrets manager. Secrets must never appear in a prompt.";
  }
  if (/redact|mask|anonymiz|de-identif/.test(q)) {
    return "Redaction replaces sensitive spans with placeholders so the task still works. Combined with classification and policies, it produces a safe prompt that a human approves.";
  }
  if (/policy|dlp|data loss|blocked/.test(q)) {
    return "Data loss prevention scans outbound channels and blocks or warns before sensitive data leaves. Policies encode rules like: no customer PII, no credentials, no source code to public AI.";
  }
  if (/why|risk|leak|dangerous/.test(q)) {
    return "The risk is not the AI itself. It is sending sensitive data to a service outside your control. Once pasted, data may be logged, retained, or echoed back - without a clear path to deletion.";
  }
  if (/prompt|hygiene|send|least disclosure|minim/.test(q)) {
    return "Practice prompt hygiene: strip identifiers, use synthetic examples, and share only the minimum that accomplishes the task. Least disclosure keeps prompts both safe and useful.";
  }
  return "This lab teaches data protection before the model. Ask about PII, secrets, classification, DLP policies, redaction, or prompt hygiene.";
}

/**
 * Backend-first assistant. Prefers POST /api/privacy/assistant, falling back
 * to the local rule engine when the API is unreachable or rejects.
 */
export async function askPrivacySmart(question: string): Promise<string> {
  try {
    const res = await fetch(`${API_BASE_URL}/privacy/assistant`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });
    if (res.ok) {
      const data = (await res.json()) as { answer?: string };
      if (data.answer) return data.answer;
    }
  } catch (err) {
    console.warn("Backend API offline, using local privacy assistant");
  }
  return askPrivacy(question);
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

export async function fetchPrivacyScenarios(): Promise<unknown[]> {
  const data = await tryApi<{ scenarios: unknown[] }>("/privacy/scenarios");
  if (data?.scenarios) return data.scenarios;
  return PRIVACY_SCENARIOS.map((s) => ({
    id: s.id,
    title: s.title,
    category: s.category,
    description: s.description,
    risk_level: s.risk_level,
    classification: s.classification,
  }));
}

export async function runRemoteScan(
  document: string,
  scenarioId?: string | null
): Promise<PrivacyScanResult | null> {
  return tryApi<PrivacyScanResult>("/privacy/scan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ document, scenario_id: scenarioId ?? undefined }),
  });
}

/**
 * Backend-first privacy scan. Prefers POST /api/privacy/scan, falling back
 * to the local deterministic scanner when the API is unreachable so the lab
 * keeps working offline.
 */
export async function runScanSmart(
  document: string,
  scenarioId?: string | null
): Promise<PrivacyScanResult> {
  const remote = await runRemoteScan(document, scenarioId);
  if (remote) return remote;
  return scanDocument(document, scenarioId ?? undefined);
}

export interface ScanHistoryEntry {
  id: number;
  timestamp: string;
  scenario_id: string;
  classification: string;
  risk_level: string;
  risk_score: number;
  findings_count: number;
}

/**
 * Backend-first recent scans list. Prefers GET /api/privacy/history
 * (SQLite-persisted), returning an empty list when the API is unreachable.
 */
export async function fetchScanHistory(limit = 5): Promise<ScanHistoryEntry[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/privacy/history`);
    if (res.ok) {
      const data = (await res.json()) as { history?: ScanHistoryEntry[] };
      if (Array.isArray(data.history)) return data.history.slice(0, limit);
    }
  } catch (err) {
    console.warn("Backend API offline, scan history unavailable");
  }
  return [];
}

export { PRIVACY_SCENARIOS };
