"""
AI Risk Assessment & Governance Simulator - governance engine.

Architecture (ready for future integration):

    Project
      -> Architecture Analysis
      -> Threat Identification
      -> Risk Scoring
      -> Control Evaluation
      -> Residual Risk
      -> Governance Report

Educational simulator only. Uses fictional organizations and fictional AI
systems. This is NOT a compliance checklist and provides no legal advice.

Future integration points: OpenAI, Ollama, and reference mappings for NIST
AI RMF, ISO/IEC 42001, and the EU AI Act. The ModelProvider class is the
seam for those providers.
"""

import os
import json
from typing import Dict, Any, List, Optional

# Future integration point: plug in OpenAI / Ollama / NIST / ISO mappings.
class ModelProvider:
    """Abstraction over AI providers. Currently heuristic/rule-based."""

    def assess(self, project_id: str) -> str:
        return "Rule-based governance assessment"


DATASETS_DIR = os.path.join(
    os.path.dirname(__file__), "..", "..", "..", "datasets", "governance"
)

KNOWLEDGE_PATH = os.path.join(
    os.path.dirname(__file__), "..", "..", "..", "knowledge", "governance",
    "knowledge_base.json",
)

CRITICALITY_INDEX = {"Critical": 0, "High": 1, "Medium": 2, "Low": 3}

# ------------------------------------------------------------ catalogs

THREAT_CATEGORIES: List[Dict[str, str]] = [
    {"id": "data_privacy", "name": "Data Privacy", "stride": "Information disclosure",
     "definition": "Personal or regulated data is exposed to parties that should not see it."},
    {"id": "prompt_injection", "name": "Prompt Injection", "stride": "Tampering",
     "definition": "Malicious instructions hidden inside input redirect the model's behavior."},
    {"id": "model_theft", "name": "Model Theft", "stride": "Information disclosure",
     "definition": "An attacker extracts the model's logic, weights, or training data."},
    {"id": "adversarial_ml", "name": "Adversarial ML", "stride": "Tampering",
     "definition": "Crafted inputs fool the model into wrong outputs at scale."},
    {"id": "jailbreak", "name": "Jailbreak", "stride": "Elevation of privilege",
     "definition": "Prompts that bypass the model's safety rules to unlock restricted behavior."},
    {"id": "model_poisoning", "name": "Model Poisoning", "stride": "Tampering",
     "definition": "Corrupted training or fine-tuning data changes how the model behaves."},
    {"id": "supply_chain", "name": "Supply Chain", "stride": "Tampering",
     "definition": "A compromised model, library, or update is trusted and deployed."},
    {"id": "hallucination", "name": "Hallucination", "stride": "Spoofing",
     "definition": "The model produces confident but false content that is acted on."},
    {"id": "unauthorized_access", "name": "Unauthorized Access", "stride": "Elevation of privilege",
     "definition": "Users or systems reach data and functions beyond their permission."},
    {"id": "insider_threat", "name": "Insider Threat", "stride": "Repudiation",
     "definition": "People inside the organization misuse their access deliberately or by accident."},
    {"id": "api_abuse", "name": "API Abuse", "stride": "Denial of service",
     "definition": "The model or API is probed or drained by automated traffic."},
    {"id": "tool_abuse", "name": "Tool Abuse", "stride": "Elevation of privilege",
     "definition": "The model's connected tools or actions are used beyond their intended scope."},
    {"id": "data_leakage", "name": "Sensitive Data Leakage", "stride": "Information disclosure",
     "definition": "Sensitive data escapes through outputs, logs, or retrieval."},
    {"id": "third_party_dependency", "name": "Third-party Dependency", "stride": "Repudiation",
     "definition": "A dependency outside your control is unsafe, outdated, or malicious."},
    {"id": "denial_of_service", "name": "Denial of Service", "stride": "Denial of service",
     "definition": "An attacker makes the AI system unavailable when it is needed."},
    {"id": "bias_fairness", "name": "Bias and Fairness", "stride": "Spoofing",
     "definition": "The model treats some groups unfairly because of data or design."},
]

