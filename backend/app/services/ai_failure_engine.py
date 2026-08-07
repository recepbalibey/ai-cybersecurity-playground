"""
AI Failure Lab - reliability and validation engine.

Architecture (ready for future LLM / local-model integration):

    Scenario
      -> Evidence presented to the model
      -> AI decision + stated confidence
      -> Student verdict on the AI decision
      -> Ground truth reveal
      -> Failure explanation
      -> Mitigation selection
      -> Reliability retest (before vs after)

Educational simulator only. Uses fictional security events and fictional AI
outputs. Every scenario demonstrates a real reliability failure so learners
learn that AI output is not automatically correct.

Future integration points: OpenAI and Ollama. The ModelProvider class is the
seam for those providers; today all outputs are deterministic and rule-based
so the lab behaves identically for every learner.
"""

import os
import json
from typing import Dict, Any, List, Optional

# Future integration point: plug in OpenAI / Ollama providers here.
class ModelProvider:
    """Abstraction over AI providers. Currently heuristic/rule-based."""

    def analyze(self, scenario_id: str) -> str:
        return "Rule-based AI failure analysis"


DATASETS_DIR = os.path.join(
    os.path.dirname(__file__), "..", "..", "..", "datasets", "ai-failures"
)

KNOWLEDGE_PATH = os.path.join(
    os.path.dirname(__file__), "..", "..", "..", "knowledge", "ai-failures",
    "knowledge_base.json",
)

FAILURE_TYPES: List[Dict[str, str]] = [
    {"id": "false_positive", "name": "False Positive",
     "definition": "The AI reports an attack where none exists."},
    {"id": "false_negative", "name": "False Negative",
     "definition": "The AI reports no attack where one is present."},
    {"id": "hallucination", "name": "Hallucination",
     "definition": "The AI fabricates indicators or facts that do not exist."},
    {"id": "overconfidence", "name": "Overconfidence",
     "definition": "The AI states near-certainty the evidence cannot support."},
    {"id": "incomplete_context", "name": "Incomplete Context",
     "definition": "The AI reasons without data it could not see and invents the gap."},
    {"id": "ambiguous_input", "name": "Ambiguous Input",
     "definition": "The AI forces a binary verdict on data that is genuinely ambiguous."},
    {"id": "poor_data_quality", "name": "Poor Data Quality",
     "definition": "Duplicated or corrupted events look like a real attack."},
    {"id": "distribution_shift", "name": "Distribution Shift",
     "definition": "The model flags everything because the environment changed after training."},
    {"id": "class_imbalance", "name": "Class Imbalance",
     "definition": "The model learns the majority 'benign' class and misses rare attacks."},
    {"id": "automation_bias", "name": "Automation Bias",
     "definition": "A human accepts the machine's verdict without checking the evidence."},
    {"id": "contradictory_evidence", "name": "Contradictory Evidence",
     "definition": "The AI lets louder but blind signals outvote a correct detector."},
    {"id": "unsafe_recommendation", "name": "Unsafe Recommendation",
     "definition": "The AI suggests a response more damaging than the risk it targets."},
]

FAILURE_BY_ID = {f["id"]: f for f in FAILURE_TYPES}

LABELS = ["benign", "attack", "insufficient_evidence", "ambiguous", "unsafe_recommendation"]


# ------------------------------------------------------------ scoring

def _reliability_before(scenario: Dict[str, Any]) -> int:
    """Reliability of the AI output before mitigations.

    A correct AI with high confidence is reliable. A wrong AI with high
    confidence is the least reliable: the more confidently it is wrong, the
    more dangerous it is to trust.
    """
    ai_correct = scenario.get("ai_label") == scenario.get("ground_truth_label")
    if ai_correct:
        return scenario.get("ai_confidence", 50)
    return 100 - scenario.get("ai_confidence", 50)


def _reliability_after(scenario: Dict[str, Any], selected: List[str]) -> Dict[str, Any]:
    """Apply selected mitigations and recompute reliability."""
    mitigations = scenario.get("possible_mitigations", [])
    selected_set = set(selected)
    chosen = [m for m in mitigations if m["id"] in selected_set]
    gain_sum = sum(m.get("gain", 0) for m in chosen)
    failure_type = scenario.get("failure_type")
    caught = any(
        failure_type in m.get("prevents", []) for m in chosen
    )
    before = _reliability_before(scenario)
    after = min(100, before + gain_sum + (20 if caught else 0))
    return {
        "before": before,
        "after": after,
        "caught": caught,
        "gain": gain_sum,
        "selected": [m["id"] for m in chosen],
    }


def _verdict_class(student_decision: str, ai_correct: bool) -> str:
    """Classify the student's verdict against the AI's actual correctness."""
    if student_decision == "uncertain":
        return "uncertain"
    if student_decision == "correct":
        return "true_positive" if ai_correct else "false_positive"
    # student said "incorrect"
    return "true_negative" if not ai_correct else "false_negative"


