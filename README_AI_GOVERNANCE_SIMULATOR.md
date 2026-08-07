# AI Risk Assessment & Governance Simulator (Module 11)

An interactive lab that teaches how enterprises evaluate, govern, and secure
an AI system before deployment. Every screen answers one question:
**should this AI system be deployed?**

The lab has the feel of an "Enterprise AI Security Decision Center." The
system architecture is the dominant visual, and each step of the workflow
(project -> architecture -> risks -> controls -> residual risk -> report)
builds toward a deployment decision you can defend.

Core lesson: security is one part of AI governance. Risk cannot be
eliminated - it is managed to a level the organization accepts, and
different organizations accept different levels of risk.

This lab is an educational simulator. All organizations and AI systems are
fictional. It provides no legal advice and does not certify compliance with
any regulation or standard.

## What you do in this lab

1. Choose an AI project: resume screening, medical diagnosis, loan
   approval, airport screening, customer chatbot, or industrial quality.
2. Explore the architecture and where each component creates attack surface.
3. Review the identified risks and their business impact, mapped to threat
   categories.
4. Select security controls and watch residual risk move in real time.
5. Read the risk heat map, the governance review, and the deployment
   recommendation.
6. Generate the governance report and compare a poorly vs well governed
   deployment.
7. Ask the governance assistant about risk scoring, controls, and
   frameworks like STRIDE, OWASP Top 10 for LLMs, and NIST AI RMF.

## Learning objectives

- Assess the risk of an AI system from its architecture and threats.
- Explain why risk exists (attack vector), why it matters (business
  impact), and how a control reduces it.
- Choose controls that match the identified threats and weigh each
  control's trade-off.
- Read a residual risk score and a deployment recommendation, and decide
  whether to accept it.
- Explain why governance decisions shape technical architecture and why
  security alone does not decide a deployment.
- Understand at a high level STRIDE, MITRE ATT&CK, OWASP Top 10 for LLM
  Applications, and how NIST AI RMF, ISO/IEC 42001, and the EU AI Act
  organize AI governance.

## Risk scoring methodology

Identical in the frontend and backend engines (round-half-up so both
produce the same integers):

- Each threat has likelihood and impact from 1 to 5.
- Threat weight = `round_half_up(10 + (likelihood*impact - 1) * 90 / 24)`,
  a 0 to 100 scale.
- Levels: Critical (85+), High (65+), Medium (45+), Low (25+),
  Informational (below 25).
- Aggregate score = `0.55 * average + 0.45 * worst`. The worst threat is
  weighted heavily because one critical risk should block a go-live even
  when the average looks fine.
- Each applied control reduces likelihood and/or impact for the threat
  categories it mitigates. Residual likelihood/impact never drops below 1.
- Recommendations: residual 80+ is "Deployment Not Recommended", 60+
  "Further Testing Required", 35+ "Deploy with Controls", below 35
  "Ready for Deployment" (a Critical/High criticality system stays "Deploy
  with Controls" below 35; a Critical worst residual threat, or a High one
  on a Critical system, escalates to "Further Testing Required").

Verified example scores (base -> with all controls): medical_ai 79 -> 24,
banking_assistant 80 -> 14, resume_screening 59 -> 14,
airport_security 57 -> 17, customer_chatbot 48 -> 12,
industrial_ai 45 -> 16.

## Security control catalog

15 controls, each with the threat categories it mitigates, its likelihood
and impact reduction, and its trade-off: input validation, prompt
filtering, output validation, human approval, role-based access control,
least privilege, audit logging, encryption, model monitoring, content
filtering, rate limiting, data classification, retrieval validation, model
version control, continuous evaluation.

16 threat categories cover STRIDE classes: data privacy, prompt injection,
model theft, adversarial ML, jailbreak, model poisoning, supply chain,
hallucination, unauthorized access, insider threat, API abuse, tool abuse,
sensitive data leakage, third-party dependency, denial of service, bias
and fairness.

## Educational scenarios (datasets/governance)

- resume_screening - AI Resume Screening, High criticality, poorly governed.
- medical_ai - Medical Diagnosis Assistant, Critical, poorly governed.
- banking_assistant - Bank Loan Approval Assistant, Critical, poorly governed.
- airport_security - Airport Security Screening, Critical, poorly governed.
- customer_chatbot - Customer Support Chatbot, Medium, poorly governed.
- industrial_ai - Industrial Quality Control, High, poorly governed.

Each scenario ships an id, title, description, business goal, users, data
types, model type, criticality, governance stance, an 8-component
architecture, seven threats with likelihood/impact and business
consequences, baseline controls, and teaching points.

## Run the backend

FastAPI with a SQLite history table (`governance_reviews`).

    cd backend
    ./venv/bin/python -m pytest -q
    ./venv/bin/python -m uvicorn main:app --port 8000

Endpoints:

- GET  /api/governance/projects
- GET  /api/governance/projects/{project_id}
- POST /api/governance/assess
- POST /api/governance/compare
- POST /api/governance/assistant
- GET  /api/governance/history

The engine is rule-based with a `ModelProvider` abstraction ready for
OpenAI, Ollama, or reference mappings for NIST AI RMF, ISO/IEC 42001, and
the EU AI Act. Empty project ids return 400, unknown projects return 404.

## Run the frontend

    cd frontend
    npm run typecheck
    npm test
    rm -rf .next && npm run build
    npm start

The frontend runs fully offline with mirrored data, knowledge, and a
deterministic engine, and falls back to the backend API when it is online.

## Classroom exercises

1. Assess the medical assistant with only its baseline controls. Would you
   deploy it? Which control would you add first and why?
2. Turn every control on for the loan approval assistant. Which trade-offs
   did you just accept, and how would you explain them to the business?
3. Compare the poorly and well governed deployment of the airport system.
   Which risks moved the most and which controls moved them?
4. Two organizations want the same chatbot. One accepts the residual risk,
   the other does not. What does that say about risk appetite and
   governance, not security alone?

## Notes

- Database table: `governance_reviews` in `backend/app/database.py`.
- Shared datasets under `datasets/governance/` and the knowledge base under
  `knowledge/governance/knowledge_base.json`.
- Frontend mirrors data in `src/data/governance.ts`, knowledge in
  `src/knowledge/governance/knowledgeBase.ts`, and the engine in
  `src/services/governanceEngine.ts`.
- Data integrity and engine parity are checked by the frontend and backend
  test suites.
