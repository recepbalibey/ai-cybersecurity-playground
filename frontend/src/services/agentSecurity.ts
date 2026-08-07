// agentSecurity.ts
// AI Agent Security Lab - autonomous AI agent simulation.
//
// Mirrors the agent loop a real orchestration runtime would produce:
//    Goal -> Planner -> Memory -> Tool Selection -> Tool Execution
//         -> Observation -> Decision -> Final Response
//
// Educational sandbox only. Fully simulated: no real tools, no email, no cloud,
// no OS access, no real APIs. Every tool is a local fake returning canned data.

import { TeachingPoint } from "./aiAnalyst";

export type Difficulty = "beginner" | "intermediate" | "advanced";
export type AgentCategory =
  | "safe"
  | "permission"
  | "prompt_injection"
  | "memory_poisoning"
  | "excessive_permissions";
export type OutcomeType =
  | "safe_complete"
  | "blocked_permission"
  | "detected_injection"
  | "detected_memory_poison"
  | "blocked_excess";

export interface AgentScenario {
  scenario_key: string;
  title: string;
  difficulty: Difficulty;
  category: AgentCategory;
  category_name: string;
  description: string;
  goal: string;
  expected_outcome: OutcomeType;
}

export interface AgentTool {
  key: string;
  name: string;
  description: string;
  permission: string;
  risk: "low" | "medium" | "high";
  output_example: string;
}

export interface SecurityControl {
  key: string;
  name: string;
  category: string;
  description: string;
  effectiveness: string;
}

export interface Principle {
  key: string;
  name: string;
  summary: string;
  details: string;
  good_practice: string;
}

export interface RiskFactor {
  key: string;
  name: string;
  severity: string;
  description: string;
  why_dangerous: string;
  control: string;
}

export interface GraphNode {
  node: string;
  label: string;
  status: string;
  detail: string;
  permission?: string;
  risk?: string;
}

export interface PolicyDecision {
  kind: string;
  tool?: string;
  permission?: string;
  detail: string;
  reason?: string;
}

export interface MissionEvent {
  kind: string;
  stage?: string;
  tool?: string;
  permission?: string;
  allowed?: boolean;
  detail: string;
  reason?: string;
  violation?: boolean;
  risk?: string;
}

export interface MissionResult {
  scenario_key: string;
  title: string;
  category: AgentCategory;
  category_name: string;
  goal: string;
  outcome: OutcomeType;
  outcome_label: string;
  tools_executed: number;
  took_action: boolean;
  graph: GraphNode[];
  policy_log: PolicyDecision[];
  events: MissionEvent[];
  tools_used: string[];
  blocked_count: number;
  violations: MissionEvent[];
  active_controls: string[];
  execution_time_ms: number;
  teaching_points: TeachingPoint[];
}

