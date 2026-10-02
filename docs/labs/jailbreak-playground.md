# Module 5: Jailbreak Playground (AI Red Team)

An interactive LLM **red-teaming** laboratory that teaches how security researchers evaluate the **safety** of AI systems. Students act as an AI red team, probing a simulated assistant with adversarial prompts, and score how resilient each model is against **jailbreak** attacks.

**Prompt Injection** asks *"Can I manipulate the instructions given to the model?"*.
**Jailbreak** asks *"Can I make the model violate its intended behavior?"*.

> Controlled educational sandbox. All models and conversations are simulated; the lab never connects to or attacks real AI systems.

---

## 🎯 Learning Objectives
1. **AI Red Teaming**: understand the disciplined, authorized process of probing a model to find safety failure modes before deployment.
2. **Safety Evaluation**: measure behavior over a standardized suite of adversarial test cases, not a single prompt.
3. **Jailbreak Categories**: recognize role manipulation, context switching, instruction conflict, encoding, multi-turn, and social engineering.
4. **Why Resistance Is Hard**: see that all LLM input is language, so tiny framing changes can flip a refusal into unsafe output.
5. **Defense**: study guardrails (input classifiers, output filters, policy layers) and alignment, and how improvements are verified across model versions.

---

## 🔍 Evaluation Methodology

```
Adversarial Prompt
        ↓
Attack Classification   → category + technique + difficulty
        ↓
Risk Assessment         → risk level (low / medium / high)
        ↓
Safety Evaluation       → blocked / compromised / clean
        ↓
Report Generation       → safety score + lesson + defenses
```

Every test also produces an **Attack Analysis** (technique, attacker goal, why it worked/failed, security lesson, possible defenses) and a **Security Assessment Timeline** (test started → attack analyzed → model evaluated → report generated).

---

## 🧪 Test Scenarios (`datasets/jailbreak/`)

| File | Technique | Difficulty |
|------|-----------|------------|
| `1_role_manipulation.json` | Change the model's identity / rules (DAN, supervisor) | Beginner |
| `2_context_manipulation.json` | Shift conversation context across multiple messages | Intermediate |
| `3_instruction_conflict.json` | Conflicting or higher-priority directives (embedded in code) | Advanced |
| `4_encoding_evaluation.json` | Base64 / leetspeak / wordplay obfuscation | Intermediate |
| `5_social_engineering.json` | Authority, urgency, flattery, empathy pressure | Advanced |

## 🧠 Models Evaluated (`knowledge/jailbreak/attack_methods.json`)

| Model | Base | Resistance | Typical behavior |
|-------|------|-----------|------------------|
| `sentinel_lite` | 71% | low (except encoding) | Fails under framing / pressure |
| `sentinel_pro` | 91% | high across categories | Holds the boundary most tests |

**Model Comparison mode** runs the *same test case* against both models to teach that safety is a property of the deployed model + guardrails, not of the prompt.

---

## 🧭 AI Security Concepts (`knowledge/jailbreak/safety_concepts.json`)

- **AI Red Teaming** • **Safety Evaluation** • **Alignment** • **Guardrails** • **Model Behavior Testing** • **Adversarial Prompting**

Each is shown in the **AI Security Concepts** panel with a "good practice" teaching note.

---

## 📊 UI (three-column security testing interface)

- **Left: Attack Library**: browse attack techniques with description, difficulty and learning objective.
- **Center: Conversation Simulator**: user prompt → model processing → response, with a live safety status badge and inline refusal alerts.
- **Right: Safety Evaluation**: risk level, model behavior, safety-score progress ring, signals detected, and lesson.

Plus the **Red Team Scoreboard** (tests completed / blocked / needs improvement / safety score with progress ring), **Security Assessment Timeline**, **Attack Analysis**, **Model Comparison**, **AI Security Concepts**, and **Progress & Achievements** ranks.

### Achievement Ranks
`AI Red Team Beginner` → `Prompt Analyst` → `Model Security Tester` → `AI Safety Evaluator` (driven by tests completed, with a lockup celebration).

---

## Architecture

```
frontend/src/components/jailbreak/
    AttackLibrary.tsx            Left: attack techniques + difficulty filter
    ConversationSimulator.tsx    Center: simulated model chat + status
    SafetyEvaluationPanel.tsx    Right: score ring, technique, risk, behavior, lesson
    SecurityAssessmentTimeline   Evaluation pipeline stages
    RedTeamScoreboard.tsx        Tests completed / blocked / score
    ModelComparison.tsx          Sentinel-Lite vs Sentinel-Pro on same test
    AttackAnalysisView.tsx       Technique, goal, why, lesson, defenses
    AISecurityConcepts.tsx       Educational concept explorer
    ProgressAchievements.tsx     Rank progression + celebration
    JailbreakLab.tsx             Orchestrator

frontend/src/services/jailbreakEvaluator.ts   API client + offline fallback engine
backend/app/services/jailbreak_evaluator.py   Deep evaluation service
```

### API Endpoints
| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/jailbreak/scenarios` | List test scenarios |
| GET | `/api/jailbreak/models` | List models to evaluate |
| GET | `/api/jailbreak/categories` | List attack categories |
| GET | `/api/jailbreak/concepts` | List safety concepts |
| POST | `/api/jailbreak/evaluate` | Run one evaluation (`prompt`, `scenario_key`, `model_key`) |
| POST | `/api/jailbreak/aggregate` | Aggregate many results into a scoreboard |

---

## Working Locally

```bash
# Backend (terminal 1)
cd backend
./venv/bin/uvicorn main:app --reload --port 8000

# Frontend (terminal 2)
cd frontend
npm run dev
```

Open **Jailbreak Lab** (Live Demo) in the sidebar. If the backend is stopped, the module falls back to an in-browser evaluator so it still works as a demo.

---

## 🏫 Classroom Exercises
1. **Identity is a boundary**: run a role-attack on Sentinel-Lite vs Sentinel-Pro. Why does one keep its identity and the other surrender it?
2. **One test is not enough.** Run 15 different prompts and watch the scoreboard change. Why is a single pass meaningless?
3. **Framing slide**: have students write their own hidden-context or Base64 prompt and predict whether each model blocks it before running.
4. **Defense design.** After a Compromised result, propose which guardrail (input classifier / output filter / policy layer) would have stopped it.
5. **Classroom reflection:** *Which defense mechanism made the difference? How should an organization evaluate and sign off a model before deployment?*

---

> Everything here is simulated for education. Jailbreak knowledge is taught to build defenders, not to evade real systems.