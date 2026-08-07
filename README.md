# AI Cybersecurity Playground - AI SOC Analyst Module

A master's-level educational cybersecurity platform designed for interactive classroom demonstrations, live threat investigation, and teaching how artificial intelligence assists modern Security Operations Centers (SOC).

---

## 🎯 Product Vision & Educational Goals

The **AI Cybersecurity Playground** simulates a futuristic Cyber Defense Command Center. It demonstrates the exact workflow of an AI-assisted security analyst:

1. **Log Upload & Ingestion**: Supporting standard Windows Event Logs, Syslog, Firewall, Zeek, and Apache log formats.
2. **AI Reasoning Pipeline**: Visual 5-stage AI analysis pipeline (Log Receiving -> Indicator Extraction -> Behavioral Analysis -> MITRE ATT&CK Mapping -> Incident Synthesis).
3. **Threat Intelligence & IOC Extraction**: Automated extraction of IP addresses, compromised accounts, malicious commands, and C2 domains.
4. **MITRE ATT&CK Mapping**: Direct mapping of log events to standardized adversary tactics & techniques (e.g., T1110 Brute Force, T1059.001 PowerShell Execution, T1055 Process Injection).
5. **SOC Incident Report & Playbook**: Generation of formal SOC incident reports with attack timelines, risk scores, and recommended containment playbooks.

---

## 🎓 Pedagogical Core: Instructor Mode

The platform features a built-in **Instructor Mode** designed specifically for master's-level cybersecurity lectures and lab assignments. Turning on Instructor Mode highlights **Teaching Points** across the workflow:

- **AI Assistance vs. Human Validation**: Demonstrating that while LLMs accelerate detection and report generation, final containment decisions require human analyst sign-off.
- **Structured Security Context**: Showing how security logs must be normalized and contextualized before prompting LLMs to avoid hallucinations.
- **False Positive & Edge Case Analysis**: Teaching students how to evaluate AI confidence metrics against raw evidence.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: Next.js 14+, TypeScript, Tailwind CSS, Lucide Icons, Custom Cyber Command Center Design System (`/DESIGN_RULES.md`).
- **Backend**: Python FastAPI, SQLite Database (`soc_investigations.db`), Modular AI Analysis Engine (`ai_analyst.py`).
- **Datasets**: Pre-packaged attack samples (`datasets/bruteforce.json`, `datasets/powershell_attack.json`, `datasets/malware_execution.json`).

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+) & npm
- Python (v3.9+)

### 1. Start the FastAPI Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```
*Backend runs at: `http://localhost:8000`*

### 2. Start the Next.js Frontend
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs at: `http://localhost:3000`*

---

## 📖 Live Classroom Demonstration Workflow (5 Minutes)

1. Open `http://localhost:3000` in browser.
2. Toggle **Instructor Mode** ON in the top header.
3. In the left panel, click **"Load Suspicious PowerShell"** or **"Load Brute Force Attack"**.
4. Observe the live 5-stage visual AI reasoning pipeline processing the log content in real-time.
5. Review the extracted IOCs and MITRE ATT&CK techniques in the right panel.
6. Scroll down to inspect the structured **SOC Incident Report** and click **Export Report**.
