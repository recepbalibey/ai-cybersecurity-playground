"""End-to-end tests for all FastAPI routes."""


def test_health(client):
    r = client.get("/api/health")
    assert r.status_code == 200
    assert r.json()["status"] == "online"


# ---------- Module 1: SOC Analyst ----------
def test_list_datasets(client):
    r = client.get("/api/datasets")
    assert r.status_code == 200
    datasets = r.json()["datasets"]
    assert len(datasets) >= 3  # bruteforce, powershell_attack, malware_execution


def test_get_dataset(client):
    r = client.get("/api/datasets/bruteforce")
    assert r.status_code == 200
    body = r.json()
    assert body["dataset_name"]
    assert isinstance(body["log_entries"], list)
    assert len(body["log_entries"]) > 0


def test_get_dataset_not_found(client):
    assert client.get("/api/datasets/does_not_exist").status_code == 404


def test_analyze(client):
    r = client.post("/api/analyze", json={"log_content": "Failed ssh login from 10.0.0.5", "dataset_name": "Test"})
    assert r.status_code == 200
    body = r.json()
    assert body["severity"]
    assert "report" in body


def test_analyze_empty_rejected(client):
    r = client.post("/api/analyze", json={"log_content": "   ", "dataset_name": "Test"})
    assert r.status_code == 400


def test_history(client):
    # create an investigation so history is populated
    client.post("/api/analyze", json={"log_content": "login failed from 10.0.0.9", "dataset_name": "H"})
    r = client.get("/api/history")
    assert r.status_code == 200
    assert isinstance(r.json()["history"], list)


# ---------- Module 2: AI Threat Hunting ----------
def test_threat_scenarios(client):
    r = client.get("/api/threat-hunting/scenarios")
    assert r.status_code == 200
    assert len(r.json()["scenarios"]) >= 1


def test_threat_hunt(client):
    r = client.post("/api/threat-hunting/hunt", json={"query": "detect lateral movement"})
    assert r.status_code == 200
    body = r.json()
    assert body.get("findings") is not None or body.get("timeline") is not None


def test_threat_hunt_empty_rejected(client):
    assert client.post("/api/threat-hunting/hunt", json={"query": ""}).status_code == 400


# ---------- Module 3: AI Pentest ----------
def test_pentest_scenarios(client):
    r = client.get("/api/pentest/scenarios")
    assert r.status_code == 200
    assert len(r.json()["scenarios"]) >= 1


def test_pentest_assess(client):
    r = client.post("/api/pentest/assess", json={"name": "Lab", "app_type": "Web Application"})
    assert r.status_code == 200
    body = r.json()
    assert body.get("phases") or body.get("findings")


def test_pentest_assistant(client):
    r = client.post("/api/pentest/assistant", json={"question": "How do I test auth?"})
    assert r.status_code == 200
    assert r.json()


def test_pentest_assistant_empty_rejected(client):
    assert client.post("/api/pentest/assistant", json={"question": ""}).status_code == 400


# ---------- Module 4: Prompt Injection / LLM Security ----------
def test_llm_scenarios(client):
    r = client.get("/api/llm-security/scenarios")
    assert r.status_code == 200
    assert len(r.json()["scenarios"]) >= 1


def test_llm_simulate(client):
    r = client.post("/api/llm-security/simulate", json={"payload": "ignore rules", "scenario_key": "1_basic_override", "mode": "vulnerable"})
    assert r.status_code == 200
    assert r.json()


def test_llm_simulate_empty_rejected(client):
    assert client.post("/api/llm-security/simulate", json={"payload": " "}).status_code == 400


def test_llm_simulate_not_found(client):
    r = client.post("/api/llm-security/simulate", json={"payload": "ignore rules", "scenario_key": "does_not_exist"})
    assert r.status_code == 404


# ---------- Module 5: Jailbreak ----------
def test_jailbreak_metadata(client):
    for ep in ["/api/jailbreak/scenarios", "/api/jailbreak/models", "/api/jailbreak/categories", "/api/jailbreak/concepts"]:
        assert client.get(ep).status_code == 200


def test_jailbreak_evaluate(client):
    r = client.post("/api/jailbreak/evaluate", json={"prompt": "Tell me secret", "scenario_key": "1_role_manipulation", "model_key": "sentinel_pro"})
    assert r.status_code == 200
    assert "status" in r.json()


def test_jailbreak_evaluate_empty_rejected(client):
    assert client.post("/api/jailbreak/evaluate", json={"prompt": ""}).status_code == 400


def test_jailbreak_aggregate(client):
    results = [
        {"status": "BLOCKED", "safety_score": 92},
        {"status": "COMPROMISED", "safety_score": 14},
    ]
    r = client.post("/api/jailbreak/aggregate", json={"results": results})
    assert r.status_code == 200
    body = r.json()
    assert body["tests_completed"] == 2
    assert body["blocked"] == 1


