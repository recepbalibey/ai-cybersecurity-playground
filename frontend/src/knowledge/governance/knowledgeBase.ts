// knowledgeBase.ts
// AI Risk Assessment & Governance Simulator - curated governance knowledge.
// Mirrors knowledge/governance/knowledge_base.json plus the control catalog
// shared by the scoring engine.

export interface GovernanceControl {
  id: string;
  name: string;
  description: string;
  mitigates: string[];
  likelihood_reduction: number;
  impact_reduction: number;
  trade_offs: string;
}

export interface ThreatCategory {
  id: string;
  name: string;
  stride: string;
  definition: string;
}

export const GOVERNANCE_CONTROLS: GovernanceControl[] = [
  { id: "input_validation", name: "Input Validation", description: "Checks every input for shape, size, and expected structure before it is processed.", mitigates: ["prompt_injection", "jailbreak", "adversarial_ml", "api_abuse"], likelihood_reduction: 1, impact_reduction: 0, trade_offs: "Strict validation can reject legitimate complex inputs and increase support load." },
  { id: "prompt_filtering", name: "Prompt Filtering", description: "Screens prompts for injection patterns and blocked content before the model sees them.", mitigates: ["prompt_injection", "jailbreak", "adversarial_ml", "api_abuse"], likelihood_reduction: 2, impact_reduction: 0, trade_offs: "Aggressive filters can block legitimate prompts and frustrate users." },
  { id: "output_validation", name: "Output Validation", description: "Checks model output for policy violations, sensitive data, and unsafe content.", mitigates: ["hallucination", "data_leakage", "bias_fairness", "jailbreak"], likelihood_reduction: 1, impact_reduction: 1, trade_offs: "Checking every output adds latency and may reject useful borderline answers." },
  { id: "human_approval", name: "Human Approval", description: "A trained person reviews and approves model outputs before high-impact actions.", mitigates: ["hallucination", "bias_fairness", "model_poisoning", "insider_threat", "data_leakage"], likelihood_reduction: 0, impact_reduction: 2, trade_offs: "Slows the workflow and needs trained reviewers to avoid rubber-stamping." },
  { id: "rbac", name: "Role-Based Access Control", description: "Access to the system and its data is granted by role instead of by default.", mitigates: ["unauthorized_access", "insider_threat", "tool_abuse", "api_abuse"], likelihood_reduction: 1, impact_reduction: 1, trade_offs: "Managing roles is overhead and over-restricting access slows teams." },
  { id: "least_privilege", name: "Least Privilege", description: "Users and processes get the minimum data and function access their task requires.", mitigates: ["unauthorized_access", "insider_threat", "data_leakage", "tool_abuse"], likelihood_reduction: 1, impact_reduction: 2, trade_offs: "Scoping data tightly can break workflows that needed the extra access." },
  { id: "audit_logging", name: "Audit Logging", description: "Records who did what, when, and with which inputs and outputs.", mitigates: ["insider_threat", "unauthorized_access", "supply_chain", "model_poisoning"], likelihood_reduction: 0, impact_reduction: 1, trade_offs: "Logs add storage cost and are themselves a target for attackers." },
  { id: "encryption", name: "Encryption", description: "Protects data at rest and in transit so a copy is unreadable without keys.", mitigates: ["data_privacy", "data_leakage", "model_theft", "third_party_dependency"], likelihood_reduction: 0, impact_reduction: 2, trade_offs: "Key management adds operational complexity and a small performance overhead." },
  { id: "model_monitoring", name: "Model Monitoring", description: "Tracks model accuracy, drift, and behavior against expected baselines.", mitigates: ["bias_fairness", "model_poisoning", "adversarial_ml", "hallucination", "model_theft"], likelihood_reduction: 1, impact_reduction: 1, trade_offs: "Monitoring needs baselines and produces alerts that must be triaged." },
  { id: "content_filtering", name: "Content Filtering", description: "Blocks disallowed topics and unsafe content in inputs and outputs.", mitigates: ["jailbreak", "prompt_injection", "api_abuse", "hallucination"], likelihood_reduction: 1, impact_reduction: 1, trade_offs: "Content filters can block legitimate topics and need careful tuning." },
  { id: "rate_limiting", name: "Rate Limiting", description: "Limits how many requests a user or source can make in a period.", mitigates: ["denial_of_service", "api_abuse", "model_theft"], likelihood_reduction: 2, impact_reduction: 0, trade_offs: "Aggressive limits can block power users and slow legitimate batch work." },
  { id: "data_classification", name: "Data Classification", description: "Labels data by sensitivity so handling rules can be enforced automatically.", mitigates: ["data_privacy", "data_leakage", "third_party_dependency", "bias_fairness"], likelihood_reduction: 1, impact_reduction: 1, trade_offs: "Labeling data takes discipline and mislabeled data misleads the controls." },
  { id: "retrieval_validation", name: "Retrieval Validation", description: "Checks and scopes what is retrieved before it is added to the model context.", mitigates: ["data_leakage", "unauthorized_access", "prompt_injection", "bias_fairness"], likelihood_reduction: 1, impact_reduction: 2, trade_offs: "Restricting retrieval can make answers less useful when context is missing." },
  { id: "model_version_control", name: "Model Version Control", description: "Pins and verifies model and dependency versions before deployment.", mitigates: ["supply_chain", "model_poisoning", "model_theft"], likelihood_reduction: 1, impact_reduction: 1, trade_offs: "Freezing versions slows adoption of improved models and security patches." },
  { id: "continuous_evaluation", name: "Continuous Evaluation", description: "Runs ongoing tests of safety, fairness, and accuracy on a held-out set.", mitigates: ["bias_fairness", "hallucination", "model_poisoning", "supply_chain"], likelihood_reduction: 1, impact_reduction: 2, trade_offs: "Evaluation needs test sets and effort, and over-testing can delay releases." },
];

