import { describe, it, expect } from "vitest";
import { LAB_BRIEFS, getLabBrief } from "./labBriefData";
import { LABS } from "../services/learningHub";

describe("lab brief data integrity", () => {
  it("covers every lab in LABS with a brief", () => {
    const labIds = LABS.map((l) => l.id);
    for (const id of labIds) {
      expect(
        LAB_BRIEFS[id],
        `missing brief for lab "${id}"`
      ).toBeDefined();
    }
    expect(Object.keys(LAB_BRIEFS).length).toBeGreaterThanOrEqual(labIds.length);
  });

  for (const id of Object.keys(LAB_BRIEFS)) {
    it(`brief "${id}" has required fields`, () => {
      const b = getLabBrief(id);
      expect(b).toBeDefined();
      expect(b!.id).toBe(id);
      expect(b!.title.trim().length).toBeGreaterThan(0);
      expect(b!.description.trim().length).toBeGreaterThan(0);
      expect(Array.isArray(b!.learningObjectives)).toBe(true);
      expect(b!.learningObjectives.length).toBeGreaterThan(0);
      b!.learningObjectives.forEach((o) =>
        expect(o.trim().length).toBeGreaterThan(0)
      );
      expect(Array.isArray(b!.prerequisites)).toBe(true);
      expect(b!.mission.trim().length).toBeGreaterThan(0);
      expect(Array.isArray(b!.missionObjectives)).toBe(true);
      expect(b!.missionObjectives.length).toBeGreaterThan(0);
      b!.missionObjectives.forEach((o) =>
        expect(o.trim().length).toBeGreaterThan(0)
      );
      expect(["Beginner", "Intermediate", "Advanced"]).toContain(b!.difficulty);
      expect(b!.estimatedTime.trim().length).toBeGreaterThan(0);
      expect(Array.isArray(b!.skills)).toBe(true);
      expect(b!.skills.length).toBeGreaterThan(0);
      expect(Array.isArray(b!.whatYouLearned)).toBe(true);
      expect(b!.whatYouLearned.length).toBeGreaterThan(0);
      if (b!.missionSteps !== undefined) {
        expect(Array.isArray(b!.missionSteps)).toBe(true);
        expect(b!.missionSteps.length).toBeGreaterThan(0);
        b!.missionSteps!.forEach((s) =>
          expect(s.trim().length).toBeGreaterThan(0)
        );
      }
    });
  }
});
