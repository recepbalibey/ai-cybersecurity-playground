// Curated secure-coding knowledge for the AI Security Code Reviewer.
// Mirrors /knowledge/secure-coding/knowledge_base.json.

export interface OwaspEntry {
  id: string;
  name: string;
}

export interface CweEntry {
  id: string;
  name: string;
}

export const OWASP_TOP_10: OwaspEntry[] = [
  { id: "A01:2021", name: "Broken Access Control" },
  { id: "A02:2021", name: "Cryptographic Failures" },
  { id: "A03:2021", name: "Injection" },
  { id: "A04:2021", name: "Insecure Design" },
  { id: "A05:2021", name: "Security Misconfiguration" },
  { id: "A07:2021", name: "Identification and Authentication Failures" },
  { id: "A08:2021", name: "Software and Data Integrity Failures" },
  { id: "A09:2021", name: "Security Logging and Monitoring Failures" },
];

export const CWE_TOP_25: CweEntry[] = [
  { id: "CWE-20", name: "Improper Input Validation" },
  { id: "CWE-78", name: "OS Command Injection" },
  { id: "CWE-79", name: "Cross-site Scripting" },
  { id: "CWE-89", name: "SQL Injection" },
  { id: "CWE-120", name: "Buffer Overflow" },
  { id: "CWE-287", name: "Improper Authentication" },
  { id: "CWE-434", name: "Unrestricted Upload of File" },
  { id: "CWE-502", name: "Deserialization of Untrusted Data" },
  { id: "CWE-798", name: "Hard-coded Credentials" },
  { id: "CWE-110", name: "Insecure Direct Reference to a Resource" },
];

export const CODING_PRINCIPLES: string[] = [
  "Trust no input by default; validate on arrival.",
  "Fail closed on security decisions - deny unless allowed.",
  "Least privilege: grant only the minimum access required.",
  "Defense in depth: layer independent controls.",
  "Validate at trust boundaries, not just the UI.",
  "Failed security checks should log and stay closed.",
];

export const INPUT_VALIDATION: string[] = [
  "Validate type, length, range, and an allowlist of characters.",
  "Validate on the server, never only in the browser.",
  "Treat all external input as hostile.",
  "Canonicalize and normalize before comparisons (paths, URLs).",
];

export const AUTHENTICATION: string[] = [
  "Hash stored passwords with a strong algorithm (bcrypt/argon2).",
  "Use random, signed session tokens with expiry.",
  "Rate-limit and lock out after repeated failures.",
];

export const AUTHORIZATION: string[] = [
  "Enforce access control server-side on every request.",
  "Deny by default; allow only explicitly authorized roles.",
  "Check ownership of the object being acted on.",
];

export const CRYPTOGRAPHY: string[] = [
  "Use modern vetted libraries; never invent your own crypto.",
  "Use sufficient key sizes for the threat model.",
  "Use a cryptographically secure RNG for security tokens.",
];

export const SECRETS_MANAGEMENT: string[] = [
  "Keep secrets out of source and version control.",
  "Load secrets from env vars or a secrets manager.",
  "Rotate secrets and revoke leaked ones.",
];

export const ERROR_HANDLING: string[] = [
  "Never leak stack traces or internals to clients.",
  "Log details, return a generic message to the user.",
];

export const LOGGING: string[] = [
  "Log authentication and authorization events.",
  "Avoid logging secrets or sensitive data.",
];

export const SECURE_APIS: string[] = [
  "Authenticate and authorize every API call.",
  "Rate-limit and validate payload structure and size.",
  "Return minimal data and follow API error contracts.",
];

export const SECURE_DEV_CHECKLIST: string[] = [
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
];