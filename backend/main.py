import os
import json
import logging
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
import time
from collections import defaultdict

logger = logging.getLogger(__name__)

from app.services.ai_analyst import AIAnalystService
from app.services.threat_hunter import ThreatHunterService
from app.services.pentest_assistant import PentestAssistantService
from app.services.llm_security import LLMSecurityService
from app.services.jailbreak_evaluator import JailbreakEvaluator
from app.services.vision_security import VisionSecurityService
from app.services.agent_security import AgentSecurityService
from app.services.malware_analyst import MalwareAnalystService
from app.services.security_code_reviewer import SecurityCodeReviewerService
from app.services.privacy_scanner import PrivacyScannerService
from app.services.governance_engine import GovernanceEngineService
from app.services.ai_failure_engine import AiFailureEngineService
from app.database import init_db, save_investigation, get_recent_investigations
from app.database import save_malware_analysis, get_recent_malware_analyses
from app.database import save_code_review, get_recent_code_reviews
from app.database import save_privacy_scan, get_recent_privacy_scans
from app.database import save_governance_review, get_recent_governance_reviews
from app.database import save_ai_failure_review, get_recent_ai_failure_reviews

app = FastAPI(
    title="AI Cybersecurity Playground API",
    description="FastAPI Backend for SOC Simulator and Educational AI Security Analysis",
    version="1.0.0"
)

# CORS: allow specific origins via ALLOWED_ORIGINS env var (comma-separated).
# Defaults to localhost for development.
ALLOWED_ORIGINS = os.environ.get(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# Rate limiting: per-IP, in-memory, sliding window.
# Production should use Cloudflare-level rate limiting in addition.
RATE_LIMIT_WINDOW = int(os.environ.get("RATE_LIMIT_WINDOW", "60"))
RATE_LIMIT_MAX = int(os.environ.get("RATE_LIMIT_MAX", "60"))
_rate_store: Dict[str, list] = defaultdict(list)

@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    # Only rate-limit API POST endpoints (expensive operations)
    if request.url.path.startswith("/api/") and request.method == "POST":
        client_ip = request.client.host if request.client else "unknown"
        now = time.time()
        window = _rate_store[client_ip]
        # Prune expired entries
        _rate_store[client_ip] = [t for t in window if now - t < RATE_LIMIT_WINDOW]
        if len(_rate_store[client_ip]) >= RATE_LIMIT_MAX:
            return JSONResponse(
                status_code=429,
                content={"detail": "Rate limit exceeded. Try again later."},
            )
        _rate_store[client_ip].append(now)
    return await call_next(request)

ai_service = AIAnalystService()
threat_hunter_service = ThreatHunterService()
pentest_service = PentestAssistantService()
llm_security_service = LLMSecurityService()
jailbreak_evaluator = JailbreakEvaluator()
vision_security_service = VisionSecurityService()
agent_security_service = AgentSecurityService()
malware_analyst_service = MalwareAnalystService()
code_review_service = SecurityCodeReviewerService()
privacy_scanner_service = PrivacyScannerService()
governance_service = GovernanceEngineService()
ai_failure_service = AiFailureEngineService()

DATASETS_DIR = os.path.join(os.path.dirname(__file__), "..", "datasets")

def _safe_dataset_path(dataset_key: str) -> str:
    """Resolve dataset path, rejecting traversal attempts."""
    # Strip .json extension if present, then re-add
    clean = dataset_key.removesuffix(".json")
    # Reject anything that could escape the directory
    if not clean or ".." in clean or "/" in clean or "\\" in clean or "\0" in clean:
        return ""
    # Only allow alphanumeric, hyphens, underscores
    if not all(c.isalnum() or c in "-_" for c in clean):
        return ""
    return os.path.join(DATASETS_DIR, f"{clean}.json")

# Initialize database
init_db()

@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "service": "AI SOC Analyst Engine",
        "model_version": "v1.4-educational",
        "database": "connected"
    }