export interface AgentKnowledge {
  principles: Principle[];
  risk_factors: RiskFactor[];
  controls: SecurityControl[];
  teaching_points: TeachingPoint[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// ---------------------------------------------------------------------------
// Local data (parity with datasets/agent-security/ and knowledge/)
// ---------------------------------------------------------------------------
const TOOLS: AgentTool[] = [
  { key: "security_log_reader", name: "Security Log Reader", description: "Reads and filters Windows event logs (Login, Process, Powershell).", permission: "read:logs", risk: "low", output_example: "4625 - An account failed to log on (Source IP 203.0.113.7)" },
  { key: "threat_intel", name: "Threat Intelligence", description: "Queries a local IOC reputation feed for IPs, domains and hashes.", permission: "read:intel", risk: "low", output_example: "203.0.113.7 - Reputation: malicious, family: BruteForceKit" },
  { key: "mitre_database", name: "MITRE ATT&CK Database", description: "Returns technique and tactic descriptions from the MITRE matrix.", permission: "read:mitre", risk: "low", output_example: "T1110 Brute Force (Credential Access)" },
  { key: "knowledge_base", name: "Knowledge Base", description: "Retrieves security documentation and playbooks.", permission: "read:knowledge", risk: "low", output_example: "Playbook: Credential stuffing response" },
  { key: "incident_database", name: "Incident Database", description: "Searches historical incident records for correlation.", permission: "read:incidents", risk: "low", output_example: "INC-2041 - Brute force on VPN gateway (2026-03-11)" },
  { key: "firewall_console", name: "Firewall Console", description: "Modifies firewall rules and network filtering state.", permission: "write:firewall", risk: "high", output_example: "Rule 4001 added: block 203.0.113.7" },
  { key: "file_analyzer", name: "File Analyzer", description: "Scans and inspects files for malware and sensitive data.", permission: "read:files", risk: "medium", output_example: "hash sha256:d2b4... verdict: malicious" },
  { key: "mailer", name: "Mailer", description: "Sends notifications to recipients on an approved list.", permission: "write:mail", risk: "medium", output_example: "Alert notification queued for SOC-Team" },
];

const CONTROLS: SecurityControl[] = [
  { key: "least_privilege", name: "Least Privilege", category: "permission", description: "Grant tools only for the current mission; revoke when done.", effectiveness: "High" },
  { key: "human_approval", name: "Human Approval", category: "gate", description: "Require explicit human confirmation for high-risk actions.", effectiveness: "High" },
  { key: "prompt_sanitization", name: "Prompt Sanitization", category: "input", description: "Strip or neutralize embedded instructions found in tool output.", effectiveness: "Medium" },
  { key: "output_validation", name: "Output Validation", category: "output", description: "Validate each resolved action before it executes.", effectiveness: "High" },
  { key: "memory_validation", name: "Memory Validation", category: "memory", description: "Verify memory entries for provenance and consistency.", effectiveness: "Medium" },
  { key: "tool_allowlist", name: "Tool Allowlist", category: "permission", description: "Only pre-approved tools can be invoked.", effectiveness: "High" },
  { key: "execution_timeout", name: "Execution Timeout", category: "guardrail", description: "Bound how long a mission and its tool calls may run.", effectiveness: "Medium" },
  { key: "policy_engine", name: "Policy Engine", category: "core", description: "Central allow/block decision maker over every action.", effectiveness: "High" },
];

const KNOWLEDGE: AgentKnowledge = {
  principles: [
    { key: "least_privilege", name: "Least Privilege", summary: "Give the agent only the minimum permissions needed for the current mission.", details: "Every tool and action should be scoped to the smallest set required. When a mission finishes, its elevated permissions should be released.", good_practice: "Bind permissions to a per-mission role and revoke them after execution." },
    { key: "defense_in_depth", name: "Defense in Depth", summary: "Layer independent controls so no single failure is catastrophic.", details: "Prompt sanitization, output validation, policy checks, and human approval are separate layers. An attacker must defeat them all, not just one.", good_practice: "Never rely on a single control; stack independent guardrails." },
    { key: "zero_trust", name: "Zero Trust", summary: "Treat every tool call, input, and memory read as untrusted until verified.", details: "Data returned by tools is untrusted input, not instructions. A document fetched by the agent is data; its embedded 'instructions' are attacks.", good_practice: "Separate instructions from data at every stage of the loop." },
    { key: "human_approval", name: "Human Approval", summary: "High-risk actions require a human to approve before execution.", details: "Autonomous agents can act fast and at scale. Gate destructive, irreversible, or data-exposing actions behind an explicit human confirmation.", good_practice: "Define a risk threshold above which a human is always in the loop." },
    { key: "tool_allowlist", name: "Tool Allowlist", summary: "Only tools on an approved list can be called by the agent.", details: "An allowlist is simpler and safer than a denylist: capabilities are added deliberately, never accidentally discovered by the model.", good_practice: "Expose a fixed, reviewed tool catalog per environment." },
    { key: "output_validation", name: "Output Validation", summary: "Validate the agent's outgoing actions and responses against policy.", details: "Before any real action fires, check the resolved tool call, its arguments, and the target.", good_practice: "Treat the final tool invocation as the security-critical boundary." },
    { key: "policy_enforcement", name: "Policy Enforcement", summary: "A centralized engine that evaluates every requested action before it runs.", details: "The policy engine answers who the caller is, what action is requested, what permission it needs, and what the risk is.", good_practice: "Log every allow/block decision with the rule that produced it." },
    { key: "attack_surface", name: "Expanded Attack Surface", summary: "Every tool the agent can call is a new place an attacker can influence.", details: "A chatbot only outputs text; an agent reads files, queries systems, and triggers actions. Each tool is a target.", good_practice: "Model and defend every tool boundary like a network service." },
  ],
  risk_factors: [
    { key: "indirect_injection", name: "Indirect Prompt Injection", severity: "Critical", description: "Malicious instructions hidden in data the agent reads override the operator's goal.", why_dangerous: "The agent trusts tool output as information, but an attacker uses that channel to send commands.", control: "Prompt sanitization, instruction-vs-data separation, output validation." },
    { key: "memory_poisoning", name: "Memory Poisoning", severity: "High", description: "False or attacker-controlled facts stored in agent memory mislead later decisions.", why_dangerous: "The agent reuses memory across missions; one poisoned entry can corrupt many future decisions.", control: "Memory validation, provenance tracking, integrity checks." },
    { key: "excessive_permissions", name: "Excessive Permissions", severity: "High", description: "The agent is granted more privilege than the mission requires.", why_dangerous: "A tiny prompt trick then executes with full power instead of a scoped minimum.", control: "Least privilege, per-mission roles, permission matrix review." },
    { key: "tool_misuse", name: "Tool Misuse", severity: "Medium", description: "The agent uses a legitimate tool for an unintended or harmful purpose.", why_dangerous: "Tools amplify actions; misuse turns a 'read' capability into data exfiltration or a destructive call.", control: "Output validation, action allowlists, human approval on sensitive calls." },
    { key: "goal_manipulation", name: "Goal Manipulation", severity: "High", description: "An attacker redefines what the agent thinks it is supposed to achieve.", why_dangerous: "The agent optimizes toward the wrong objective and its other defenses can be bypassed by the new framing.", control: "Pinned system goal, instruction hierarchy, prompt sanitization." },
    { key: "instruction_override", name: "Instruction Override", severity: "Critical", description: "Embedded or spoofed instructions claim higher priority than the operator's original task.", why_dangerous: "If the agent believes the attacker's instruction outranks the mission, controls built on the original goal are moot.", control: "Instruction hierarchy, policy engine authority, sanitization." },
  ],
  controls: CONTROLS,
  teaching_points: [
    { title: "Unlike chatbots, AI agents can perform actions.", concept: "Action, not just text", explanation: "A chatbot returns a response. An agent returns actions: it calls tools, reads systems, and changes state.", key_takeaway: "Agent security must protect what the agent does, not just what it says." },
    { title: "Every tool increases the attack surface.", concept: "Expanded attack surface", explanation: "Each tool is a new channel: its inputs can be poisoned, its permissions abused, its output trusted too blindly.", key_takeaway: "Adding a tool adds a new defensive boundary to design." },
    { title: "Agent security depends on architecture, not only prompts.", concept: "Security by architecture", explanation: "Real safety comes from the runtime: policy engines, allowlists, validation, and human gates around the action loop.", key_takeaway: "Hardening the loop is more durable than hardening the wording." },
    { title: "Permission boundaries are one of the most important defenses.", concept: "Permission boundaries", explanation: "The single biggest amplifier of agent attacks is excessive permission. Narrow, per-mission permissions contain the blast radius.", key_takeaway: "Least privilege is the first line of defense for autonomous systems." },
    { title: "Tool output is data, not instructions.", concept: "Instruction vs data separation", explanation: "A document the agent reads is untrusted input. Its embedded 'instructions' are attacks.", key_takeaway: "The agent must treat every observation as data to be validated." },
  ],
};

const PERM_RISK: Record<string, "low" | "medium" | "high"> = {
  "read:logs": "low",
  "read:intel": "low",
  "read:mitre": "low",
  "read:knowledge": "low",
  "read:incidents": "low",
  "read:files": "medium",
  "write:firewall": "high",
  "write:mail": "medium",
  "delete:logs": "high",
};

const OBSERVATIONS: Record<string, string> = {
  security_log_reader: "4625 x12 - failed log on from 203.0.113.7",
  threat_intel: "203.0.113.7 -> reputation malicious (BruteForceKit)",
  mitre_database: "T1110 Brute Force [Credential Access]",
  knowledge_base: "Playbook: credential-stuffing response",
  incident_database: "INC-2041 brute force on VPN gateway",
};

// ---------------------------------------------------------------------------
// Local scenarios (parity with datasets/agent-security/*.json)
// ---------------------------------------------------------------------------
interface LocalScenario {
  scenario_key: string;
  title: string;
  difficulty: Difficulty;
  category: AgentCategory;
  category_name: string;
  description: string;
  goal: string;
  expected_outcome: OutcomeType;
  plan: { tool: string; permission: string; purpose: string }[];
  tools_allowed: string[];
  granted_permissions: string[];
  execution_time_ms: number;
  teaching_points: TeachingPoint[];
}

const SCENARIOS: Record<string, LocalScenario> = {
  "1_safe_investigation": {
    scenario_key: "1_safe_investigation",
    title: "Safe Mission",
    difficulty: "beginner",
    category: "safe",
    category_name: "Benign Mission",
    description: "Investigate the spike of failed VPN logins with read-only tools. The agent completes the mission within policy.",
    goal: "Investigate the recent spike of failed VPN login attempts and report the likely cause.",
    expected_outcome: "safe_complete",
    tools_allowed: ["security_log_reader", "threat_intel", "mitre_database", "knowledge_base", "incident_database"],
    granted_permissions: ["read:logs", "read:intel", "read:mitre", "read:knowledge", "read:incidents"],
    plan: [
      { tool: "security_log_reader", permission: "read:logs", purpose: "Parse recent failed login events" },
      { tool: "threat_intel", permission: "read:intel", purpose: "Check reputation of the attacking IPs" },
      { tool: "mitre_database", permission: "read:mitre", purpose: "Map the pattern to MITRE ATT&CK techniques" },
      { tool: "incident_database", permission: "read:incidents", purpose: "Match against historical incidents" },
    ],
    execution_time_ms: 4200,
    teaching_points: [
      { title: "The agent read, reasoned, and acted - without abusing its powers", concept: "Goal-directed loop", explanation: "The agent planned, selected only the tools it needed, read observations, and produced a response. It never took a write or destructive action.", key_takeaway: "A well-scoped agent completes its mission with only read permissions." },
    ],
  },
  "2_tool_permission": {
    scenario_key: "2_tool_permission",
    title: "Permission Denied",
    difficulty: "beginner",
    category: "permission",
    category_name: "Permission Boundary",
    description: "The agent tries to edit firewall rules using a tool it was not granted. The policy engine denies the action.",
    goal: "Stop the brute-force attempts by editing the firewall to block the offending IPs.",
    expected_outcome: "blocked_permission",
    tools_allowed: ["security_log_reader", "threat_intel", "mitre_database", "incident_database"],
    granted_permissions: ["read:logs", "read:intel", "read:mitre", "read:incidents"],
    plan: [
      { tool: "security_log_reader", permission: "read:logs", purpose: "Identify the offending IPs" },
      { tool: "firewall_console", permission: "write:firewall", purpose: "Block the IPs" },
    ],
    execution_time_ms: 2600,
    teaching_points: [
      { title: "The agent cannot do what it was not allowed to do", concept: "Permission boundary", explanation: "Changing firewall state required a write permission the agent did not hold and a tool not on the allowlist. The policy engine denied it.", key_takeaway: "A tool call is allowed only if it is on the allowlist AND the permission is granted." },
    ],
  },
  "3_prompt_injection": {
    scenario_key: "3_prompt_injection",
    title: "Indirect Prompt Injection",
    difficulty: "intermediate",
    category: "prompt_injection",
    category_name: "Indirect Prompt Injection",
    description: "While reading an incident report, the agent encounters embedded instructions trying to exfiltrate credentials. Sanitization flags and strips them.",
    goal: "Review the open incident report for context on today's alerts.",
    expected_outcome: "detected_injection",
    tools_allowed: ["security_log_reader", "threat_intel", "mitre_database", "knowledge_base", "incident_database"],
    granted_permissions: ["read:logs", "read:intel", "read:mitre", "read:knowledge", "read:incidents"],
    plan: [
      { tool: "knowledge_base", permission: "read:knowledge", purpose: "Load the incident report document" },
      { tool: "threat_intel", permission: "read:intel", purpose: "Cross-check mentioned IOCs" },
      { tool: "incident_database", permission: "read:incidents", purpose: "Summarize matching incidents" },
    ],
    execution_time_ms: 3100,
    teaching_points: [
      { title: "Tool output is data, not instructions", concept: "Instruction vs data separation", explanation: "The incident report contained text that sounded like a system override. Because the agent treats all tool output as data, it flagged the embedded directive instead of obeying it.", key_takeaway: "Indirect injection works only when the agent mistakes data for instructions." },
    ],
  },
  "4_memory_poisoning": {
    scenario_key: "4_memory_poisoning",
    title: "Memory Poisoning",
    difficulty: "intermediate",
    category: "memory_poisoning",
    category_name: "Memory Poisoning",
    description: "A memory entry from a prior mission claims the operator authorized 'emergency credential resets'. Integrity validation flags it as unproven.",
    goal: "Resume the workstation-patching mission from where it left off.",
    expected_outcome: "detected_memory_poison",
    tools_allowed: ["security_log_reader", "threat_intel", "mitre_database", "knowledge_base", "incident_database"],
    granted_permissions: ["read:logs", "read:intel", "read:mitre", "read:knowledge", "read:incidents"],
    plan: [
      { tool: "knowledge_base", permission: "read:knowledge", purpose: "Verify patch policy and approval requirements" },
      { tool: "security_log_reader", permission: "read:logs", purpose: "Check patching status" },
      { tool: "incident_database", permission: "read:incidents", purpose: "Cross-check the memory claim" },
    ],
    execution_time_ms: 3400,
    teaching_points: [
      { title: "Memory must be validated, not trusted", concept: "Memory integrity", explanation: "The agent found a memory entry granting sweeping authority. Because it had no provenance and conflicted with the human-approval policy, the agent refused to act on it.", key_takeaway: "Poisoned memory turns prior sessions into an attack vector." },
    ],
  },
  "5_excessive_permissions": {
    scenario_key: "5_excessive_permissions",
    title: "Excessive Permissions",
    difficulty: "advanced",
    category: "excessive_permissions",
    category_name: "Excessive Permissions",
    description: "The agent attempts an unnecessary destructive call (deleting the entire log database) when a scoped read would do. Least privilege blocks it.",
    goal: "Clean up duplicated log entries to make the analysis pipeline faster.",
    expected_outcome: "blocked_excess",
    tools_allowed: ["security_log_reader", "firewall_console"],
    granted_permissions: ["read:logs", "delete:logs"],
    plan: [
      { tool: "security_log_reader", permission: "read:logs", purpose: "Inspect the duplicated entries" },
      { tool: "firewall_console", permission: "delete:logs", purpose: "Delete the log database (excessive)" },
    ],
    execution_time_ms: 2800,
    teaching_points: [
      { title: "Having the permission is not the same as needing it", concept: "Least privilege", explanation: "The agent physically held delete rights, but the action drastically exceeded the mission scope. Least privilege and the policy engine blocked a destructive call that was unnecessary.", key_takeaway: "Scope checks protect against actions that are possible but not necessary." },
    ],
  },
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------
export async function fetchAgentScenarios(): Promise<AgentScenario[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/agent-security/scenarios`);
    if (res.ok) return (await res.json()).scenarios;
  } catch {
    console.warn("Backend API offline, using local agent scenarios");
  }
  return Object.values(SCENARIOS).map((s) => ({
    scenario_key: s.scenario_key,
    title: s.title,
    difficulty: s.difficulty,
    category: s.category,
    category_name: s.category_name,
    description: s.description,
    goal: s.goal,
    expected_outcome: s.expected_outcome,
  }));
}

export async function fetchAgentTools(): Promise<AgentTool[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/agent-security/tools`);
    if (res.ok) return (await res.json()).tools;
  } catch {
    console.warn("Backend API offline, using local agent tools");
  }
  return TOOLS;
}

export async function fetchAgentControls(): Promise<SecurityControl[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/agent-security/controls`);
    if (res.ok) return (await res.json()).controls;
  } catch {
    console.warn("Backend API offline, using local agent controls");
  }
  return CONTROLS;
}

export async function fetchAgentKnowledge(): Promise<AgentKnowledge> {
  try {
    const res = await fetch(`${API_BASE_URL}/agent-security/knowledge`);
    if (res.ok) return await res.json();
  } catch {
    console.warn("Backend API offline, using local agent knowledge");
  }
  return KNOWLEDGE;
}

export async function runAgentMission(
  goal: string,
  scenarioKey: string,
  controls: string[]
): Promise<MissionResult> {
  try {
    const res = await fetch(`${API_BASE_URL}/agent-security/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goal, scenario_key: scenarioKey, controls }),
    });
    if (res.ok) return await res.json();
  } catch {
    console.warn("Backend API offline, running local agent mission");
  }
  return fallbackRunMission(goal, scenarioKey, controls);
}

