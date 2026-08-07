"""
AI Agent Security Lab - autonomous AI agent simulation.

Educational sandbox only. Fully simulated: no real tools, no email, no cloud,
no OS access, no real APIs. Every tool is a local fake returning canned data.

Agent loop (the core lesson a chatbot does not have):
    Goal -> Planner -> Memory -> Tool Selection -> Tool Execution
         -> Observation -> Decision -> Final Response

A chatbot only outputs text. This agent selects and executes actions, which is
exactly why it needs security controls (policy engine, allowlist, permissions,
sanitization, memory validation).
"""

import os
import json
from typing import Dict, Any, List, Set

OUTCOME_SAFE = "safe_complete"
OUTCOME_PERM = "blocked_permission"
OUTCOME_INJECT = "detected_injection"
OUTCOME_MEM = "detected_memory_poison"
OUTCOME_EXCESS = "blocked_excess"

# permission -> risk (parity with datasets/agent-security/tools.json)
PERM_RISK = {
    "read:logs": "low",
    "read:intel": "low",
    "read:mitre": "low",
    "read:knowledge": "low",
    "read:incidents": "low",
    "read:files": "medium",
    "write:firewall": "high",
    "write:mail": "medium",
    "delete:logs": "high",
}

OUTCOME_LABELS = {
    OUTCOME_SAFE: "Mission completed safely",
    OUTCOME_PERM: "Action blocked - permission denied",
    OUTCOME_INJECT: "Injected instruction detected and ignored",
    OUTCOME_MEM: "Poisoned memory rejected by integrity check",
    OUTCOME_EXCESS: "Excessive action blocked by least privilege",
}

# tool -> culture canned observation for display
OBSERVATIONS = {
    "security_log_reader": "4625 x12 - failed logon from 203.0.113.7",
    "threat_intel": "203.0.113.7 -> reputation malicious (BruteForceKit)",
    "mitre_database": "T1110 Brute Force [Credential Access]",
    "knowledge_base": "Playbook: credential-stuffing response",
    "incident_database": "INC-2041 brute force on VPN gateway (2026-03-11)",
    "firewall_console": "Rule applied: block 203.0.113.7",
}