@app.get("/api/datasets")
def list_datasets():
    datasets = []
    if os.path.exists(DATASETS_DIR):
        for fname in os.listdir(DATASETS_DIR):
            if fname.endswith(".json"):
                filepath = os.path.join(DATASETS_DIR, fname)
                try:
                    with open(filepath, "r") as f:
                        data = json.load(f)
                        datasets.append({
                            "key": fname.replace(".json", ""),
                            "filename": fname,
                            "name": data.get("dataset_name", fname),
                            "source": data.get("source", "Unknown"),
                            "target": data.get("target_system", "Unknown"),
                            "entry_count": len(data.get("log_entries", []))
                        })
                except Exception as e:
                    logger.warning("Failed to read dataset %s: %s", fname, e)
    return {"datasets": datasets}

@app.get("/api/datasets/{dataset_key}")
def get_dataset(dataset_key: str):
    filepath = _safe_dataset_path(dataset_key)
    if not filepath or not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Dataset file not found")
    with open(filepath, "r") as f:
        data = json.load(f)
    return data

class AnalysisRequest(BaseModel):
    log_content: str = Field(..., max_length=100_000)
    dataset_name: Optional[str] = Field(default="Custom Upload", max_length=200)

@app.post("/api/analyze")
def analyze_logs(req: AnalysisRequest):
    if not req.log_content.strip():
        raise HTTPException(status_code=400, detail="Log content cannot be empty")
    
    result = ai_service.analyze_logs(req.log_content, req.dataset_name)

    # Persist in SQLite
    try:
        inv_id = save_investigation(
            dataset_name=result["dataset_name"],
            severity=result["severity"],
            iocs=result["iocs"],
            mitre=result["mitre_mappings"],
            summary=result["report"]["summary"],
            full_report=result["report"]
        )
        result["investigation_db_id"] = inv_id
    except Exception as e:
        result["investigation_db_id"] = None

    return result

@app.get("/api/history")
def get_history():
    history = get_recent_investigations(limit=10)
    return {"history": history}

# Module 2: AI Threat Hunting Endpoints
class ThreatHuntRequest(BaseModel):
    query: str = Field(..., max_length=5_000)

@app.get("/api/threat-hunting/scenarios")
def list_threat_hunting_scenarios():
    return {"scenarios": threat_hunter_service.list_scenarios()}

@app.post("/api/threat-hunting/hunt")
def run_threat_hunt(req: ThreatHuntRequest):
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Threat query cannot be empty")
    return threat_hunter_service.run_hunt(req.query)

# Module 3: AI Pentest Assistant Endpoints
class PentestConfig(BaseModel):
    name: Optional[str] = Field(default="Lab Target", max_length=200)
    app_type: Optional[str] = Field(default="Web Application", max_length=200)
    tech_stack: Optional[str] = Field(default="", max_length=500)
    assessment_goal: Optional[str] = Field(default="Perform a security assessment", max_length=2_000)

class PentestAssistantRequest(BaseModel):
    question: str = Field(..., max_length=5_000)
    scenario_key: Optional[str] = Field(default="", max_length=200)

@app.get("/api/pentest/scenarios")
def list_pentest_scenarios():
    return {"scenarios": pentest_service.list_scenarios()}

@app.post("/api/pentest/assess")
def run_pentest_assessment(req: PentestConfig):
    target = {
        "name": req.name or "Lab Target",
        "app_type": req.app_type or "Web Application",
        "tech_stack": req.tech_stack or "",
        "assessment_goal": req.assessment_goal or "Perform a security assessment",
    }
    return pentest_service.run_assessment(target)

@app.post("/api/pentest/assistant")
def run_pentest_assistant(req: PentestAssistantRequest):
    if not req.question.strip():
        raise HTTPException(status_code=400, detail="Assistant question cannot be empty")
    return pentest_service.answer_assistant(req.question, req.scenario_key)