CONTROLS: List[Dict[str, Any]] = [
    {"id": "input_validation", "name": "Input Validation",
     "description": "Checks every input for shape, size, and expected structure before it is processed.",
     "mitigates": ["prompt_injection", "jailbreak", "adversarial_ml", "api_abuse"],
     "likelihood_reduction": 1, "impact_reduction": 0,
     "trade_offs": "Strict validation can reject legitimate complex inputs and increase support load."},
    {"id": "prompt_filtering", "name": "Prompt Filtering",
     "description": "Screens prompts for injection patterns and blocked content before the model sees them.",
     "mitigates": ["prompt_injection", "jailbreak", "adversarial_ml", "api_abuse"],
     "likelihood_reduction": 2, "impact_reduction": 0,
     "trade_offs": "Aggressive filters can block legitimate prompts and frustrate users."},
    {"id": "output_validation", "name": "Output Validation",
     "description": "Checks model output for policy violations, sensitive data, and unsafe content.",
     "mitigates": ["hallucination", "data_leakage", "bias_fairness", "jailbreak"],
     "likelihood_reduction": 1, "impact_reduction": 1,
     "trade_offs": "Checking every output adds latency and may reject useful borderline answers."},
    {"id": "human_approval", "name": "Human Approval",
     "description": "A trained person reviews and approves model outputs before high-impact actions.",
     "mitigates": ["hallucination", "bias_fairness", "model_poisoning", "insider_threat", "data_leakage"],
     "likelihood_reduction": 0, "impact_reduction": 2,
     "trade_offs": "Slows the workflow and needs trained reviewers to avoid rubber-stamping."},
    {"id": "rbac", "name": "Role-Based Access Control",
     "description": "Access to the system and its data is granted by role instead of by default.",
     "mitigates": ["unauthorized_access", "insider_threat", "tool_abuse", "api_abuse"],
     "likelihood_reduction": 1, "impact_reduction": 1,
     "trade_offs": "Managing roles is overhead and over-restricting access slows teams."},
    {"id": "least_privilege", "name": "Least Privilege",
     "description": "Users and processes get the minimum data and function access their task requires.",
     "mitigates": ["unauthorized_access", "insider_threat", "data_leakage", "tool_abuse"],
     "likelihood_reduction": 1, "impact_reduction": 2,
     "trade_offs": "Scoping data tightly can break workflows that needed the extra access."},
    {"id": "audit_logging", "name": "Audit Logging",
     "description": "Records who did what, when, and with which inputs and outputs.",
     "mitigates": ["insider_threat", "unauthorized_access", "supply_chain", "model_poisoning"],
     "likelihood_reduction": 0, "impact_reduction": 1,
     "trade_offs": "Logs add storage cost and are themselves a target for attackers."},
    {"id": "encryption", "name": "Encryption",
     "description": "Protects data at rest and in transit so a copy is unreadable without keys.",
     "mitigates": ["data_privacy", "data_leakage", "model_theft", "third_party_dependency"],
     "likelihood_reduction": 0, "impact_reduction": 2,
     "trade_offs": "Key management adds operational complexity and a small performance overhead."},
    {"id": "model_monitoring", "name": "Model Monitoring",
     "description": "Tracks model accuracy, drift, and behavior against expected baselines.",
     "mitigates": ["bias_fairness", "model_poisoning", "adversarial_ml", "hallucination", "model_theft"],
     "likelihood_reduction": 1, "impact_reduction": 1,
     "trade_offs": "Monitoring needs baselines and produces alerts that must be triaged."},
    {"id": "content_filtering", "name": "Content Filtering",
     "description": "Blocks disallowed topics and unsafe content in inputs and outputs.",
     "mitigates": ["jailbreak", "prompt_injection", "api_abuse", "hallucination"],
     "likelihood_reduction": 1, "impact_reduction": 1,
     "trade_offs": "Content filters can block legitimate topics and need careful tuning."},
    {"id": "rate_limiting", "name": "Rate Limiting",
     "description": "Limits how many requests a user or source can make in a period.",
     "mitigates": ["denial_of_service", "api_abuse", "model_theft"],
     "likelihood_reduction": 2, "impact_reduction": 0,
     "trade_offs": "Aggressive limits can block power users and slow legitimate batch work."},
    {"id": "data_classification", "name": "Data Classification",
     "description": "Labels data by sensitivity so handling rules can be enforced automatically.",
     "mitigates": ["data_privacy", "data_leakage", "third_party_dependency", "bias_fairness"],
     "likelihood_reduction": 1, "impact_reduction": 1,
     "trade_offs": "Labeling data takes discipline and mislabeled data misleads the controls."},
    {"id": "retrieval_validation", "name": "Retrieval Validation",
     "description": "Checks and scopes what is retrieved before it is added to the model context.",
     "mitigates": ["data_leakage", "unauthorized_access", "prompt_injection", "bias_fairness"],
     "likelihood_reduction": 1, "impact_reduction": 2,
     "trade_offs": "Restricting retrieval can make answers less useful when context is missing."},
    {"id": "model_version_control", "name": "Model Version Control",
     "description": "Pins and verifies model and dependency versions before deployment.",
     "mitigates": ["supply_chain", "model_poisoning", "model_theft"],
     "likelihood_reduction": 1, "impact_reduction": 1,
     "trade_offs": "Freezing versions slows adoption of improved models and security patches."},
    {"id": "continuous_evaluation", "name": "Continuous Evaluation",
     "description": "Runs ongoing tests of safety, fairness, and accuracy on a held-out set.",
     "mitigates": ["bias_fairness", "hallucination", "model_poisoning", "supply_chain"],
     "likelihood_reduction": 1, "impact_reduction": 2,
     "trade_offs": "Evaluation needs test sets and effort, and over-testing can delay releases."},
]