def _verdict_correct(student_decision: str, ai_correct: bool) -> bool:
    return _verdict_class(student_decision, ai_correct) in ("true_positive", "true_negative")


def _calibration_bucket(confidence: int) -> str:
    if confidence >= 70:
        return "high"
    if confidence >= 30:
        return "medium"
    return "low"


# ------------------------------------------------------------ service

class AiFailureEngineService:
    def __init__(self):
        self.provider = ModelProvider()
        self._scenarios: Dict[str, Dict[str, Any]] = {}
        self._knowledge: Dict[str, Any] = {}
        self._load_scenarios()
        self._load_knowledge()

    def _load_scenarios(self):
        if not os.path.exists(DATASETS_DIR):
            return
        for fname in sorted(os.listdir(DATASETS_DIR)):
            if fname.endswith(".json"):
                try:
                    with open(os.path.join(DATASETS_DIR, fname), "r", encoding="utf-8") as f:
                        data = json.load(f)
                    self._scenarios[data["id"]] = data
                except Exception:
                    continue

    def _load_knowledge(self):
        if os.path.exists(KNOWLEDGE_PATH):
            try:
                with open(KNOWLEDGE_PATH, "r", encoding="utf-8") as f:
                    self._knowledge = json.load(f)
            except Exception:
                self._knowledge = {}

    def list_scenarios(self) -> List[Dict[str, str]]:
        def _difficulty_order(s):
            return {"beginner": 0, "intermediate": 1, "advanced": 2}.get(s.get("difficulty", "intermediate"), 1)
        ordered = sorted(self._scenarios.values(), key=lambda s: (not s.get("capstone_events", None) is None, _difficulty_order(s)))
        return [
            {
                "id": s["id"],
                "title": s["title"],
                "category": s["category"],
                "difficulty": s["difficulty"],
                "failure_type": s["failure_type"],
                "failure_name": FAILURE_BY_ID.get(s["failure_type"], {}).get("name", s["failure_type"]),
                "is_capstone": "capstone_events" in s,
                "learning_objective": s["learning_objective"],
            }
            for s in ordered
        ]

    def get_scenario(self, scenario_id: str) -> Dict[str, Any]:
        s = self._scenarios.get(scenario_id)
        if not s:
            raise FileNotFoundError(f"Scenario {scenario_id} not found")
        return s

    def list_knowledge(self) -> Dict[str, Any]:
        return self._knowledge

    def evaluate(self, scenario_id: str, student_decision: str,
                 selected_mitigations: Optional[List[str]] = None,
                 student_confidence: Optional[int] = None) -> Dict[str, Any]:
        scenario = self.get_scenario(scenario_id)
        if student_decision not in ("correct", "incorrect", "uncertain"):
            raise ValueError("decision must be correct, incorrect, or uncertain")

        ai_label = scenario.get("ai_label")
        ground_truth_label = scenario.get("ground_truth_label")
        ai_correct = ai_label == ground_truth_label
        decision = student_decision
        verdict_class = _verdict_class(decision, ai_correct)
        verdict_correct = _verdict_correct(decision, ai_correct)
        reliability = _reliability_after(scenario, selected_mitigations or [])
        confidence = student_confidence if student_confidence is not None else 50

        mitigations = [
            {
                "id": m["id"],
                "name": m["name"],
                "description": m["description"],
                "gain": m.get("gain", 0),
                "prevents": m.get("prevents", []),
            }
            for m in scenario.get("possible_mitigations", [])
        ]

        return {
            "scenario_id": scenario_id,
            "title": scenario["title"],
            "category": scenario["category"],
            "difficulty": scenario["difficulty"],
            "input_data": scenario["input_data"],
            "ai_output": scenario["ai_output"],
            "ai_confidence": scenario["ai_confidence"],
            "ai_label": ai_label,
            "ai_correct": ai_correct,
            "ground_truth": scenario["ground_truth"],
            "ground_truth_label": ground_truth_label,
            "failure_type": scenario["failure_type"],
            "failure_name": FAILURE_BY_ID.get(scenario["failure_type"], {}).get("name", scenario["failure_type"]),
            "explanation": scenario["explanation"],
            "security_impact": scenario["security_impact"],
            "recommended_validation": scenario["recommended_validation"],
            "learning_objective": scenario["learning_objective"],
            "student_decision": decision,
            "student_confidence": confidence,
            "student_verdict_class": verdict_class,
            "student_verdict_correct": verdict_correct,
            "reliability": reliability,
            "mitigations": mitigations,
            "calibration_bucket": _calibration_bucket(confidence),
            "summary": [
                f"The AI reported '{ai_label}' with {scenario['ai_confidence']}% confidence.",
                f"The ground truth is '{ground_truth_label}', so the AI was {'correct' if ai_correct else 'incorrect'}.",
                f"Your verdict ({decision}) was {'correct' if verdict_correct else 'not correct'}.",
                f"Reliability before mitigations: {reliability['before']}/100. After: {reliability['after']}/100.",
            ],
            "instructor_context": {
                "teaching_points": scenario.get("teaching_points", []),
                "discussion_questions": [
                    "What evidence would you need before trusting this AI output?",
                    "Which single mitigation would have caught this failure?",
                    "How did the AI's confidence compare to how confident you felt?",
                ],
            },
        }

    def challenge(self, scenario_id: str, student_predict: str) -> Dict[str, Any]:
        """Human vs AI mode: student predicts before seeing the AI output."""
        scenario = self.get_scenario(scenario_id)
        if student_predict not in LABELS:
            raise ValueError(f"prediction must be one of {LABELS}")
        ground_truth_label = scenario.get("ground_truth_label")
        ai_label = scenario.get("ai_label")
        ai_correct = ai_label == ground_truth_label
        human_correct = student_predict == ground_truth_label

        return {
            "scenario_id": scenario_id,
            "title": scenario["title"],
            "student_predict": student_predict,
            "ai_label": ai_label,
            "ai_confidence": scenario["ai_confidence"],
            "ground_truth_label": ground_truth_label,
            "human_correct": human_correct,
            "ai_correct": ai_correct,
            "both_correct": human_correct and ai_correct,
            "neither_correct": not human_correct and not ai_correct,
            "summary": (
                f"You predicted '{student_predict}' and the AI predicted '{ai_label}'. "
                f"The ground truth is '{ground_truth_label}'. "
                f"You were {'correct' if human_correct else 'incorrect'} and the AI was {'correct' if ai_correct else 'incorrect'}."
            ),
            "calibration_insight": (
                "When you and the AI disagree, the ground truth decides. "
                "Trust calibration means knowing when your judgment adds value over the model."
            ),
        }

    def run_capstone(self, scenario_id: str, student_picks: Dict[str, str]) -> Dict[str, Any]:
        """Capstone: per-event human vs AI vs combined scoring."""
        scenario = self.get_scenario(scenario_id)
        events = scenario.get("capstone_events", [])
        if not events:
            raise ValueError("Scenario is not a capstone")

        rows = []
        ai_total = 0
        human_total = 0
        combined_total = 0
        for ev in events:
            pick = student_picks.get(ev["id"])
            human_correct = pick == ev["ground_truth"]
            ai_correct = ev["ai_verdict"] == ev["ground_truth"]
            combined_correct = human_correct or ai_correct
            rows.append({
                "id": ev["id"],
                "title": ev["title"],
                "evidence": ev["evidence"],
                "detail": ev["detail"],
                "student_verdict": pick,
                "ai_verdict": ev["ai_verdict"],
                "ground_truth": ev["ground_truth"],
                "human_correct": human_correct,
                "ai_correct": ai_correct,
                "combined_correct": combined_correct,
            })
            ai_total += ai_correct
            human_total += human_correct
            combined_total += combined_correct

        n = len(events)
        ai_accuracy = round(ai_total / n * 100)
        human_accuracy = round(human_total / n * 100)
        combined_accuracy = round(combined_total / n * 100)

        insight = (
            f"The AI alone was right on {ai_total} of {n} events ({ai_accuracy}%). "
            f"You were right on {human_total} ({human_accuracy}%). "
            f"Combined, {combined_total} of {n} events were caught ({combined_accuracy}%). "
            "The combined score is higher than either alone because each catches what the other missed."
        )

        return {
            "scenario_id": scenario_id,
            "title": scenario["title"],
            "events": rows,
            "ai_accuracy": ai_accuracy,
            "human_accuracy": human_accuracy,
            "combined_accuracy": combined_accuracy,
            "ai_total": ai_total,
            "human_total": human_total,
            "combined_total": combined_total,
            "total_events": n,
            "insight": insight,
            "summary": [
                f"AI alone: {ai_total}/{n} ({ai_accuracy}%).",
                f"Human alone: {human_total}/{n} ({human_accuracy}%).",
                f"Combined: {combined_total}/{n} ({combined_accuracy}%).",
            ],
        }

    def scorecard(self, entries: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Aggregate student verdicts into an accuracy / FP / FN / uncertainty scorecard."""
        total = len(entries)
        correct = 0
        fp = 0  # trusted a wrong AI
        fn = 0  # distrusted a correct AI
        uncertain = 0
        for e in entries:
            cls = e.get("student_verdict_class")
            if cls == "uncertain":
                uncertain += 1
            elif cls == "true_positive" or cls == "true_negative":
                correct += 1
            elif cls == "false_positive":
                fp += 1
            elif cls == "false_negative":
                fn += 1

        decided = total - uncertain
        accuracy = round(correct / decided * 100) if decided else 0
        return {
            "total": total,
            "correct": correct,
            "incorrect": fp + fn,
            "uncertain": uncertain,
            "false_positives": fp,
            "false_negatives": fn,
            "decided": decided,
            "accuracy": accuracy,
            "insight": (
                f"Over {total} verdict(s), you were correct on {correct}, "
                f"you trusted a wrong AI {fp} time(s), distrusted a correct AI {fn} time(s), "
                f"and stayed uncertain {uncertain} time(s). Accuracy on decided cases: {accuracy}%."
            ),
        }

    def calibration(self, entries: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Trust calibration: student confidence buckets vs actual correctness."""
        buckets = {"high": [], "medium": [], "low": []}
        for e in entries:
            b = _calibration_bucket(e.get("student_confidence", 50))
            cls = e.get("student_verdict_class")
            correct = cls in ("true_positive", "true_negative")
            buckets[b].append(correct)

        out = {}
        for b, flags in buckets.items():
            n = len(flags)
            rate = round(sum(flags) / n * 100) if n else None
            out[b] = {"count": n, "correct_rate": rate}
        out["insight"] = (
            "A well calibrated reviewer is right in the same proportion of cases "
            "as their stated confidence. If you are often confident but often wrong, "
            "your trust in your own judgment is misaligned with reality."
        )
        return out

    def ask(self, question: str) -> Dict[str, str]:
        q = question.lower()
        if any(k in q for k in ("false positive", "false alarm", "false_positive")):
            return {"answer": "A false positive is when the AI reports an attack that does not exist. It is costly when the response is destructive, so verify high-impact actions before executing them."}
        if any(k in q for k in ("false negative", "miss", "false_negative")):
            return {"answer": "A false negative is when the AI reports no attack while one is present. It is the silent failure because no alert is raised and the intrusion continues. Volume is a weak signal, so weight data sensitivity and behavior quality."}
        if any(k in q for k in ("hallucin", "fabricat")):
            return {"answer": "A hallucination is confident fabricated content. In security reports it looks like a real indicator, so every claimed domain or IP must be traceable to the source data before it is acted on."}
        if any(k in q for k in ("calibrat", "confidence", "overconfid")):
            return {"answer": "Calibration matches stated confidence to actual correctness. A calibrated model is right 90% of the time when it says 90%. Overconfidence is saying 98% while being right half the time; track the gap."}
        if any(k in q for k in ("bias", "automation")):
            return {"answer": "Automation bias is accepting the machine's verdict without reading the evidence. The human is part of the failure, so require the analyst to reconcile the AI verdict against raw evidence before closing a case."}
        if any(k in q for k in ("drift", "distribution", "shift")):
            return {"answer": "Distribution shift is when the input data no longer matches what the model was trained on. The model then flags everything as abnormal. Build per-environment baselines and detect drift before it erodes trust."}
        if any(k in q for k in ("imbalance", "rare", "majority")):
            return {"answer": "Class imbalance biases a model toward the majority class. In security the rare class is the attack, so validate on balanced test sets and use recall and precision instead of overall accuracy."}
        if any(k in q for k in ("precision", "recall", "f1")):
            return {"answer": "Precision is the share of alerts that are real, recall is the share of attacks caught, and F1 balances the two. For imbalanced data, accuracy lies and precision-recall is the honest view."}
        if any(k in q for k in ("threshold")):
            return {"answer": "A threshold decides the trade-off between false positives and false negatives. Lower thresholds catch more attacks but raise more false alarms. Set the threshold from the cost of a miss versus the cost of a false alarm."}
        if any(k in q for k in ("human", "loop")):
            return {"answer": "Human-in-the-loop means a person approves before high-impact actions. Human-on-the-loop means a person supervises and intervenes on exception. Both only work when the human actually challenges the machine."}
        if any(k in q for k in ("mitigat", "control", "defense", "fix")):
            return {"answer": "Mitigations raise the reliability of an AI decision. Pick controls that would catch the specific failure: evidence citations stop hallucination, ticket correlation fixes missing context, and calibration tracking exposes overconfidence."}
        if any(k in q for k in ("confusion", "matrix")):
            return {"answer": "A confusion matrix splits results into true positives, false positives, true negatives, and false negatives. Every other metric derives from it, so read the matrix before trusting a headline accuracy number."}
        if any(k in q for k in ("recommend", "action", "response")):
            return {"answer": "AI recommendations can be unsafe: a response that disables a team or wipes a machine can be worse than the risk it targets. Map every recommended action to the evidence and gate disruptive actions behind a human."}
        return {"answer": "This lab teaches why AI output is not automatically correct. Ask about false positives, false negatives, hallucinations, confidence calibration, distribution shift, class imbalance, automation bias, or mitigations."}
