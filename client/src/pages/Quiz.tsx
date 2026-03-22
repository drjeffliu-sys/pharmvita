/*
 * Design: Clinical Pulse / Neo-Brutalism
 * - Question card with thick border
 * - Progress bar at top
 * - Streak counter with pulse animation
 * - 書籤功能 + 錯題模式 + 跳題
 */
import { useState, useMemo } from "react";
import { useParams, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Zap, CheckCircle2,
  ChevronRight, ChevronLeft, Shuffle, Bookmark, BookmarkCheck,
  XCircle, Hash, Calendar
} from "lucide-react";
import Navbar from "@/components/Navbar";
import QuestionCard from "@/components/QuestionCard";
import { useSubjectQuestions, useTagQuestions } from "@/hooks/useQuestionBank";
import { useStudyProgress } from "@/hooks/useStudyProgress";
import { SUBJECT_CONFIG, EXAM_YEARS } from "@/lib/types";
import type { Question } from "@/lib/types";

type FilterMode = "all" | "wrong" | "bookmarks" | "unanswered";

export default function Quiz() {
  const params = useParams<{ subjectKey: string; tag?: string }>();
  const { subjectKey, tag } = params;

  const [selectedYear, setSelectedYear] = useState<string | undefined>(undefined);
  const subjectQuestions = useSubjectQuestions(subjectKey || "pharm1", selectedYear);
  const tagQuestions = useTagQuestions(subjectKey || "pharm1", tag || "", selectedYear);

  const baseQuestions = tag ? tagQuestions : subjectQuestions;
  const subject = SUBJECT_CONFIG.find((s) => s.key === subjectKey);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffled, setShuffled] = useState(false);
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [showJump, setShowJump] = useState(false);

  const { progress, recordAnswer, toggleBookmark, isBookmarked } = useStudyProgress();

  // shuffled base
  const shuffledBase = useMemo(() => {
    if (!shuffled) return baseQuestions;
    const arr = [...baseQuestions];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [baseQuestions, shuffled]);

  // apply filter
  const displayQuestions = useMemo(() => {
    switch (filterMode) {
      case "wrong":
        return shuffledBase.filter((q) => q.id in progress.answered && !progress.correct[q.id]);
      case "bookmarks":
        return shuffledBase.filter((q) => progress.bookmarks.includes(q.id));
      case "unanswered":
        return shuffledBase.filter((q) => !(q.id in progress.answered));
      default:
        return shuffledBase;
    }
  }, [shuffledBase, filterMode, progress]);

  const currentQuestion = displayQuestions[currentIndex];

  const handleAnswer = (questionId: string, answer: string, correct: string) => {
    recordAnswer(questionId, answer, correct);
  };

  const handleNext = () => {
    if (currentIndex < displayQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleShuffle = () => {
    setShuffled(!shuffled);
    setCurrentIndex(0);
  };

  const handleFilterChange = (mode: FilterMode) => {
    setFilterMode(mode);
    setCurrentIndex(0);
    setShowJump(false);
  };

  const handleYearChange = (year: string | undefined) => {
    setSelectedYear(year);
    setCurrentIndex(0);
    setShowJump(false);
  };

  const answeredInSession = displayQuestions.filter((q) => q.id in progress.answered).length;
  const correctInSession = displayQuestions.filter((q) => progress.correct[q.id]).length;
  const wrongCount = displayQuestions.filter((q) => q.id in progress.answered && !progress.correct[q.id]).length;
  const bookmarkCount = displayQuestions.filter((q) => progress.bookmarks.includes(q.id)).length;

  if (!subject || baseQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-16 text-center">
          <p className="text-muted-foreground">找不到題目</p>
          <Link href="/subjects" className="text-emerald-600 underline mt-4 inline-block">
            返回科目列表
          </Link>
        </div>
      </div>
    );
  }

  const progressPct = ((currentIndex + 1) / displayQuestions.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Top Bar */}
      <div className="border-b-[2.5px] border-foreground bg-card">
        <div className="container py-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <Link
                href="/subjects"
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground no-underline"
              >
                <ArrowLeft className="w-4 h-4" />
                返回
              </Link>
              <div className="h-5 w-px bg-border" />
              <div>
                <h2 className="font-display text-sm font-bold" style={{ color: subject.color }}>
                  {subject.name}
                </h2>
                {tag && (
                  <span className="text-xs text-muted-foreground">
                    {decodeURIComponent(tag)}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Streak */}
              <div className="flex items-center gap-1.5">
                <Zap className={`w-4 h-4 ${progress.streak > 0 ? "text-amber-500" : "text-muted-foreground"}`} />
                <span className={`font-display text-sm font-bold ${progress.streak > 0 ? "text-amber-500" : "text-muted-foreground"}`}>
                  {progress.streak}
                </span>
              </div>

              {/* Stats */}
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                {correctInSession}/{answeredInSession}
              </div>

              {/* Jump button */}
              <button
                onClick={() => setShowJump(!showJump)}
                className={`p-2 rounded-lg border-[1.5px] transition-all ${
                  showJump
                    ? "bg-emerald-50 border-emerald-300 text-emerald-600"
                    : "border-foreground/10 text-muted-foreground hover:bg-muted"
                }`}
                title="跳題"
              >
                <Hash className="w-4 h-4" />
              </button>

              {/* Shuffle */}
              <button
                onClick={handleShuffle}
                className={`p-2 rounded-lg border-[1.5px] transition-all ${
                  shuffled
                    ? "bg-emerald-50 border-emerald-300 text-emerald-600"
                    : "border-foreground/10 text-muted-foreground hover:bg-muted"
                }`}
                title={shuffled ? "取消隨機" : "隨機排序"}
              >
                <Shuffle className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1">
            {[
              { mode: "all" as FilterMode, label: `全部 (${baseQuestions.length})` },
              { mode: "unanswered" as FilterMode, label: `未答 (${baseQuestions.filter(q => !(q.id in progress.answered)).length})` },
              { mode: "wrong" as FilterMode, label: `錯題 (${wrongCount})`, color: "text-red-600" },
              { mode: "bookmarks" as FilterMode, label: `書籤 (${bookmarkCount})`, color: "text-amber-600" },
            ].map(({ mode, label, color }) => (
              <button
                key={mode}
                onClick={() => handleFilterChange(mode)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border-[1.5px] transition-all ${
                  filterMode === mode
                    ? "bg-foreground text-background border-foreground"
                    : `bg-card border-foreground/10 hover:border-foreground/30 ${color || "text-muted-foreground"}`
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* 屆別篩選 */}
          <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-0.5">
            <Calendar className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
            <button
              onClick={() => handleYearChange(undefined)}
              className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-medium border-[1.5px] transition-all ${
                !selectedYear ? "bg-foreground text-background border-foreground" : "bg-card border-foreground/10 text-muted-foreground hover:border-foreground/30"
              }`}
            >
              全屆
            </button>
            {[...EXAM_YEARS].reverse().map((y) => (
              <button
                key={y}
                onClick={() => handleYearChange(y)}
                className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-medium border-[1.5px] transition-all ${
                  selectedYear === y ? "bg-foreground text-background border-foreground" : "bg-card border-foreground/10 text-muted-foreground hover:border-foreground/30"
                }`}
              >
                {y}
              </button>
            ))}
          </div>

          {/* Jump panel */}
          <AnimatePresence>
            {showJump && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mt-2"
              >
                <div className="flex flex-wrap gap-1 py-2">
                  {displayQuestions.map((q, i) => {
                    const isAnswered = q.id in progress.answered;
                    const isCorrectQ = progress.correct[q.id];
                    const isCurrent = i === currentIndex;
                    const isBookmarkedQ = progress.bookmarks.includes(q.id);
                    return (
                      <button
                        key={q.id}
                        onClick={() => { setCurrentIndex(i); setShowJump(false); }}
                        className={`w-8 h-8 rounded-md text-[10px] font-bold transition-all border relative ${
                          isCurrent
                            ? "bg-emerald-600 text-white border-emerald-700"
                            : isAnswered
                            ? isCorrectQ
                              ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                              : "bg-red-100 text-red-600 border-red-200"
                            : "bg-muted text-muted-foreground border-transparent"
                        }`}
                      >
                        {i + 1}
                        {isBookmarkedQ && (
                          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-amber-400 rounded-full" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Progress bar */}
          <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: subject.color }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      {/* Question Area */}
      <div className="container py-8">
        {displayQuestions.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg font-medium">此分類目前沒有題目</p>
            <button onClick={() => handleFilterChange("all")} className="mt-4 text-emerald-600 underline text-sm">
              回到全部題目
            </button>
          </div>
        ) : (
          <>
            <AnimatePresence mode="wait">
              {currentQuestion && (
                <QuestionCard
                  key={currentQuestion.id}
                  question={currentQuestion}
                  index={currentIndex}
                  total={displayQuestions.length}
                  onAnswer={handleAnswer}
                  onNext={handleNext}
                  previousAnswer={progress.answered[currentQuestion.id]}
                  isRevealed={currentQuestion.id in progress.answered}
                  bookmarked={isBookmarked(currentQuestion.id)}
                  onToggleBookmark={toggleBookmark}
                />
              )}
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-center gap-3 mt-8">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="btn-capsule flex items-center gap-1.5 px-4 py-2 bg-card text-foreground text-sm disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
                上一題
              </button>
              <span className="font-display text-sm font-medium text-muted-foreground px-3">
                {currentIndex + 1} / {displayQuestions.length}
              </span>
              <button
                onClick={handleNext}
                disabled={currentIndex >= displayQuestions.length - 1}
                className="btn-capsule flex items-center gap-1.5 px-4 py-2 bg-card text-foreground text-sm disabled:opacity-30"
              >
                下一題
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