# Module 4: Prompt Injection Playground Endpoints
class LLMSimulationRequest(BaseModel):
    payload: str = Field(..., max_length=10_000)
    scenario_key: Optional[str] = Field(default="1_basic_override", max_length=200)
    mode: Optional[str] = Field(default="vulnerable", max_length=20)

@app.get("/api/llm-security/scenarios")
def list_llm_security_scenarios():
    return {"scenarios": llm_security_service.list_scenarios()}

@app.post("/api/llm-security/simulate")
def run_llm_simulation(req: LLMSimulationRequest):
    if not req.payload.strip():
        raise HTTPException(status_code=400, detail="Attack payload cannot be empty")
    mode = req.mode if req.mode in ("vulnerable", "protected") else "vulnerable"
    try:
        return llm_security_service.simulate(req.payload, req.scenario_key, mode)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Scenario not found")

# Module 5: Jailbreak Playground Endpoints
class JailbreakEvaluationRequest(BaseModel):
    prompt: str = Field(..., max_length=10_000)
    scenario_key: Optional[str] = Field(default="1_role_manipulation", max_length=200)
    model_key: Optional[str] = Field(default="sentinel_pro", max_length=200)

@app.get("/api/jailbreak/scenarios")
def list_jailbreak_scenarios():
    return {"scenarios": jailbreak_evaluator.list_scenarios()}

@app.get("/api/jailbreak/models")
def list_jailbreak_models():
    return {"models": jailbreak_evaluator.list_models()}

@app.get("/api/jailbreak/categories")
def list_jailbreak_categories():
    return {"categories": jailbreak_evaluator.list_categories()}

@app.get("/api/jailbreak/concepts")
def list_jailbreak_concepts():
    return {"concepts": jailbreak_evaluator.list_concepts()}

@app.post("/api/jailbreak/evaluate")
def run_jailbreak_evaluation(req: JailbreakEvaluationRequest):
    if not req.prompt.strip():
        raise HTTPException(status_code=400, detail="Test prompt cannot be empty")
    return jailbreak_evaluator.evaluate(req.prompt, req.scenario_key, req.model_key)

@app.post("/api/jailbreak/aggregate")
def aggregate_jailbreak_results(req: dict):
    results = req.get("results", [])
    if not results:
        raise HTTPException(status_code=400, detail="No evaluation results provided")
    return jailbreak_evaluator.aggregate(results)

# Module 6: Adversarial Face Recognition Lab Endpoints
class VisionExperimentRequest(BaseModel):
    experiment_key: str = Field(..., max_length=200)
    mode: str = Field(default="clean", max_length=20)
    intensity: Optional[float] = None

@app.get("/api/vision/experiments")
def list_vision_experiments():
    return {"experiments": vision_security_service.list_experiments()}

@app.get("/api/vision/experiments/{experiment_key}")
def vision_experiment_detail(experiment_key: str):
    try:
        return vision_security_service.experiment_detail(experiment_key)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Experiment not found")

@app.get("/api/vision/concepts")
def list_vision_concepts():
    return {"concepts": vision_security_service.list_concepts()}

@app.get("/api/vision/attacks-defenses")
def list_vision_attacks_defenses():
    return vision_security_service.list_attacks_defenses()

@app.post("/api/vision/analyze")
def run_vision_analysis(req: VisionExperimentRequest):
    try:
        return vision_security_service.analyze(req.experiment_key, req.mode)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Experiment not found")

# Module 7: AI Agent Security Lab Endpoints
class AgentMissionRequest(BaseModel):
    goal: str = Field(default="", max_length=5_000)
    scenario_key: Optional[str] = Field(default="1_safe_investigation", max_length=200)
    controls: Optional[List[str]] = None

@app.get("/api/agent-security/scenarios")
def list_agent_scenarios():
    return {"scenarios": agent_security_service.list_scenarios()}

