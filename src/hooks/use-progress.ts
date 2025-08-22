"use client";

import { useState, useEffect, useCallback } from "react";

const PROGRESS_KEY = "ngbeta_learn_progress";

type Progress = {
  completedGuides: Set<string>;
};

export function useProgress() {
  const [progress, setProgress] = useState<Progress>({
    completedGuides: new Set(),
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedProgress = localStorage.getItem(PROGRESS_KEY);
      if (savedProgress) {
        const parsed = JSON.parse(savedProgress);
        setProgress({ completedGuides: new Set(parsed.completedGuides) });
      }
    } catch (error) {
      console.error("Failed to load progress from localStorage", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const saveProgress = useCallback((newProgress: Progress) => {
    try {
      const dataToStore = {
        completedGuides: Array.from(newProgress.completedGuides),
      };
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(dataToStore));
      setProgress(newProgress);
    } catch (error) {
      console.error("Failed to save progress to localStorage", error);
    }
  }, []);

  const toggleComplete = useCallback(
    (slug: string) => {
      if (!isLoaded) return;
      const newCompletedGuides = new Set(progress.completedGuides);
      if (newCompletedGuides.has(slug)) {
        newCompletedGuides.delete(slug);
      } else {
        newCompletedGuides.add(slug);
      }
      saveProgress({ completedGuides: newCompletedGuides });
    },
    [progress.completedGuides, saveProgress, isLoaded]
  );

  const isCompleted = useCallback(
    (slug: string) => {
      return progress.completedGuides.has(slug);
    },
    [progress.completedGuides]
  );

  return { progress, isLoaded, toggleComplete, isCompleted };
}
