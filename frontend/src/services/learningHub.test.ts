import { describe, it, expect, beforeEach } from "vitest";
import {
  LABS,
  LAB_LESSONS,
  THEORY_TOPICS,
  LEARNING_PATHS,
  ROADMAP,
  getProgress,
  getLearningPath,
  setLearningPath,
  setLabCompleted,
  isLabCompleted,
  clearAllProgress,
  suggestedLabs,
} from "./learningHub";

beforeEach(() => {
  window.localStorage.clear();
});

describe("progress tracking (reset button regression)", () => {
  it("starts at 0 of all labs completed", () => {
    const p = getProgress();
    expect(p.total).toBe(LABS.length);
    expect(p.completed).toBe(0);
    expect(p.percent).toBe(0);
  });

  it("reflects completed labs and can clear them via clearAllProgress", () => {
    setLabCompleted("soc-analyst", true);
    setLabCompleted("agent-security", true);
    expect(getProgress().completed).toBe(2);
    expect(isLabCompleted("soc-analyst")).toBe(true);

    clearAllProgress();
    expect(getProgress().completed).toBe(0);
    expect(isLabCompleted("soc-analyst")).toBe(false);
  });

  it("does not mark a lab complete when no-op", () => {
    expect(isLabCompleted("pentest-assistant")).toBe(false);
    // overrides are idempotent
    setLabCompleted("pentest-assistant", true);
    setLabCompleted("pentest-assistant", true);
    expect(getProgress().completed).toBe(1);
  });

  it("keeps the learning path when progress is reset", () => {
    setLearningPath("cyber-of-ai");
    clearAllProgress();
    expect(getLearningPath()).toBe("cyber-of-ai");
  });

  it("suggestedLabs drops completed labs", () => {
    setLabCompleted("prompt-injection", true);
    const suggested = suggestedLabs("cyber-of-ai");
    expect(suggested.find((l) => l.id === "prompt-injection")).toBeUndefined();
  });
});

describe("learning path persistence", () => {
  it("returns null before a choice and persists after", () => {
    expect(getLearningPath()).toBeNull();
    setLearningPath("ai-for-cyber");
    expect(getLearningPath()).toBe("ai-for-cyber");
  });
});

describe("learning hub data integrity", () => {
  it("has 12 labs with unique ids and ordered labels", () => {
    const ids = LABS.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(LABS.length).toBe(12);
    LABS.forEach((l, i) => {
      expect(l.order).toBe(i + 1);
      expect(l.title).toBeTruthy();
      expect(l.blurb).toBeTruthy();
      expect(l.learned).toBeTruthy();
      expect(l.path).toBeDefined();
    });
  });

  it("has 7 not-more theory topics with unique ids, a flow, sections and takeaways", () => {
    expect(THEORY_TOPICS.length).toBeGreaterThanOrEqual(7);
    const ids = THEORY_TOPICS.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    THEORY_TOPICS.forEach((t) => {
      expect(t.title).toBeTruthy();
      expect(t.flow.nodes.length).toBeGreaterThanOrEqual(2);
      expect(t.flow.edges.length).toBeGreaterThanOrEqual(1);
      expect(t.sections.length).toBeGreaterThanOrEqual(1);
      expect(t.takeaways.length).toBeGreaterThanOrEqual(1);
      // every edge references existing nodes
      const nodeIds = new Set(t.flow.nodes.map((n) => n.id));
      t.flow.edges.forEach(([from, to]) => {
        expect(nodeIds.has(from)).toBe(true);
        expect(nodeIds.has(to)).toBe(true);
      });
    });
  });

  it("has 2 learning paths that reference only existing labs", () => {
    const labOrderSet = new Set(LABS.map((l) => l.order));
    expect(Object.keys(LEARNING_PATHS).length).toBe(2);
    Object.values(LEARNING_PATHS).forEach((p) => {
      expect(p.labs.length).toBeGreaterThan(0);
      p.labs.forEach((order) => expect(labOrderSet.has(order)).toBe(true));
    });
  });

  it("roadmap has exactly 4 ordered steps", () => {
    expect(ROADMAP.length).toBe(4);
    ROADMAP.forEach((s, i) => expect(s.order).toBe(i + 1));
  });

  it("every lab has a full 'understand the lab' lesson", () => {
    LABS.forEach((lab) => {
      const lesson = LAB_LESSONS[lab.id];
      expect(lesson, `${lab.id} missing lesson`).toBeTruthy();
      expect(lesson.id).toBe(lab.id);
      expect(lesson.title).toBe(lab.title);
      expect(lesson.teaser).toBeTruthy();
      expect(lesson.what_you_do.length).toBeGreaterThan(0);
      expect(lesson.concepts.length).toBeGreaterThan(0);
      expect(lesson.takeaways.length).toBeGreaterThan(0);
      expect(lesson.not_secrets.length).toBeGreaterThan(0);
    });
  });
});