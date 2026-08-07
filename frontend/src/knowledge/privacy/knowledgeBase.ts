// Curated privacy knowledge for the AI Data Privacy Lab.
// Mirrors /knowledge/privacy/knowledge_base.json.

export interface PiiEntry {
  type: string;
  definition: string;
  severity: string;
  protection: string;
}

export interface ClassificationLevel {
  label: string;
  impact: string;
  handling: string;
}

export const PII_CATEGORIES: PiiEntry[] = [
  {
    type: "Name",
    definition: "Any identifier that can link data to a specific person, such as a full name.",
    severity: "High",
    protection: "Remove or replace with synthetic names before sending to external AI services.",
  },
  {
    type: "Email Address",
    definition: "Personal or work email addresses are direct personal identifiers.",
    severity: "Medium",
    protection: "Anonymize or aggregate; blocklist personal domains.",
  },
  {
    type: "Phone Number",
    definition: "Contact details that can be used for tracking or social engineering.",
    severity: "Medium",
    protection: "Redact unless the business task truly requires the number.",
  },
  {
    type: "Address",
    definition: "Home or work addresses reveal where a person lives and works.",
    severity: "High",
    protection: "Replace with city or region level data when the location matters.",
  },
  {
    type: "Passport Number",
    definition: "Government-issued identifier, highly sensitive, often regulated.",
    severity: "Critical",
    protection: "Never send to an external service without specific legal basis.",
  },
  {
    type: "Credit Card",
    definition: "Payment card data is regulated (PCI DSS) and valuable to attackers.",
    severity: "Critical",
    protection: "Mask to last four digits at most; use tokenization.",
  },
  {
    type: "Bank Account",
    definition: "Financial account identifiers that enable fraud if stolen.",
    severity: "Critical",
    protection: "Redact fully; route through approved financial systems.",
  },
  {
    type: "Customer ID",
    definition: "Internal identifiers that link activity to a customer record.",
    severity: "Medium",
    protection: "Synthesize or hash before external use.",
  },
  {
    type: "Medical Information",
    definition: "Health conditions, medications, and lab results - protected by law.",
    severity: "Critical",
    protection: "Only approved clinical tooling may process health data.",
  },
  {
    type: "Salary Information",
    definition: "Compensation data is confidential to the employee, manager, and HR.",
    severity: "Critical",
    protection: "Keep in approved HR systems; never share externally.",
  },
];

export const SENSITIVE_PERSONAL_INFORMATION: string[] = [
  "Health and genetic data",
  "Financial details and payment data",
  "Government identifiers (passport, national ID)",
  "Biometric data",
  "HR and performance records",
  "Location and movement history",
  "Children's data",
  "Criminal history and internal investigation data",
];

export const SECRETS_DETECTION: string[] = [
  "API keys and secret tokens used to authenticate to services",
  "Database connection strings with credentials",
  "Private keys and certificates",
  "Passwords in plain text",
  "Cloud provider access keys",
  "OAuth and session tokens",
  "Deployment credentials and CI secrets",
];

export const API_KEYS: string[] = [
  "Treat any key as live until proven otherwise",
  "Detect common patterns: sk-, ghp_, AKIA, bearer tokens",
  "Never log keys or paste them into chat tools",
  "Use a secrets manager and rotate on any exposure",
];

export const DATA_CLASSIFICATION: ClassificationLevel[] = [
  { label: "Public", impact: "No confidentiality impact if exposed", handling: "May be shared freely" },
  { label: "Internal", impact: "Low to moderate impact if exposed", handling: "Only within the organization" },
  { label: "Confidential", impact: "Significant impact if exposed", handling: "Approved recipients and tools only" },
  { label: "Restricted", impact: "Severe impact if exposed", handling: "Access on a need-to-know basis" },
  { label: "Highly Restricted", impact: "Critical legal or regulatory impact", handling: "Strict controls, audit required" },
];

export const DATA_LOSS_PREVENTION: string[] = [
  "Classify data at creation, not at the edge",
  "Scan outbound channels for sensitive patterns",
  "Block or warn before data leaves the boundary",
  "Redact minimally so the task still works",
  "Log and review every block or warning",
];

export const PRIVACY_PRINCIPLES: string[] = [
  "Least disclosure: send only what the task needs",
  "Minimization: collect and share the smallest useful set",
  "Purpose limitation: use data only for the stated task",
  "Data protection by design and by default",
  "The user owns the decision: humans approve external sharing",
];

export const ENTERPRISE_AI_POLICIES: string[] = [
  "No customer PII to public AI services",
  "No credentials, secrets, or keys to public AI",
  "No financial or medical records to public AI",
  "No source code to public AI without approval",
  "No confidential contracts to public AI",
  "Approved internal AI tools with audit logging for sensitive data",
];

export const PROMPT_HYGIENE: string[] = [
  "Strip identifiers before building a prompt",
  "Use synthetic or aggregated data for examples",
  "State in the prompt that data is de-identified",
  "Never paste secrets to debug a tool",
  "Review the final prompt for leftovers before sending",
];

export const LEAST_DISCLOSURE_PRINCIPLE: string[] = [
  "Share the minimum information that accomplishes the task",
  "Ask: what does the model actually need to answer this?",
  "A marketing email does not need card numbers or home addresses",
  "Summaries and structure can usually be produced from synthetic data",
];
