# Module 7: AI Agent Security Lab

An interactive **AI Agent Security Operations Center** that demonstrates how autonomous AI agents make decisions and take actions, and how those decisions can be **abused** and **protected**.

Traditional LLMs generate text. AI agents **act**: they plan, call tools, read systems, and change state. That capability is powerful — and it is also a new, large attack surface.

> **Controlled educational sandbox.** Fully simulated. No email, cloud, OS, browser, or real-API access. Every tool is a local fake returning canned data. Students safely observe, attack, and defend autonomous AI systems.

---

## 🎯 Learning Objectives
1. **Agents vs. Chatbots** — understand that an agent can perform actions, not just generate text.
2. **Agent Loop** — see the Goal → Planner → Memory → Tool Selection → Tool Execution → Observation → Decision → Final Response cycle.
3. **Why Agents Add Risk** — recognize that every tool expands the attack surface (indirect injection, memory poisoning, excessive permissions).
4. **Attacks** — simulate indirect prompt injection, memory poisoning, tool misuse, permission escalation, goal manipulation, and instruction override.
5. **Defense** — layer least privilege, human approval, prompt sanitization, memory validation, tool allowlists, and a policy engine.
6. **Security Architecture** — learn that agent security depends on the runtime (policy engines, permission boundaries), not only prompt wording.

---

## ⚙️ Agent Loop (the core lesson)

```
       Traditional LLM                     AI Agent
   ┌──────────────────┐           ┌──────────────────────────┐
   │     Prompt       │           │          Goal            │
   │       ↓          │           │           ↓              │
   │      Model       │           │        Planner           │
   │       ↓          │           │           ↓              │
   │     Response     │           │         Memory            │
   └──────────────────┘           │           ↓              │
                                  │    Tool Selection         │
                                  │           ↓              │
                                  │    Tool Execution         │
                                  │           ↓              │
                                  │       Observation        │
                                  │           ↓              │
                                  │       Decision           │
                                  │           ↓              │
                                  │    Final Response        │
                                  └──────────────────────────┘
```

**A chatbot returns text. An agent performs actions.**

---

## 🔍 Pipeline & Methodology

```
User Goal
   ↓
Planner            → decompose into scoped steps
   ↓
Memory             → read + validate remembered facts
   ↓
Policy Engine      → For each tool call:
                       Tool Allowlist?  →  Permission granted?  →  Risk eval  →  Allow / Block
   ↓
Tool Execution     → simulated observation (canned data)
   ↓
Decision           → synthesize observations, apply policy
   ↓
Final Response
```

Every decision (allow or block) is logged in the **Policy Decision Log** with its reason, so students can always answer *"Why was that action blocked?"*

---

## 🧪 Demo Scenarios (`datasets/agent-security/`)

| File | Title | Category | Difficulty | Expected outcome |
|------|-------|----------|-----------|------------------|
| `1_safe_investigation.json` | Safe Mission | benign mission | Beginner | Mission completes safely |
| `2_tool_permission.json` | Permission Denied | permission boundary | Beginner | Action blocked - permission denied |
| `3_prompt_injection.json` | Indirect Prompt Injection | indirect injection | Intermediate | Injected instruction detected & ignored |
| `4_memory_poisoning.json` | Memory Poisoning | memory poisoning | Intermediate | Poisoned memory rejected by integrity check |
| `5_excessive_permissions.json` | Excessive Permissions | scope violation | Advanced | Excessive action blocked by least privilege |

---

## 🛠️ Tool Sandbox (`datasets/agent-security/tools.json`)

Simulated tools, each with a **permission** and **risk** level:

| Tool | Permission | Risk |
|------|-----------|------|
| Security Log Reader | read:logs | Low |
| Threat Intelligence | read:intel | Low |
| MITRE ATT&CK Database | read:mitre | Low |
| Knowledge Base | read:knowledge | Low |
| Incident Database | read:incidents | Low |
| Firewall Console | write:firewall | High |
| File Analyzer | read:files | Medium |
| Mailer | write:mail | Medium |

Every tool call shows its permission, status, last execution, and execution detail.

---

## 🛡️ Defensive Controls

Toggleable so students see the effect of each layer:

- **Least Privilege** — scoped, per-mission permissions, revoked when done.
- **Human Approval** — high-risk actions require explicit confirmation.
- **Prompt Sanitization** — neutralize embedded instructions in tool output.
- **Output Validation** — validate each resolved action before it executes.
- **Memory Validation** — check provenance and consistency of memory.
- **Tool Allowlist** — only pre-approved tools can be invoked.
- **Execution Timeout** — bound mission and tool-call runtime.
- **Policy Engine** — central allow/block decision maker.

Determine it yourself: run the **same mission** with controls **off** (unprotected) vs **on** (protected) and compare the outcome.

---

## 🧩 Policy Engine & Decision Flow

```
Requested Action
   ↓
Policy Check        → is this tool on the allowlist?
   ↓
Permission Check    → does the agent hold the required permission?
   ↓
Risk Evaluation     → how risky is the action?
   ↓
Allow  OR  Block    → (logged with reason)
```

---

## 🧭 Educational Content (`knowledge/agent-security/knowledge_base.json`)

- **8 security principles**: Least Privilege, Defense in Depth, Zero Trust, Human Approval, Tool Allowlist, Output Validation, Policy Enforcement, Expanded Attack Surface.
- **6 risk factors**: Indirect Injection, Memory Poisoning, Excessive Permissions, Tool Misuse, Goal Manipulation, Instruction Override.
- **Built-in classroom teaching points**, e.g. *"Unlike chatbots, AI agents can perform actions."*, *"Every tool increases the attack surface."*, *"Permission boundaries are one of the most important defenses."*

Discussion questions surfaced in the UI:
- Why was the agent believe the embedded "override" was instruction rather than data?
- Should the agent have permanent access to write tools? When should it be revoked?
- Which security control (e.g. least privilege) prevented the compromise?

---

## 🏆 Interactive Features
- **Mission Timeline** — step-by-step agent loop visualization.
- **Execution Graph** — holographic connectors animating Goal → Planner → Memory → Tool → Policy → Decision → Output.
- **Policy Decision Log** — every allow/block with reason.
- **Permission Matrix** — tool-permission-risk overview.
- **Risk Meter** — LOW / MEDIUM / HIGH live risk.
- **Security Event Stream** — live feed of allowed/blocked actions.
- **Agent Security Score** — missions count + blocked-to-done tally.
- **Compare Protected** — same mission, unprotected vs protected.

---

## 🚀 Run
```bash
# Backend (FastAPI) - serves /api/agent-security/*
cd backend && ./venv/bin/uvicorn main:app --reload

# Frontend (Next.js)
cd frontend && npm run dev
```
The frontend falls back to a built-in local engine when the API is unavailable, so the lab is fully interactive offline.

---

## 📁 File Map
```
datasets/agent-security/                    → 5 demo scenarios + tools.json
knowledge/agent-security/                   → principles, risk factors, controls
backend/app/services/agent_security.py      → agent simulation + policy engine
backend/main.py                             → /api/agent-security/* endpoints
frontend/src/services/agentSecurity.ts      → client + offline engine
frontend/src/components/agent-security/     → lab UI ("AI Agent Security Operations Center")
```