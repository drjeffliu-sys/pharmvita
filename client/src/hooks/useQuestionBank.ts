import { useMemo, useRef } from "react";
import type { Question } from "@/lib/types";
import questionBankData from "@/data/question_bank.json";

// 題庫是純陣列格式
const ALL_QUESTIONS = questionBankData as Question[];

// ── 基本 hook ───────────────────────────────────────────

/** 取得全部題目 */
export function useQuestionBank() {
  return useMemo(() => ({
    questions: ALL_QUESTIONS,
    total_questions: ALL_QUESTIONS.length,
    years: [...new Set(ALL_QUESTIONS.map((q) => q.year))].sort(),
  }), []);
}

/** 依科目取得所有題目（跨屆） */
export function useSubjectQuestions(subjectKey: string, year?: string) {
  return useMemo(() => {
    const prefix = subjectKey + "_";
    let qs = ALL_QUESTIONS.filter((q) => q.id.startsWith(prefix));
    if (year) qs = qs.filter((q) => q.year === year);
    return qs;
  }, [subjectKey, year]);
}

/** 依 tag 篩選題目 */
export function useTagQuestions(subjectKey: string, tag: string, year?: string) {
  return useMemo(() => {
    const prefix = subjectKey + "_";
    const decodedTag = decodeURIComponent(tag);
    let qs = ALL_QUESTIONS.filter(
      (q) => q.id.startsWith(prefix) && q.tags.includes(decodedTag)
    );
    if (year) qs = qs.filter((q) => q.year === year);
    return qs;
  }, [subjectKey, tag, year]);
}

/** 取得所有 tag 的索引 */
export function useAllTags() {
  return useMemo(() => {
    const tagMap: Record<string, { count: number; subjects: string[] }> = {};
    ALL_QUESTIONS.forEach((q) => {
      const subjectKey = q.id.split("_")[0];
      q.tags.forEach((tag) => {
        if (!tagMap[tag]) tagMap[tag] = { count: 0, subjects: [] };
        tagMap[tag].count++;
        if (!tagMap[tag].subjects.includes(subjectKey)) {
          tagMap[tag].subjects.push(subjectKey);
        }
      });
    });
    return tagMap;
  }, []);
}

/** 取得某科目的所有 tag（依題數排序） */
export function useSubjectTags(subjectKey: string, year?: string) {
  return useMemo(() => {
    const prefix = subjectKey + "_";
    const tagMap: Record<string, number> = {};
    ALL_QUESTIONS
      .filter((q) => q.id.startsWith(prefix) && (!year || q.year === year))
      .forEach((q) => {
        q.tags.forEach((tag) => {
          tagMap[tag] = (tagMap[tag] || 0) + 1;
        });
      });
    return Object.entries(tagMap)
      .sort((a, b) => b[1] - a[1])
      .map(([tag, count]) => ({ tag, count }));
  }, [subjectKey, year]);
}

// ── Fisher-Yates shuffle ─────────────────────────────────
function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * 隨機抽題 hook（用於模擬考試）
 * 只在 count / subjectKeys / years 真正改變時才重新抽，避免每次 render 都 shuffle
 */
export function useRandomQuestions(
  count: number,
  subjectKeys?: string[],
  years?: string[]
) {
  const stableKey = [
    (subjectKeys ? [...subjectKeys].sort().join(",") : "all"),
    (years ? [...years].sort().join(",") : "all"),
    count,
  ].join("|");

  const cacheRef = useRef<{ key: string; result: Question[] } | null>(null);

  if (!cacheRef.current || cacheRef.current.key !== stableKey) {
    let pool = ALL_QUESTIONS;
    if (subjectKeys && subjectKeys.length > 0) {
      pool = pool.filter((q) =>
        subjectKeys.some((key) => q.id.startsWith(key + "_"))
      );
    }
    if (years && years.length > 0) {
      pool = pool.filter((q) => years.includes(q.year));
    }
    cacheRef.current = { key: stableKey, result: shuffleArray(pool).slice(0, count) };
  }

  return cacheRef.current.result;
}
