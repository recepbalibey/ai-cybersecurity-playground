# AI Failure Lab (Module 13)

An interactive lab that teaches one uncomfortable lesson: **an AI's output
is not automatically correct**. Every scenario in the lab shows a
confident, plausible AI output that is wrong - a false positive, a missed
attack, a hallucinated indicator - and asks you to catch it before it
causes real harm.

The lab has the feel of a "SOC Analyst Validation Simulator." You read raw
evidence, decide what you believe, compare your answer to a confident AI
answer, then reveal the ground truth and learn exactly why the AI failed
and which mitigation would have caught it.

Core lesson: confidence is not accuracy. An AI that is 97% confident can
still be wrong, and automation bias - trusting the machine because it
sounds sure - is where that wrongness becomes a security incident.

This lab is an educational simulator. All alerts, reports, and systems are
fictional. It does not evaluate any real model and provides no guarantee
about the reliability of any AI system you operate.

## What you do in this lab

1. Choose one of 12 failure scenarios or the capstone.
2. Read the raw evidence the analyst received (input_data).
3. Decide: correct, incorrect, or uncertain, with a confidence slider from
   0 to 100.
4. Commit your verdict BEFORE the AI answer is shown (challenge mode) or
   after it (default), then reveal the AI's confident answer.
5. Reveal the ground truth and read why the AI failed, with its security
   impact.
6. Choose mitigations and watch the reliability score move in real time.
7. Run the capstone: a live incident with 6 events where the AI gets 2
   right and 4 wrong under pressure. Prove that human review plus AI
   beats either one alone.
8. Review the scorecard (accuracy, false positives, false negatives,
   uncertainty) and the trust calibration report.
9. Ask the assistant about hallucinations, overconfidence, calibration,
   precision and recall, automation bias, and human-in-the-loop design.

## Learning objectives

- Explain why a confident AI output can still be wrong (hallucination,
  overconfidence, false positives and negatives, distribution shift).
- Distinguish the failure types and the evidence pattern behind each one.
- Explain why confidence measures language fluency, not correctness, and
  why calibration - not raw accuracy - is the useful metric.
- Describe automation bias and why human review only works when the human
  is willing to override the machine.
- Select mitigations that map to the failure they prevent and reason about
  reliability before and after a control.
- Apply a retest loop: validate claims against source data, keep a human in
  the loop, and monitor for drift.

## Reliability scoring methodology

Identical in the frontend and backend engines:

- Baseline reliability before review:
  - `ai_confidence` when the AI verdict is correct.
  - `100 - ai_confidence` when the AI verdict is wrong (the less the AI
    knows, the less you should trust it).
- Each selected mitigation adds its `gain` to reliability.
- A mitigation whose `prevents` list includes the scenario's
  `failure_type` also adds a 20 point "caught the actual failure" bonus.
- Reliability after review = `min(100, before + gains + 20 if caught)`,
  and `caught` is true when a preventing mitigation was selected.
- Example: hallucination scenario (AI wrong, confidence 97) has before 3.
  Selecting `grounded_extraction` (+15) and `citation_requirement` (+15),
  both of which prevent hallucination, adds the 20 point caught bonus and
  lifts reliability to 53.

## Verdict, scorecard, and calibration

- Verdict classes: correct (true positive or true negative), incorrect
  (false positive or false negative), uncertain.
- Scorecard counts total, correct, false positives, false negatives, and
  uncertainty, then reports accuracy.
- Calibration buckets confidence into high (>= 70), medium (30-69), and
  low (< 30), then compares each bucket's average confidence to its
  correct rate. A well calibrated analyst is confident when right and
  uncertain when wrong.

## Failure type catalog

12 failure types: false_positive, false_negative, hallucination,
overconfidence, incomplete_context, ambiguous_input, poor_data_quality,
distribution_shift, class_imbalance, automation_bias,
contradictory_evidence, unsafe_recommendation.

## Educational scenarios (datasets/ai-failures)

