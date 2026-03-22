import { useState, useEffect, useCallback } from "react";
import type { Question } from "@/lib/types";

interface ExamSession {
  phase: "setup" | "exam" | "result";
  selectedSubjects: string[];
  questionCount: number;
  timeLimit: number;
  examQuestions: Question[];
  answers: Record<string, string>;
  currentIndex: number;
  startTime: number;
  elapsed: number;
}

const EXAM_KEY = "pharmvita_exam_session";

export function useExamSession(defaultSubjects: string[]) {
  const [session, setSession] = useState<ExamSession>(() => {
    try {
      const stored = localStorage.getItem(EXAM_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // 只恢復 exam 中的考試（不恢復 result，因為已完成）
        if (parsed.phase === "exam" && parsed.examQuestions?.length > 0) {
          return parsed;
        }
      }
    } catch {}
    return {
      phase: "setup",
      selectedSubjects: defaultSubjects,
      questionCount: 50,
      timeLimit: 90,
      examQuestions: [],
      answers: {},
      currentIndex: 0,
      startTime: 0,
      elapsed: 0,
    };
  });

  useEffect(() => {
    // 只在 exam 階段儲存（setup 和 result 不需要）
    if (session.phase === "exam") {
      localStorage.setItem(EXAM_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(EXAM_KEY);
    }
  }, [session]);

  const updateSession = useCallback((updates: Partial<ExamSession>) => {
    setSession((prev) => ({ ...prev, ...updates }));
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem(EXAM_KEY);
    setSession({
      phase: "setup",
      selectedSubjects: defaultSubjects,
      questionCount: 50,
      timeLimit: 90,
      examQuestions: [],
      answers: {},
      currentIndex: 0,
      startTime: 0,
      elapsed: 0,
    });
  }, [defaultSubjects]);

  return { session, updateSession, setSession, clearSession };
}