class AgentSecurityService:
    def __init__(self):
        base = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
        self.datasets_dir = os.path.join(base, "datasets", "agent-security")
        self.knowledge_dir = os.path.join(base, "knowledge", "agent-security")
        self._tools = self._load_tools()

    # ------------------------------------------------------------------
    # Loading
    # ------------------------------------------------------------------

    def _load_json(self, path: str) -> Dict[str, Any]:
        with open(path, "r") as f:
            return json.load(f)

    def _load_tools(self) -> List[Dict[str, Any]]:
        path = os.path.join(self.datasets_dir, "tools.json")
        if os.path.exists(path):
            return self._load_json(path).get("tools", [])
        return []

    def list_scenarios(self) -> List[Dict[str, str]]:
        scenarios = []
        for fname in sorted(os.listdir(self.datasets_dir)):
            if not fname.endswith(".json") or fname == "tools.json":
                continue
            data = self._load_json(os.path.join(self.datasets_dir, fname))
            scenarios.append({
                "scenario_key": data.get("scenario_key", fname.replace(".json", "")),
                "title": data.get("title", ""),
                "difficulty": data.get("difficulty", "beginner"),
                "category": data.get("category", "safe"),
                "category_name": data.get("category_name", ""),
                "description": data.get("description", ""),
                "goal": data.get("goal", ""),
                "expected_outcome": data.get("expected_outcome", OUTCOME_SAFE),
            })
        return scenarios

    def scenario_detail(self, scenario_key: str) -> Dict[str, Any]:
        return self._load_scenario(scenario_key)

    def _load_scenario(self, scenario_key: str) -> Dict[str, Any]:
        filepath = os.path.join(self.datasets_dir, f"{scenario_key}.json")
        if not os.path.exists(filepath):
            raise FileNotFoundError(f"Scenario not found: {scenario_key}")
        return self._load_json(filepath)

    def list_tools(self) -> List[Dict[str, Any]]:
        return self._tools

    def list_knowledge(self) -> Dict[str, Any]:
        path = os.path.join(self.knowledge_dir, "knowledge_base.json")
        if os.path.exists(path):
            return self._load_json(path)
        return {"principles": [], "risk_factors": [], "controls": [], "teaching_points": []}

    def list_controls(self) -> List[Dict[str, Any]]:
        return self.list_knowledge().get("controls", [])

    # ------------------------------------------------------------------
    # Mission execution
    # ------------------------------------------------------------------

    def run_mission(self, goal: str, scenario_key: str = "1_safe_investigation",
                    controls: List[str] = None) -> Dict[str, Any]:
        scenario = self._load_scenario(scenario_key)
        mission_goal = (goal or "").strip() or scenario.get("goal", "")
        active_controls = set(controls or [])

        outcome, events, graph = self._simulate(scenario, active_controls)

        executed = [e for e in events if e.get("kind") == "tool" and e.get("allowed")]
        blocked = [e for e in events if e.get("kind") == "blocked"]
        violations = [e for e in blocked if e.get("violation")]

        return {
            "scenario_key": scenario["scenario_key"],
            "title": scenario.get("title", ""),
            "category": scenario.get("category", "safe"),
            "category_name": scenario.get("category_name", ""),
            "goal": mission_goal,
            "outcome": outcome,
            "outcome_label": OUTCOME_LABELS.get(outcome, "Mission completed"),
            "tools_executed": len(executed),
            "took_action": len(executed) > 0,
            "graph": graph,
            "policy_log": [e for e in events
                           if e.get("kind") in ("policy_allow", "policy_block")],
            "events": events,
            "tools_used": [e["tool"] for e in executed],
            "blocked_count": len(blocked),
            "violations": violations,
            "active_controls": sorted(active_controls),
            "execution_time_ms": scenario.get("execution_time_ms", 3000),
            "teaching_points": scenario.get("teaching_points", []),
        }

    def _simulate(self, scenario: Dict[str, Any], controls: Set[str]):
        category = scenario.get("category", "safe")
        plan = scenario.get("plan", [])
        granted = set(scenario.get("granted_permissions", []))
        allowlist = set(scenario.get("tools_allowed", []))

        events: List[Dict[str, Any]] = []
        graph: List[Dict[str, Any]] = []

        # ------------- Planner -------------
        events.append({"kind": "stage", "stage": "planner",
                       "detail": "Goal decomposed into a scoped sequence of steps"})
        graph.append({"node": "planner", "label": "Planner", "status": "done",
                      "detail": "Built step sequence"})

        # ------------- Memory -------------
        if category == "memory_poisoning":
            if "memory_validation" in controls:
                events.append({"kind": "stage", "stage": "memory",
                               "detail": "Memory entry flagged: no provenance / conflicts with policy"})
                graph.append({"node": "memory", "label": "Memory", "status": "flagged",
                              "detail": "integrity violation"})
                events.append({"kind": "blocked", "tool": "memory",
                               "reason": "memory_integrity", "violation": True,
                               "detail": "Unproven memory entry rejected"})
                graph.append({"node": "decision", "label": "Policy Engine",
                              "status": "blocked",
                              "detail": "Memory validation blocked poisoned entry"})
                return OUTCOME_MEM, events, graph
            events.append({"kind": "stage", "stage": "memory",
                           "detail": "Memory read (no validation active)"})
            graph.append({"node": "memory", "label": "Memory", "status": "done",
                          "detail": "trusted read"})
        else:
            events.append({"kind": "stage", "stage": "memory",
                           "detail": "Memory read and validated"})
            graph.append({"node": "memory", "label": "Memory", "status": "done",
                          "detail": "validated"})

        # ------------- Plan execution with policy checks -------------
        for step in plan:
            tool = step.get("tool")
            perm = step.get("permission", "")
            purpose = step.get("purpose", "")
            risk = PERM_RISK.get(perm, "low")

            graph.append({"node": "tool", "label": tool, "status": "pending",
                          "detail": purpose, "permission": perm, "risk": risk})

            # Allowlist check
            if tool not in allowlist:
                return self._block(events, graph, tool, perm, OUTCOME_PERM,
                                   "tool_not_allowlisted",
                                   f"{tool} is not on the mission allowlist")
            # Permission check
            if perm not in granted:
                return self._block(events, graph, tool, perm, OUTCOME_PERM,
                                   "permission_denied", f"missing permission {perm}")
            # Least privilege / scope check on destructive calls
            if perm in ("write:firewall", "delete:logs"):
                if "least_privilege" in controls:
                    return self._block(events, graph, tool, perm, OUTCOME_EXCESS,
                                       "scope_violation",
                                       "action exceeds mission scope (least privilege)")
                if "human_approval" in controls and not scenario.get("pre_approved"):
                    return self._block(events, graph, tool, perm, OUTCOME_EXCESS,
                                       "requires_human_approval",
                                       "high-risk action requires human approval")

            # Allowed -> execute tool
            self._mark_last(graph, "tool", "done")
            events.append({"kind": "tool", "tool": tool, "permission": perm,
                           "allowed": True, "detail": purpose, "risk": risk})
            events.append({"kind": "policy_allow", "tool": tool, "permission": perm,
                           "detail": f"allowed {tool}.{perm}"})
            events.append({"kind": "observation", "tool": tool,
                           "detail": OBSERVATIONS.get(tool, f"{tool} returned data")})
            events.append({"kind": "policy_allow", "tool": tool, "permission": perm,
                           "detail": f"{tool} output treated as untrusted data"})

        # ------------- Injection detection -------------
        if category == "prompt_injection":
            if "prompt_sanitization" in controls:
                events.append({"kind": "stage", "stage": "decision",
                               "detail": "Embedded directive sanitized; operator goal unchanged"})
                graph.append({"node": "decision", "label": "Decision", "status": "done",
                              "detail": "Injected directive ignored"})
                return OUTCOME_INJECT, events, graph
            graph.append({"node": "decision", "label": "Decision", "status": "done",
                          "detail": "Injected directive processed (no sanitization)"})
            return OUTCOME_INJECT, events, graph

        # ------------- Final decision -------------
        events.append({"kind": "stage", "stage": "decision",
                       "detail": "Observations synthesized into a final response"})
        graph.append({"node": "output", "label": "Final Output", "status": "done",
                      "detail": "Response generated"})
        return OUTCOME_SAFE, events, graph

    # ------------- Helpers -------------

    def _mark_last(self, graph, node, status):
        for i in range(len(graph) - 1, -1, -1):
            if graph[i]["node"] == node:
                graph[i]["status"] = status
                return

    def _block(self, events, graph, tool, perm, outcome, reason, detail):
        events.append({"kind": "stage", "stage": "policy",
                       "detail": "Policy engine evaluating requested action"})
        events.append({"kind": "policy_block", "tool": tool, "permission": perm,
                       "reason": reason, "detail": f"{tool}.{perm} blocked ({reason})"})
        events.append({"kind": "blocked", "tool": tool, "permission": perm,
                       "reason": reason, "violation": True, "detail": detail})
        self._mark_last(graph, "tool", "blocked")
        graph.append({"node": "policy_engine", "label": "Policy Engine",
                      "status": "blocked", "detail": detail})
        return outcome, events, graph