CONTROLS_BY_ID = {c["id"]: c for c in CONTROLS}
CATEGORY_NAMES = {c["id"]: c["name"] for c in THREAT_CATEGORIES}


# ------------------------------------------------------------ scoring

def _weight(likelihood: int, impact: int) -> int:
    """Map likelihood*impact (1..25) to a 0..100 risk weight.

    Uses explicit round-half-up so the frontend engine produces identical
    integers regardless of float representation.
    """
    v = 10 + (likelihood * impact - 1) * 90 / 24 + 0.5
    return max(0, min(100, int(v)))


def _level(weight: int) -> str:
    if weight >= 85:
        return "Critical"
    if weight >= 65:
        return "High"
    if weight >= 45:
        return "Medium"
    if weight >= 25:
        return "Low"
    return "Informational"


def _assess_threats(threats: List[Dict[str, Any]], enabled: set) -> List[Dict[str, Any]]:
    out = []
    for t in threats:
        cat = t["category"]
        lr = sum(c["likelihood_reduction"] for c in CONTROLS if c["id"] in enabled and cat in c["mitigates"])
        ir = sum(c["impact_reduction"] for c in CONTROLS if c["id"] in enabled and cat in c["mitigates"])
        base_l = t["likelihood"]
        base_i = t["impact"]
        res_l = max(1, base_l - lr)
        res_i = max(1, base_i - ir)
        out.append({
            "id": t["id"],
            "category": cat,
            "category_name": CATEGORY_NAMES.get(cat, cat),
            "name": t["name"],
            "description": t["description"],
            "business_consequences": t["business_consequences"],
            "likelihood": base_l,
            "impact": base_i,
            "base_weight": _weight(base_l, base_i),
            "base_level": _level(_weight(base_l, base_i)),
            "residual_likelihood": res_l,
            "residual_impact": res_i,
            "residual_weight": _weight(res_l, res_i),
            "residual_level": _level(_weight(res_l, res_i)),
            "controls_applied": [c["id"] for c in CONTROLS if c["id"] in enabled and cat in c["mitigates"]],
        })
    return out