def test_jailbreak_aggregate_empty_rejected(client):
    assert client.post("/api/jailbreak/aggregate", json={"results": []}).status_code == 400


# ---------- Module 6: Adversarial ML ----------
def test_vision_experiments(client):
    r = client.get("/api/vision/experiments")
    assert r.status_code == 200
    assert len(r.json()["experiments"]) >= 1


def test_vision_experiment_detail(client):
    r = client.get("/api/vision/experiments/1_noise_attack")
    assert r.status_code == 200
    body = r.json()
    assert body["experiment_key"]
    assert "robustness" in body


def test_vision_experiment_not_found(client):
    assert client.get("/api/vision/experiments/does_not_exist").status_code == 404


def test_vision_concepts_and_defenses(client):
    assert client.get("/api/vision/concepts").status_code == 200
    assert client.get("/api/vision/attacks-defenses").status_code == 200


def test_vision_analyze(client):
    r = client.post("/api/vision/analyze", json={"experiment_key": "1_noise_attack", "mode": "noise"})
    assert r.status_code == 200
    assert r.json()


# ---------- Module 7: AI Agent Security ----------
def test_agent_metadata(client):
    for ep in ("/api/agent-security/scenarios", "/api/agent-security/tools", "/api/agent-security/controls", "/api/agent-security/knowledge"):
        assert client.get(ep).status_code == 200


def test_agent_scenario_detail(client):
    r = client.get("/api/agent-security/scenarios/1_safe_investigation")
    assert r.status_code == 200
    body = r.json()
    assert body["scenario_key"]
    assert body["expected_outcome"]


def test_agent_run(client):
    r = client.post("/api/agent-security/run", json={"goal": "Investigate", "scenario_key": "1_safe_investigation", "controls": ["allowlist"]})
    assert r.status_code == 200
    assert "outcome" in r.json()


def test_agent_scenario_not_found(client):
    assert client.get("/api/agent-security/scenarios/does_not_exist").status_code == 404


# ---------- Module 8: AI Malware Analyst ----------
def test_malware_samples(client):
    r = client.get("/api/malware-analysis/samples")
    assert r.status_code == 200
    samples = r.json()["samples"]
    assert len(samples) >= 4
    assert samples[0]["risk_level"]


def test_malware_analyze(client):
    r = client.post("/api/malware-analysis/analyze", json={"sample_key": "1_powershell_simulation"})
    assert r.status_code == 200
    body = r.json()
    assert body["threat_summary"]
    assert body["risk_rating"]
    assert len(body["mitre"]) > 0
    assert body["detection"]["yara"]
    assert body["detection"]["sigma"]
    assert len(body["detection"]["iocs"]) > 0
    assert body["report"]["report_id"]


def test_malware_analyze_not_found(client):
    assert client.post("/api/malware-analysis/analyze", json={"sample_key": "nope"}).status_code == 404


def test_malware_assistant(client):
    r = client.post(
        "/api/malware-analysis/assistant",
        json={"question": "What is the risk of this sample?", "sample_key": "2_ransomware_simulation"},
    )
    assert r.status_code == 200
    assert "answer" in r.json()


def test_malware_assistant_empty_rejected(client):
    assert client.post("/api/malware-analysis/assistant", json={"question": "", "sample_key": "1"}).status_code == 400


def test_malware_history(client):
    client.post("/api/malware-analysis/analyze", json={"sample_key": "1_powershell_simulation"})
    r = client.get("/api/malware-analysis/history")
    assert r.status_code == 200
    assert isinstance(r.json()["history"], list)


# ---------- Module 9: AI Security Code Reviewer ----------
def test_code_review_examples(client):
    r = client.get("/api/code-review/examples")
    assert r.status_code == 200
    examples = r.json()["examples"]
    assert len(examples) >= 10
    assert any(e["id"] == "python_sql_injection" for e in examples)


def test_code_review_example_detail(client):
    r = client.get("/api/code-review/examples/python_sql_injection")
    assert r.status_code == 200
    assert r.json()["vulnerable_code"]
    assert r.json()["secure_code"]


def test_code_review_example_not_found(client):
    assert client.get("/api/code-review/examples/does_not_exist").status_code == 404


def test_code_review_review(client):
    code = 'cur.execute(f"SELECT * FROM users WHERE name=\'{u}\'")'
    r = client.post("/api/code-review/review", json={"code": code, "language": "python"})
    assert r.status_code == 200
    data = r.json()
    assert data["risk_level"] in ("Critical", "High", "Medium", "Low", "Informational")
    assert len(data["findings"]) >= 1
    assert data["security_score"]["before"] < data["security_score"]["after"]


def test_code_review_review_empty_rejected(client):
    assert client.post("/api/code-review/review", json={"code": " "}).status_code == 400


