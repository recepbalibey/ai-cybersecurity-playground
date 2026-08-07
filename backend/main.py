import os
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any, List

from app.services.ai_analyst import AIAnalystService
from app.services.threat_hunter import ThreatHunterService
from app.services.pentest_assistant import PentestAssistantService
from app.services.llm_security import LLMSecurityService
from app.services.jailbreak_evaluator import JailbreakEvaluator
from app.services.vision_security import VisionSecurityService
from app.services.agent_security import AgentSecurityService
from app.database import init_db, save_investigation, get_recent_investigations

app = FastAPI(
    title="AI Cybersecurity Playground API",
    description="FastAPI Backend for SOC Simulator and Educational AI Security Analysis",
    version="1.0.0"
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ai_service = AIAnalystService()
threat_hunter_service = ThreatHunterService()
pentest_service = PentestAssistantService()
llm_security_service = LLMSecurityService()
jailbreak_evaluator = JailbreakEvaluator()
vision_security_service = VisionSecurityService()
agent_security_service = AgentSecurityService()

DATASETS_DIR = os.path.join(os.path.dirname(__file__), "..", "datasets")

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
                    pass
    return {"datasets": datasets}

@app.get("/api/datasets/{dataset_key}")
def get_dataset(dataset_key: str):
    fname = f"{dataset_key}.json" if not dataset_key.endswith(".json") else dataset_key
    filepath = os.path.join(DATASETS_DIR, fname)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Dataset file not found")
    with open(filepath, "r") as f:
        data = json.load(f)
    return data

class AnalysisRequest(BaseModel):
    log_content: str
    dataset_name: Optional[str] = "Custom Upload"

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
    query: str

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
    name: Optional[str] = "Lab Target"
    app_type: Optional[str] = "Web Application"
    tech_stack: Optional[str] = ""
    assessment_goal: Optional[str] = "Perform a security assessment"

class PentestAssistantRequest(BaseModel):
    question: str
    scenario_key: Optional[str] = ""

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
    payload: str
    scenario_key: Optional[str] = "1_basic_override"
    mode: Optional[str] = "vulnerable"

@app.get("/api/llm-security/scenarios")
def list_llm_security_scenarios():
    return {"scenarios": llm_security_service.list_scenarios()}

@app.post("/api/llm-security/simulate")
def run_llm_simulation(req: LLMSimulationRequest):
    if not req.payload.strip():
        raise HTTPException(status_code=400, detail="Attack payload cannot be empty")
    mode = req.mode if req.mode in ("vulnerable", "protected") else "vulnerable"
    return llm_security_service.simulate(req.payload, req.scenario_key, mode)

# Module 5: Jailbreak Playground Endpoints
class JailbreakEvaluationRequest(BaseModel):
    prompt: str
    scenario_key: Optional[str] = "1_role_manipulation"
    model_key: Optional[str] = "sentinel_pro"

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
    experiment_key: str
    mode: str = "clean"
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
    goal: str = ""
    scenario_key: Optional[str] = "1_safe_investigation"
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