def _score(threats_assessed: List[Dict[str, Any]], key: str) -> int:
    """Aggregate a threat list into a 0..100 score.

    Governance should be driven by the worst case, so the aggregate blends the
    average with the worst threat weight (55% average, 45% worst).
    """
    if not threats_assessed:
        return 0
    weights = [t[key] for t in threats_assessed]
    avg = sum(weights) / len(weights)
    worst = max(weights)
    return max(0, min(100, round(0.55 * avg + 0.45 * worst)))


# ------------------------------------------------------------ recommendation

def _recommendation(residual_score: int, threats: List[Dict[str, Any]], criticality: str) -> Dict[str, Any]:
    worst = min((t["residual_level"] for t in threats), default="Low",
                key=lambda l: {"Critical": 0, "High": 1, "Medium": 2, "Low": 3, "Informational": 4}[l])

    label = "Ready for Deployment"
    reason = "Residual risk is low and within the organization's accepted level."
    if residual_score >= 80:
        label = "Deployment Not Recommended"
        reason = "Residual risk is critical and the organization should not accept it."
    elif residual_score >= 60:
        label = "Further Testing Required"
        reason = "Residual risk is high; more testing and controls are needed before deployment."
    elif residual_score >= 35:
        label = "Deploy with Controls"
        reason = "Residual risk is moderate and acceptable only with the selected controls enforced."
    else:
        if criticality in ("Critical", "High"):
            label = "Deploy with Controls"
            reason = "The system is high criticality; deploy only with the selected controls enforced."
        else:
            label = "Ready for Deployment"
            reason = "Residual risk is low and within the organization's accepted level."

    if worst == "Critical" and label not in ("Deployment Not Recommended", "Further Testing Required"):
        label = "Further Testing Required"
        reason = "At least one residual threat remains critical; resolve it before deployment."
    elif worst == "High" and criticality == "Critical" and label not in ("Deployment Not Recommended", "Further Testing Required"):
        label = "Further Testing Required"
        reason = "A high residual threat on a critical system requires further testing."

    return {"label": label, "reason": reason}


# ------------------------------------------------------------ service

