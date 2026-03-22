import { useState, useEffect, useCallback } from "react";

interface ProgressData {
  answered: Record<string, string>;
  correct: Record<string, boolean>;
  streak: number;
  totalCorrect: number;
  totalAnswered: number;
  studyDays: string[];
  lastStudyDate: string;
  bookmarks: string[];
}

const STORAGE_KEY = "pharmvita_progress";

function getInitialProgress(): ProgressData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { bookmarks: [], ...parsed };
    }
  } catch {}
  return {
    answered: {},
    correct: {},
    streak: 0,
    totalCorrect: 0,
    totalAnswered: 0,
    studyDays: [],
    lastStudyDate: "",
    bookmarks: [],
  };
}

export function useStudyProgress() {
  const [progress, setProgress] = useState<ProgressData>(getInitialProgress);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  const recordAnswer = useCallback(
    (questionId: string, userAnswer: string, correctAnswer: string) => {
      setProgress((prev) => {
        const isCorrect = userAnswer === correctAnswer;
        const today = new Date().toISOString().split("T")[0];
        const newStudyDays = prev.studyDays.includes(today)
          ? prev.studyDays
          : [...prev.studyDays, today];
        const wasAnswered = questionId in prev.answered;
        const wasCorrect = prev.correct[questionId];

        let totalCorrect = prev.totalCorrect;
        let totalAnswered = prev.totalAnswered;

        if (!wasAnswered) {
          totalAnswered++;
          if (isCorrect) totalCorrect++;
        } else {
          if (wasCorrect && !isCorrect) totalCorrect--;
          else if (!wasCorrect && isCorrect) totalCorrect++;
        }

        return {
          ...prev,
          answered: { ...prev.answered, [questionId]: userAnswer },
          correct: { ...prev.correct, [questionId]: isCorrect },
          streak: isCorrect ? prev.streak + 1 : 0,
          totalCorrect,
          totalAnswered,
          studyDays: newStudyDays,
          lastStudyDate: today,
        };
      });
    },
    []
  );

  const toggleBookmark = useCallback((questionId: string) => {
    setProgress((prev) => {
      const isBookmarked = prev.bookmarks.includes(questionId);
      return {
        ...prev,
        bookmarks: isBookmarked
          ? prev.bookmarks.filter((id) => id !== questionId)
          : [...prev.bookmarks, questionId],
      };
    });
  }, []);

  const isBookmarked = useCallback(
    (questionId: string) => progress.bookmarks.includes(questionId),
    [progress.bookmarks]
  );

  const getSubjectProgress = useCallback(
    (subjectKey: string) => {
      const prefix = subjectKey + "_";
      let answered = 0;
      let correct = 0;
      Object.entries(progress.answered).forEach(([id]) => {
        if (id.startsWith(prefix)) {
          answered++;
          if (progress.correct[id]) correct++;
        }
      });
      return { answered, correct };
    },
    [progress]
  );

  const getAccuracy = useCallback(() => {
    if (progress.totalAnswered === 0) return 0;
    return Math.round((progress.totalCorrect / progress.totalAnswered) * 100);
  }, [progress]);

  const resetProgress = useCallback(() => {
    setProgress({
      answered: {},
      correct: {},
      streak: 0,
      totalCorrect: 0,
      totalAnswered: 0,
      studyDays: [],
      lastStudyDate: "",
      bookmarks: [],
    });
  }, []);

  const exportProgress = useCallback(() => {
    const dataStr = JSON.stringify(progress, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pharmvita_progress_${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [progress]);

  const importProgress = useCallback((file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          if (typeof data.answered === "object" && typeof data.correct === "object") {
            setProgress({ bookmarks: [], ...data });
            resolve(true);
          } else {
            resolve(false);
          }
        } catch {
          resolve(false);
        }
      };
      reader.readAsText(file);
    });
  }, []);

  return {
    progress,
    recordAnswer,
    toggleBookmark,
    isBookmarked,
    getSubjectProgress,
    getAccuracy,
    resetProgress,
    exportProgress,
    importProgress,
  };
}
