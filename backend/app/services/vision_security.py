"""
Adversarial Face Recognition Lab - computer vision security simulation.

Educational sandbox only. Deterministic heuristics; no real identity data and no
connection to real person recognition systems. Fictional subjects only.

Pipeline (mirrors a real adversarial-ML assessment harness so the API contract
is stable if a real model backend is wired in later):
    Image -> Preprocessing -> ML Model -> Prediction -> Robustness Evaluation
"""

import os
import json
import hashlib
from typing import Dict, Any, List

SUBJECT_LABELS = {
    "alpha": "Subject Alpha",
    "beta": "Subject Beta",
    "gamma": "Subject Gamma",
}


class VisionSecurityService:
    def __init__(self):
        base = self._base_dir()
        self.datasets_dir = os.path.join(base, "datasets", "adversarial-ml")
        self.knowledge_dir = os.path.join(base, "knowledge", "adversarial-ml")

    @staticmethod
    def _base_dir() -> str:
        return os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

    # ------------------------------------------------------------------
    # Datasets
    # ------------------------------------------------------------------

    def list_experiments(self) -> List[Dict[str, Any]]:
        experiments = []
        if os.path.exists(self.datasets_dir):
            for fname in sorted(os.listdir(self.datasets_dir)):
                if not fname.endswith(".json"):
                    continue
                try:
                    with open(os.path.join(self.datasets_dir, fname), "r") as f:
                        data = json.load(f)
                    experiments.append({
                        "key": data.get("experiment_key", fname.replace(".json", "")),
                        "title": data.get("title", ""),
                        "difficulty": data.get("difficulty", "beginner"),
                        "application": data.get("application", ""),
                        "description": data.get("description", ""),
                        "attack_type": data.get("config", {}).get("attack_key", "noise"),
                        "robustness": data.get("robustness", 0),
                    })
                except Exception:
                    continue
        return experiments

    def _load_experiment(self, experiment_key: str) -> Dict[str, Any]:
        filepath = os.path.join(self.datasets_dir, f"{experiment_key}.json")
        if not os.path.exists(filepath):
            # tolerate a leading number prefix fallback
            for candidate in os.listdir(self.datasets_dir):
                if candidate.endswith(f"_{experiment_key}.json") or candidate.endswith(f"{experiment_key}.json"):
                    filepath = os.path.join(self.datasets_dir, candidate)
                    break
        if not os.path.exists(filepath):
            raise FileNotFoundError(f"Experiment not found: {experiment_key}")
        with open(filepath, "r") as f:
            return json.load(f)

    # ------------------------------------------------------------------
    # Knowledge base
    # ------------------------------------------------------------------

    def list_concepts(self) -> List[Dict[str, Any]]:
        path = os.path.join(self.knowledge_dir, "concepts.json")
        if os.path.exists(path):
            with open(path, "r") as f:
                return json.load(f).get("concepts", [])
        return []

    def list_attacks_defenses(self) -> Dict[str, List[Dict[str, Any]]]:
        path = os.path.join(self.knowledge_dir, "attacks_defenses.json")
        if os.path.exists(path):
            with open(path, "r") as f:
                data = json.load(f)
            return {"attacks": data.get("attacks", []), "defenses": data.get("defenses", [])}
        return {"attacks": [], "defenses": []}

    def experiment_detail(self, experiment_key: str) -> Dict[str, Any]:
        exp = self._load_experiment(experiment_key)
        return exp  # exp already uses the stable front-end field names

    # ------------------------------------------------------------------
    # Simulation pipeline
    # ------------------------------------------------------------------

    def analyze(self, experiment_key: str, mode: str = "clean") -> Dict[str, Any]:
        exp = self._load_experiment(experiment_key)
        attack_key = exp.get("config", {}).get("attack_key", "noise")
        is_defense = exp.get("experiment_key", "").startswith("4_")

        if is_defense:
            return self._analyze_defense(exp, experiment_key, attack_key)

        before = exp.get("before", {})
        after = exp.get("after", {})

        clean = {
            "prediction": before.get("prediction", "alpha"),
            "prediction_label": SUBJECT_LABELS.get(before.get("prediction", "alpha"), before.get("prediction", "")),
            "confidence": before.get("confidence", 90),
            "logits": self._logits(exp, before.get("prediction"), before.get("confidence")),
        }
        adversarial = {
            "prediction": after.get("prediction", "beta"),
            "prediction_label": SUBJECT_LABELS.get(after.get("prediction", "beta"), after.get("prediction", "")),
            "confidence": after.get("confidence", 80),
            "logits": self._logits(exp, after.get("prediction"), after.get("confidence")),
        }

        seed = self._seed(experiment_key, mode)
        if mode == "clean":
            outcome, confidence = "clean", clean["confidence"]
        elif mode == "adversarial":
            blocked = seed % 100 < exp.get("robustness", 0)
            if blocked:
                outcome, confidence = "blocked", clean["confidence"]
            else:
                outcome, confidence = "misclassified", adversarial["confidence"]
        else:
            outcome, confidence = "clean", clean["confidence"]

        return {
            "experiment_key": experiment_key,
            "mode": mode,
            "attack_type": attack_key,
            "is_defense_comparison": False,
            "before": clean,
            "after": adversarial,
            "outcome": outcome,
            "confidence": confidence,
            "affected_pixels": self._affected_pixels(attack_key),
            "robustness": exp.get("robustness", 0),
            "explanation": exp.get("explanation", ""),
            "why_failed": exp.get("why_failed", ""),
            "mitigations": exp.get("mitigations", ""),
            "teaching_points": exp.get("teaching_points", []),
            "timeline": self._timeline(attack_key, outcome),
            "confidence_gap": max(0, clean["confidence"] - adversarial["confidence"]),
        }

    def _analyze_defense(self, exp: Dict[str, Any], experiment_key: str, attack_key: str) -> Dict[str, Any]:
        def view(m):
            return {
                "name": m.get("name", ""),
                "clean_accuracy": m.get("clean_accuracy", 0),
                "robustness": m.get("robustness", 0),
                "clean_prediction": m.get("clean_prediction", "alpha"),
                "clean_confidence": m.get("clean_confidence", 90),
                "adversarial_prediction": m.get("adversarial_prediction", ""),
                "adversarial_confidence": m.get("adversarial_confidence", 0),
            }
        return {
            "experiment_key": experiment_key,
            "mode": "adversarial",
            "attack_type": attack_key,
            "is_defense_comparison": True,
            "vulnerable": view(exp.get("vulnerable_model")),
            "protected": view(exp.get("protected_model")),
            "subjects": exp.get("subjects", []),
            "explanation": exp.get("explanation", ""),
            "robustness": exp.get("robustness", 0),
            "teaching_points": exp.get("teaching_points", []),
            "timeline": self._timeline(attack_key, "defended"),
        }

    # ------------------------------------------------------------------
    # Heuristics
    # ------------------------------------------------------------------

    def _seed(self, experiment_key: str, mode: str) -> int:
        h = hashlib.md5(f"{experiment_key}::{mode}".encode()).digest()
        return int.from_bytes(h[:4], "big")

    def _logits(self, exp: Dict[str, Any], prediction: str, confidence: float) -> List[Dict[str, Any]]:
        subjects = exp.get("subjects", [
            {"id": "alpha"}, {"id": "beta"}, {"id": "gamma"},
        ])
        names = [s.get("id", s) for s in subjects]
        seed = self._seed(exp.get("experiment_key", ""), prediction)
        main = float(confidence) / 100.0
        remaining = 1.0 - main
        others = [n for n in names if n != prediction]
        allocation = {prediction: main}
        for i, n in enumerate(others):
            frac = remaining * (0.4 + 0.3 * ((seed + i) % 3) / 2)
            frac = min(frac, remaining)
            allocation[n] = frac
            remaining -= frac
        total = sum(allocation.values())
        return [{"subject": n, "probability": round(allocation[n] / total, 4)} for n in names]

    @staticmethod
    def _affected_pixels(attack_key: str) -> float:
        return {"noise": 0.06, "occlusion": 0.32, "transformation": 0.42}.get(attack_key, 0.2)

    @staticmethod
    def _timeline(attack_key: str, outcome: str) -> List[Dict[str, str]]:
        return [
            {"stage": "Image received", "status": "complete", "detail": "Input passed into the pipeline"},
            {"stage": "Preprocessing", "status": "complete", "detail": "Normalized and resized"},
            {"stage": "Features extracted", "status": "complete", "detail": "Latent vector computed"},
            {"stage": "Prediction generated", "status": "complete", "detail": "Class probabilities produced"},
            {"stage": "Adversarial check", "status": "complete", "detail": f"Guardrail: {outcome}"},
        ]