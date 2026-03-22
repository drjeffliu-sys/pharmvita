/*
 * Design: Clinical Pulse / Neo-Brutalism
 * - Exam setup → Exam taking → Comprehensive result report
 * - 考試狀態持久化：關閉後可繼續
 */
import { useState, useEffect, useMemo, useRef } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardCheck, Clock, Play, RotateCcw, CheckCircle2, XCircle,
  ArrowRight, Trophy, Target, Beaker, Microscope, Pill, Stethoscope,
  HeartPulse, Scale, ChevronDown, ChevronUp, BookOpen, Map,
  AlertTriangle, TrendingUp, Home as HomeIcon, RefreshCw
} from "lucide-react";
import Navbar from "@/components/Navbar";
import QuestionCard from "@/components/QuestionCard";
import EcgLine from "@/components/EcgLine";
import { useRandomQuestions } from "@/hooks/useQuestionBank";
import { SUBJECT_CONFIG, EXAM_YEARS } from "@/lib/types";
import type { Question } from "@/lib/types";

const EXAM_KEY = "pharmvita_exam_session";

const subjectIcons: Record<string, React.ReactNode> = {
  pharm1: <Beaker className="w-5 h-5" />,
  pharm2: <Microscope className="w-5 h-5" />,
  pharm3: <Pill className="w-5 h-5" />,
  pharm4: <Stethoscope className="w-5 h-5" />,
  pharm5: <HeartPulse className="w-5 h-5" />,
  pharm6: <Scale className="w-5 h-5" />,
};

type ExamPhase = "setup" | "exam" | "result";

interface SavedExam {
  phase: ExamPhase;
  selectedSubjects: string[];
  questionCount: number;
  timeLimit: number;
  examQuestions: Question[];
  answers: Record<string, string>;
  currentIndex: number;
  startTime: number;
  elapsed: number;
}