@app.get("/api/agent-security/scenarios/{scenario_key}")
def agent_scenario_detail(scenario_key: str):
    try:
        return agent_security_service.scenario_detail(scenario_key)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Scenario not found")

@app.get("/api/agent-security/tools")
def list_agent_tools():
    return {"tools": agent_security_service.list_tools()}

@app.get("/api/agent-security/controls")
def list_agent_controls():
    return {"controls": agent_security_service.list_controls()}

@app.get("/api/agent-security/knowledge")
def list_agent_knowledge():
    return agent_security_service.list_knowledge()

@app.post("/api/agent-security/run")
def run_agent_mission(req: AgentMissionRequest):
    try:
        return agent_security_service.run_mission(
            req.goal, req.scenario_key or "1_safe_investigation", req.controls or []
        )
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Scenario not found")

# Module 8: AI Malware Analyst Lab Endpoints
class MalwareAssistantRequest(BaseModel):
    question: str = Field(..., max_length=5_000)
    sample_key: Optional[str] = Field(default="1_powershell_simulation", max_length=200)

@app.get("/api/malware-analysis/samples")
def list_malware_samples():
    return {"samples": malware_analyst_service.list_samples()}

@app.post("/api/malware-analysis/analyze")
def run_malware_analysis(req: dict):
    sample_key = req.get("sample_key", "1_powershell_simulation")
    try:
        result = malware_analyst_service.analyze(sample_key)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Sample not found")

    try:
        result["analysis_db_id"] = save_malware_analysis(
            sample_key=result["sample_key"],
            file_name=result["file"]["name"],
            risk_rating=result["risk_rating"],
            mitre=result["mitre"],
            detections=result["detection"],
            threat_summary=result["threat_summary"],
            full_report=result["report"],
        )
    except Exception:
        result["analysis_db_id"] = None
    return result

@app.post("/api/malware-analysis/assistant")
def run_malware_assistant(req: MalwareAssistantRequest):
    if not req.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")
    try:
        return malware_analyst_service.answer_assistant(req.question, req.sample_key)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Sample not found")

@app.get("/api/malware-analysis/history")
def get_malware_history():
    return {"history": get_recent_malware_analyses(limit=10)}

# Module 9: AI Security Code Reviewer Endpoints
class CodeReviewRequest(BaseModel):
    code: str = Field(..., max_length=100_000)
    language: Optional[str] = Field(default=None, max_length=50)
    example_id: Optional[str] = Field(default=None, max_length=200)

class CodeReviewAssistantRequest(BaseModel):
    question: str = Field(..., max_length=5_000)
    example_id: Optional[str] = Field(default=None, max_length=200)

@app.get("/api/code-review/examples")
def list_code_review_examples():
    return {"examples": code_review_service.list_examples()}

@app.get("/api/code-review/examples/{example_id}")
def code_review_example_detail(example_id: str):
    try:
        return code_review_service.get_example(example_id)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Example not found")

