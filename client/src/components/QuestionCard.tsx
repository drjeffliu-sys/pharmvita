/*
 * QuestionCard — 支援：
 *   - 題目圖片（images 陣列）
 *   - 解析摺疊（預設收合）
 *   - detailed_explanation 四區塊（正確答案、觀念解析、錯誤選項分析、考試重點）
 *   - 書籤功能
 *   - 屆別標籤
 */
import { useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, XCircle, ChevronRight, Map, Bookmark,
  BookmarkCheck, ChevronDown, ChevronUp, Lightbulb,
  AlertTriangle, Target, BookOpen
} from "lucide-react";
import type { Question } from "@/lib/types";
import { useExplanationLimit, FREE_DAILY_LIMIT } from "@/hooks/useExplanationLimit";
import { Link as WouterLink } from "wouter";

interface QuestionCardProps {
  question: Question;
  index: number;
  total: number;
  onAnswer: (questionId: string, answer: string, correct: string) => void;
  onNext: () => void;
  previousAnswer?: string;
  isRevealed?: boolean;
  bookmarked?: boolean;
  onToggleBookmark?: (questionId: string) => void;
}

export default function QuestionCard({
  question,
  index,
  total,
  onAnswer,
  onNext,
  previousAnswer,
  isRevealed: initialRevealed = false,
  bookmarked = false,
  onToggleBookmark,
}: QuestionCardProps) {
  const { canViewExplanation, remaining, recordView } = useExplanationLimit();
  const [selected, setSelected] = useState<string | null>(previousAnswer || null);
  const [revealed, setRevealed] = useState(initialRevealed);
  const [showExplanation, setShowExplanation] = useState(false);
  const [explanationTab, setExplanationTab] = useState<"concept" | "wrong" | "focus">("concept");

  const handleSelect = (option: string) => {
    if (revealed) return;
    setSelected(option);
    setRevealed(true);
    onAnswer(question.id, option, question.answer);
  };

  const isCorrect = selected === question.answer;
  const optionKeys = Object.keys(question.options).sort();
  const de = question.detailed_explanation;
  const hasDetailedExplanation = de && (de.concept_analysis || de.wrong_options_analysis || de.exam_focus);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-3xl mx-auto"
    >
      {/* 題目 Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-600 text-white font-display font-bold text-sm border-[2px] border-foreground shadow-[2px_2px_0px_rgba(0,0,0,0.9)]">
            {index + 1}
          </span>
          <span className="text-sm text-muted-foreground font-medium">/ {total}</span>
          {/* 屆別標籤 */}
          {question.year && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
              {question.year}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* 書籤 */}
          {onToggleBookmark && (
            <button
              onClick={() => onToggleBookmark(question.id)}
              className={`p-1.5 rounded-lg border-[1.5px] transition-all ${
                bookmarked
                  ? "bg-amber-50 border-amber-400 text-amber-500"
                  : "border-foreground/10 text-muted-foreground hover:bg-muted"
              }`}
              title={bookmarked ? "取消書籤" : "加入書籤"}
            >
              {bookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            </button>
          )}
          {/* 知識點 tags */}
          {question.tags.map((tag) => (
            <Link
              key={tag}
              href={`/knowledge/${encodeURIComponent(tag)}`}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 no-underline hover:bg-emerald-100 hover:border-emerald-300 transition-colors"
            >
              <Map className="w-3 h-3" />
              {tag}
            </Link>
          ))}
        </div>
      </div>

      {/* 題目 Body */}
      <div className="card-brutal bg-card rounded-lg p-6 mb-4">
        <p className="text-base leading-relaxed font-medium text-card-foreground whitespace-pre-line">
          {question.question}
        </p>
        {/* 題目圖片 */}
        {question.images && question.images.length > 0 && (
          <div className="mt-4 space-y-3">
            {question.images.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`題目圖片 ${i + 1}`}
                className="max-w-full rounded-lg border border-foreground/10 mx-auto block"
                loading="lazy"
              />
            ))}
          </div>
        )}
      </div>

      {/* 選項 */}
      <div className="space-y-3">
        {optionKeys.map((key) => {
          const isSelected = selected === key;
          const isAnswer = question.answer === key;
          let optionStyle =
            "bg-card border-foreground/20 hover:border-foreground/50 hover:shadow-[3px_3px_0px_rgba(0,0,0,0.15)]";

          if (revealed) {
            if (isAnswer) {
              optionStyle = "bg-emerald-50 border-emerald-600 shadow-[3px_3px_0px_rgba(5,150,105,0.4)]";
            } else if (isSelected && !isAnswer) {
              optionStyle = "bg-red-50 border-red-500 shadow-[3px_3px_0px_rgba(239,68,68,0.3)]";
            } else {
              optionStyle = "bg-card border-foreground/10 opacity-60";
            }
          }

          return (
            <motion.button
              key={key}
              whileTap={!revealed ? { scale: 0.98 } : {}}
              onClick={() => handleSelect(key)}
              disabled={revealed}
              className={`w-full flex items-start gap-3 p-4 rounded-lg border-[2px] text-left transition-all ${optionStyle}`}
            >
              <span
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-display font-bold text-sm border-[2px] ${
                  revealed && isAnswer
                    ? "bg-emerald-600 text-white border-emerald-700"
                    : revealed && isSelected
                    ? "bg-red-500 text-white border-red-600"
                    : "bg-muted text-foreground border-foreground/20"
                }`}
              >
                {key}
              </span>
              <span className="flex-1 text-sm leading-relaxed pt-1">
                {question.options[key]}
              </span>
              {revealed && isAnswer && <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-1" />}
              {revealed && isSelected && !isAnswer && <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-1" />}
            </motion.button>
          );
        })}
      </div>

      {/* 答題後回饋 */}
      {revealed && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-5"
        >
          {/* 答對/錯 + 下一題 */}
          <div className="flex items-center justify-between mb-3">
            <div className={`flex items-center gap-2 text-sm font-semibold ${isCorrect ? "text-emerald-600" : "text-red-500"}`}>
              {isCorrect ? (
                <><CheckCircle2 className="w-5 h-5" />答對了！</>
              ) : (
                <><XCircle className="w-5 h-5" />正確答案是 {question.answer}</>
              )}
            </div>
            <button
              onClick={() => {
                setSelected(null);
                setRevealed(false);
                setShowExplanation(false);
                onNext();
              }}
              className="btn-capsule flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 text-white text-sm"
            >
              下一題
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* 解析區塊 */}
          {hasDetailedExplanation && (
            <div className="mb-3">
              <button
                onClick={() => setShowExplanation(!showExplanation)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-muted/60 border border-foreground/10 hover:bg-muted transition-colors text-sm font-medium"
              >
                <span className="flex items-center gap-2 text-foreground/70">
                  <BookOpen className="w-4 h-4" />
                  查看詳解
                </span>
                {canViewExplanation || showExplanation ? (
                  showExplanation
                    ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    : <ChevronDown className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <WouterLink href="/pricing" onClick={(e) => e.stopPropagation()}
                    className="text-[11px] text-amber-600 font-semibold no-underline hover:underline flex-shrink-0">
                    升級無限 →
                  </WouterLink>
                )}
              </button>

              <AnimatePresence>
                {showExplanation && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-white border border-foreground/10 border-t-0 rounded-b-lg">
                      {/* 分頁 Tab */}
                      <div className="flex border-b border-foreground/10">
                        {[
                          { key: "concept", label: "觀念解析", icon: <Lightbulb className="w-3.5 h-3.5" />, color: "text-blue-600" },
                          { key: "wrong", label: "錯誤選項", icon: <AlertTriangle className="w-3.5 h-3.5" />, color: "text-red-500" },
                          { key: "focus", label: "考試重點", icon: <Target className="w-3.5 h-3.5" />, color: "text-emerald-600" },
                        ].map(({ key, label, icon, color }) => (
                          <button
                            key={key}
                            onClick={() => setExplanationTab(key as typeof explanationTab)}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors border-b-2 ${
                              explanationTab === key
                                ? `${color} border-current`
                                : "text-muted-foreground border-transparent hover:text-foreground"
                            }`}
                          >
                            {icon}
                            {label}
                          </button>
                        ))}
                      </div>

                      <div className="p-4">
                        {explanationTab === "concept" && (
                          <div>
                            {de.correct_answer && (
                              <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg">
                                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                                正確答案：{de.correct_answer}
                              </div>
                            )}
                            <p className="text-sm leading-relaxed text-foreground whitespace-pre-line">
                              {de.concept_analysis || "（暫無觀念解析）"}
                            </p>
                          </div>
                        )}
                        {explanationTab === "wrong" && (
                          <p className="text-sm leading-relaxed text-foreground whitespace-pre-line">
                            {de.wrong_options_analysis || "（暫無錯誤選項分析）"}
                          </p>
                        )}
                        {explanationTab === "focus" && (
                          <p className="text-sm leading-relaxed text-foreground whitespace-pre-line">
                            {de.exam_focus || "（暫無考試重點）"}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* 答錯時的知識點連結 */}
          {!isCorrect && question.tags.length > 0 && (
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
              <p className="text-[11px] text-amber-700 mb-2 font-medium">前往相關知識點加強學習：</p>
              <div className="flex flex-wrap gap-1.5">
                {question.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/knowledge/${encodeURIComponent(tag)}`}
                    className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-white text-amber-800 border border-amber-300 no-underline hover:bg-amber-100 transition-colors"
                  >
                    <Map className="w-3 h-3" />
                    {tag}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
