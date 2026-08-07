// governance.ts
// AI Risk Assessment & Governance Simulator - project data.
// Mirrors datasets/governance/*.json so the lab works fully offline.

export type GovernanceCriticality = "Critical" | "High" | "Medium" | "Low";
export type GovernanceStance = "Poorly Governed" | "Well Governed";
export type RiskLevel = "Critical" | "High" | "Medium" | "Low" | "Informational";

export interface GovernanceComponent {
  id: string;
  name: string;
  role: string;
  purpose: string;
  security_considerations: string[];
  attack_surface: string;
}

export interface GovernanceThreat {
  id: string;
  category: string;
  name: string;
  description: string;
  likelihood: number;
  impact: number;
  business_consequences: string;
}

export interface GovernanceProject {
  id: string;
  title: string;
  description: string;
  business_goal: string;
  users: string;
  data_types: string[];
  model_type: string;
  criticality: GovernanceCriticality;
  governance_stance: GovernanceStance;
  architecture: GovernanceComponent[];
  threats: GovernanceThreat[];
  baseline_controls: string[];
  teaching_points: string[];
}

export const GOVERNANCE_PROJECTS: GovernanceProject[] = [
  {
    id: "resume_screening",
    title: "AI Resume Screening",
    description: "An AI assistant that screens candidate resumes and ranks applicants for recruiters.",
    business_goal: "Cut the time recruiters spend on first-pass resume review by ranking candidates against a job description.",
    users: "Internal recruiters and hiring managers (about 200 users).",
    data_types: ["Candidate resumes", "Names and contact details", "Employment history", "Interview notes"],
    model_type: "LLM with embeddings for resume ranking",
    criticality: "High",
    governance_stance: "Poorly Governed",
    baseline_controls: ["input_validation", "audit_logging"],
    architecture: [
      { id: "recruiters", name: "Recruiters", role: "input", purpose: "Hiring staff upload resumes and enter a job description, then review the ranked list.", security_considerations: ["Recruiters hold wide access to candidate data", "Screens are shared devices in an open office"], attack_surface: "A recruiter can accidentally paste sensitive resumes into any external tool." },
      { id: "web_app", name: "Web Application", role: "application", purpose: "Browser front end where recruiters manage the screening queue.", security_considerations: ["Session handling and access control", "File upload validation"], attack_surface: "Weak authentication lets an attacker view every candidate file." },
      { id: "ai_gateway", name: "AI Gateway", role: "gateway", purpose: "Central entry point that enforces policy before any request reaches the model.", security_considerations: ["This is the natural place for filtering and rate limits", "Currently used only for routing"], attack_surface: "Without filtering here, malicious prompts pass straight to the model." },
      { id: "llm", name: "LLM", role: "model", purpose: "Third-party hosted model that scores resume sections against the job description.", security_considerations: ["Data leaves the company to the model provider", "Responses may leak training or prompt data"], attack_surface: "Crafting prompts hidden inside resume text (prompt injection)." },
      { id: "vector_db", name: "Vector Database", role: "store", purpose: "Stores resume embeddings so similar candidates can be grouped and compared.", security_considerations: ["Embeddings can be inverted to recover text", "Access controls are broad"], attack_surface: "A stolen copy of the vector store can reconstruct candidate data." },
      { id: "internal_docs", name: "Internal Documents", role: "data", purpose: "Company job descriptions and hiring policies used as context for scoring.", security_considerations: ["Hiring policy is internal information", "Versioning is manual"], attack_surface: "Outdated policies retrieved as context can produce wrong and biased decisions." },
      { id: "logging", name: "Logging", role: "support", purpose: "Records who submitted which resume and what score each candidate received.", security_considerations: ["Logs contain candidate names", "Logs are not encrypted at rest"], attack_surface: "Log access without controls exposes personal data of every applicant." },
      { id: "monitoring", name: "Monitoring", role: "support", purpose: "Tracks model latency and error rates.", security_considerations: ["Monitoring is alerts only", "No drift or fairness checks"], attack_surface: "Silent drift in scoring behavior goes unnoticed." },
    ],
    threats: [
      { id: "t1", category: "data_privacy", name: "Resume PII exposure", description: "Candidate resumes contain names, contact details, and employment history processed by a third-party model.", likelihood: 4, impact: 4, business_consequences: "Legal exposure, loss of trust from applicants, and fines for mishandling personal data." },
      { id: "t2", category: "prompt_injection", name: "Hidden instructions in resumes", description: "A candidate or attacker embeds instructions inside a resume that tell the model to rank them highest.", likelihood: 4, impact: 4, business_consequences: "The wrong candidates are hired while the tool looks like it works." },
      { id: "t3", category: "bias_fairness", name: "Biased screening", description: "The model learns patterns from historical hiring data and scores groups unfairly.", likelihood: 4, impact: 4, business_consequences: "Discrimination risk, reputation damage, and legal claims from rejected applicants." },
      { id: "t4", category: "unauthorized_access", name: "Broken access control", description: "Any recruiter can view all resumes, including ones outside their hiring pipeline.", likelihood: 3, impact: 4, business_consequences: "Confidential candidate data is seen by the wrong people." },
      { id: "t5", category: "model_theft", name: "Extracting the scoring logic", description: "Repeated probing lets an attacker reverse engineer what the model rewards in a resume.", likelihood: 3, impact: 2, business_consequences: "Competitors copy the screening approach and the tool loses its edge." },
      { id: "t6", category: "data_leakage", name: "Candidate data in logs", description: "Resumes and scores are written to logs that are readable by the wider IT team.", likelihood: 4, impact: 3, business_consequences: "Personal data is exposed beyond the intended audience." },
      { id: "t7", category: "hallucination", name: "Wrong rankings", description: "The model invents qualifications or ignores real ones, producing an unreliable rank order.", likelihood: 3, impact: 3, business_consequences: "Strong candidates are overlooked and hiring decisions are unfair." },
    ],
    teaching_points: [
      "Hiring decisions with real consequences cannot rely on an uncontrolled model.",
      "Prompt injection can arrive hidden inside the input document, not only in the chat box.",
      "Bias in the model mirrors bias in the historical data used to train it.",
      "The AI gateway is the single best place to enforce filtering before the model.",
    ],
  },
  {
    id: "medical_ai",
    title: "Medical Diagnosis Assistant",
    description: "An AI assistant that drafts possible diagnoses and care suggestions from patient notes.",
    business_goal: "Reduce the time doctors spend on documentation and offer second opinions on complex cases.",
    users: "Hospital clinicians (about 150 licensed physicians and nurses).",
    data_types: ["Electronic health records", "Lab results", "Medication lists", "Patient demographics"],
    model_type: "Fine-tuned LLM on clinical text",
    criticality: "Critical",
    governance_stance: "Poorly Governed",
    baseline_controls: ["audit_logging"],
    architecture: [
      { id: "clinicians", name: "Clinicians", role: "input", purpose: "Physicians and nurses enter patient notes and review suggested diagnoses.", security_considerations: ["Clinicians have broad legitimate access to health records", "Mobile devices are used at the bedside"], attack_surface: "A lost or stolen clinician session exposes protected health data." },
      { id: "web_app", name: "Clinical Web App", role: "application", purpose: "Secure portal where the assistant is integrated into the clinical workflow.", security_considerations: ["Must comply with health data protection rules", "Audit trail is partial"], attack_surface: "Weak session handling exposes patient records." },
      { id: "ai_gateway", name: "AI Gateway", role: "gateway", purpose: "Routes clinical prompts to the model and is supposed to filter protected health data.", security_considerations: ["Filtering is configured broadly and often bypassed", "No approval step before the model"], attack_surface: "Health data passes to the model without a governance decision." },
      { id: "llm", name: "Clinical LLM", role: "model", purpose: "Model trained on clinical text that drafts possible diagnoses.", security_considerations: ["Hosted model provider stores prompts", "Diagnoses are suggestions, not medical advice"], attack_surface: "Patient data in prompts is retained by a third party." },
      { id: "vector_db", name: "Knowledge Store", role: "store", purpose: "Retrieves relevant clinical guidelines and similar historical cases.", security_considerations: ["Similar cases may contain patient identifiers", "Retrieval has no validation"], attack_surface: "Retrieved patient data leaks into the generated answer." },
      { id: "internal_docs", name: "Medical Records", role: "data", purpose: "Source electronic health records that populate the assistant context.", security_considerations: ["Highest sensitivity data class", "Access should be on a need-to-know basis"], attack_surface: "Every record retrieved is a disclosure of protected health information." },
      { id: "logging", name: "Audit Logging", role: "support", purpose: "Records which clinician asked which question and what the model replied.", security_considerations: ["Logs are health data themselves", "Retention rules are unclear"], attack_surface: "Logs become a second copy of protected health data." },
      { id: "monitoring", name: "Safety Monitoring", role: "support", purpose: "Watch for unsafe suggestions and model drift.", security_considerations: ["Monitoring is manual and periodic", "No automated safety review"], attack_surface: "A dangerous suggestion can reach a clinician before any review." },
    ],
    threats: [
      { id: "t1", category: "data_privacy", name: "Protected health data to a third party", description: "Full patient notes are sent to a hosted model provider without a governance decision.", likelihood: 5, impact: 5, business_consequences: "Severe regulatory breach, fines, and a loss of patient trust that is hard to rebuild." },
      { id: "t2", category: "hallucination", name: "Unsafe diagnosis suggestion", description: "The model states a confident but wrong diagnosis that a clinician may follow.", likelihood: 4, impact: 5, business_consequences: "Patient harm, liability, and an immediate loss of clinical trust." },
      { id: "t3", category: "bias_fairness", name: "Biased care suggestions", description: "The model treats some patient groups differently because of training data bias.", likelihood: 3, impact: 4, business_consequences: "Unequal care and potential discrimination claims." },
      { id: "t4", category: "unauthorized_access", name: "Wide record access", description: "Any clinician can retrieve records for patients outside their care team.", likelihood: 3, impact: 5, business_consequences: "Protected health data is seen by staff with no clinical need." },
      { id: "t5", category: "prompt_injection", name: "Instructions hidden in notes", description: "Text inside a patient note instructs the model to change its behavior or expose data.", likelihood: 2, impact: 4, business_consequences: "Model behavior is hijacked inside a clinical context." },
      { id: "t6", category: "model_poisoning", name: "Corrupted fine-tuning data", description: "The model is fine-tuned on clinical text that includes poisoned or incorrect labels.", likelihood: 2, impact: 4, business_consequences: "Systematic wrong suggestions across many patients." },
      { id: "t7", category: "data_leakage", name: "Records in audit logs", description: "Prompts and replies containing patient data are stored in logs with broad access.", likelihood: 4, impact: 4, business_consequences: "A second uncontrolled copy of protected health data." },
    ],
    teaching_points: [
      "Health data has the highest stakes: the risk is patient harm, not only a fine.",
      "Hallucination in a clinical tool is a safety failure, so output validation matters most.",
      "Retrieval of similar cases can leak identifiers even when the question is clean.",
      "Human approval is essential before a suggestion becomes a decision.",
    ],
  },
  {
    id: "banking_assistant",
    title: "Bank Loan Approval Assistant",
    description: "An AI assistant that drafts loan decisions and explains them to applicants and staff.",
    business_goal: "Speed up loan underwriting and provide plain-language explanations of decisions.",
    users: "Loan officers and support staff (about 120 users), plus public-facing chat.",
    data_types: ["Financial statements", "Credit scores", "Income and employment data", "Application forms"],
    model_type: "LLM over structured financial data",
    criticality: "Critical",
    governance_stance: "Poorly Governed",
    baseline_controls: ["audit_logging", "encryption"],
    architecture: [
      { id: "users", name: "Users", role: "input", purpose: "Loan officers use the assistant internally while applicants reach it through public chat.", security_considerations: ["Public chat is a different threat model than internal use", "Users can paste documents freely"], attack_surface: "The public interface invites abuse that internal users would not attempt." },
      { id: "web_app", name: "Banking App", role: "application", purpose: "Web portal and chat widget for loan applications and decision explanations.", security_considerations: ["Financial data requires strong controls", "Rate limits are not applied to chat"], attack_surface: "An unauthenticated user can query the assistant repeatedly." },
      { id: "ai_gateway", name: "AI Gateway", role: "gateway", purpose: "Entry point that routes requests and enforces policy between the app and the model.", security_considerations: ["No prompt filtering configured", "No approval workflow"], attack_surface: "Policy is only a routing rule, so nothing stops abusive or sensitive requests." },
      { id: "llm", name: "LLM", role: "model", purpose: "Drafts loan decisions and produces applicant-facing explanations.", security_considerations: ["Financial data is highly regulated", "Model may expose other applicants' data in rare cases"], attack_surface: "An attacker prompts the model to reveal decision logic or protected data." },
      { id: "vector_db", name: "Policy Store", role: "store", purpose: "Holds lending policies and past decision examples used as context.", security_considerations: ["Past decisions contain applicant identifiers", "Retrieval is unfiltered"], attack_surface: "Retrieval surfaces a similar customer's financial data." },
      { id: "internal_docs", name: "Financial Records", role: "data", purpose: "Applicant statements, credit reports, and income data pulled into the prompt.", security_considerations: ["Highest value data for fraud", "Regulated and auditable"], attack_surface: "Every prompt is a potential disclosure of financial data." },
      { id: "logging", name: "Decision Logging", role: "support", purpose: "Records every decision and explanation for regulatory audit.", security_considerations: ["Logs are evidence, not just telemetry", "Retention must be controlled"], attack_surface: "Poorly protected logs expose the same financial data as the system." },
      { id: "monitoring", name: "Fairness Monitoring", role: "support", purpose: "Checks whether decisions treat applicants consistently.", security_considerations: ["Monitoring covers only technical errors", "No fairness or bias checks"], attack_surface: "Unfair patterns persist silently and become a legal exposure." },
    ],
    threats: [
      { id: "t1", category: "data_leakage", name: "Financial data in prompts", description: "Full financial statements and credit data are sent to the model for every request.", likelihood: 5, impact: 5, business_consequences: "Regulatory breach, fraud risk, and severe reputational damage for a bank." },
      { id: "t2", category: "api_abuse", name: "Unlimited public chat abuse", description: "The public interface has no rate limits, so anyone can probe or overload the assistant.", likelihood: 4, impact: 3, business_consequences: "Cost abuse, service degradation, and a playground for attackers." },
      { id: "t3", category: "bias_fairness", name: "Unfair loan decisions", description: "The model reflects historical lending bias in the decisions it drafts.", likelihood: 4, impact: 5, business_consequences: "Discrimination complaints, regulatory action, and public backlash." },
      { id: "t4", category: "prompt_injection", name: "Prompt injection via chat", description: "A user crafts a chat message that overrides the assistant's instructions.", likelihood: 4, impact: 4, business_consequences: "The assistant can be made to reveal data or give dangerous advice." },
      { id: "t5", category: "unauthorized_access", name: "Missing access control", description: "Any staff member can see decision context for applicants outside their team.", likelihood: 3, impact: 4, business_consequences: "Financial details of customers are visible to the wrong employees." },
      { id: "t6", category: "hallucination", name: "Wrong explanations", description: "The model explains a decision with reasons that contradict the actual underwriting logic.", likelihood: 3, impact: 4, business_consequences: "Customers are misled and the bank's reasoning is not defensible in disputes." },
      { id: "t7", category: "denial_of_service", name: "Overload of the assistant", description: "Automated traffic floods the chat interface and blocks genuine applicants.", likelihood: 3, impact: 3, business_consequences: "Applicants cannot reach support at critical moments." },
    ],
    teaching_points: [
      "A public-facing AI has a larger attack surface than an internal one.",
      "Rate limiting is a security control, not just a cost control.",
      "Explaining a loan decision wrongly is a legal risk, not only a product bug.",
      "Financial data in every prompt multiplies the impact of a single mistake.",
    ],
  },
  {
    id: "airport_security",
    title: "Airport Security Assistant",
    description: "An AI assistant that helps screening officers evaluate flagged passengers and baggage scans.",
    business_goal: "Help officers interpret scanner flags faster and improve the accuracy of secondary screening.",
    users: "Airport screening officers (about 400 users) at one airport.",
    data_types: ["Passenger watchlists", "Biometric data", "Flight manifests", "Scanner output"],
    model_type: "Vision model with a language interface",
    criticality: "Critical",
    governance_stance: "Poorly Governed",
    baseline_controls: ["audit_logging", "model_version_control"],
    architecture: [
      { id: "officers", name: "Screening Officers", role: "input", purpose: "Officers ask the assistant about flagged passengers and review its reading of scans.", security_considerations: ["Officers are under time pressure and may trust the AI too fast", "Shared terminals at checkpoints"], attack_surface: "A confident wrong answer influences a security decision under pressure." },
      { id: "web_app", name: "Screening Console", role: "application", purpose: "Terminal application at the checkpoint where flags and assistant answers appear.", security_considerations: ["High-security environment", "Session integrity is critical"], attack_surface: "Session hijacking on a checkpoint terminal affects live operations." },
      { id: "ai_gateway", name: "AI Gateway", role: "gateway", purpose: "Routes screening queries to the vision model and enforces policy.", security_considerations: ["Biometric data must be restricted", "No approval gate before actions"], attack_surface: "A request can ask the model to override or reveal watchlist data." },
      { id: "llm", name: "Vision-Language Model", role: "model", purpose: "Interprets scanner images and answers questions about flagged items and passengers.", security_considerations: ["Vision models can be fooled by adversarial patterns", "Outputs must not be treated as decisions"], attack_surface: "An adversarial image is crafted to hide a threat from the model." },
      { id: "vector_db", name: "Watchlist Store", role: "store", purpose: "Stores watchlist embeddings and historical flag patterns.", security_considerations: ["Watchlist data is extremely sensitive", "Access must be audit-only"], attack_surface: "Retrieval exposes watchlist membership through the assistant's answers." },
      { id: "internal_docs", name: "Security Data", role: "data", purpose: "Flight manifests, biometric samples, and scanner configuration used as context.", security_considerations: ["Sensitive operational data", "Must never leave the airport network"], attack_surface: "Operational data is disclosed to a hosted model provider." },
      { id: "logging", name: "Security Logging", role: "support", purpose: "Records every query and the officer who made it for accountability.", security_considerations: ["Logs contain passenger and biometric data", "Logs support incident investigation"], attack_surface: "Insiders read logs to track specific passengers." },
      { id: "monitoring", name: "Alert Monitoring", role: "support", purpose: "Flags model errors and unusual query patterns.", security_considerations: ["Monitoring exists but is reactive", "No adversarial robustness testing"], attack_surface: "A crafted scan pattern goes unnoticed until a real miss." },
    ],
    threats: [
      { id: "t1", category: "adversarial_ml", name: "Adversarial scan patterns", description: "An attacker crafts a pattern that the vision model consistently misreads.", likelihood: 3, impact: 5, business_consequences: "A genuine threat passes screening or a passenger is wrongly held." },
      { id: "t2", category: "data_privacy", name: "Biometric data outside the network", description: "Biometric samples and watchlist data are sent to a hosted model provider.", likelihood: 3, impact: 5, business_consequences: "A major privacy breach of sensitive identity data." },
      { id: "t3", category: "hallucination", name: "Confident wrong answers", description: "The model invents a reason to detain or release a passenger.", likelihood: 3, impact: 5, business_consequences: "Wrong security decisions with real safety and legal consequences." },
      { id: "t4", category: "insider_threat", name: "Insider data misuse", description: "Staff use the assistant to probe watchlist status of people they know.", likelihood: 3, impact: 4, business_consequences: "Watchlist membership is leaked to people with access to the tool." },
      { id: "t5", category: "unauthorized_access", name: "Broad terminal access", description: "Any officer can query any passenger record regardless of duty need.", likelihood: 3, impact: 4, business_consequences: "Passenger data is accessible beyond the need-to-know boundary." },
      { id: "t6", category: "denial_of_service", name: "Assistant unavailable at peak", description: "High checkpoint load degrades the assistant exactly when it is needed.", likelihood: 3, impact: 3, business_consequences: "Screening slows down and officers fall back to manual review." },
      { id: "t7", category: "supply_chain", name: "Untrusted model update", description: "A model or scanner update arrives from the vendor without verification.", likelihood: 2, impact: 4, business_consequences: "A modified model behaves differently without anyone knowing why." },
    ],
    teaching_points: [
      "When lives and safety are at stake, the model output is a signal, not the decision.",
      "Biometric data should never leave the operational network.",
      "Adversarial ML means the model can be beaten by input patterns, not just words.",
      "Governance here is about who can ask and what the answer may be used for.",
    ],
  },
  {
    id: "customer_chatbot",
    title: "Customer Support Chatbot",
    description: "A public chatbot that answers customer questions using product docs and account history.",
    business_goal: "Resolve common support tickets automatically and cut call center volume.",
    users: "All customers of the platform (public interface), plus support agents.",
    data_types: ["Product documentation", "Customer account details", "Order history", "Support transcripts"],
    model_type: "RAG-enabled LLM chatbot",
    criticality: "Medium",
    governance_stance: "Poorly Governed",
    baseline_controls: ["input_validation", "audit_logging"],
    architecture: [
      { id: "customers", name: "Customers", role: "input", purpose: "Anyone with a web browser can chat with the assistant from the public site.", security_considerations: ["Unauthenticated users form the primary threat surface", "Public prompts can be malicious"], attack_surface: "An anonymous user is one crafted prompt away from abusing the system." },
      { id: "web_app", name: "Support Portal", role: "application", purpose: "Chat widget embedded in the customer portal with a login for account-linked answers.", security_considerations: ["Authentication is optional for most questions", "Session data is sensitive"], attack_surface: "An attacker logs in as a victim and asks account questions." },
      { id: "ai_gateway", name: "AI Gateway", role: "gateway", purpose: "Routes chatbot requests, applies prompt filters, and enforces answer policy.", security_considerations: ["Filtering is the main defense and is lightly configured", "No human review lane"], attack_surface: "Malicious prompts pass through because filtering is weak." },
      { id: "llm", name: "LLM", role: "model", purpose: "Generates conversational answers to customer questions.", security_considerations: ["Hosted model processes all public prompts", "Answers must be grounded in product docs"], attack_surface: "Jailbreaks and injections turn the model into a tool for the attacker." },
      { id: "vector_db", name: "Knowledge Base", role: "store", purpose: "Embeds product documentation and curated FAQ content.", security_considerations: ["Should contain only approved public docs", "Account data must not be indexed here"], attack_surface: "If internal docs are indexed, the chatbot leaks them." },
      { id: "internal_docs", name: "Account Data", role: "data", purpose: "Customer order history and account details used for account-linked answers.", security_considerations: ["Only the logged-in customer's own data should be available", "Cross-customer retrieval is a risk"], attack_surface: "The model retrieves another customer's order details." },
      { id: "logging", name: "Chat Logging", role: "support", purpose: "Stores transcripts for QA and dispute resolution.", security_considerations: ["Transcripts contain customer data", "Log retention should be time-limited"], attack_surface: "Long-lived transcripts become a data breach waiting to happen." },
      { id: "monitoring", name: "Answer Monitoring", role: "support", purpose: "Tracks satisfaction and flagged bad answers.", security_considerations: ["Monitoring is manual", "No automated content safety checks"], attack_surface: "Abusive or dangerous answers are not caught until a customer reports them." },
    ],
    threats: [
      { id: "t1", category: "jailbreak", name: "Public jailbreak attempts", description: "Anonymous users use roleplay and framing tricks to bypass the assistant's rules.", likelihood: 4, impact: 3, business_consequences: "The chatbot gives harmful or off-policy answers at scale." },
      { id: "t2", category: "prompt_injection", name: "Injection through support text", description: "A user pastes injection text that the chatbot follows instead of its instructions.", likelihood: 4, impact: 3, business_consequences: "The assistant is hijacked to do things it was not built to do." },
      { id: "t3", category: "data_leakage", name: "Cross-customer data leak", description: "The model retrieves or repeats another customer's order details.", likelihood: 3, impact: 4, business_consequences: "A privacy breach affecting many customers and trust in the brand." },
      { id: "t4", category: "data_privacy", name: "Transcripts held too long", description: "Chat logs with personal data are stored without a retention limit.", likelihood: 3, impact: 3, business_consequences: "Every transcript is a potential future breach." },
      { id: "t5", category: "api_abuse", name: "Prompt cost abuse", description: "Automated traffic pumps prompts to exhaust the budget or trigger rate limits.", likelihood: 4, impact: 2, business_consequences: "Rising cost and degraded service for real customers." },
      { id: "t6", category: "unauthorized_access", name: "Account-linked answers without checks", description: "The assistant answers account questions without verifying the session belongs to the account.", likelihood: 3, impact: 4, business_consequences: "Customer account details are disclosed to the wrong person." },
      { id: "t7", category: "hallucination", name: "Invented policies", description: "The model invents refund or shipping policies that the company never offered.", likelihood: 4, impact: 2, business_consequences: "Customers act on wrong information and disputes increase." },
    ],
    teaching_points: [
      "A public chatbot is the highest-exposure AI you can build because anyone can reach it.",
      "Jailbreaks and injections are the default threat for anonymous users.",
      "Retrieval must be scoped to the logged-in user, never the whole database.",
      "Rate limits protect budget and service availability, not only security.",
    ],
  },
  {
    id: "industrial_ai",
    title: "Industrial Predictive Maintenance",
    description: "An AI system that predicts machine failures and schedules maintenance on factory equipment.",
    business_goal: "Reduce unplanned downtime by predicting equipment failure before it happens.",
    users: "Plant operators and maintenance teams (about 80 users) at one factory.",
    data_types: ["Sensor telemetry", "Machine logs", "Maintenance history", "Equipment specs"],
    model_type: "Time-series model with an LLM reporting layer",
    criticality: "High",
    governance_stance: "Poorly Governed",
    baseline_controls: ["input_validation", "model_monitoring"],
    architecture: [
      { id: "operators", name: "Plant Operators", role: "input", purpose: "Operators read maintenance alerts and act on the assistant's recommendations.", security_considerations: ["Operators act fast on alerts", "Wrong advice stops production"], attack_surface: "A misleading alert causes operators to shut down healthy machines." },
      { id: "web_app", name: "Plant Dashboard", role: "application", purpose: "Dashboard where predictions and recommended actions are shown.", security_considerations: ["Production systems have high uptime needs", "Access control is per-plant"], attack_surface: "A compromised dashboard feeds false predictions to operators." },
      { id: "ai_gateway", name: "AI Gateway", role: "gateway", purpose: "Routes sensor data to the prediction model and the reporting LLM.", security_considerations: ["Sensor data volume is large", "Gateway should validate inputs"], attack_surface: "Fake telemetry injected at the gateway skews predictions." },
      { id: "llm", name: "Reporting LLM", role: "model", purpose: "Turns prediction scores into plain-language maintenance recommendations.", security_considerations: ["The LLM is only the reporting layer", "Its words affect operator actions"], attack_surface: "Injected text in sensor labels changes what the report says." },
      { id: "vector_db", name: "Maintenance Knowledge", role: "store", purpose: "Historical maintenance records used to explain why a part fails.", security_considerations: ["Contains vendor and plant data", "Should not include proprietary formulas"], attack_surface: "Retrieval exposes vendor pricing or maintenance secrets." },
      { id: "internal_docs", name: "Sensor Telemetry", role: "data", purpose: "Continuous streams of sensor readings from factory equipment.", security_considerations: ["Telemetry reveals production capacity", "Availability matters more than secrecy"], attack_surface: "Telemetry manipulation creates false alarms or hides real ones." },
      { id: "logging", name: "Plant Logging", role: "support", purpose: "Records every prediction and maintenance action for audit.", security_considerations: ["Logs support incident reconstruction", "Integration with SCADA is delicate"], attack_surface: "Insider edits to logs hide a failed maintenance action." },
      { id: "monitoring", name: "Prediction Monitoring", role: "support", purpose: "Tracks model accuracy against actual failures.", security_considerations: ["Drift detection is manual", "No feedback loop into the model"], attack_surface: "The model drifts and nobody notices until a machine fails." },
    ],
    threats: [
      { id: "t1", category: "adversarial_ml", name: "Telemetry poisoning", description: "An attacker injects false sensor readings that make the model miss a real failure.", likelihood: 2, impact: 5, business_consequences: "A machine fails without warning, causing downtime and safety risk." },
      { id: "t2", category: "model_poisoning", name: "Corrupted maintenance history", description: "Bad labels in maintenance history train the model to repeat wrong predictions.", likelihood: 2, impact: 4, business_consequences: "Systematically wrong maintenance schedules across the plant." },
      { id: "t3", category: "hallucination", name: "Wrong maintenance advice", description: "The reporting LLM invents a root cause that matches the score but not reality.", likelihood: 3, impact: 4, business_consequences: "Maintenance crews fix the wrong part and the failure returns." },
      { id: "t4", category: "unauthorized_access", name: "Broad dashboard access", description: "Contractors and vendors see prediction data for machines beyond their scope.", likelihood: 3, impact: 3, business_consequences: "Operational data leaks to third parties." },
      { id: "t5", category: "insider_threat", name: "Insider manipulation of predictions", description: "A disgruntled employee alters telemetry or logs to cause a shutdown.", likelihood: 2, impact: 4, business_consequences: "Deliberate operational disruption from inside the plant." },
      { id: "t6", category: "supply_chain", name: "Compromised model update", description: "A vendor model update is deployed without integrity verification.", likelihood: 2, impact: 4, business_consequences: "Unknown changes to prediction behavior across all machines." },
      { id: "t7", category: "denial_of_service", name: "Alert flooding", description: "Automated or malicious telemetry floods the dashboard with alerts.", likelihood: 3, impact: 3, business_consequences: "Operators ignore alerts and miss a genuine failure." },
    ],
    teaching_points: [
      "An AI that touches physical systems has safety consequences, not only data ones.",
      "Poisoning the training data is a real way to break a maintenance model.",
      "The reporting LLM must be separated from the prediction model that does the math.",
      "Monitoring accuracy against actual outcomes is the core governance control here.",
    ],
  },
];

export const GOVERNANCE_PROJECT_BY_ID: Record<string, GovernanceProject> = Object.fromEntries(
  GOVERNANCE_PROJECTS.map((p) => [p.id, p])
);
