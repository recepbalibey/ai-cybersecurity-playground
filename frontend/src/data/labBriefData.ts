/* ------------------------------------------------------------------ */
/* Lab Brief - centralized configuration for every laboratory.        */
/* One LabBrief object per lab drives the shared LabBrief drawer,     */
/* the mission indicator, and the completion panel.                   */
/* ------------------------------------------------------------------ */

export type LabDifficulty = "Beginner" | "Intermediate" | "Advanced";

export interface LabTheoryLink {
  topicId: string;
  label: string;
}

export interface LabBrief {
  id: string;
  title: string;
  description: string;
  learningObjectives: string[];
  prerequisites: string[];
  theoryLinks: LabTheoryLink[];
  mission: string;
  missionObjectives: string[];
  difficulty: LabDifficulty;
  estimatedTime: string;
  skills: string[];
  whatYouLearned: string[];
  missionSteps?: string[];
}

export const LAB_BRIEFS: Record<string, LabBrief> = {
  "soc-analyst": {
    id: "soc-analyst",
    title: "AI SOC Analyst",
    description: "Investigate suspicious activity with AI.",
    learningObjectives: [
      "Use AI to analyze security events, identify suspicious behavior, and validate AI-generated conclusions.",
      "Triage raw log evidence into a clear incident narrative.",
      "Extract indicators of compromise and map them to MITRE ATT&CK.",
    ],
    prerequisites: [
      "Basic networking",
      "IP addresses and network events",
      "Difference between benign and malicious activity",
    ],
    theoryLinks: [{ topicId: "detection", label: "Review theory: AI Detection & SOC Triage" }],
    mission:
      "Investigate the suspicious activity, determine what happened, and validate the AI analyst's conclusions using the available evidence.",
    missionObjectives: [
      "Analyze the provided evidence",
      "Identify suspicious behavior",
      "Validate the AI conclusion",
      "Submit your final assessment",
    ],
    difficulty: "Intermediate",
    estimatedTime: "15 min",
    skills: ["Threat Detection", "AI Validation"],
    whatYouLearned: [
      "Identified suspicious activity",
      "Validated AI findings",
      "Used evidence to support a security decision",
    ],
    missionSteps: [
      "Review the evidence",
      "Analyze with AI",
      "Extract indicators",
      "Read the incident report",
    ],
  },
  "threat-hunting": {
    id: "threat-hunting",
    title: "AI Threat Hunting Assistant",
    description: "Proactively hunt for threats before alarms fire.",
    learningObjectives: [
      "Use AI to turn a hunting objective into a hypothesis and queries.",
      "Select the right telemetry for a hunt.",
      "Interpret findings and close the loop with a hunt report.",
    ],
    prerequisites: [
      "Basic network and endpoint concepts",
      "Indicators of compromise",
      "Logs and telemetry sources",
    ],
    theoryLinks: [{ topicId: "hunting", label: "Review theory: Threat Hunting" }],
    mission:
      "Develop a hunting hypothesis, investigate the available telemetry, and determine whether the suspected threat is present.",
    missionObjectives: [
      "Define a hunting objective",
      "Form a testable hypothesis",
      "Inspect the generated queries",
      "Judge the findings against evidence",
    ],
    difficulty: "Intermediate",
    estimatedTime: "15 min",
    skills: ["Threat Hunting", "Query Interpretation"],
    whatYouLearned: [
      "Ran a hypothesis-driven hunt",
      "Selected relevant telemetry",
      "Connected queries to findings",
    ],
    missionSteps: [
      "Define the objective",
      "Form a hypothesis",
      "Inspect the queries",
      "Judge the findings",
    ],
  },
  "pentest-assistant": {
    id: "pentest-assistant",
    title: "AI Pentest Assistant",
    description: "Assess a target's attack surface with AI support.",
    learningObjectives: [
      "Use AI to plan a structured security assessment.",
      "Analyze vulnerabilities and their impact.",
      "Produce a professional, scoped assessment report.",
    ],
    prerequisites: [
      "Basic web security",
      "Vulnerability concepts",
      "Ethical security testing",
    ],
    theoryLinks: [{ topicId: "pentest", label: "Review theory: AI-Assisted Pentesting" }],
    mission:
      "Assess the simulated target, identify security weaknesses, evaluate their impact, and determine appropriate defensive recommendations.",
    missionObjectives: [
      "Configure the target and scope",
      "Map the attack surface",
      "Review the findings and their impact",
      "Read the final report",
    ],
    difficulty: "Intermediate",
    estimatedTime: "20 min",
    skills: ["Vulnerability Analysis", "Security Validation"],
    whatYouLearned: [
      "Mapped an attack surface",
      "Prioritized vulnerabilities by impact",
      "Drafted a scoped assessment report",
    ],
    missionSteps: [
      "Configure the target",
      "Map the attack surface",
      "Review the phases",
      "Read the findings and report",
    ],
  },
  "prompt-injection": {
    id: "prompt-injection",
    title: "Prompt Injection Lab",
    description: "Attack and defend a simulated LLM application.",
    learningObjectives: [
      "Craft prompts that override intended AI behavior.",
      "Understand the instruction hierarchy and context separation.",
      "Evaluate which defenses stop the attack.",
    ],
    prerequisites: [
      "Basic LLM concepts",
      "Prompts and instructions",
      "Input handling basics",
    ],
    theoryLinks: [
      { topicId: "prompt", label: "Review theory: Prompt Injection" },
      { topicId: "llm", label: "Review theory: Large Language Models" },
    ],
    mission:
      "Attempt to manipulate the simulated AI application using prompt injection techniques, identify what the attack changes, and evaluate the effectiveness of the available defenses.",
    missionObjectives: [
      "Craft an injection payload",
      "Run it against the vulnerable application",
      "Compare the protected configuration",
      "Identify the defense that blocked it",
    ],
    difficulty: "Intermediate",
    estimatedTime: "15 min",
    skills: ["Prompt Injection", "AI Application Defenses"],
    whatYouLearned: [
      "Crafted an effective injection",
      "Saw how instructions override intended behavior",
      "Evaluated which defense prevented it",
    ],
  },
  "jailbreak-lab": {
    id: "jailbreak-lab",
    title: "Jailbreak Playground",
    description: "Probe a model's safety boundaries and measure guardrails.",
    learningObjectives: [
      "Understand how jailbreaks bypass safety training.",
      "Test model safety boundaries with controlled scenarios.",
      "Measure and compare defensive robustness.",
    ],
    prerequisites: [
      "Basic LLM behavior",
      "AI safety concepts",
      "Model guardrails",
    ],
    theoryLinks: [
      { topicId: "jailbreak", label: "Review theory: Jailbreaks" },
      { topicId: "llm", label: "Review theory: Large Language Models" },
    ],
    mission:
      "Test the model's safety boundaries using the provided scenarios and determine which defenses reduce unsafe behavior.",
    missionObjectives: [
      "Select a scenario and target model",
      "Craft a jailbreak attempt",
      "Review the safety evaluation",
      "Compare models and defenses",
    ],
    difficulty: "Intermediate",
    estimatedTime: "20 min",
    skills: ["Jailbreak Techniques", "Defensive Evaluation"],
    whatYouLearned: [
      "Probed model safety boundaries",
      "Measured unsafe behavior",
      "Compared defensive robustness",
    ],
  },
  "adversarial-ml": {
    id: "adversarial-ml",
    title: "Adversarial Face Recognition Lab",
    description: "Fool a vision model and measure its robustness.",
    learningObjectives: [
      "Understand adversarial examples and perturbations.",
      "Modify inputs and observe classification changes.",
      "Evaluate model robustness and defenses.",
    ],
    prerequisites: [
      "Basic machine learning",
      "Classification concepts",
      "Confidence scores",
    ],
    theoryLinks: [
      { topicId: "adversarial", label: "Review theory: Adversarial Examples" },
      { topicId: "ml", label: "Review theory: Machine Learning" },
    ],
    mission:
      "Modify the simulated input within the permitted laboratory controls, observe how the model's classification changes, and evaluate its robustness.",
    missionObjectives: [
      "Choose an experiment and attack",
      "Run the adversarial analysis",
      "Review how classification changed",
      "Assess robustness and defenses",
    ],
    difficulty: "Intermediate",
    estimatedTime: "20 min",
    skills: ["Adversarial ML", "Model Robustness"],
    whatYouLearned: [
      "Created adversarial perturbations",
      "Saw classification failures",
      "Measured model robustness",
    ],
  },
  "agent-security": {
    id: "agent-security",
    title: "AI Agent Security Lab",
    description: "Understand, attack, and defend autonomous AI agents.",
    learningObjectives: [
      "Map an agent's tools, permissions, and attack surface.",
      "Identify unsafe agent behavior.",
      "Select controls that gate actions and prevent abuse.",
    ],
    prerequisites: [
      "LLM basics",
      "APIs",
      "Authentication and authorization",
    ],
    theoryLinks: [
      { topicId: "agent", label: "Review theory: AI Agents & Tool Use" },
      { topicId: "prompt", label: "Review theory: Prompt Injection" },
    ],
    mission:
      "Evaluate the agent's tools and permissions, identify unsafe behavior, and determine which controls prevent unauthorized actions.",
    missionObjectives: [
      "Inspect the agent's tools and permissions",
      "Run the mission and watch the actions",
      "Identify unsafe behavior",
      "Apply controls and re-check",
    ],
    difficulty: "Advanced",
    estimatedTime: "20 min",
    skills: ["Agent Security", "Access Control"],
    whatYouLearned: [
      "Mapped an agent's attack surface",
      "Identified unsafe tool usage",
      "Selected controls that prevent abuse",
    ],
  },
  "malware-analysis": {
    id: "malware-analysis",
    title: "AI Malware Analyst Lab",
    description: "Analyze simulated malware and draft detections.",
    learningObjectives: [
      "Use AI to triage a malware sample.",
      "Map observed behavior to MITRE ATT&CK techniques.",
      "Generate defensive detection recommendations.",
    ],
    prerequisites: [
      "Basic operating system concepts",
      "Malware terminology",
      "Indicators of compromise",
    ],
    theoryLinks: [{ topicId: "detection", label: "Review theory: AI Detection & SOC Triage" }],
    mission:
      "Analyze the simulated malware sample, identify its behavior, map the relevant techniques, and generate defensive detection recommendations.",
    missionObjectives: [
      "Select a malware sample",
      "Review the analysis stages",
      "Map behavior to ATT&CK techniques",
      "Draft detection recommendations",
    ],
    difficulty: "Intermediate",
    estimatedTime: "15 min",
    skills: ["Behavior Analysis", "Detection Engineering"],
    whatYouLearned: [
      "Triaged a malware sample",
      "Mapped behavior to techniques",
      "Drafted defensive detections",
    ],
    missionSteps: [
      "Select a sample",
      "Run the analysis",
      "Map to ATT&CK",
      "Draft detections",
    ],
  },
  "code-review": {
    id: "code-review",
    title: "AI Security Code Reviewer",
    description: "Review code for vulnerabilities and verify fixes.",
    learningObjectives: [
      "Use AI to review code for security weaknesses.",
      "Validate AI findings against the code.",
      "Evaluate proposed secure implementations.",
    ],
    prerequisites: [
      "Basic programming",
      "Common web vulnerabilities",
      "Secure coding principles",
    ],
    theoryLinks: [
      { topicId: "pentest", label: "Review theory: AI-Assisted Pentesting" },
      { topicId: "llm", label: "Review theory: Large Language Models" },
    ],
    mission:
      "Review the vulnerable code, identify the security weaknesses, validate the AI findings, and evaluate the proposed secure implementation.",
    missionObjectives: [
      "Load the vulnerable code sample",
      "Run the secure code review",
      "Inspect the findings and risk levels",
      "Review the proposed fix",
    ],
    difficulty: "Intermediate",
    estimatedTime: "20 min",
    skills: ["Secure Code Review", "Vulnerability Identification"],
    whatYouLearned: [
      "Identified security weaknesses",
      "Validated AI findings",
      "Evaluated a secure implementation",
    ],
    missionSteps: [
      "Load the code",
      "Run the review",
      "Inspect the findings",
      "Review the fix",
    ],
  },
  "privacy-lab": {
    id: "privacy-lab",
    title: "AI Data Privacy Lab",
    description: "Protect sensitive data before it reaches the AI.",
    learningObjectives: [
      "Detect sensitive information such as PII in documents.",
      "Classify data by privacy risk.",
      "Apply policy and redaction controls before prompts are sent.",
    ],
    prerequisites: [
      "Basic privacy concepts",
      "PII and sensitive data",
      "Data classification",
    ],
    theoryLinks: [
      { topicId: "llm", label: "Review theory: Large Language Models" },
      { topicId: "rag", label: "Review theory: Retrieval-Augmented Generation" },
    ],
    mission:
      "Identify sensitive information in the provided data, determine whether it can safely reach the AI system, and apply appropriate protection controls.",
    missionObjectives: [
      "Select a document",
      "Scan for sensitive information",
      "Review the findings by risk",
      "Apply redaction and policy controls",
    ],
    difficulty: "Intermediate",
    estimatedTime: "15 min",
    skills: ["Data Privacy", "Data Protection"],
    whatYouLearned: [
      "Detected sensitive information",
      "Classified data by risk",
      "Applied protection controls",
    ],
    missionSteps: [
      "Select a document",
      "Run the scan",
      "Review the findings",
      "Apply redaction",
    ],
  },
  governance: {
    id: "governance",
    title: "AI Risk Assessment & Governance Simulator",
    description: "Assess AI risk and decide whether a system may deploy.",
    learningObjectives: [
      "Assess AI risk from architecture and threats.",
      "Select controls that reduce likelihood and impact.",
      "Interpret residual risk and a deployment recommendation.",
    ],
    prerequisites: [
      "Basic cybersecurity risk concepts",
      "Threats and controls",
      "Risk likelihood and impact",
    ],
    theoryLinks: [
      { topicId: "ml", label: "Review theory: Machine Learning" },
      { topicId: "rag", label: "Review theory: Retrieval-Augmented Generation" },
    ],
    mission:
      "Assess the AI system, identify the most important risks, select appropriate controls, and determine whether the system is ready for deployment.",
    missionObjectives: [
      "Choose an AI project",
      "Explore the architecture",
      "Review the identified risks",
      "Apply controls and watch residual risk",
      "Decide whether to deploy",
    ],
    difficulty: "Advanced",
    estimatedTime: "25 min",
    skills: ["AI Risk Assessment", "Security Governance"],
    whatYouLearned: [
      "Assessed AI risk from architecture",
      "Matched controls to threats",
      "Made a defensible deployment decision",
    ],
    missionSteps: [
      "Choose a project",
      "Explore the architecture",
      "Review the risks",
      "Apply controls",
      "Decide on deployment",
    ],
  },
  "ai-failure-lab": {
    id: "ai-failure-lab",
    title: "AI Failure Lab",
    description: "Validate AI output and judge AI decisions.",
    learningObjectives: [
      "Recognize AI failure modes: false positives, hallucinations, overconfidence.",
      "Compare AI decisions with the evidence.",
      "Choose mitigations that raise reliability.",
    ],
    prerequisites: [
      "Basic cybersecurity analysis",
      "Difference between detection and classification",
      "Confidence vs. correctness",
    ],
    theoryLinks: [
      { topicId: "llm", label: "Review theory: Large Language Models" },
      { topicId: "ml", label: "Review theory: Machine Learning" },
    ],
    mission:
      "Evaluate the AI decision, compare it with the available evidence, identify whether the AI failed, and determine how the decision should be validated.",
    missionObjectives: [
      "Read the evidence and the AI output",
      "Judge whether the AI is correct",
      "Reveal the ground truth",
      "Select mitigations that raise reliability",
    ],
    difficulty: "Intermediate",
    estimatedTime: "20 min",
    skills: ["AI Validation", "Reliability Analysis"],
    whatYouLearned: [
      "Judged AI decisions against evidence",
      "Identified failure modes",
      "Raised reliability with mitigations",
    ],
    missionSteps: [
      "Read the evidence",
      "Judge the AI",
      "Reveal the truth",
      "Apply mitigations",
    ],
  },
};

export function getLabBrief(labId: string): LabBrief | null {
  return LAB_BRIEFS[labId] ?? null;
}
