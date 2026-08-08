# AI Cybersecurity Playground

An interactive, master's-level **educational cybersecurity laboratory** that demonstrates how artificial intelligence is used *to defend* systems **and** how AI systems themselves can be *attacked and secured*.

Students work inside a simulated Cyber Defense Command Center, run "live" investigations powered by AI-simulated analysis, and see the exact workflow an AI-assisted security analyst, threat hunter, penetration tester, or security engineer follows — with inline teaching points at every step.

> **Educational sandbox only.** Every dataset, target, vulnerability, finding, and scenario is **simulated**. The platform never connects to, attacks, or tests real systems, real identity data, or real APIs. It is built to teach concepts, not to probe production environments.

---

## Table of Contents

- [Product Vision & Educational Goals](#-product-vision--educational-goals)
- [Modules](#-modules)
- [Learning Hub & Learning Paths](#-learning-hub--learning-paths)
- [Tech Stack & Architecture](#-tech-stack--architecture)
- [Repository Layout](#-repository-layout)
- [Prerequisites](#-prerequisites)
- [Install & Run — macOS](#-install--run-on-macos)
- [Install & Run — Windows](#-install--run-on-windows)
- [Install & Run — Linux](#-install--run-on-linux)
- [How the Frontend Finds the Backend](#-how-the-frontend-finds-the-backend)
- [How to Use the App](#-how-to-use-the-app)
- [Running Tests](#-running-tests)
- [Production Build](#-production-build)
- [Datasets & Knowledge Base](#-datasets--knowledge-base)
- [Troubleshooting](#-troubleshooting)
- [Further Reading](#-further-reading)

---

## 🎯 Product Vision & Educational Goals

The platform is built around one core idea: **AI changes cybersecurity in two directions.**

1. **Defend with AI** — AI accelerates detection, triage, threat hunting, pentest planning, malware analysis, code review, and privacy scanning, while a human analyst remains accountable for the verdict.
2. **Secure AI** — the same AI can be manipulated: prompt injection, jailbreaks, adversarial examples, agent abuse, unsafe coding, and AI *failures* (hallucination, overconfidence, automation bias).

Each module answers **one question**, reveals complexity gradually, and ends with a teaching takeaway, so a student leaves every lab able to explain not just *what* happened, but *why* — and what to *try next*.

### Outstanding features for a classroom

- **Instructor Mode** — permanent toggle in the header reveals *teaching points*, *"the catch"*, and *"dig deeper"* materials across every module.
- **Learning Hub** — pick a learning path, read short theory lessons with animated flow diagrams, and jump straight into the matching lab.
- **Live AI pipelines** — every module animates the AI's reasoning stages/timeline as it "runs", so students see the process, not just the result.
- **Interactive effects** — holographic lab surfaces, cursor-following spotlights, hover-tilt cards, packet/data-flow rails, decode-style text reveals, and live status beacons (all disabled automatically for users who prefer reduced motion).
- **Single-command verification** — the codebase ships with `typecheck`, a Vitest suite (167 tests) and a pytest API suite. See [Running Tests](#-running-tests).

---

## 🧩 Modules

The app ships 12 interactive lab modules in addition to the Learning Hub. Each lab README (see [Further Reading](#-further-reading)) goes deep on that module's methodology and objectives.

| # | Module | Question it answers | Module README |
|---|--------|---------------------|---------------|
| 0 | **Learning Hub** | "What do I learn first?" | — (built into the app) |
| 1 | **AI SOC Analyst** | "What happened in my security logs?" | `README` (this file) |
| 2 | **AI Threat Hunting** | "What threat am I looking for?" | `README_THREAT_HUNTING.md` |
| 3 | **AI Pentest Assistant** | "How should I assess this target?" | `README_PENTEST_ASSISTANT.md` |
| 4 | **Prompt Injection Lab** | "Can this AI application be manipulated?" | `README_PROMPT_INJECTION.md` |
| 5 | **Jailbreak Playground** | "How robust is this model's safety behavior?" | `README_JAILBREAK_PLAYGROUND.md` |
| 6 | **Adversarial ML Lab** | "Can this AI model be fooled?" | `README_ADVERSARIAL_ML_LAB.md` |
| 7 | **AI Agent Security** | "Can this AI agent safely perform actions?" | `README_AGENT_SECURITY.md` |
| 8 | **AI Malware Analyst** | "What is this malware doing?" | `README_MALWARE_ANALYST.md` |
| 9 | **AI Security Code Reviewer** | "Is this code safe to ship?" | `README_SECURITY_CODE_REVIEWER.md` |
| 10 | **AI Data Privacy Lab** | "Does this data leak sensitive information?" | `README_DATA_PRIVACY_LAB.md` |
| 11 | **AI Risk & Governance Simulator** | "Should this AI system be allowed to deploy?" | `README_AI_GOVERNANCE_SIMULATOR.md` |
| 13 | **AI Failure Lab** | "Can I trust the AI's output?" | `README_AI_FAILURE_LAB.md` |

**Brief description of each lab**

- **1 · AI SOC Analyst** — Feed raw Windows/PowerShell/Web/Zeek-style logs to the AI and watch a 5-stage reasoning pipeline: normalize → extract IOCs → detect anomalies → map to MITRE ATT&CK → synthesize a formal SOC incident report with a containment playbook. Supports uploading your own logs too.
- **2 · AI Threat Hunting** — Turn a natural-language hunting objective into a falsifiable hypothesis, select telemetry, and generate Sigma, KQL, Splunk, and SQL detection queries. Review findings and confidence at the end.
- **3 · AI Pentest Assistant** — Configure a target (web server, auth, database, API), watch the AI work through recon → auth testing → input validation → authorization → reporting, map the attack surface, and ask the assistant questions.
- **4 · Prompt Injection** — Attack a simulated LLM application with direct and indirect (document-smuggled) injection, and compare a vulnerable vs. protected pipeline side-by-side.
- **5 · Jailbreak Playground** — Red-team a safety-trained model with roleplay, encoding, conflict, and social-engineering prompts; measure the bypass rate and understand why guardrails held or broke.
- **6 · Adversarial Face Lab** — Craft perturbations (noise, occlusion, transformation) that flip a face-recognition model's prediction, then harden it and re-evaluate. Synthetic subjects only.
- **7 · AI Agent Security** — Run an autonomous agent (goal → planner → memory → tool call → observation → decision), attack it with indirect injection / memory poisoning / excessive permissions, and defend it with a policy engine, allowlists, and least privilege.
- **8 · AI Malware Analyst** — Analyze simulated malware samples (PowerShell, ransomware, RAT, credential theft), map behaviors to MITRE, get Yara/Sigma/Suricata detection rules, and read a risk-graded report.
- **9 · AI Security Code Reviewer** — Review vulnerable vs. patched code in Python, JS, Java, C++, Go, C#, PHP, and Rust; see the security score before/after and the diff of the fix.
- **10 · AI Data Privacy Lab** — Detect sensitive data types (PII, credentials, financial, medical), assess risk, redact, and check prompts against a policy before sending.
- **11 · AI Risk & Governance Simulator** — Assess an AI application against risk taxonomy, apply governance controls, get a residual risk score and a GO / NO-GO deployment recommendation.
- **13 · AI Failure Lab** — Learn and calibrate a "AI is wrong sometimes" mindset: false positives, hallucinations, overconfidence, and automation bias, with reliability challenges and scorecards.

---

## 📚 Learning Hub & Learning Paths

The Learning Hub is the front door of the app. It does three things:

1. **Learning paths** — choose *"AI for cybersecurity"* or *"Cybersecurity of AI"* and the recommended lab order adapts.
2. **Theory library** — 11 short lesson topics (AI, ML, LLMs, RAG, Prompt Injection, Adversarial Examples, AI Agents, AI Detection & SOC, Threat Hunting, AI-Assisted Pentesting, Jailbreaks) each with a blurb, "the catch", animated flow diagram, full teaching text, and key takeaways.
3. **Lab grid** — all labs presented as interactive cards with difficulty, estimated time, skills, and "what you'll learn".

You can visit any lab at any time — nothing is gated.

---

## 🛠️ Tech Stack & Architecture

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14, React 18, TypeScript, Tailwind CSS, Lucide icons, Vitest |
| **Backend** | Python FastAPI + Uvicorn, modular simulation services |
| **Storage** | SQLite (`soc_investigations.db`) for review history |
| **Design system** | Custom "Cyber Command" design tokens & animation rules in [`DESIGN_RULES.md`](DESIGN_RULES.md) |
| **Data** | Pre-packaged simulated datasets + knowledge base (MITRE, detection rules, secure-coding patterns) |

Both layers are self-contained simulation engines. The **backend** implements the AI-“analysis” services; the **frontend** also ships demo fallbacks, so most screens stay usable even if the API is briefly offline.

---

## 📁 Repository Layout

```
ai-cybersecurity-playground/
├── README.md                      # this file
├── README_*.md                    # per-module documentation
├── DESIGN_RULES.md                # design system rules
│
├── backend/
│   ├── main.py                    # FastAPI app + all routes
│   ├── requirements.txt
│   ├── pytest.ini
│   ├── app/
│   │   ├── database.py            # SQLite setup & persistence
│   │   └── services/              # 12 AI simulation engines
│   └── tests/                     # pytest API tests
│
├── frontend/
│   ├── package.json
│   ├── src/
│   │   ├── app/                   # Next.js app router (page.tsx)
│   │   ├── components/            # React UI per module
│   │   ├── services/              # API clients + demo fallbacks
│   │   └── data/                  # datasets, lab briefs, code samples
│   └── ...
│
├── datasets/                      # simulated attack datasets & scenarios
└── knowledge/                     # MITRE, detection rules, security patterns
```

---

## 🧰 Prerequisites

- **Node.js v18+** and **npm** (for the Next.js frontend)
- **Python 3.9+** and **pip** (for the FastAPI backend)
- An internet connection only needed on first install; the app is otherwise fully local.

> On some Linux distros you may need `python3` + `pip3` and `python3-venv`. On Windows, use **PowerShell** (or cmd) and add Python and Node to `PATH`.

Verify before continuing:

```bash
# Frontend
node --version   # v18 or newer
npm --version

# Backend
python --version   # 3.9+   (macOS/Linux may need: python3 --version)
pip --version      # (may be: pip3)
```

---

## 1️⃣ Install & Run on macOS

### Backend

```bash
cd ai-cybersecurity-playground/backend

python3 -m venv venv
source venv/bin/activate

pip install -r requirements.txt

python main.py      # or: python3 main.py
```

You should see FastAPI start and print
`Uvicorn running on http://0.0.0.0:8000`.

### Frontend (in a second terminal)

```bash
cd ai-cybersecurity-playground/frontend

npm install
npm run dev
```

Open **http://localhost:3000** in your browser.

> Tip: to stop the backend later, press `Ctrl+C` inside the venv terminal.

---

## 2. Install & Run on Windows

All commands below assume **PowerShell**. For cmd, replace `.\venv\Scripts\Activate.ps1` with `.\venv\Scripts\activate.bat`.

### Backend

```powershell
cd ai-cybersecurity-playground\backend

python -m venv venv
.\venv\Scripts\Activate.ps1   # enable unsigned scripts if needed:
                              # Set-ExecutionPolicy -Scope CurrentUser RemoteSigned

pip install -r requirements.txt

python main.py
```

If `python` is not recognized, use the full Python launcher:

```powershell
py -m venv venv
.\venv\Scripts\Activate.ps1
py -m pip install -r requirements.txt
py main.py
```

### Frontend (PowerShell, new terminal)

```powershell
cd ai-cybersecurity-playground\frontend

npm install
npm run dev
```

Open **http://localhost:3000**.

> If the browser blocks the backend CORS or the frontend can't reach it, see [Troubleshooting](#-troubleshooting).

---

## 3. Install & Run on Linux (Debian/Ubuntu, Fedora, etc.)

### Backend

```bash
cd ai-cybersecurity-playground/backend

python3 -m venv venv
source venv/bin/activate

pip install -r requirements.txt   # may need: python3 -m pip install ...

python main.py                     # or: python3 main.py
```

If `venv` is not installed:

```bash
# Debian / Ubuntu
sudo apt update && sudo apt install -y python3-venv python3-pip

# Fedora
sudo dnf install -y python3-devel python3-pip
```

### Frontend

```bash
cd ai-cybersecurity-playground/frontend

npm install
npm run dev
```

Open **http://localhost:3000**.

---

## 🔗 How the Frontend Finds the Backend

Every API client reads the base URL from the `NEXT_PUBLIC_API_URL` environment variable, defaulting to `http://localhost:8000/api`.

- **Local (default)** — nothing to configure; both apps run on the same machine.
- **Different machine / container / remote backend** — set the variable before starting the frontend:

```bash
# macOS / Linux
NEXT_PUBLIC_API_URL=http://192.168.1.50:8000/api npm run dev

# Windows (PowerShell, current session)
$env:NEXT_PUBLIC_API_URL = "http://192.168.1.50:8000/api"
npm run dev
```

Quick check that the API is alive:

```bash
curl http://localhost:8000/api/health
# {"status":"online","service":...,"database":"connected"}
```

> The frontend ships per-module **demo fallbacks**, so if the API is unreachable most solos still run with bundled data (check the console for a "Backend API offline, using local data" warning) — but run the backend for the full experience.

---

## 🕹️ How to Use the App

### 1. First Run

1. Open **http://localhost:3000**.
2. In the **Learning Hub**, choose a **learning path**:
   - *AI for Cybersecurity* → starts with SOC Analyst, Threat Hunting, Pentest.
   - *Cybersecurity of AI* → starts with Prompt Injection, Jailbreak, Adversarial, Agent Security.
   - You can switch or visit any lab at any time (left navigation).
3. Read the animated flow diagram to "Understand the concept" (Concepts column), then hit **Open lab**.

### 2. Core workflow (any lab)

Each module follows the same rhythm:

1. **Set up** — pick a dataset / target / example / scenario.
2. **Run** — press the primary **Start / Analyze / Hunt / Evaluate** button and watch the AI's live reasoning (stages, timeline, or scanning badges) animate top-to-bottom as it "computes".
3. **Review** — inspect results (IOCs, MITRE, findings, report), then scroll for the **report** / **teaching takeaways**.
4. **Dig deeper** — inline glossary buttons (treats like `?`) let students pull up short theory explanations, and **Instructor Mode** (header) reveals teaching points, the catch, and "why this matters".

### 3. Try a 60-second SOC demo

1. Open **AI SOC Analyst**.
2. Click **Load Brute Force Attack** (or upload your own `.json`/`.log`).
3. Click **Analyze Logs ** and watch the 5-stage reasoning pipeline.
4. When done, scroll to the auto-generated **SOC Incident Report**; export **JSON/Markdown** via the buttons.

### 4. Reset progress

To reset all lab progress and start fresh, top-right in the **Learning Hub**, open *Reset progress*.

---

## 🔬 Running Tests

Both layers include automated tests.

### Backend (pytest)

```bash
cd backend
source venv/bin/activate        # Windows: .\venv\Scripts\Activate.ps1
pytest
```

### Frontend (typecheck + Vitest)

```bash
cd frontend
npm run typecheck        # TypeScript type checking (tsc --noEmit)
npm test                 # Vitest (167 tests across services & data)
```

---

## 📦 Production Build

### Frontend

```bash
cd frontend
npm run build     # Next.js production build
npm start         # serve the production build on :3000
```

### Backend (no reload, robust process)

```bash
cd backend && source venv/bin/activate && pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

---

## 💾 Datasets & Knowledge Base

- **`datasets/`** — simulated logs (`bruteforce.json`, `powershell_attack.json`, `malware_execution.json`) plus per-module scenario folders (prompt-injection, jailbreak, adversarial-ml, agent-security, malware-analysis, pentest, code-review, privacy, ai-failures, threat-hunting, advisory).
- **`knowledge/`** — static knowledge bases used by the engines: `mitre_attack.json`, `detection_rules.json`, `security_patterns.json`, and per-module teaching data.
- **SQLite** — the backend persists recent investigations, malware analyses, code reviews, privacy scans, governance reviews, and AI-failure reviews in `soc_investigations.db` (auto-created on first start; delete it to wipe history).

---

## 🛠️ Troubleshooting

| Problem | Likely fix |
|---------|-----------|
| `command not found: python` (macOS/Linux) | Use `python3`; or `brew install python@3.12`. |
| `python` not recognized (Windows) | Install Python from python.org (check "Add python.exe to PATH"); use `py main.py`. |
| `venv` not found (Linux) | `sudo apt install python3-venv` (see Linux section). |
| Frontend can't reach the API (health check stays red) | Start the backend; check CORS is `*` (default); set `NEXT_PUBLIC_API_URL` if ports differ; restart `npm run dev` after editing. |
| Port already in use — `8000` | Kill the old process or run `uvicorn main:app --port 8001` and point the frontend at it. |
| `npm run dev` slow / `node_modules` issues | `rm -rf node_modules package-lock.json && npm install`. |
| AI pipeline animations don't show | The `prefers-reduced-motion` system setting disables decorations by design; re-enable or check your browser's "Reduce motion" setting. |
| Database sanity | Delete `backend/soc_investigations.db` and restart the backend to recreate it. |

---

## 📖 Further Reading

The repo ships a detailed README for each module:

- Module 1 — [AI SOC Analyst](README.md) (this file)
- Module 2 — [AI Threat Hunting](README_THREAT_HUNTING.md)
- Module 3 — [AI Pentest Assistant](README_PENTEST_ASSISTANT.md)
- Module 4 — [Prompt Injection](README_PROMPT_INJECTION.md)
- Module 5 — [Jailbreak Playground](README_JAILBREAK_PLAYGROUND.md)
- Module 6 — [Adversarial ML Lab](README_ADVERSARIAL_ML_LAB.md)
- Module 7 — [AI Agent Security](README_AGENT_SECURITY.md)
- Module 8 — [AI Malware Analyst](README_MALWARE_ANALYST.md)
- Module 9 — [AI Security Code Reviewer](README_SECURITY_CODE_REVIEWER.md)
- Module 10 — [AI Data Privacy Lab](README_DATA_PRIVACY_LAB.md)
- Module 11 — [AI Risk & Governance Simulator](README_AI_GOVERNANCE_SIMULATOR.md)
- Module 13 — [AI Failure Lab](README_AI_FAILURE_LAB.md)

And the design system that governs every screen: [`DESIGN_RULES.md`](DESIGN_RULES.md).

---

*Built for students learning how AI powers — and endangers — modern cybersecurity.*