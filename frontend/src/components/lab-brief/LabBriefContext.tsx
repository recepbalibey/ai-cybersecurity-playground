"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface LabBriefState {
  /* which lab's brief is open (null = closed) */
  openLabId: string | null;
  /* labs the student has started working on */
  startedLabs: Set<string>;
  /* labs the student has completed */
  completedLabs: Set<string>;
  /* optional per-lab mission step index */
  missionSteps: Record<string, number>;

  openBrief: (labId: string) => void;
  closeBrief: () => void;
  toggleBrief: (labId: string) => void;
  markStarted: (labId: string) => void;
  markCompleted: (labId: string) => void;
  resetLab: (labId: string) => void;
  setMissionStep: (labId: string, index: number) => void;
}

const LabBriefContext = createContext<LabBriefState | null>(null);

export function LabBriefProvider({ children }: { children: ReactNode }) {
  const [openLabId, setOpenLabId] = useState<string | null>(null);
  const [startedLabs, setStartedLabs] = useState<Set<string>>(new Set());
  const [completedLabs, setCompletedLabs] = useState<Set<string>>(new Set());
  const [missionSteps, setMissionSteps] = useState<Record<string, number>>({});

  const openBrief = useCallback((labId: string) => setOpenLabId(labId), []);
  const closeBrief = useCallback(() => setOpenLabId(null), []);
  const toggleBrief = useCallback(
    (labId: string) =>
      setOpenLabId((prev) => (prev === labId ? null : labId)),
    []
  );

  const markStarted = useCallback((labId: string) => {
    setStartedLabs((prev) => {
      if (prev.has(labId)) return prev;
      const next = new Set(prev);
      next.add(labId);
      return next;
    });
  }, []);

  const markCompleted = useCallback((labId: string) => {
    setCompletedLabs((prev) => {
      if (prev.has(labId)) return prev;
      const next = new Set(prev);
      next.add(labId);
      return next;
    });
    setStartedLabs((prev) => {
      if (prev.has(labId)) return prev;
      const next = new Set(prev);
      next.add(labId);
      return next;
    });
  }, []);

  const resetLab = useCallback((labId: string) => {
    setCompletedLabs((prev) => {
      const next = new Set(prev);
      next.delete(labId);
      return next;
    });
    setStartedLabs((prev) => {
      const next = new Set(prev);
      next.delete(labId);
      return next;
    });
    setMissionSteps((prev) => {
      const next = { ...prev };
      delete next[labId];
      return next;
    });
  }, []);

  const setMissionStep = useCallback((labId: string, index: number) => {
    setMissionSteps((prev) => {
      if (prev[labId] === index) return prev;
      return { ...prev, [labId]: index };
    });
  }, []);

  const value = useMemo<LabBriefState>(
    () => ({
      openLabId,
      startedLabs,
      completedLabs,
      missionSteps,
      openBrief,
      closeBrief,
      toggleBrief,
      markStarted,
      markCompleted,
      resetLab,
      setMissionStep,
    }),
    [
      openLabId,
      startedLabs,
      completedLabs,
      missionSteps,
      openBrief,
      closeBrief,
      toggleBrief,
      markStarted,
      markCompleted,
      resetLab,
      setMissionStep,
    ]
  );

  return (
    <LabBriefContext.Provider value={value}>
      {children}
    </LabBriefContext.Provider>
  );
}

export function useLabBrief(): LabBriefState {
  const ctx = useContext(LabBriefContext);
  if (!ctx) {
    throw new Error("useLabBrief must be used within LabBriefProvider");
  }
  return ctx;
}
