# Module 6: Adversarial Face Recognition Lab (ML Security)

An interactive **machine-learning security** laboratory that teaches how adversary crafted inputs can fool a **vision recognition model**, and how defenders improve **robustness**. Students become an AI red team against a simulated face-classifier, applying different attack classes and comparing vulnerable vs. hardened models.

> **Controlled educational sandbox.** The lab uses **synthetic images**, **simulated models**, and **fictional subjects only** (Subject Alpha / Beta / Gamma). It never uses real identity data and is not connected to any real person-recognition system. It teaches the *concepts* of adversarial ML, not surveillance or identification of real people.

---

## 🎯 Learning Objectives
1. **Adversarial Examples** — understand that a tiny, human-imperceptible change can completely flip a model's prediction.
2. **Decision Boundaries** — see how a small perturbation can cross the boundary between classes in feature space.
3. **Robustness vs. Accuracy** — measure the model's ability to resist attacks and accept the deliberate trade-offs of hardening it.
4. **Attack Classes** — compare perturbation (noise) attacks, occlusion attacks, and input transformations.
5. **ML Security Testing** — apply an AI-red-team cycle (craft attack → measure failure → harden → re-evaluate) to a machine-learning pipeline.

---

## 🔍 Pipeline & Methodology

```
Input Image
        ↓
Preprocessing        → normalize + resize
        ↓
ML Model             → extract features, compute probabilities
        ↓
Prediction           → predicted class + confidence
        ↓
Robustness Evaluation → clean / misclassified / blocked / defended
```

Every attack produces:
- **Before / After prediction** — synthetic face rendering with a confidence bar graph for each class.
- **Confidence shift** — how wrong the model becomes under the attack.
- **Robustness score** — simulated security metric (higher = harder to fool).
- **What happened / Why it failed / Mitigations** — a written analyst narrative.
- **Model Decision Timeline** — image → preprocessing → features → prediction → adversarial check.
- **Teaching Points** — a portable-concept lesson for classroom use (Instructor Mode).

---

## 🧪 Experiments (`datasets/adversarial-ml/`)

| File | Attack class | Difficulty | Robustness |
|------|-------------|-----------|-----------|
| `1_noise_attack.json` | Perturbation (noise) | Beginner | 38% |
| `2_occlusion_attack.json` | Occlusion | Intermediate | 52% |
| `3_input_transformation.json` | Input transformation | Intermediate | 58% |
| `4_defense_comparison.json` | Noise vs. defense | Advanced | 78% |

`4_defense_comparison` runs the *same adversarial input* against an unprotected model (`Base VisionNet`) and an adversarially trained one (`Robust VisionNet`) to teach the accuracy-vs-robustness trade-off.

---

## 🧭 Knowledge Base (`knowledge/adversarial-ml/`)

### Concepts (`concepts.json`) — 6 lessons
- **Adversarial Examples**, **Decision Boundaries**, **Model Robustness**, **Adversarial Training**, **High Accuracy != High Security**, **ML Security Testing**

### Attacks & Defenses (`attacks_defenses.json`)
- **Attack classes**: noise, occlusion, transformation, physical
- **Defense mechanisms**: adversarial training, input preprocessing, adversarial detection, certified defenses (each with effectiveness and trade-off).

---

## 🏆 Gamification / Achievements
Learners unlock tiers by running experiments across the attack surface:
- **ML Security Novice** — run your first attack.
- **Adversarial Tester** — fully compromise a subject with an adversarial input.
- **Defense Engineer** — complete the defense comparison.
- **AI Red Team Specialist** — uncover a robustness weakness across noise, occlusion, and transformation.

---

## 🚀 Run
```bash
# Backend (FastAPI) — serves /api/vision/experiments, /concepts, /attacks-defenses, /analyze
cd backend && ./venv/bin/uvicorn main:app --reload

# Frontend (Next.js)
cd frontend && npm run dev
```
Frontend falls back to a built-in local engine when the API is unavailable, so the lab is fully interactive offline.

---

## 📁 File Map
```
datasets/adversarial-ml/           → experiment scenarios (1-4)
knowledge/adversarial-ml/           → security concepts + attacks/defenses
backend/app/services/vision_security.py   → simulation + knowledge API
backend/main.py                     → /api/vision/* endpoints
frontend/src/services/visionSecurity.ts   → client + offline engine
frontend/src/components/adversarial/      → Lab UI components
```