export const THREAT_CATEGORIES: ThreatCategory[] = [
  { id: "data_privacy", name: "Data Privacy", stride: "Information disclosure", definition: "Personal or regulated data is exposed to parties that should not see it." },
  { id: "prompt_injection", name: "Prompt Injection", stride: "Tampering", definition: "Malicious instructions hidden inside input redirect the model's behavior." },
  { id: "model_theft", name: "Model Theft", stride: "Information disclosure", definition: "An attacker extracts the model's logic, weights, or training data." },
  { id: "adversarial_ml", name: "Adversarial ML", stride: "Tampering", definition: "Crafted inputs fool the model into wrong outputs at scale." },
  { id: "jailbreak", name: "Jailbreak", stride: "Elevation of privilege", definition: "Prompts that bypass the model's safety rules to unlock restricted behavior." },
  { id: "model_poisoning", name: "Model Poisoning", stride: "Tampering", definition: "Corrupted training or fine-tuning data changes how the model behaves." },
  { id: "supply_chain", name: "Supply Chain", stride: "Tampering", definition: "A compromised model, library, or update is trusted and deployed." },
  { id: "hallucination", name: "Hallucination", stride: "Spoofing", definition: "The model produces confident but false content that is acted on." },
  { id: "unauthorized_access", name: "Unauthorized Access", stride: "Elevation of privilege", definition: "Users or systems reach data and functions beyond their permission." },
  { id: "insider_threat", name: "Insider Threat", stride: "Repudiation", definition: "People inside the organization misuse their access deliberately or by accident." },
  { id: "api_abuse", name: "API Abuse", stride: "Denial of service", definition: "The model or API is probed or drained by automated traffic." },
  { id: "tool_abuse", name: "Tool Abuse", stride: "Elevation of privilege", definition: "The model's connected tools or actions are used beyond their intended scope." },
  { id: "data_leakage", name: "Sensitive Data Leakage", stride: "Information disclosure", definition: "Sensitive data escapes through outputs, logs, or retrieval." },
  { id: "third_party_dependency", name: "Third-party Dependency", stride: "Repudiation", definition: "A dependency outside your control is unsafe, outdated, or malicious." },
  { id: "denial_of_service", name: "Denial of Service", stride: "Denial of service", definition: "An attacker makes the AI system unavailable when it is needed." },
  { id: "bias_fairness", name: "Bias and Fairness", stride: "Spoofing", definition: "The model treats some groups unfairly because of data or design." },
];

export const GOVERNANCE_CONTROL_BY_ID: Record<string, GovernanceControl> = Object.fromEntries(
  GOVERNANCE_CONTROLS.map((c) => [c.id, c])
);

export const THREAT_CATEGORY_BY_ID: Record<string, ThreatCategory> = Object.fromEntries(
  THREAT_CATEGORIES.map((c) => [c.id, c])
);