class GovernanceEngineService:
    def __init__(self):
        self.provider = ModelProvider()
        self._projects: Dict[str, Dict[str, Any]] = {}
        self._knowledge: Dict[str, Any] = {}
        self._load_projects()
        self._load_knowledge()

    def _load_projects(self):
        if not os.path.exists(DATASETS_DIR):
            return
        for fname in sorted(os.listdir(DATASETS_DIR)):
            if fname.endswith(".json"):
                try:
                    with open(os.path.join(DATASETS_DIR, fname), "r", encoding="utf-8") as f:
                        data = json.load(f)
                    self._projects[data["id"]] = data
                except Exception:
                    continue

    def _load_knowledge(self):
        if os.path.exists(KNOWLEDGE_PATH):
            try:
                with open(KNOWLEDGE_PATH, "r", encoding="utf-8") as f:
                    self._knowledge = json.load(f)
            except Exception:
                self._knowledge = {}

    def list_projects(self) -> List[Dict[str, str]]:
        return [
            {
                "id": p["id"],
                "title": p["title"],
                "description": p["description"],
                "model_type": p["model_type"],
                "criticality": p["criticality"],
                "governance_stance": p["governance_stance"],
            }
            for p in self._projects.values()
        ]

    def get_project(self, project_id: str) -> Dict[str, Any]:
        p = self._projects.get(project_id)
        if not p:
            raise FileNotFoundError(f"Project {project_id} not found")
        return p

    def assess(self, project_id: str, enabled_controls: Optional[List[str]] = None) -> Dict[str, Any]:
        project = self.get_project(project_id)
        baseline = set(project.get("baseline_controls", []))
        requested = set(enabled_controls or [])
        enabled = baseline | requested

        threats = _assess_threats(project["threats"], enabled)
        base_score = _score(threats, "base_weight")
        residual_score = _score(threats, "residual_weight")
        criticality = project["criticality"]
        rec = _recommendation(residual_score, threats, criticality)

        control_results = [
            {
                "id": c["id"],
                "name": c["name"],
                "description": c["description"],
                "enabled": c["id"] in enabled,
                "baseline": c["id"] in baseline,
                "mitigates": [CATEGORY_NAMES.get(m, m) for m in c["mitigates"]],
                "trade_offs": c["trade_offs"],
            }
            for c in CONTROLS
        ]

        review = self._governance_review(project, threats, base_score, residual_score, enabled, rec)

        return {
            "project_id": project_id,
            "project": {
                "id": project["id"],
                "title": project["title"],
                "description": project["description"],
                "business_goal": project["business_goal"],
                "users": project["users"],
                "data_types": project["data_types"],
                "model_type": project["model_type"],
                "criticality": criticality,
                "governance_stance": project["governance_stance"],
            },
            "architecture": project["architecture"],
            "threats": threats,
            "controls": control_results,
            "base_score": base_score,
            "base_level": _level(base_score),
            "residual_score": residual_score,
            "residual_level": _level(residual_score),
            "recommendation": rec,
            "governance_review": review,
            "report": self._report(project, threats, enabled, residual_score, rec),
            "timeline": [
                {"step": 1, "name": "Project loaded", "detail": "Business goal, users, data, and model type accepted."},
                {"step": 2, "name": "Architecture analysis", "detail": f"{len(project['architecture'])} component(s) mapped with trust boundaries."},
                {"step": 3, "name": "Threat identification", "detail": f"{len(threats)} risk(s) mapped to threat categories."},
                {"step": 4, "name": "Risk scoring", "detail": f"Base risk scored at {base_score}/100."},
                {"step": 5, "name": "Control evaluation", "detail": f"{len(enabled)} control(s) applied; residual risk is {residual_score}/100."},
                {"step": 6, "name": "Governance review", "detail": f"Recommendation: {rec['label']}."},
            ],
            "summary": [
                f"Base risk is {base_score}/100 ({_level(base_score)}).",
                f"With {len(enabled)} control(s) applied, residual risk is {residual_score}/100 ({_level(residual_score)}).",
                f"Deployment recommendation: {rec['label']}.",
            ],
            "instructor_context": {
                "teaching_points": [
                    {
                        "title": "Security is one part of governance",
                        "concept": "Holistic review",
                        "explanation": "Governance balances business goals, security, privacy, and operations. A secure system can still fail governance if it is unfair or hard to operate.",
                        "key_takeaway": "The best decision is the one the organization can stand behind, not just the most secure one.",
                    },
                    {
                        "title": "Risk cannot be eliminated",
                        "concept": "Residual risk",
                        "explanation": "Controls reduce risk to a level the organization accepts. Some risk always remains and must be accepted, transferred, or mitigated further.",
                        "key_takeaway": "Governance is about managing and accepting risk, not removing it entirely.",
                    },
                    {
                        "title": "Governance shapes architecture",
                        "concept": "Decisions and design",
                        "explanation": "A requirement for human approval or scoped retrieval changes how the system is built, not only how it is reviewed.",
                        "key_takeaway": "Governance decisions made early are cheaper and more effective than retrofits.",
                    },
                ],
                "discussion_questions": [
                    "Would you approve deployment of this system as configured?",
                    "Which of the identified risks is acceptable for this organization, and why?",
                    "Which controls provide the highest value for the effort they cost?",
                    "What risks remain after mitigation, and who accepts them?",
                ],
            },
        }

    def _governance_review(self, project: Dict[str, Any], threats: List[Dict[str, Any]],
                           base_score: int, residual_score: int, enabled: set,
                           rec: Dict[str, Any]) -> Dict[str, Any]:
        worst = min((t["residual_level"] for t in threats), default="Low",
                    key=lambda l: {"Critical": 0, "High": 1, "Medium": 2, "Low": 3, "Informational": 4}[l])
        critical_count = sum(1 for t in threats if t["residual_level"] == "Critical")
        high_count = sum(1 for t in threats if t["residual_level"] == "High")

        business = (
            f"Deploying {project['title']} targets {project['business_goal']}. "
            f"The dominant business risk is {worst.lower()} residual exposure across {critical_count} critical and {high_count} high threat(s)."
        )
        security = (
            f"Security risk is driven by model-specific threats such as injection, jailbreak, and data leakage. "
            f"With {len(enabled)} control(s) active, residual security risk is {residual_score}/100."
        )
        privacy = (
            f"The system handles {', '.join(project['data_types'][:3])}. "
            f"Privacy risk depends on whether sensitive data is filtered, scoped, and logged before it reaches the model."
        )
        operational = (
            f"Operational risk covers availability, monitoring, and the ability to respond to incidents. "
            f"Operators depend on the system, so downtime and drift are operational risks, not only security ones."
        )

        return {
            "executive_summary": (
                f"{project['title']} shows a base risk of {base_score}/100 which falls to {residual_score}/100 "
                f"with the selected controls. The assessment recommends: {rec['label']}."
            ),
            "business_risk": {"summary": business, "points": [t["business_consequences"] for t in threats[:4]]},
            "security_risk": {"summary": security, "points": [t["name"] for t in threats if t["residual_level"] in ("Critical", "High")] or ["No critical or high residual security threat."]},
            "privacy_risk": {"summary": privacy, "points": [t["name"] for t in threats if t["category"] in ("data_privacy", "data_leakage")]},
            "operational_risk": {"summary": operational, "points": [t["name"] for t in threats if t["category"] in ("denial_of_service", "supply_chain", "third_party_dependency")]},
            "residual_risk": {
                "score": residual_score,
                "level": _level(residual_score),
                "summary": f"Residual risk is {residual_score}/100 ({_level(residual_score)}). {critical_count} threat(s) remain critical and {high_count} remain high.",
            },
            "deployment_recommendation": {"label": rec["label"], "reason": rec["reason"]},
        }

    def _report(self, project: Dict[str, Any], threats: List[Dict[str, Any]], enabled: set,
                residual_score: int, rec: Dict[str, Any]) -> Dict[str, Any]:
        high_threats = [t for t in threats if t["residual_level"] in ("Critical", "High")]
        selected = [c for c in CONTROLS if c["id"] in enabled]
        missing_recommended = [
            c for c in CONTROLS
            if c["id"] not in enabled and any(
                t["category"] in c["mitigates"] and t["residual_level"] in ("Critical", "High")
                for t in high_threats
            )
        ]

        return {
            "project_overview": {
                "title": project["title"],
                "business_goal": project["business_goal"],
                "users": project["users"],
                "data_types": project["data_types"],
                "model_type": project["model_type"],
                "criticality": project["criticality"],
            },
            "architecture_summary": [f"{c['name']} - {c['role']}" for c in project["architecture"]],
            "threat_assessment": [
                {
                    "name": t["name"],
                    "category": t["category_name"],
                    "before": f"{t['base_level']} ({t['base_weight']}/100)",
                    "after": f"{t['residual_level']} ({t['residual_weight']}/100)",
                    "controls": t["controls_applied"],
                }
                for t in threats
            ],
            "selected_controls": [{"id": c["id"], "name": c["name"]} for c in selected],
            "residual_risks": [
                {
                    "name": t["name"],
                    "level": t["residual_level"],
                    "weight": t["residual_weight"],
                    "consequences": t["business_consequences"],
                }
                for t in threats
                if t["residual_level"] in ("Critical", "High", "Medium")
            ],
            "recommended_improvements": [
                {"id": c["id"], "name": c["name"], "reason": f"Reduces residual {t['name']}."}
                for c in missing_recommended[:5]
                for t in high_threats[:1]
            ],
            "security_checklist": [
                "Input validation and prompt filtering are enabled at the gateway.",
                "Sensitive data is classified, scoped, and logged with controls.",
                "Human approval is required before high-impact actions.",
                "Model outputs are validated and monitored for drift and fairness.",
                "Access follows least privilege and roles are audited.",
            ],
            "executive_summary": (
                f"{project['title']} reaches a residual risk of {residual_score}/100 after controls. "
                f"The governance recommendation is: {rec['label']}. {rec['reason']}"
            ),
            "export": "PDF export is a future extension placeholder.",
        }

    def compare(self, project_id: str) -> Dict[str, Any]:
        project = self.get_project(project_id)
        all_ids = [c["id"] for c in CONTROLS]
        poor = self.assess(project_id, [])
        well = self.assess(project_id, all_ids)
        return {
            "project_id": project_id,
            "project_title": project["title"],
            "poor": {
                "label": "Poorly Governed",
                "score": poor["residual_score"],
                "level": poor["residual_level"],
                "recommendation": poor["recommendation"]["label"],
                "controls": 0,
            },
            "well": {
                "label": "Well Governed",
                "score": well["residual_score"],
                "level": well["residual_level"],
                "recommendation": well["recommendation"]["label"],
                "controls": len(all_ids),
            },
            "difference": poor["residual_score"] - well["residual_score"],
            "notes": (
                f"A poorly governed deployment of {project['title']} scores {poor['residual_score']}/100 "
                f"with no controls, while a well governed one scores {well['residual_score']}/100 "
                f"with all controls enforced. Governance choices change the outcome more than the model does."
            ),
        }

    def ask(self, question: str, project_id: Optional[str] = None) -> Dict[str, str]:
        q = question.lower()
        if any(k in q for k in ("risk", "assess", "accept", "appetite")):
            return {"answer": "Risk is likelihood times impact. Organizations set an appetite, then use controls to bring risk to an acceptable residual level. Risk is managed, never fully removed."}
        if any(k in q for k in ("control", "mitigat", "defense")):
            return {"answer": "Controls reduce the likelihood or impact of specific threats. Choose controls that match the threats you found, and stack them in layers. Each control also has a trade-off."}
        if any(k in q for k in ("govern", "review", "deploy")):
            return {"answer": "Governance decides whether a system may deploy. It balances business, security, privacy, and operational risk, and it shapes the architecture before launch."}
        if any(k in q for k in ("injection", "jailbreak", "poison", "hallucin")):
            return {"answer": "Model-specific threats: prompt injection redirects behavior, jailbreaks bypass rules, poisoning corrupts training data, and hallucination produces confident falsehoods. Each needs its own control."}
        if any(k in q for k in ("stride", "mitre", "owasp")):
            return {"answer": "STRIDE names six threat classes, MITRE ATT&CK names attacker behaviors, and OWASP Top 10 for LLMs lists common LLM weaknesses. Use them as checklists during threat modeling."}
        if any(k in q for k in ("nist", "iso", "eu", "42001", "ai act")):
            return {"answer": "NIST AI RMF (govern, map, measure, manage), ISO/IEC 42001, and the EU AI Act organize AI governance. This lab teaches the concepts educationally and does not certify compliance."}
        if any(k in q for k in ("bias", "fair")):
            return {"answer": "Bias comes from data and design. Controls like continuous evaluation, human approval, and monitoring detect unfair patterns before they become decisions."}
        return {"answer": "This simulator teaches AI risk assessment and governance. Ask about risk scoring, controls, threat modeling frameworks, governance reviews, or model-specific threats."}