function loadSavedExam(): SavedExam | null {
  try {
    const raw = localStorage.getItem(EXAM_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as SavedExam;
    if (data.phase === "exam" && data.examQuestions?.length > 0) return data;
  } catch {}
  return null;
}

export default function MockExam() {
  const defaultSubjects = SUBJECT_CONFIG.map((s) => s.key);
  const saved = useMemo(() => loadSavedExam(), []);

  const [phase, setPhase] = useState<ExamPhase>(saved ? "exam" : "setup");
  const [showResumePrompt, setShowResumePrompt] = useState(!!saved);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(
    saved?.selectedSubjects || defaultSubjects
  );
  const [questionCount, setQuestionCount] = useState(saved?.questionCount || 50);
  const [selectedYears, setSelectedYears] = useState<string[]>([...EXAM_YEARS]);
  const [timeLimit, setTimeLimit] = useState(saved?.timeLimit ?? 90);
  const [examQuestions, setExamQuestions] = useState<Question[]>(saved?.examQuestions || []);
  const [currentIndex, setCurrentIndex] = useState(saved?.currentIndex || 0);
  const [answers, setAnswers] = useState<Record<string, string>>(saved?.answers || {});
  const [startTime, setStartTime] = useState(saved?.startTime || 0);
  const [elapsed, setElapsed] = useState(saved?.elapsed || 0);
  const [showWrongOnly, setShowWrongOnly] = useState(false);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  const randomQuestions = useRandomQuestions(questionCount, selectedSubjects, selectedYears);

  // 計時器
  useEffect(() => {
    if (phase !== "exam") return;
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [phase, startTime]);

  // Auto-submit on timeout
  useEffect(() => {
    if (phase === "exam" && timeLimit > 0 && elapsed >= timeLimit * 60) {
      setPhase("result");
      localStorage.removeItem(EXAM_KEY);
    }
  }, [phase, timeLimit, elapsed]);

  // 持久化考試狀態
  useEffect(() => {
    if (phase === "exam" && examQuestions.length > 0) {
      const data: SavedExam = {
        phase, selectedSubjects, questionCount, timeLimit,
        examQuestions, answers, currentIndex, startTime, elapsed,
      };
      localStorage.setItem(EXAM_KEY, JSON.stringify(data));
    } else if (phase !== "exam") {
      localStorage.removeItem(EXAM_KEY);
    }
  }, [phase, answers, currentIndex, elapsed]);

  const toggleSubject = (key: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const startExam = () => {
    const qs = randomQuestions;
    setExamQuestions(qs);
    setCurrentIndex(0);
    setAnswers({});
    const now = Date.now();
    setStartTime(now);
    setElapsed(0);
    setPhase("exam");
    setShowResumePrompt(false);
  };

  const resumeExam = () => {
    setShowResumePrompt(false);
  };

  const discardAndSetup = () => {
    localStorage.removeItem(EXAM_KEY);
    setPhase("setup");
    setExamQuestions([]);
    setAnswers({});
    setCurrentIndex(0);
    setShowResumePrompt(false);
  };

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleNext = () => {
    if (currentIndex < examQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const finishExam = () => {
    setPhase("result");
    localStorage.removeItem(EXAM_KEY);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const correctCount = examQuestions.filter((q) => answers[q.id] === q.answer).length;
  const totalAnswered = Object.keys(answers).length;
  const unanswered = examQuestions.length - totalAnswered;
  const wrongCount = totalAnswered - correctCount;
  const score = examQuestions.length > 0 ? Math.round((correctCount / examQuestions.length) * 100) : 0;

  const wrongQuestions = examQuestions.filter((q) => answers[q.id] && answers[q.id] !== q.answer);
  const unansweredQuestions = examQuestions.filter((q) => !answers[q.id]);

  const subjectBreakdown = useMemo(() => {
    if (examQuestions.length === 0) return [];
    const map: Record<string, { total: number; correct: number; wrong: number; unanswered: number; key: string }> = {};
    examQuestions.forEach((q) => {
      const key = q.id.split("_")[0];
      const subj = SUBJECT_CONFIG.find((s) => s.key === key);
      const name = subj?.name || key;
      if (!map[name]) map[name] = { total: 0, correct: 0, wrong: 0, unanswered: 0, key };
      map[name].total++;
      if (!answers[q.id]) map[name].unanswered++;
      else if (answers[q.id] === q.answer) map[name].correct++;
      else map[name].wrong++;
    });
    return Object.entries(map).map(([name, data]) => ({ name, ...data }));
  }, [examQuestions, answers]);

  const wrongTags = useMemo(() => {
    const tagMap: Record<string, { count: number; subjects: string[] }> = {};
    [...wrongQuestions, ...unansweredQuestions].forEach((q) => {
      q.tags.forEach((tag) => {
        if (!tagMap[tag]) tagMap[tag] = { count: 0, subjects: [] };
        tagMap[tag].count++;
        const sk = q.id.split("_")[0];
        if (!tagMap[tag].subjects.includes(sk)) tagMap[tag].subjects.push(sk);
      });
    });
    return Object.entries(tagMap).sort((a, b) => b[1].count - a[1].count);
  }, [wrongQuestions, unansweredQuestions]);

  // ========== RESUME PROMPT ==========
  if (showResumePrompt && saved) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-16 max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-brutal bg-card rounded-lg p-8 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-50 border-[2.5px] border-foreground shadow-[3px_3px_0px_rgba(0,0,0,0.9)] flex items-center justify-center mx-auto mb-5">
              <RefreshCw className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="font-display text-xl font-bold mb-2">發現未完成的考試</h2>
            <p className="text-muted-foreground text-sm mb-2">
              你上次有一場考試尚未完成
            </p>
            <div className="text-xs text-muted-foreground bg-muted rounded-lg px-4 py-2 mb-6">
              已作答 {Object.keys(saved.answers).length} / {saved.examQuestions.length} 題
              {saved.timeLimit > 0 && `・已用時 ${formatTime(saved.elapsed)}`}
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={resumeExam}
                className="btn-capsule w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white text-sm"
              >
                <Play className="w-4 h-4" />
                繼續作答
              </button>
              <button
                onClick={discardAndSetup}
                className="btn-capsule w-full flex items-center justify-center gap-2 py-3 bg-card text-foreground text-sm border"
              >
                <RotateCcw className="w-4 h-4" />
                放棄並重新開始
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // ========== SETUP ==========
  if (phase === "setup") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-8 md:py-12 max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-emerald-600 border-[2.5px] border-foreground shadow-[3px_3px_0px_rgba(0,0,0,0.9)] flex items-center justify-center">
              <ClipboardCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold">模擬考試</h1>
              <p className="text-sm text-muted-foreground">設定考試範圍與題數</p>
            </div>
          </div>

          <div className="card-brutal bg-card rounded-lg p-6 space-y-6">
            <div>
              <label className="font-display text-sm font-bold mb-3 block">選擇考試科目</label>
              <div className="grid grid-cols-2 gap-2">
                {SUBJECT_CONFIG.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => toggleSubject(s.key)}
                    className={`flex items-center gap-2 p-3 rounded-lg border-[2px] text-left text-sm transition-all ${
                      selectedSubjects.includes(s.key)
                        ? "border-foreground bg-emerald-50 shadow-[2px_2px_0px_rgba(0,0,0,0.9)]"
                        : "border-foreground/15 bg-card hover:border-foreground/30"
                    }`}
                  >
                    <span style={{ color: s.color }}>{subjectIcons[s.key]}</span>
                    <span className="font-medium">{s.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="font-display text-sm font-bold mb-3 block">題目數量</label>
              <div className="flex gap-2">
                {[20, 30, 50, 80].map((n) => (
                  <button
                    key={n}
                    onClick={() => setQuestionCount(n)}
                    className={`flex-1 py-2.5 rounded-full border-[2px] text-sm font-medium transition-all ${
                      questionCount === n
                        ? "bg-emerald-600 text-white border-foreground shadow-[2px_2px_0px_rgba(0,0,0,0.9)]"
                        : "bg-card border-foreground/15 hover:border-foreground/30"
                    }`}
                  >
                    {n} 題
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="font-display text-sm font-bold mb-3 block">作答時間</label>
              <div className="flex gap-2">
                {[30, 60, 90, 0].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTimeLimit(t)}
                    className={`flex-1 py-2.5 rounded-full border-[2px] text-sm font-medium transition-all ${
                      timeLimit === t
                        ? "bg-emerald-600 text-white border-foreground shadow-[2px_2px_0px_rgba(0,0,0,0.9)]"
                        : "bg-card border-foreground/15 hover:border-foreground/30"
                    }`}
                  >
                    {t === 0 ? "不限時" : `${t} 分鐘`}
                  </button>
                ))}
              </div>
            </div>


            <div>
              <label className="font-display text-sm font-bold mb-3 block">選擇屆別（可多選）</label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
                <button
                  onClick={() => setSelectedYears(selectedYears.length === EXAM_YEARS.length ? [] : [...EXAM_YEARS])}
                  className={`col-span-3 sm:col-span-4 flex items-center justify-center py-2 rounded-full border-[2px] text-sm font-medium transition-all ${
                    selectedYears.length === EXAM_YEARS.length
                      ? "bg-emerald-600 text-white border-foreground shadow-[2px_2px_0px_rgba(0,0,0,0.9)]"
                      : "bg-card border-foreground/15 hover:border-foreground/30"
                  }`}
                >
                  {selectedYears.length === EXAM_YEARS.length ? "✓ 全選" : "全選"}
                </button>
                {[...EXAM_YEARS].reverse().map((y) => (
                  <button
                    key={y}
                    onClick={() => setSelectedYears((prev) =>
                      prev.includes(y) ? prev.filter((k) => k !== y) : [...prev, y]
                    )}
                    className={`py-2 rounded-full border-[2px] text-xs font-medium transition-all ${
                      selectedYears.includes(y)
                        ? "bg-emerald-600 text-white border-foreground shadow-[2px_2px_0px_rgba(0,0,0,0.9)]"
                        : "bg-card border-foreground/15 hover:border-foreground/30"
                    }`}
                  >
                    {y}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">已選 {selectedYears.length} / {EXAM_YEARS.length} 屆</p>
            </div>

            <button
              onClick={startExam}
              disabled={selectedSubjects.length === 0 || selectedYears.length === 0}
              className="btn-capsule w-full flex items-center justify-center gap-2 py-3.5 bg-emerald-600 text-white text-base disabled:opacity-40"
            >
              <Play className="w-5 h-5" />
              開始考試
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ========== EXAM ==========
  if (phase === "exam") {
    const currentQuestion = examQuestions[currentIndex];
    const remaining = timeLimit > 0 ? timeLimit * 60 - elapsed : null;
    const isLowTime = remaining !== null && remaining < 300;

    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="border-b-[2.5px] border-foreground bg-card">
          <div className="container py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-display text-sm font-bold text-emerald-600">模擬考試</span>
                <span className="text-xs text-muted-foreground">
                  {totalAnswered}/{examQuestions.length} 已作答
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className={`flex items-center gap-1.5 ${isLowTime ? "text-red-500" : ""}`}>
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="font-mono text-sm font-medium">{formatTime(elapsed)}</span>
                  {timeLimit > 0 && (
                    <span className={`text-xs ${isLowTime ? "text-red-400" : "text-muted-foreground"}`}>
                      / {formatTime(timeLimit * 60)}
                    </span>
                  )}
                </div>
                <button onClick={finishExam} className="btn-capsule px-4 py-1.5 bg-red-500 text-white text-xs">
                  交卷
                </button>
              </div>
            </div>
            {/* Question number pills */}
            <div className="mt-3 flex gap-1 flex-wrap">
              {examQuestions.map((q, i) => {
                const isAnswered = q.id in answers;
                const isCurrent = i === currentIndex;
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(i)}
                    className={`w-7 h-7 rounded-md text-[10px] font-bold transition-all border ${
                      isCurrent
                        ? "bg-emerald-600 text-white border-emerald-700 shadow-sm"
                        : isAnswered
                        ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                        : "bg-muted text-muted-foreground border-transparent"
                    }`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="container py-8">
          {currentQuestion && (
            <QuestionCard
              key={currentQuestion.id}
              question={currentQuestion}
              index={currentIndex}
              total={examQuestions.length}
              onAnswer={(qId, ans, correct) => handleAnswer(qId, ans)}
              onNext={handleNext}
              previousAnswer={answers[currentQuestion.id]}
              isRevealed={currentQuestion.id in answers}
            />
          )}
        </div>
      </div>
    );
  }

  // ========== RESULT ==========
  const displayWrongList = showWrongOnly
    ? wrongQuestions
    : [...wrongQuestions, ...unansweredQuestions];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container py-8 md:py-12">
        {/* Score Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-brutal bg-card rounded-lg p-8 mb-6"
        >
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Score Circle */}
            <div className="relative flex-shrink-0">
              <svg width="160" height="160" viewBox="0 0 160 160">
                <circle cx="80" cy="80" r="70" fill="none" stroke="#e5e7eb" strokeWidth="10" />
                <circle
                  cx="80" cy="80" r="70"
                  fill="none"
                  stroke={score >= 60 ? "#059669" : "#ef4444"}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${(score / 100) * 440} 440`}
                  transform="rotate(-90 80 80)"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display text-4xl font-black" style={{ color: score >= 60 ? "#059669" : "#ef4444" }}>
                  {score}
                </span>
                <span className="text-xs text-muted-foreground font-medium">分</span>
              </div>
            </div>

            {/* Summary */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                <Trophy className={`w-6 h-6 ${score >= 60 ? "text-emerald-600" : "text-red-500"}`} />
                <h1 className="font-display text-2xl font-bold">
                  {score >= 60 ? "恭喜通過！" : "繼續加油！"}
                </h1>
              </div>
              <p className="text-muted-foreground text-sm mb-4">
                作答時間 {formatTime(elapsed)}，共 {examQuestions.length} 題
              </p>

              <div className="grid grid-cols-4 gap-3">
                <div className="text-center p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                  <div className="font-display text-2xl font-bold text-emerald-600">{correctCount}</div>
                  <div className="text-[10px] text-emerald-700 font-medium">答對</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-red-50 border border-red-200">
                  <div className="font-display text-2xl font-bold text-red-500">{wrongCount}</div>
                  <div className="text-[10px] text-red-600 font-medium">答錯</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-amber-50 border border-amber-200">
                  <div className="font-display text-2xl font-bold text-amber-600">{unanswered}</div>
                  <div className="text-[10px] text-amber-700 font-medium">未答</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="font-display text-2xl font-bold text-blue-600">{totalAnswered}</div>
                  <div className="text-[10px] text-blue-700 font-medium">已答</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-6">
            {/* Subject Breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card-brutal bg-card rounded-lg p-5"
            >
              <h2 className="font-display text-base font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                各科表現
              </h2>
              <div className="space-y-3">
                {subjectBreakdown.map((s) => {
                  const subj = SUBJECT_CONFIG.find((c) => c.key === s.key);
                  const pct = s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0;
                  return (
                    <div key={s.name} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span style={{ color: subj?.color }}>{subjectIcons[s.key]}</span>
                          <span className="text-xs font-bold">{s.name}</span>
                        </div>
                        <span className="text-xs font-mono font-bold" style={{ color: pct >= 60 ? "#059669" : "#ef4444" }}>
                          {s.correct}/{s.total} ({pct}%)
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, backgroundColor: subj?.color || "#059669" }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Weak Knowledge Points */}
            {wrongTags.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="card-brutal bg-amber-50 border-amber-300 rounded-lg p-5"
              >
                <h2 className="font-display text-base font-bold mb-3 flex items-center gap-2 text-amber-800">
                  <Map className="w-4 h-4" />
                  需加強的知識點
                </h2>
                <p className="text-xs text-amber-700 mb-3">
                  以下知識點在本次考試中出現錯誤，點擊可前往深入學習
                </p>
                <div className="space-y-1.5">
                  {wrongTags.slice(0, 10).map(([tag, info]) => {
                    const subj = SUBJECT_CONFIG.find((s) => s.key === info.subjects[0]);
                    return (
                      <Link
                        key={tag}
                        href={`/knowledge/${encodeURIComponent(tag)}`}
                        className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-amber-200 no-underline hover:bg-amber-50 transition-colors group"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded flex items-center justify-center" style={{ color: subj?.color }}>
                            {subjectIcons[info.subjects[0]]}
                          </span>
                          <span className="text-xs font-medium text-foreground">{tag}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded">
                            {info.count} 題錯誤
                          </span>
                          <ArrowRight className="w-3 h-3 text-amber-400 group-hover:text-amber-600 transition-colors" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  setPhase("setup");
                  setExamQuestions([]);
                  setAnswers({});
                  setExpandedQuestion(null);
                }}
                className="btn-capsule w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white text-sm"
              >
                <RotateCcw className="w-4 h-4" />
                再考一次
              </button>
              <Link
                href="/"
                className="btn-capsule w-full flex items-center justify-center gap-2 py-3 bg-card text-foreground text-sm no-underline"
              >
                <HomeIcon className="w-4 h-4" />
                回到首頁
              </Link>
            </div>
          </div>

          {/* Right Column: Wrong Questions Review */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="lg:col-span-2"
          >
            <div className="card-brutal bg-card rounded-lg p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-base font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  錯題與未答題檢討
                  <span className="text-xs font-normal text-muted-foreground ml-1">
                    ({wrongQuestions.length + unansweredQuestions.length} 題)
                  </span>
                </h2>
                {unansweredQuestions.length > 0 && (
                  <button
                    onClick={() => setShowWrongOnly(!showWrongOnly)}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded border border-foreground/10"
                  >
                    {showWrongOnly ? "顯示全部" : "僅顯示答錯"}
                  </button>
                )}
              </div>

              {displayWrongList.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                  <p className="font-display text-lg font-bold text-emerald-600">全部答對！</p>
                  <p className="text-sm text-muted-foreground mt-1">表現非常出色</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto pr-1">
                  {displayWrongList.map((q) => {
                    const userAnswer = answers[q.id];
                    const isWrong = userAnswer && userAnswer !== q.answer;
                    const isUnanswered = !userAnswer;
                    const isExpanded = expandedQuestion === q.id;
                    const subjectKey = q.id.split("_")[0];
                    const subj = SUBJECT_CONFIG.find((s) => s.key === subjectKey);

                    return (
                      <div
                        key={q.id}
                        className={`rounded-lg border-[2px] overflow-hidden transition-all ${
                          isUnanswered
                            ? "border-amber-300 bg-amber-50/50"
                            : "border-red-300 bg-red-50/50"
                        }`}
                      >
                        <button
                          onClick={() => setExpandedQuestion(isExpanded ? null : q.id)}
                          className="w-full flex items-start gap-3 p-4 text-left hover:bg-black/[0.02] transition-colors"
                        >
                          <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                            isUnanswered ? "bg-amber-500" : "bg-red-500"
                          }`}>
                            {q.number}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground line-clamp-2">
                              {q.question}
                            </p>
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                              <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: subj?.color + "15", color: subj?.color }}>
                                {subj?.name}
                              </span>
                              {q.tags.map((tag) => (
                                <Link
                                  key={tag}
                                  href={`/knowledge/${encodeURIComponent(tag)}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 no-underline hover:bg-emerald-100 transition-colors"
                                >
                                  {tag}
                                </Link>
                              ))}
                              {isUnanswered && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-medium">
                                  未作答
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex-shrink-0 mt-1">
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            )}
                          </div>
                        </button>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="px-4 pb-4 border-t border-foreground/10 pt-3">
                                <p className="text-sm text-foreground mb-3 whitespace-pre-line leading-relaxed">
                                  {q.question}
                                </p>
                                <div className="space-y-2 mb-3">
                                  {Object.entries(q.options).sort(([a], [b]) => a.localeCompare(b)).map(([key, text]) => {
                                    const isCorrectOption = key === q.answer;
                                    const isUserChoice = key === userAnswer;
                                    let bg = "bg-white border-foreground/10";
                                    if (isCorrectOption) bg = "bg-emerald-50 border-emerald-400";
                                    if (isUserChoice && !isCorrectOption) bg = "bg-red-50 border-red-400";
                                    return (
                                      <div key={key} className={`flex items-start gap-2 p-2.5 rounded-lg border ${bg}`}>
                                        <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                          isCorrectOption ? "bg-emerald-600 text-white"
                                            : isUserChoice ? "bg-red-500 text-white"
                                            : "bg-muted text-muted-foreground"
                                        }`}>
                                          {key}
                                        </span>
                                        <span className="text-xs leading-relaxed flex-1">{text}</span>
                                        {isCorrectOption && <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
                                        {isUserChoice && !isCorrectOption && <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />}
                                      </div>
                                    );
                                  })}
                                </div>
                                <div className="flex items-center gap-3 text-xs p-2.5 rounded-lg bg-muted/50">
                                  <span className="text-muted-foreground">
                                    你的答案：<span className={`font-bold ${isWrong ? "text-red-500" : "text-amber-600"}`}>{userAnswer || "未作答"}</span>
                                  </span>
                                  <span className="text-muted-foreground">
                                    正確答案：<span className="font-bold text-emerald-600">{q.answer}</span>
                                  </span>
                                </div>
                                {q.detailed_explanation?.concept_analysis && (
                                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <p className="text-[10px] font-bold text-blue-700 mb-1">觀念解析</p>
                                    <p className="text-xs text-blue-800 leading-relaxed whitespace-pre-line">{q.detailed_explanation.concept_analysis}</p>
                                  </div>
                                )}
                                <div className="mt-3 flex items-center gap-2 flex-wrap">
                                  <span className="text-[10px] text-muted-foreground">前往知識點：</span>
                                  {q.tags.map((tag) => (
                                    <Link
                                      key={tag}
                                      href={`/knowledge/${encodeURIComponent(tag)}`}
                                      className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 no-underline hover:bg-emerald-100 transition-colors"
                                    >
                                      <Map className="w-3 h-3" />
                                      {tag}
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