// Educational knowledge topics, keyed by topic id.
export const GOVERNANCE_TOPICS: Record<string, { title: string; explanation: string; practical: string }[]> = {
  ai_risk_management: [
    { title: "AI risk is risk, not magic", explanation: "AI systems carry the same classes of risk as software - confidentiality, integrity, availability - plus model-specific risks like bias and hallucination.", practical: "Assess AI with the same discipline you use for any critical system, then add the model-specific layers." },
    { title: "Risk cannot be eliminated", explanation: "Security reduces risk to a level the organization accepts. A governance process decides what that level is.", practical: "Define a risk appetite so controls and exceptions are judged consistently." },
    { title: "Risk changes over time", explanation: "New threats, new users, new data, and model drift all change the risk profile. Assessment is continuous, not a one-time gate.", practical: "Re-run the risk assessment whenever the system or its context changes." },
  ],
  threat_modeling: [
    { title: "Model before you build", explanation: "Threat modeling names the components, the trust boundaries, and the ways an attacker can cross them before you deploy.", practical: "Draw the architecture, mark each boundary, and ask what could go wrong at each one." },
    { title: "Threat to control to residual risk", explanation: "A good model flows from threat to attack vector to business impact, then to a control, then to the risk that remains.", practical: "Every control you add should be traceable to a specific threat it reduces." },
    { title: "Frameworks structure the work", explanation: "STRIDE gives a high-level list of threat classes, MITRE ATT&CK names attacker behaviors, and OWASP maps known LLM weaknesses.", practical: "Use them as checklists to make sure you did not forget a whole class of attack." },
  ],
  defense_in_depth: [
    { title: "Layers, not a wall", explanation: "No single control is perfect. Defense in depth stacks independent controls so one failure does not end the defense.", practical: "Combine gateway filtering, output validation, and human approval rather than relying on one." },
    { title: "Controls must not depend on each other", explanation: "If every layer uses the same weakness, the layers collapse together. Vary the techniques across layers.", practical: "Mix technical controls, process controls, and human checks." },
  ],
  least_privilege: [
    { title: "Give the minimum access", explanation: "Users, processes, and models should have only the access they need for their task, nothing more.", practical: "Scope retrieval to the current user, limit who can see logs, and keep model keys separate." },
    { title: "It limits blast radius", explanation: "When one account is compromised, least privilege decides how much damage the attacker can do.", practical: "Apply it to people and to the AI system's own tool and data access." },
  ],
  zero_trust: [
    { title: "Never trust, always verify", explanation: "Assume a breach is possible on the network and in the pipeline. Every request is authenticated and authorized on its own.", practical: "Do not trust a prompt because it came from an internal user or a logged-in session." },
    { title: "Treat prompts as untrusted input", explanation: "A prompt can carry injection payloads no matter who sends it. Validate, filter, and verify before acting.", practical: "Treat the model boundary like any other untrusted network boundary." },
  ],
  human_in_the_loop: [
    { title: "A human owns the decision", explanation: "For high-impact actions the model proposes and a person disposes. The model is a decision aid, not the authority.", practical: "Require approval before the AI takes irreversible or high-stakes actions." },
    { title: "Human review has its own cost", explanation: "Approval loops slow things down and people rubber-stamp when overloaded. Reserve them for the decisions that matter.", practical: "Use automation where consequences are low and humans where they are high." },
  ],
  secure_ai_lifecycle: [
    { title: "Security before deployment", explanation: "AI security starts at the business goal, then flows through data, model, threat assessment, controls, governance, and only then deployment.", practical: "Address risk early because retrofitting controls after launch is expensive and incomplete." },
    { title: "Every phase has a job", explanation: "Data quality feeds model behavior, model choice sets the attack surface, and controls decide the residual risk.", practical: "Track decisions from each phase so the final recommendation is defensible." },
  ],
  model_monitoring: [
    { title: "Watch behavior, not just uptime", explanation: "A model that is up and fast can still be drifting, biased, or wrong. Monitor outputs and outcomes.", practical: "Track accuracy against real outcomes, fairness across groups, and unexpected prompt patterns." },
    { title: "Monitoring feeds governance", explanation: "Evidence from production justifies keeping, adjusting, or retiring a system.", practical: "Turn monitoring findings into periodic governance reviews." },
  ],
  incident_response_for_ai: [
    { title: "Plan for the AI-specific incident", explanation: "Incidents include prompt injections, data leaks through prompts, model poisoning, and harmful outputs - not just server failures.", practical: "Extend the incident playbook with AI-specific detection and response steps." },
    { title: "Contain and learn", explanation: "Isolate the model, stop the risky channel, preserve evidence, then update the risk assessment and controls.", practical: "Log everything so an AI incident can be reconstructed and explained." },
  ],
  nist_ai_rmf: [
    { title: "Govern, Map, Measure, Manage", explanation: "The NIST AI Risk Management Framework structures AI risk work in four functions: govern, map, measure, and manage.", practical: "Govern sets the rules, map finds the risks, measure quantifies them, and manage applies controls." },
    { title: "A reference, not a checklist", explanation: "The framework guides how to think about AI risk and adapt it to your context.", practical: "Use its functions to structure your assessment and your report." },
  ],
  owasp_llm_top10: [
    { title: "The LLM weakness catalog", explanation: "OWASP Top 10 for LLM Applications lists the common weaknesses: prompt injection, data leakage, training data poisoning, and more.", practical: "Match each identified risk to an OWASP LLM category to communicate with a shared vocabulary." },
    { title: "Prompt injection leads the list", explanation: "Injection is the defining LLM weakness because prompts are both input and instructions.", practical: "Design gateways that treat prompt content as untrusted." },
  ],
  mitre_attack_concepts: [
    { title: "Attacker behavior, named", explanation: "MITRE ATT&CK catalogs how attackers operate across reconnaissance, initial access, persistence, and more.", practical: "Use it to imagine how an attacker would target the AI system at each stage." },
    { title: "High level here", explanation: "This lab uses ATT&CK concepts at a high level to keep the focus on risk reasoning, not taxonomy.", practical: "Name the behavior, then reason about the control that disrupts it." },
  ],
  stride_concepts: [
    { title: "Six threat classes", explanation: "STRIDE stands for Spoofing, Tampering, Repudiation, Information disclosure, Denial of service, Elevation of privilege.", practical: "Walk the architecture once per letter to catch classes you might miss." },
    { title: "A conversation starter", explanation: "STRIDE is a high-level lens that turns 'what could go wrong' into structured categories.", practical: "Tag each identified risk with its STRIDE class." },
  ],
  iso_iec_42001: [
    { title: "A management system for AI", explanation: "ISO/IEC 42001 provides a management system for AI governance, similar in spirit to ISO 27001 for information security.", practical: "It organizes policy, risk, and oversight so AI use is repeatable and auditable." },
    { title: "Educational overview only", explanation: "This lab teaches the concepts. It does not certify or guarantee compliance with the standard.", practical: "Use it to understand how enterprises structure AI governance programs." },
  ],
  eu_ai_act: [
    { title: "Risk-based regulation", explanation: "The EU AI Act regulates AI by risk tier, with the strictest duties for high-risk uses like employment and medical decisions.", practical: "Know the tier of your system because it changes the controls and documentation expected." },
    { title: "Educational overview only", explanation: "This lab explains the concept of risk tiers. It does not provide legal advice or compliance certification.", practical: "Use it to understand why governance documentation matters before deployment." },
  ],
};

export const TOPIC_ORDER: { id: string; label: string }[] = [
  { id: "ai_risk_management", label: "AI Risk Management" },
  { id: "threat_modeling", label: "Threat Modeling" },
  { id: "defense_in_depth", label: "Defense in Depth" },
  { id: "least_privilege", label: "Least Privilege" },
  { id: "zero_trust", label: "Zero Trust" },
  { id: "human_in_the_loop", label: "Human-in-the-Loop" },
  { id: "secure_ai_lifecycle", label: "Secure AI Lifecycle" },
  { id: "model_monitoring", label: "Model Monitoring" },
  { id: "incident_response_for_ai", label: "Incident Response for AI" },
  { id: "nist_ai_rmf", label: "NIST AI RMF" },
  { id: "owasp_llm_top10", label: "OWASP Top 10 for LLMs" },
  { id: "mitre_attack_concepts", label: "MITRE ATT&CK Concepts" },
  { id: "stride_concepts", label: "STRIDE Concepts" },
  { id: "iso_iec_42001", label: "ISO/IEC 42001" },
  { id: "eu_ai_act", label: "EU AI Act" },
];