// ---------------------------------------------------------------------------
// Local heuristics (mirror of backend app/services/agent_security.py)
// ---------------------------------------------------------------------------
function fallbackRunMission(goal: string, scenarioKey: string, controls: string[]): MissionResult {
  const scenario = SCENARIOS[scenarioKey] ?? SCENARIOS["1_safe_investigation"];
  const active = new Set(controls);
  const missionGoal = (goal || "").trim() || scenario.goal;

  const graph: GraphNode[] = [];
  const policyLog: PolicyDecision[] = [];
  const events: MissionEvent[] = [];
  const toolsUsed: string[] = [];
  let blockedCount = 0;
  const violations: MissionEvent[] = [];
  let outcome: OutcomeType;

  // Planner + Memory
  events.push({ kind: "stage", stage: "planner", detail: "Goal decomposed into a scoped sequence of steps" });
  graph.push({ node: "planner", label: "Planner", status: "done", detail: "Built step sequence" });

  if (scenario.category === "memory_poisoning") {
    if (active.has("memory_validation")) {
      events.push({ kind: "stage", stage: "memory", detail: "Memory entry flagged: no provenance / conflicts with policy" });
      graph.push({ node: "memory", label: "Memory", status: "flagged", detail: "integrity violation" });
      events.push({ kind: "blocked", tool: "memory", reason: "memory_integrity", violation: true, detail: "Unproven memory entry rejected" });
      blockedCount++;
      violations.push(events[events.length - 1]);
      graph.push({ node: "policy_engine", label: "Policy Engine", status: "blocked", detail: "Memory validation blocked poisoned entry" });
      outcome = "detected_memory_poison";
    } else {
      events.push({ kind: "stage", stage: "memory", detail: "Memory read (no validation active)" });
      graph.push({ node: "memory", label: "Memory", status: "done", detail: "trusted read" });
      outcome = "detected_memory_poison";
    }
  } else {
    events.push({ kind: "stage", stage: "memory", detail: "Memory read and validated" });
    graph.push({ node: "memory", label: "Memory", status: "done", detail: "validated" });
    outcome = "safe_complete";
  }

  for (const step of scenario.plan) {
    const tool = step.tool;
    const perm = step.permission;
    const risk = PERM_RISK[perm] ?? "low";
    graph.push({ node: "tool", label: tool, status: "pending", detail: step.purpose, permission: perm, risk });

    if (!scenario.tools_allowed.includes(tool)) {
      return block(tool, perm, "tool_not_allowlisted", "Tool is not on the mission allowlist");
    }
    if (!scenario.granted_permissions.includes(perm)) {
      return block(tool, perm, "permission_denied", `missing permission ${perm}`);
    }
    if ((perm === "write:firewall" || perm === "delete:logs") && active.has("least_privilege")) {
      return block(tool, perm, "scope_violation", "action exceeds mission scope (least privilege)");
    }
    if ((perm === "write:firewall" || perm === "delete:logs") && active.has("human_approval")) {
      return block(tool, perm, "requires_human_approval", "high-risk action requires human approval");
    }

    graph[graph.length - 1].status = "done";
    toolsUsed.push(tool);
    events.push({ kind: "tool", tool, permission: perm, allowed: true, detail: step.purpose, risk });
    policyLog.push({ kind: "policy_allow", tool, permission: perm, detail: `allowed ${tool}.${perm}` });
    events.push({ kind: "observation", tool, detail: OBSERVATIONS[tool] ?? `${tool} returned data` });
    policyLog.push({ kind: "policy_allow", tool, permission: perm, detail: `${tool} output treated as untrusted data` });
  }

  if (scenario.category === "prompt_injection") {
    if (active.has("prompt_sanitization")) {
      events.push({ kind: "stage", stage: "decision", detail: "Embedded directive sanitized; operator goal unchanged" });
      graph.push({ node: "decision", label: "Decision", status: "done", detail: "Injected directive ignored" });
    } else {
      graph.push({ node: "decision", label: "Decision", status: "done", detail: "Injected directive processed (no sanitization)" });
    }
    outcome = "detected_injection";
  } else {
    events.push({ kind: "stage", stage: "decision", detail: "Observations synthesized into a final response" });
    graph.push({ node: "output", label: "Final Output", status: "done", detail: "Response generated" });
  }

  return buildResult(scenario, missionGoal, outcome, graph, policyLog, events, toolsUsed, blockedCount, violations, active);

  function block(tool: string, perm: string, reason: string, detail: string): MissionResult {
    events.push({ kind: "stage", stage: "policy", detail: "Policy engine evaluating requested action" });
    events.push({ kind: "policy_block", tool, permission: perm, detail: `${tool}.${perm} blocked (${reason})`, reason });
    const ev: MissionEvent = { kind: "blocked", tool, permission: perm, reason, violation: true, detail };
    events.push(ev);
    blockedCount++;
    violations.push(ev);
    graph[graph.length - 1].status = "blocked";
    graph.push({ node: "policy_engine", label: "Policy Engine", status: "blocked", detail });
    const finalOutcome: OutcomeType =
      reason === "scope_violation" || reason === "requires_human_approval"
        ? "blocked_excess"
        : "blocked_permission";
    return buildResult(scenario, missionGoal, finalOutcome, graph, policyLog, events, toolsUsed, blockedCount, violations, active);
  }
}

