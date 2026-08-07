// knowledgeBase.ts
// AI Failure Lab - curated knowledge about why AI output is not automatically correct.
// Mirrors knowledge/ai-failures/knowledge_base.json.

export interface KnowledgeItem {
  title: string;
  explanation: string;
  practical: string;
}

export const AI_FAILURE_TOPICS: Record<string, KnowledgeItem[]> = {
  false_positives: [
    {
      title: "A false alarm can be more expensive than an attack",
      explanation: "A false positive triggers a response. When the response is destructive, such as blocking a subnet or resetting an account, the damage can exceed the attack that was never there.",
      practical: "Before acting on an alert, check the cost of the action you are about to take. High-impact responses deserve verification.",
    },
    {
      title: "Volume is a weak signal",
      explanation: "Many failed logins or many events look scary, but automation, retries, and duplicates can produce volume without any attacker.",
      practical: "Correlate volume with source, account, schedule, and change context before calling it an attack.",
    },
    {
      title: "Precision decides how much noise the team tolerates",
      explanation: "A detector with low precision floods the team with false alarms. After enough false alarms, real alerts stop being trusted.",
      practical: "Measure precision and tune thresholds so that when the tool says 'attack', the team believes it.",
    },
  ],
  false_negatives: [
    {
      title: "The silent failure",
      explanation: "A false negative produces no alert at all. The team believes the system is clean while an intrusion continues and deepens.",
      practical: "Monitor for missed attacks with detection engineering reviews and hunting, because no alarm does not mean no attack.",
    },
    {
      title: "Attackers hide below the threshold",
      explanation: "Low-volume, patient attackers stay under the threshold that triggers alerts. Volume-based detection is blind to them.",
      practical: "Weight sensitivity of data and behavior quality, not only event volume.",
    },
    {
      title: "Recall decides what gets missed",
      explanation: "Recall measures how many real attacks the tool catches. A high-confidence tool with low recall catches few attacks and is still dangerous.",
      practical: "Validate on balanced test sets that include real attacks so recall is measured, not assumed.",
    },
  ],
  hallucinations: [
    {
      title: "Confident falsehoods look like findings",
      explanation: "A hallucination is fabricated content presented with normal confidence. In a security report it looks identical to a real indicator.",
      practical: "Every claimed indicator must be traceable to the source data before it is believed or acted on.",
    },
    {
      title: "Confidence is not truth",
      explanation: "Reported confidence often measures how natural the text sounds, not how well it matches evidence.",
      practical: "Compare stated confidence against verified correctness over time; the gap is the calibration error.",
    },
    {
      title: "Grounded generation prevents invention",
      explanation: "When the model is forced to extract from a source or cite a reference, it cannot invent indicators it never saw.",
      practical: "Require citations and deterministic extraction for anything that will be acted on.",
    },
  ],
  confidence_calibration: [
    {
      title: "Calibration matches confidence to reality",
      explanation: "A calibrated model is right 90% of the time when it says 90%. Overconfidence is when it says 98% and is right half the time.",
      practical: "Track stated confidence against actual correctness and report the gap to the team.",
    },
    {
      title: "Overconfidence converts ambiguity into decisions",
      explanation: "A thin or ambiguous signal becomes a near-certain conclusion, and the confidence is what makes people act.",
      practical: "Require multiple corroborating signals before high-confidence, high-impact calls.",
    },
    {
      title: "Uncertainty is a decision, not a failure",
      explanation: "Reporting 'insufficient evidence' or 'unknown' is a correct answer when the data is ambiguous. Forcing a binary guess is the failure.",
      practical: "Support an explicit uncertainty class and reward models that use it honestly.",
    },
  ],
  uncertainty: [
    {
      title: "Ambiguous input does not become a signal",
      explanation: "When the same data supports two explanations, it supports neither. The correct answer is often 'needs more data'.",
      practical: "Collect the missing signal before deciding, and never treat ambiguity as confirmation.",
    },
    {
      title: "Missing context gets invented",
      explanation: "When the model cannot see the full context, it fills the gap with its most likely story, which may be wrong.",
      practical: "Join alert data with change, ticket, and scheduling systems before classification.",
    },
    {
      title: "Incomplete data changes meaning",
      explanation: "The same rule change is benign with an approved ticket and suspicious without one. The unseen data decides the meaning.",
      practical: "Flag when context sources are missing and lower confidence accordingly.",
    },
  ],
  data_quality: [
    {
      title: "Garbage in, confident garbage out",
      explanation: "Duplicated, truncated, or misattributed events look exactly like real patterns. The model will describe the artifact as if it were a threat.",
      practical: "Deduplicate and validate the event stream before any analysis or counting.",
    },
    {
      title: "Uniqueness is the first check",
      explanation: "Identical timestamps, sources, and users across many lines are a data-quality tell, not proof of an attack.",
      practical: "Count distinct events, not raw lines, for any volume-based conclusion.",
    },
    {
      title: "Input quality is a security control",
      explanation: "A broken ingestion pipeline produces fake alerts that erode trust in the very signal that matters during a real attack.",
      practical: "Monitor agents and pipelines for retries, truncation, and clock skew.",
    },
  ],
  class_imbalance: [
    {
      title: "The rare class is the one that matters",
      explanation: "In security, attacks are rare in the data. A model trained mostly on benign examples learns to say benign, and misses the rare attack.",
      practical: "Validate on balanced sets that include real attacks so the rare class is visible.",
    },
    {
      title: "Accuracy hides the failure",
      explanation: "A model that says 'benign' 99% of the time is 99% accurate and misses every attack. Accuracy is the wrong metric for imbalanced data.",
      practical: "Use recall, precision, and F1 on the attack class instead of overall accuracy.",
    },
    {
      title: "Signal beats template similarity",
      explanation: "Scoring a message as safe because it resembles a template misses attacks that look like normal traffic on purpose.",
      practical: "Score concrete indicators such as domain age, reply-to mismatch, and attachment type.",
    },
  ],
  distribution_shift: [
    {
      title: "A model is only valid on its own distribution",
      explanation: "A model trained on office IT traffic will flag normal OT traffic as anomalous because it has no reference for it.",
      practical: "Build per-environment baselines and validate a model on the environment it will actually run in.",
    },
    {
      title: "Shift turns routine data into alarm",
      explanation: "Distribution shift does not degrade the model slowly; it makes everything look abnormal at once, which trains the team to ignore alarms.",
      practical: "Detect input distribution drift and flag the model as out of scope when it occurs.",
    },
    {
      title: "Deployment is an evaluation, not a handoff",
      explanation: "Moving a model to a new environment changes its inputs. Re-baseline and re-evaluate at deployment.",
      practical: "Compare the deployment environment to the training environment before trusting output.",
    },
  ],
  concept_drift: [
    {
      title: "The world changes under the model",
      explanation: "Concept drift is when the meaning of the signal itself changes over time, so patterns that used to indicate an attack stop meaning that.",
      practical: "Re-evaluate periodically and retrain when the relationship between features and outcomes drifts.",
    },
    {
      title: "Old truth becomes new noise",
      explanation: "A domain, IP, or behavior that once signaled compromise can become routine as attackers change tactics and defenders change configs.",
      practical: "Track performance over time and investigate when the model stops matching reality.",
    },
  ],
  automation_bias: [
    {
      title: "The human is part of the failure",
      explanation: "Automation bias is accepting the machine's verdict without reading the evidence. A confident AI can override facts a person would otherwise act on.",
      practical: "Require the analyst to reconcile the AI verdict against raw evidence before closing a case.",
    },
    {
      title: "High confidence invites deference",
      explanation: "The more confident the machine sounds, the less the human checks. Confidence is a driver of automation bias.",
      practical: "Expose evidence alongside confidence so the two are always compared.",
    },
    {
      title: "Human-in-the-loop must actually challenge",
      explanation: "A human who only rubber-stamps the machine is not a control, just a delay. The loop only works when the human can say no.",
      practical: "Ask for one reason the AI could be wrong before accepting a low-risk call on sensitive access.",
    },
  ],
  human_in_the_loop: [
    {
      title: "Keep the human at the decision",
      explanation: "A human review gate before high-impact actions turns the model into a decision aid instead of a decision maker.",
      practical: "Route disruptive actions through an analyst or incident owner before execution.",
    },
    {
      title: "Human review is only as good as its incentives",
      explanation: "If reviewers are never told when they were wrong, or if they are punished for slowing things down, review becomes a formality.",
      practical: "Measure reviewer accuracy and reward challenge, not speed.",
    },
  ],
  human_on_the_loop: [
    {
      title: "Watch the automated system",
      explanation: "Human-on-the-loop means a person supervises automation and intervenes on exception, rather than approving every action.",
      practical: "Set clear exception conditions under which the supervisor must be pulled in.",
    },
    {
      title: "Supervision needs visibility",
      explanation: "A supervisor who cannot see what the system is doing cannot intervene in time.",
      practical: "Provide live visibility into what the model saw and decided.",
    },
  ],
  model_monitoring: [
    {
      title: "A model is not a finished product",
      explanation: "Performance degrades after deployment through drift, changing data, and changing attackers. Monitoring is how you see it happen.",
      practical: "Track accuracy, precision, recall, confidence, and input distribution over time.",
    },
    {
      title: "Monitoring feeds the review",
      explanation: "Evidence from production about where the model is wrong should drive retraining and policy decisions.",
      practical: "Turn monitoring findings into periodic model reviews, not just alert pages.",
    },
  ],
  ai_evaluation: [
    {
      title: "Evaluate on the real task",
      explanation: "An AI security tool must be judged on security outcomes, such as catching real attacks, not on how natural its output sounds.",
      practical: "Build test sets from real incidents and score the tool on what it gets right and misses.",
    },
    {
      title: "Evaluation is continuous",
      explanation: "A single good test result at launch means little after deployment shifts the data.",
      practical: "Re-run evaluations on a schedule and after any change to data or environment.",
    },
  ],
  security_evaluation: [
    {
      title: "Judge the tool by security outcomes",
      explanation: "Costs matter in security evaluation: a false positive costs response time, a false negative costs the breach itself.",
      practical: "Weigh false positives and false negatives by their real cost in your environment.",
    },
    {
      title: "Every metric is a decision",
      explanation: "Choosing a threshold decides which attacks are missed and which alarms are raised. That is a security policy choice.",
      practical: "Set thresholds from cost analysis and review them as the environment changes.",
    },
  ],
  decision_thresholds: [
    {
      title: "Thresholds set the trade-off",
      explanation: "A low threshold catches more attacks and raises more false alarms. A high threshold does the opposite. The right threshold depends on cost.",
      practical: "Set the threshold from the cost of a miss versus the cost of a false alarm.",
    },
    {
      title: "Calibration is not a threshold",
      explanation: "Calibration fixes the honesty of the confidence number. The threshold is where you decide to act on it. Both matter.",
      practical: "Fix calibration first, then choose thresholds on calibrated confidence.",
    },
  ],
  precision: [
    {
      title: "Precision is trust",
      explanation: "Precision is the share of alerts that are real. High precision means when the tool says 'attack', it is usually right.",
      practical: "Improve precision by raising thresholds and reducing weak signals; measure it per detector.",
    },
  ],
  recall: [
    {
      title: "Recall is coverage",
      explanation: "Recall is the share of real attacks the tool catches. High recall means few attacks slip through.",
      practical: "Improve recall with balanced training and by scoring high-sensitivity events regardless of volume.",
    },
  ],
  f1_score: [
    {
      title: "F1 balances the two failures",
      explanation: "F1 is the harmonic mean of precision and recall. It collapses the trade-off into one number for comparing models.",
      practical: "Use F1 alongside the raw precision and recall so the trade-off stays visible.",
    },
  ],
  pr_auc: [
    {
      title: "PR-AUC judges the whole threshold range",
      explanation: "Precision-recall AUC summarizes performance across all thresholds and is meaningful for imbalanced data where accuracy lies.",
      practical: "Compare candidate models with PR-AUC before choosing a threshold.",
    },
  ],
  confusion_matrix: [
    {
      title: "The confusion matrix is the ground truth",
      explanation: "It splits results into true positive, false positive, true negative, and false negative. Every other metric derives from it.",
      practical: "Read the matrix for the attack class before trusting a single headline accuracy number.",
    },
  ],
};

export const FAILURE_TOPIC_ORDER: string[] = [
  "false_positives",
  "false_negatives",
  "hallucinations",
  "confidence_calibration",
  "uncertainty",
  "data_quality",
  "class_imbalance",
  "distribution_shift",
  "concept_drift",
  "automation_bias",
  "human_in_the_loop",
  "human_on_the_loop",
  "model_monitoring",
  "ai_evaluation",
  "security_evaluation",
  "decision_thresholds",
  "precision",
  "recall",
  "f1_score",
  "pr_auc",
  "confusion_matrix",
];
