# AI Data Privacy Lab (Module 10)

An interactive, defensive lab that shows how enterprises protect sensitive
data before it reaches an AI system. Learn to detect PII and secrets,
classify data, apply policy, redact, and produce a safe prompt for an
approved AI tool.

Core lesson: AI is not the problem. Sending sensitive information without
controls is the problem. Protection happens before data reaches the model.

This lab is strictly defensive and educational. All documents, employees,
and records are fictional and synthetic. It does not connect to any real
AI service, cloud system, M365, Google Workspace, or production API.

## What you do in this lab

1. Pick one of five simulated documents, from a customer database export to
   a healthcare record.
2. Run the privacy scan. It detects PII and secrets, then classifies the
   document.
3. Inspect every finding: why the data is sensitive, why attackers want it,
   why AI systems should not receive it, and how organizations protect it.
4. Read the policy engine verdict. Blocked documents must be redacted
   before any external AI use.
5. Compare the original with the protected version and copy the safe,
   de-identified prompt.
6. Ask the privacy assistant questions about PII, secrets, classification,
   DLP, and prompt hygiene.

## Learning objectives

- Identify PII (personal data) and secrets in plain text documents.
- Explain the four answers for every finding: why sensitive, why targeted,
  why not for AI, how to protect.
- Apply the five data classification labels: Public, Internal, Confidential,
  Restricted, Highly Restricted.
- Read a policy engine result and explain when a document is blocked.
- Compare original and redacted versions and use least disclosure.
- Explain why privacy protection is a team discipline that happens before
  the model, not after.

## What the engine checks

The rule-based scanner detects 17 finding types across these groups:

- PII: personal name, email, phone, address, passport number, customer ID,
  date of birth, salary information.
- Credentials and secrets: API keys, passwords, access tokens, cloud access
  keys, private certificates.
- Regulated data: credit card numbers, bank accounts, medical information.
- Corporate secrets: internal project names, internal systems and accounts,
  source code content.

### Classification

Critical findings give "Restricted", or "Highly Restricted" when medical or
salary data is present. High gives "Confidential", Medium gives "Internal",
otherwise "Public".

### Risk score

Risk runs from 0 to 100 and matches the backend formula: a base of 30 plus
8 per Critical finding, 4 per High, 2 per Medium, with bonuses for medical
(+15), secrets (+10), and financial data (+6). Levels are Critical (85+),
High (65+), Medium (45+), Low (25+), and Informational (below 25).

### Policy engine

- No customer PII to public AI
- No credentials or secrets
- No financial records
- No medical records
- No source code
- No confidential contracts
- Least disclosure review flag

## Educational scenarios (datasets/privacy)

- customer_database - customer export, declared High.
- source_code_secret - code file with live-looking keys, declared Critical.
- employee_hr_record - full HR record with salary, declared Critical.
- security_incident - incident log with internal systems, declared High.
- healthcare_record - patient record, declared Critical.

Each scenario ships an id, title, category, description, classification,
risk level, handling, the document body, and teaching points.

## Run the backend

FastAPI with a SQLite history table (`privacy_scans`).

    cd backend
    ./venv/bin/python -m pytest -q
    ./venv/bin/python -m uvicorn main:app --port 8000

Endpoints:

- GET  /api/privacy/scenarios
- GET  /api/privacy/scenarios/{id}
- POST /api/privacy/scan
- POST /api/privacy/assistant
- GET  /api/privacy/history

The scanner is rule-based with a `ModelProvider` abstraction ready for
Microsoft Presidio, OpenAI, Ollama, or Azure AI Content Safety. Unknown
routes return 404. Empty documents return 400.

## Run the frontend

    cd frontend
    npm run typecheck
    npm test
    rm -rf .next && npm run build
    npm start

## Classroom exercises

1. Pick the healthcare record. List every finding that makes it
   "Highly Restricted" and state the rule that blocks it.
2. Run the scan on the customer export. What data would you keep if you
   really needed to build a marketing email?
3. Compare the original and protected document. Which values survived and
   why were they allowed to stay?
4. Build a safe prompt for the incident log and argue why an internal tool
   is preferred for it.

## Notes

- Database table: `privacy_scans` in `backend/app/database.py`.
- Shared datasets under `datasets/privacy/` and the knowledge base under
  `knowledge/privacy/knowledge_base.json`.
- Data integrity is checked by the frontend suite.