- soc_false_positive - "The Case of the Alarming Rate Limit"
- soc_false_negative - "The Quiet Exfiltration"
- hallucination_security_report - "The Indicator That Never Existed"
- overconfidence - "The Overconfident Classifier"
- incomplete_context - "The SOC Analyst Without Context"
- ambiguous_security_input - "The Ambiguous Detection Rule"
- poor_data_quality - "The Tainted Training Set"
- distribution_shift - "The World Changed Overnight"
- class_imbalance - "The Needle in the Ransomware Stack"
- automation_bias - "Because the Machine Said It"
- contradictory_evidence - "The Split Verdict"
- unsafe_recommendation - "The Suggestion That Made It Worse"
- ai_soc_under_pressure - CAPSTONE, a live 6-event incident

All 12 named scenarios ship an id, title, category, difficulty,
input_data, ai_output, ai_confidence, ai_label, ground_truth,
ground_truth_label, failure_type, explanation, security_impact,
recommended_validation, possible_mitigations (each with gain and the
failure types it prevents), learning_objective, and teaching_points. The
AI verdict is intentionally wrong in every named scenario.

The capstone adds 6 events (E1-E6), each with its own evidence, AI
verdict, and ground truth. The AI gets 2 right and 4 wrong under pressure.
Scores: ai_accuracy (AI alone), human_accuracy (the analyst alone),
combined_accuracy (correct when either is right). Combined is always at
least as high as each alone, and a perfect analyst scores 100. A knowledge
base with 21 topics (false positives, hallucinations, confidence
calibration, precision, recall, f1, pr_auc, confusion matrix, automation
bias, human-in-the-loop, model monitoring, and more) lives in
`knowledge/ai-failures/knowledge_base.json`.

## Run the backend

FastAPI with a SQLite history table (`ai_failure_reviews`).

    cd backend
    ./venv/bin/python -m pytest -q
    ./venv/bin/python -m uvicorn main:app --port 8000

Endpoints:

- GET  /api/ai-failures/scenarios
- GET  /api/ai-failures/scenarios/{scenario_id}
- GET  /api/ai-failures/knowledge
- POST /api/ai-failures/evaluate
- POST /api/ai-failures/challenge
- POST /api/ai-failures/capstone
- POST /api/ai-failures/scorecard
- POST /api/ai-failures/calibration
- POST /api/ai-failures/assistant
- GET  /api/ai-failures/history

The engine is rule-based with a `ModelProvider` abstraction ready for
OpenAI or Ollama. Unknown scenario ids return 404.

## Run the frontend

    cd frontend
    npm run typecheck
    npm test
    rm -rf .next && npm run build
    npm start

The frontend runs fully offline with mirrored data, knowledge, and a
deterministic engine, and falls back to the backend API when it is online.
Local and remote outputs (verdicts, reliability, capstone scores) are
field-for-field identical, which the frontend test suite verifies.

## Classroom exercises

1. Run the hallucination scenario. The AI says it found a malicious
   domain at 97% confidence. Where in the evidence is that domain? Why
   did confidence stay high?
2. Run the automation_bias scenario with the AI answer hidden. Did you
   override the machine? Now run it again with the AI answer shown. How
   did your answer change?
3. Run the capstone twice: once trusting the AI, once checking each
   event. Which score was higher, and what does that teach about
   human-in-the-loop triage during an incident?
4. Review your calibration report. Were you confident when wrong? What
   does your calibration curve say about when you should slow down?

## Notes

- Database table: `ai_failure_reviews` in `backend/app/database.py`.
- Shared datasets under `datasets/ai-failures/` and the knowledge base
  under `knowledge/ai-failures/knowledge_base.json`.
- Frontend mirrors data in `src/data/aiFailures.ts`, knowledge in
  `src/knowledge/ai-failures/knowledgeBase.ts`, and the engine in
  `src/services/aiFailureEngine.ts`.
- Data integrity and engine parity are checked by the frontend and backend
  test suites.