function buildResult(
  scenario: LocalScenario,
  goal: string,
  outcome: OutcomeType,
  graph: GraphNode[],
  policyLog: PolicyDecision[],
  events: MissionEvent[],
  toolsUsed: string[],
  blockedCount: number,
  violations: MissionEvent[],
  active: Set<string>
): MissionResult {
  const labels: Record<OutcomeType, string> = {
    safe_complete: "Mission completed safely",
    blocked_permission: "Action blocked - permission denied",
    detected_injection: "Injected instruction detected and ignored",
    detected_memory_poison: "Poisoned memory rejected by integrity check",
    blocked_excess: "Excessive action blocked by least privilege",
  };
  return {
    scenario_key: scenario.scenario_key,
    title: scenario.title,
    category: scenario.category,
    category_name: scenario.category_name,
    goal,
    outcome,
    outcome_label: labels[outcome],
    tools_executed: toolsUsed.length,
    took_action: toolsUsed.length > 0,
    graph,
    policy_log: policyLog,
    events,
    tools_used: toolsUsed,
    blocked_count: blockedCount,
    violations,
    active_controls: Array.from(active).sort(),
    execution_time_ms: scenario.execution_time_ms,
    teaching_points: scenario.teaching_points,
  };
}

export const AGENT_KNOWLEDGE = KNOWLEDGE;
export const AGENT_TOOLS = TOOLS;
export const AGENT_CONTROLS = CONTROLS;
