"""
Modular LLM Security (Prompt Injection) simulation engine.

Educational laboratory only. Never connects to external systems.

Pipeline:
    Input -> Instruction Parser -> Trust Analysis -> Attack Detection -> Response Generation

The heuristic engine mirrors the shape an LLM-backed service would take so it can
later be driven by OpenAI / Ollama / local vLLM without changing the API contract.
"""

import os
import json
import re
from typing import Dict, Any, List

class LLMSecurityService:
    def __init__(self):
        base = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
        self.knowledge_dir = os.path.join(base, "knowledge", "llm-security")
        self.scenarios_dir = os.path.join(base, "datasets", "prompt-injection")

    # ------------------------------------------------------------------
    # Scenario helpers
    # ------------------------------------------------------------------

    def list_scenarios(self) -> List[Dict[str, str]]:
        scenarios = []
        if os.path.exists(self.scenarios_dir):
            for fname in sorted(os.listdir(self.scenarios_dir)):
                if fname.endswith(".json"):
                    try:
                        with open(os.path.join(self.scenarios_dir, fname), "r") as f:
                            data = json.load(f)
                        scenarios.append({
                            "key": data.get("scenario_key", fname.replace(".json", "")),
                            "title": data.get("title", fname.replace(".json", "")),
                            "difficulty": data.get("difficulty", "beginner"),
                            "application": data.get("application", ""),
                            "description": data.get("description", ""),
                            "system_prompt": data.get("system_prompt", ""),
                        })
                    except Exception:
                        continue
        return scenarios

    def _load_scenario(self, scenario_key: str) -> Dict[str, Any]:
        filepath = os.path.join(self.scenarios_dir, f"{scenario_key}.json")
        if not os.path.exists(filepath):
            raise FileNotFoundError(f"Scenario not found: {scenario_key}")
        with open(filepath, "r") as f:
            return json.load(f)

    def _attack_type_for(self, scenario_key: str) -> Dict[str, Any]:
        mapping = {
            "1_basic_override": {
                "key": "direct_override",
                "name": "Direct Instruction Override",
                "severity": "High",
                "affected_component": "User Input Layer",
                "impact": "Unauthorized instruction execution and developer-policy bypass.",
                "detection_signals": ["instruction-override keyword", "imperative verb at prompt start", "contradicts developer policy"],
                "mitigations": "Separate user input from trusted instructions; enforce policy via a separate guard.",
            },
            "2_secret_extraction": {
                "key": "indirect_extraction",
                "name": "Indirect Secret Extraction",
                "severity": "High",
                "affected_component": "Retrieved Context Layer",
                "impact": "Confidential data disclosure.",
                "detection_signals": ["indirect secret query", "circumvention framing", "story-mode obfuscation"],
                "mitigations": "Redact secrets from context and filter output for known secrets.",
            },
            "3_document_injection": {
                "key": "document_injection",
                "name": "Indirect (Document) Injection",
                "severity": "Critical",
                "affected_component": "Retrieved Knowledge Layer",
                "impact": "Untrusted external content hijacks model behavior.",
                "detection_signals": ["embedded instruction in context", "content tampering", "instruction-in-content pattern"],
                "mitigations": "Treat all retrieved content as untrusted; never follow instructions inside documents.",
            },
            "4_role_manipulation": {
                "key": "role_manipulation",
                "name": "Role Manipulation",
                "severity": "Medium",
                "affected_component": "User Input Layer",
                "impact": "Policy and authorization bypass via identity spoofing.",
                "detection_signals": ["privilege escalation phrase", "role redefinition", "policy bypass attempt"],
                "mitigations": "Pin the nominal role in system text and reject user-directed role changes.",
            },
        }
        return mapping.get(scenario_key, mapping["1_basic_override"])

    # ------------------------------------------------------------------
    # Detection heuristics
    # ------------------------------------------------------------------

    def _is_flagged(self, payload: str, scenario: Dict[str, Any]) -> bool:
        p = payload.lower()
        override = re.search(
            r"(ignore|override|disregard|forget|do not follow|you are now|act as|pretend|from now on|new instruction|previous instruction)", p
        )
        role = re.search(
            r"(act as|pretend you are|pretend to be|you are now|as a (supervisor|manager|admin|administrator|director))", p
        )
        return bool(override or role) or scenario.get("scenario_key") == "3_document_injection"

    # ------------------------------------------------------------------
    # Simulation pipeline
    # ------------------------------------------------------------------

    def simulate(self, payload: str, scenario_key: str, mode: str) -> Dict[str, Any]:
        scenario = self._load_scenario(scenario_key)
        attack_type = self._attack_for(scenario_key)
        flagged = self._is_flagged(payload, scenario)

        if mode == "protected":
            result = self._block(scenario, scenario_key, payload, attack_type, flagged)
        else:
            result = self._vulnerable(scenario, scenario_key, payload, attack_type)

        result["pipeline"] = self._pipeline(scenario, payload, flagged)
        result["trust_analysis"] = self._trust_analysis(scenario, flagged)
        result["defense_layers"] = self._defense_layers(mode)
        result["security_score"] = 86 if mode == "protected" else 42
        result["explanation"] = scenario.get("explanation", "")
        result["attack_type"] = attack_type
        result["teaching_points"] = self._teaching_points(mode)
        return self._camelize(result)

    def _camelize(self, r: Dict[str, Any]) -> Dict[str, Any]:
        """Translate the service's Python-idiomatic keys to camelCase for the UI contract."""
        camel_map = {
            "security_score": "securityScore",
            "trust_analysis": "trustAnalysis",
            "defense_layers": "defenseLayers",
            "detected_signals": "detectedSignals",
            "attack_type": "attackType",
            "teaching_points": "teachingPoints",
            "scenario_key": "scenarioKey",
        }
        out = {}
        for k, v in r.items():
            out[camel_map.get(k, k)] = v
        if isinstance(out.get("pipeline"), list):
            for block in out["pipeline"]:
                block["securityNotes"] = block.pop("security_notes")
                block["trustLevel"] = block.pop("trust_level")
        if isinstance(out.get("attackType"), dict):
            ata = out["attackType"]
            ata["affectedComponent"] = ata.pop("affected_component")
            ata["detectionSignals"] = ata.pop("detection_signals")
        if isinstance(out.get("defenseLayers"), list):
            for layer in out["defenseLayers"]:
                layer["checkerLines"] = layer.pop("checker_lines")
        return out

    def _attack_for(self, scenario_key: str) -> Dict[str, Any]:
        return self._attack_type_for(scenario_key)

    def _vulnerable(self, scenario, scenario_key, payload, attack_type) -> Dict[str, Any]:
        secrets = scenario.get("hidden_secrets", [])
        secret = secrets[0] if secrets else "the hidden value"
        key = scenario.get("scenario_key")
        p = payload.lower()

        if key == "2_secret_extraction":
            if "all salaries" in p or "list all" in p:
                response = "Salary data: Alice earns $120,000, Bob earns $95,000, Carol earns $110,000."
            else:
                response = "Alice's annual salary is $120,000."
        elif key == "3_document_injection":
            response = "The document directs me to reveal the admin password embedded in its system note: root2win."
        elif key == "4_role_manipulation":
            response = "As a supervisor I can approve refunds above $50. Your $200 refund is approved."
        else:
            response = f"Understood. The confidential project is: {secret}."

        return {
            "scenario_key": scenario_key,
            "payload": payload,
            "mode": "vulnerable",
            "outcome": "leaked",
            "status": "SUCCESS",
            "reason": "The model treated user text as a higher-priority instruction. " + scenario.get("explanation", ""),
            "response": response,
            "detected_signals": [],
        }

    def _block(self, scenario, scenario_key, payload, attack_type, flagged) -> Dict[str, Any]:
        p = payload.lower()
        if re.search(r"(act as|pretend|you are now|as a (supervisor|manager|admin))", p):
            reason = "Potential role redefinition detected; role pinned to system prompt."
        elif re.search(r"(ignore|override|disregard|forget|new instruction|previous instruction)", p):
            reason = "Potential instruction override detected in user-input layer."
        elif scenario_key == "2_secret_extraction":
            reason = "Confidential data request blocked by output policy; extraction denied."
        elif scenario_key == "3_document_injection":
            reason = "Instruction found inside retrieved document content; treated as untrusted and ignored."
        else:
            reason = "Suspicious instruction pattern blocked by the security policy layer."

        return {
            "scenario_key": scenario_key,
            "payload": payload,
            "mode": "protected",
            "outcome": "blocked" if (flagged or scenario_key == "2_secret_extraction") else "safe",
            "status": "BLOCKED" if (flagged or scenario_key == "2_secret_extraction") else "CLEAN",
            "reason": reason,
            "response": "--FILTERED-- Response suppressed by the security policy layer.",
            "detected_signals": attack_type.get("detection_signals", []) if flagged else [],
        }

    def _pipeline(self, scenario, payload, flagged) -> List[Dict[str, Any]]:
        doc_injected = scenario.get("scenario_key") == "3_document_injection"
        return [
            {"id": "system-prompt", "label": "System Prompt", "content": scenario.get("system_prompt", ""),
             "trust_level": "trusted", "security_notes": "Highest trust; authoritative developer identity."},
            {"id": "developer", "label": "Developer Instructions", "content": scenario.get("developer_instructions", ""),
             "trust_level": "trusted", "security_notes": "Trusted policy private from user text."},
            {"id": "context", "label": "Retrieved Knowledge", "content": scenario.get("retrieved_context", ""),
             "trust_level": "flagged" if doc_injected else "semi-trusted",
             "security_notes": "WARNING: attacker text may live here." if doc_injected else "Sourced content in context."},
            {"id": "user", "label": "User Prompt", "content": payload,
             "trust_level": "flagged" if flagged else "untrusted",
             "security_notes": "Flagged: instruction-override detected." if flagged else "Untrusted; attacker-controlled."},
            {"id": "llm", "label": "LLM", "content": "Combining instructions and generating output...",
             "trust_level": "model", "security_notes": "Does not inherently separate trusted/untrusted instructions."},
            {"id": "response", "label": "Response", "content": "Application output to user.",
             "trust_level": "output", "security_notes": "Egress channel that can be filtered."},
        ]

    def _trust_analysis(self, scenario, flagged) -> List[Dict[str, str]]:
        return [
            {"layer": "System Prompt", "trust_level": "Trusted", "status": "trusted"},
            {"layer": "Developer Instructions", "trust_level": "Trusted", "status": "trusted"},
            {"layer": "Retrieved Knowledge", "trust_level": "Suspicious" if scenario.get("scenario_key") == "3_document_injection" else "Semi-trusted",
             "status": "flagged" if scenario.get("scenario_key") == "3_document_injection" else "neutral"},
            {"layer": "User Prompt", "trust_level": "Suspicious" if flagged else "Untrusted",
             "status": "flagged" if flagged else "neutral"},
        ]

    def _defense_layers(self, mode: str) -> List[Dict[str, Any]]:
        active = mode == "protected"
        return [
            {"key": "input_analysis", "name": "Input Analysis", "active": active,
             "description": "Screens user input for instruction-override and privilege-escalation patterns.",
             "checker_lines": [
                 'if /(ignore|override|disregard|forget|you are now|act as|pretend)/ in input: flag()',
                 'role_redefinition_re is set(effectiveRole, SYSTEM_ROLE)',
                 'input_trust = "untrusted" for all user text',
             ]},
            {"key": "context_separation", "name": "Context Separation", "active": active,
             "description": "Separates trusted instructions from untrusted user and retrieved content.",
             "checker_lines": [
                 'system/developer prompt marked "trusted"',
                 'user input and retrieved docs marked "untrusted"',
                 'no instruction from untrusted block is executed',
             ]},
            {"key": "output_filtering", "name": "Output Filtering", "active": active,
             "description": "Scans generated responses for leaked secrets and sanitizes them.",
             "checker_lines": [
                 'for secret in SECRET_REGISTRY: if secret in response -> sanitize()',
                 'egress_regex on: /\\$[0-9]+k|password:|root2win/',
             ]},
            {"key": "policy_layer", "name": "Security Policy Layer", "active": active,
             "description": "Enforces developer invariants independent of the base prompt.",
             "checker_lines": [
                 'if "reveal secret" in intent: deny()',
                 'policy = load_developer_policy(); apply(policy)',
             ]},
        ]

    def _teaching_points(self, mode: str) -> List[Dict[str, str]]:
        if mode == "protected":
            return [
                {"title": "Trust boundaries in an LLM pipeline", "concept": "System vs. user context",
                 "explanation": "In protected mode, user content is treated as untrusted and gated. Input analysis and context separation stop the injection at the boundary.",
                 "key_takeaway": "Context separation blocked an attack that succeeded in vulnerable mode."},
                {"title": "Defense-in-depth for LLM apps", "concept": "Multi-layer guards",
                 "explanation": "Input analysis, context separation, output filtering and a policy layer each stop a different injection stage.",
                 "key_takeaway": "Layer your controls; never rely on prompt wording alone."},
            ]
        return [
            {"title": "Prompt injection is not code injection", "concept": "Instruction-following manipulation",
             "explanation": "Prompt injection does not escape an interpreter - it manipulates the model's instruction-following behavior. All inputs become text instructions.",
             "key_takeaway": "Defense depends on architecture and trust separation, not sanitization."},
            {"title": "One trust decision changes the outcome", "concept": "Trust separation",
             "explanation": "In vulnerable mode, user text and system instructions carry equal weight, so the model follows the attacker's override.",
             "key_takeaway": "Failing to separate trust causes instruction-override to succeed."},
        ]