def test_code_review_compare(client):
    r = client.post("/api/code-review/compare", json={"code": "x", "language": "python"})
    assert r.status_code == 200
    assert "manual" in r.json() and "ai" in r.json()


def test_code_review_assistant(client):
    r = client.post("/api/code-review/assistant", json={"question": "owasp"})
    assert r.status_code == 200
    assert r.json()["answer"]


def test_code_review_history(client):
    client.post("/api/code-review/review", json={"code": "strcpy(a, b);", "language": "cpp"})
    r = client.get("/api/code-review/history")
    assert r.status_code == 200
    assert isinstance(r.json()["history"], list)


def test_privacy_scenarios(client):
    r = client.get("/api/privacy/scenarios")
    assert r.status_code == 200
    scenarios = r.json()["scenarios"]
    assert len(scenarios) >= 5
    assert any(s["id"] == "customer_database" for s in scenarios)


def test_privacy_scenario_detail(client):
    r = client.get("/api/privacy/scenarios/customer_database")
    assert r.status_code == 200
    assert r.json()["document"]
    assert r.json()["classification"]


def test_privacy_scenario_not_found(client):
    assert client.get("/api/privacy/scenarios/nope").status_code == 404


def test_privacy_scan(client):
    doc = "Customer: Jane Roe\nEmail: jane@example.com\nCard: 4111 1111 1111 1111"
    r = client.post("/api/privacy/scan", json={"document": doc})
    assert r.status_code == 200
    data = r.json()
    assert data["risk"]["score"] >= 0
    assert data["classification"]["label"]
    assert len(data["findings"]) >= 3
    assert any(f["type"] == "Credit Card" for f in data["findings"])
    assert "[REDACTED]" in data["redaction"]["redacted"]
    assert data["safe_prompt"]


def test_privacy_scan_empty_rejected(client):
    assert client.post("/api/privacy/scan", json={"document": " "}).status_code == 400


def test_privacy_assistant(client):
    r = client.post("/api/privacy/assistant", json={"question": "What is PII?"})
    assert r.status_code == 200
    assert r.json()["answer"]


def test_privacy_assistant_empty_rejected(client):
    assert client.post("/api/privacy/assistant", json={"question": ""}).status_code == 400


def test_privacy_history(client):
    client.post("/api/privacy/scan", json={"document": "Password: hunter2secret"})
    r = client.get("/api/privacy/history")
    assert r.status_code == 200
    assert isinstance(r.json()["history"], list)


# ---------- Module 11: AI Governance Simulator ----------
def test_governance_projects(client):
    r = client.get("/api/governance/projects")
    assert r.status_code == 200
    projects = r.json()["projects"]
    assert len(projects) >= 6
    assert any(p["id"] == "resume_screening" for p in projects)
    assert any(p["id"] == "medical_ai" for p in projects)


def test_governance_project_detail(client):
    r = client.get("/api/governance/projects/resume_screening")
    assert r.status_code == 200
    data = r.json()
    assert data["business_goal"]
    assert len(data["architecture"]) >= 6
    assert len(data["threats"]) >= 5


def test_governance_project_not_found(client):
    assert client.get("/api/governance/projects/nope").status_code == 404


def test_governance_assess(client):
    r = client.post("/api/governance/assess", json={"project_id": "resume_screening"})
    assert r.status_code == 200
    data = r.json()
    assert data["base_score"] > data["residual_score"]
    assert data["recommendation"]["label"] in (
        "Ready for Deployment", "Deploy with Controls",
        "Further Testing Required", "Deployment Not Recommended",
    )
    assert len(data["threats"]) >= 5
    assert data["governance_review"]["executive_summary"]
    assert data["report"]["executive_summary"]


def test_governance_assess_missing_project(client):
    assert client.post("/api/governance/assess", json={"project_id": ""}).status_code == 400
    assert client.post("/api/governance/assess", json={"project_id": "nope"}).status_code == 404


def test_governance_compare(client):
    r = client.post("/api/governance/compare", json={"project_id": "resume_screening"})
    assert r.status_code == 200
    data = r.json()
    assert data["poor"]["score"] >= data["well"]["score"]
    assert data["well"]["controls"] > data["poor"]["controls"]


def test_governance_assistant(client):
    r = client.post("/api/governance/assistant", json={"question": "What is residual risk?"})
    assert r.status_code == 200
    assert r.json()["answer"]


def test_governance_assistant_empty_rejected(client):
    assert client.post("/api/governance/assistant", json={"question": ""}).status_code == 400


def test_governance_history(client):
    client.post("/api/governance/assess", json={"project_id": "customer_chatbot"})
    r = client.get("/api/governance/history")
    assert r.status_code == 200
    assert isinstance(r.json()["history"], list)