@app.post("/api/code-review/review")
def run_code_review(req: CodeReviewRequest):
    if not req.code.strip():
        raise HTTPException(status_code=400, detail="Code cannot be empty")
    try:
        result = code_review_service.analyze(req.code, req.language, req.example_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    try:
        score = result["security_score"]
        result["review_db_id"] = save_code_review(
            language=result["language"],
            risk_level=result["risk_level"],
            score_before=score["before"],
            score_after=score["after"],
            findings=result["findings"],
            full_report=result,
        )
    except Exception:
        result["review_db_id"] = None
    return result

@app.post("/api/code-review/compare")
def run_code_review_compare(req: CodeReviewRequest):
    try:
        return code_review_service.compare(req.code, req.language, req.example_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/code-review/assistant")
def run_code_review_assistant(req: CodeReviewAssistantRequest):
    if not req.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")
    return code_review_service.ask(req.question, req.example_id)

@app.get("/api/code-review/history")
def get_code_review_history():
    return {"history": get_recent_code_reviews(limit=10)}

# Module 10: AI Data Privacy Lab Endpoints
class PrivacyScanRequest(BaseModel):
    document: str = Field(..., max_length=100_000)
    scenario_id: Optional[str] = Field(default=None, max_length=200)

class PrivacyAssistantRequest(BaseModel):
    question: str = Field(..., max_length=5_000)
    scenario_id: Optional[str] = Field(default=None, max_length=200)

@app.get("/api/privacy/scenarios")
def list_privacy_scenarios():
    return {"scenarios": privacy_scanner_service.list_scenarios()}

@app.get("/api/privacy/scenarios/{scenario_id}")
def privacy_scenario_detail(scenario_id: str):
    try:
        return privacy_scanner_service.get_scenario(scenario_id)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Scenario not found")

@app.post("/api/privacy/scan")
def run_privacy_scan(req: PrivacyScanRequest):
    if not req.document.strip():
        raise HTTPException(status_code=400, detail="Document cannot be empty")
    try:
        result = privacy_scanner_service.scan(req.document, req.scenario_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    try:
        result["scan_db_id"] = save_privacy_scan(
            scenario_id=result["scenario_id"] or "custom",
            classification=result["classification"]["label"],
            risk_level=result["risk"]["level"],
            risk_score=result["risk"]["score"],
            findings=result["findings"],
            full_report=result,
        )
    except Exception:
        result["scan_db_id"] = None
    return result

@app.post("/api/privacy/assistant")
def run_privacy_assistant(req: PrivacyAssistantRequest):
    if not req.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")
    return privacy_scanner_service.ask(req.question, req.scenario_id)

@app.get("/api/privacy/history")
def get_privacy_history():
    return {"history": get_recent_privacy_scans(limit=10)}

# Module 11: AI Risk Assessment & Governance Simulator Endpoints
class GovernanceAssessRequest(BaseModel):
    project_id: str = Field(..., max_length=200)
    controls: Optional[List[str]] = None

class GovernanceAssistantRequest(BaseModel):
    question: str = Field(..., max_length=5_000)
    project_id: Optional[str] = Field(default=None, max_length=200)

@app.get("/api/governance/projects")
def list_governance_projects():
    return {"projects": governance_service.list_projects()}

@app.get("/api/governance/projects/{project_id}")
def governance_project_detail(project_id: str):
    try:
        return governance_service.get_project(project_id)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Project not found")

@app.post("/api/governance/assess")
def run_governance_assessment(req: GovernanceAssessRequest):
    if not req.project_id.strip():
        raise HTTPException(status_code=400, detail="Project id cannot be empty")
    try:
        result = governance_service.assess(req.project_id, req.controls or None)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Project not found")
    try:
        result["review_db_id"] = save_governance_review(
            project_id=result["project_id"],
            base_score=result["base_score"],
            residual_score=result["residual_score"],
            recommendation=result["recommendation"]["label"],
            controls_count=len([c for c in result["controls"] if c["enabled"]]),
            full_report=result,
        )
    except Exception:
        result["review_db_id"] = None
    return result

@app.post("/api/governance/compare")
def run_governance_compare(req: GovernanceAssessRequest):
    if not req.project_id.strip():
        raise HTTPException(status_code=400, detail="Project id cannot be empty")
    try:
        return governance_service.compare(req.project_id)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Project not found")

@app.post("/api/governance/assistant")
def run_governance_assistant(req: GovernanceAssistantRequest):
    if not req.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")
    return governance_service.ask(req.question, req.project_id)

@app.get("/api/governance/history")
def get_governance_history():
    return {"history": get_recent_governance_reviews(limit=10)}

# Module 13: AI Failure Lab Endpoints
class AiFailureEvaluateRequest(BaseModel):
    scenario_id: str = Field(..., max_length=200)
    decision: str = Field(default="uncertain", max_length=200)
    mitigations: Optional[List[str]] = None
    confidence: Optional[int] = None

class AiFailureChallengeRequest(BaseModel):
    scenario_id: str = Field(..., max_length=200)
    prediction: str = Field(..., max_length=200)

class AiFailureCapstoneRequest(BaseModel):
    scenario_id: str = Field(..., max_length=200)
    picks: Dict[str, str] = {}

class AiFailureScorecardRequest(BaseModel):
    entries: List[Dict[str, Any]] = Field(default_factory=list, max_length=50)

class AiFailureAssistantRequest(BaseModel):
    question: str = Field(..., max_length=5_000)

@app.get("/api/ai-failures/scenarios")
def list_ai_failure_scenarios():
    return {"scenarios": ai_failure_service.list_scenarios()}

@app.get("/api/ai-failures/scenarios/{scenario_id}")
def ai_failure_scenario_detail(scenario_id: str):
    try:
        return ai_failure_service.get_scenario(scenario_id)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Scenario not found")

@app.get("/api/ai-failures/knowledge")
def ai_failure_knowledge():
    return ai_failure_service.list_knowledge()

@app.post("/api/ai-failures/evaluate")
def run_ai_failure_evaluate(req: AiFailureEvaluateRequest):
    if not req.scenario_id.strip():
        raise HTTPException(status_code=400, detail="Scenario id cannot be empty")
    try:
        result = ai_failure_service.evaluate(
            req.scenario_id,
            req.decision,
            req.mitigations or [],
            req.confidence,
        )
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Scenario not found")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    try:
        rel = result["reliability"]
        result["review_db_id"] = save_ai_failure_review(
            scenario_id=result["scenario_id"],
            student_decision=result["student_decision"],
            ai_correct=result["ai_correct"],
            student_verdict_correct=result["student_verdict_correct"],
            student_confidence=result["student_confidence"],
            reliability_before=rel["before"],
            reliability_after=rel["after"],
            mitigations_count=len(rel["selected"]),
            full_report=result,
        )
    except Exception:
        result["review_db_id"] = None
    return result

@app.post("/api/ai-failures/challenge")
def run_ai_failure_challenge(req: AiFailureChallengeRequest):
    if not req.scenario_id.strip():
        raise HTTPException(status_code=400, detail="Scenario id cannot be empty")
    try:
        return ai_failure_service.challenge(req.scenario_id, req.prediction)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Scenario not found")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/ai-failures/capstone")
def run_ai_failure_capstone(req: AiFailureCapstoneRequest):
    if not req.scenario_id.strip():
        raise HTTPException(status_code=400, detail="Scenario id cannot be empty")
    try:
        return ai_failure_service.run_capstone(req.scenario_id, req.picks or {})
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Scenario not found")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/ai-failures/scorecard")
def run_ai_failure_scorecard(req: AiFailureScorecardRequest):
    if not req.entries:
        raise HTTPException(status_code=400, detail="No verdict entries provided")
    return ai_failure_service.scorecard(req.entries)

@app.post("/api/ai-failures/calibration")
def run_ai_failure_calibration(req: AiFailureScorecardRequest):
    if not req.entries:
        raise HTTPException(status_code=400, detail="No verdict entries provided")
    return ai_failure_service.calibration(req.entries)

@app.post("/api/ai-failures/assistant")
def run_ai_failure_assistant(req: AiFailureAssistantRequest):
    if not req.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")
    return ai_failure_service.ask(req.question)

@app.get("/api/ai-failures/history")
def get_ai_failure_history():
    return {"history": get_recent_ai_failure_reviews(limit=10)}

if __name__ == "__main__":
    import uvicorn
    host = os.environ.get("HOST", "127.0.0.1")
    port = int(os.environ.get("PORT", "8000"))
    reload = os.environ.get("RELOAD", "true").lower() == "true"
    uvicorn.run("main:app", host=host, port=port, reload=reload)
