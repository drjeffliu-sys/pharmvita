/*
 * Design: Clinical Pulse / Neo-Brutalism
 * Knowledge node detail page — 大補帖整合版
 * - 上方：大補帖六大區塊（concept, mechanism, drugList, comparison, pitfalls, examFocus）
 * - 下方：相關題目（可展開查看選項與答案）
 */
import { useState, useMemo } from "react";
import { useParams, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, BookOpen, Play, ChevronDown, ChevronUp,
  CheckCircle2, XCircle, Beaker, Microscope, Pill, Stethoscope,
  HeartPulse, Scale, Tag, Lightbulb, AlertTriangle, Target,
  FlaskConical, GitBranch, List
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { useQuestionBank } from "@/hooks/useQuestionBank";
import { useExplanationLimit, FREE_DAILY_LIMIT } from "@/hooks/useExplanationLimit";
import { useStudyProgress } from "@/hooks/useStudyProgress";
import { SUBJECT_CONFIG } from "@/lib/types";
import type { Question } from "@/lib/types";
import knowledgeBaseData from "@/data/knowledge-base.json";

// ── 型別定義 ──────────────────────────────────────────────
interface KBNode {
  id: string;
  name: string;
  nameTw: string;
  tags: string[];
  concept?: string;
  mechanism?: { type: string; desc: string }[];
  drugList?: { drug: string; category: string; use: string }[];
  comparison?: { headers: string[]; rows: string[][] };
  pitfalls?: string[];
  examFocus?: string[];
}
interface KBDomain {
  id: string;
  name: string;
  nameTw: string;
  nodes: KBNode[];
}

const knowledgeBase = knowledgeBaseData as { domains: KBDomain[] };

const subjectIcons: Record<string, React.ReactNode> = {
  pharm1: <Beaker className="w-5 h-5" />,
  pharm2: <Microscope className="w-5 h-5" />,
  pharm3: <Pill className="w-5 h-5" />,
  pharm4: <Stethoscope className="w-5 h-5" />,
  pharm5: <HeartPulse className="w-5 h-5" />,
  pharm6: <Scale className="w-5 h-5" />,
};

// ── 大補帖區塊元件 ────────────────────────────────────────
function SectionCard({
  icon,
  title,
  color,
  children,
  defaultOpen = true,
}: {
  icon: React.ReactNode;
  title: string;
  color: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="card-brutal bg-card rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-muted/20 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
            style={{ backgroundColor: color }}
          >
            {icon}
          </div>
          <span className="font-display text-sm font-bold">{title}</span>
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-foreground/10 pt-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── 主頁面 ────────────────────────────────────────────────
export default function KnowledgeDetail() {
  const params = useParams<{ tag: string }>();
  const tag = decodeURIComponent(params.tag || "");
  const bank = useQuestionBank();
  const { canViewExplanation, recordView } = useExplanationLimit();
  const { progress } = useStudyProgress();
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [filterSubject, setFilterSubject] = useState<string | null>(null);

  // 找對應的大補帖節點（tags 包含此 tag 的節點）
  const kbNode = useMemo<KBNode | null>(() => {
    for (const domain of knowledgeBase.domains) {
      const found = domain.nodes.find((n) => n.tags.includes(tag));
      if (found) return found;
    }
    return null;
  }, [tag]);

  // 題庫題目
  const tagQuestions = useMemo(
    () => bank.questions.filter((q) => q.tags.includes(tag)),
    [tag, bank.questions]
  );

  const subjectGroups = useMemo(() => {
    const groups: Record<string, Question[]> = {};
    tagQuestions.forEach((q) => {
      const key = q.id.split("_")[0];
      if (!groups[key]) groups[key] = [];
      groups[key].push(q);
    });
    return groups;
  }, [tagQuestions]);

  const availableSubjects = Object.keys(subjectGroups);

  const displayQuestions = filterSubject
    ? tagQuestions.filter((q) => q.id.startsWith(filterSubject + "_"))
    : tagQuestions;

  const answeredCount = displayQuestions.filter((q) => q.id in progress.answered).length;
  const correctCount = displayQuestions.filter((q) => progress.correct[q.id]).length;
  const accuracy = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;

  const relatedTags = useMemo(() => {
    const tagMap: Record<string, number> = {};
    tagQuestions.forEach((q) => {
      q.tags.forEach((t) => {
        if (t !== tag) tagMap[t] = (tagMap[t] || 0) + 1;
      });
    });
    return Object.entries(tagMap).sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [tagQuestions, tag]);

  if (!tag || tagQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-16 text-center">
          <p className="text-muted-foreground">找不到此知識點</p>
          <Link href="/knowledge" className="text-emerald-600 underline mt-4 inline-block">
            返回知識分類
          </Link>
        </div>
      </div>
    );
  }

  const primarySubjectKey = availableSubjects[0];
  const primarySubject = SUBJECT_CONFIG.find((s) => s.key === primarySubjectKey);
  const primaryColor = primarySubject?.color || "#059669";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <div className="border-b-[2.5px] border-foreground bg-card">
        <div className="container py-5">
          <div className="flex items-center gap-2 mb-3">
            <Link
              href="/knowledge"
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground no-underline"
            >
              <ArrowLeft className="w-4 h-4" />
              知識分類
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-sm font-medium text-foreground">{tag}</span>
          </div>

          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center border-[2.5px] border-foreground shadow-[3px_3px_0px_rgba(0,0,0,0.9)]"
                style={{ backgroundColor: primaryColor, color: "white" }}
              >
                <Tag className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-display text-xl font-bold">{tag}</h1>
                {kbNode && (
                  <p className="text-xs text-muted-foreground mt-0.5">{kbNode.nameTw}</p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  {availableSubjects.map((sk) => {
                    const s = SUBJECT_CONFIG.find((c) => c.key === sk);
                    return s ? (
                      <span
                        key={sk}
                        className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                        style={{ backgroundColor: s.color + "15", color: s.color }}
                      >
                        {s.name}
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
            </div>
            <Link
              href={`/quiz/${primarySubjectKey}/${encodeURIComponent(tag)}`}
              className="btn-capsule flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white text-sm no-underline flex-shrink-0"
            >
              <Play className="w-4 h-4" />
              開始練習
            </Link>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* ── 左側欄 ── */}
          <div className="lg:col-span-1 space-y-5">
            {/* 學習統計 */}
            <div className="card-brutal bg-card rounded-lg p-5">
              <h3 className="font-display text-sm font-bold mb-3">學習統計</h3>
              <div className="space-y-2.5">
                {[
                  { label: "總題數", value: tagQuestions.length, color: "text-foreground" },
                  { label: "已作答", value: answeredCount, color: "text-blue-600" },
                  { label: "答對", value: correctCount, color: "text-emerald-600" },
                  { label: "正確率", value: `${accuracy}%`, color: accuracy >= 60 ? "text-emerald-600" : "text-red-500" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{label}</span>
                    <span className={`font-display text-base font-bold ${color}`}>{value}</span>
                  </div>
                ))}
                <div className="h-2 bg-muted rounded-full overflow-hidden mt-1">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${tagQuestions.length > 0 ? (answeredCount / tagQuestions.length) * 100 : 0}%`,
                      backgroundColor: primaryColor,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* 相關知識點 */}
            {relatedTags.length > 0 && (
              <div className="card-brutal bg-card rounded-lg p-5">
                <h3 className="font-display text-sm font-bold mb-3">相關知識點</h3>
                <div className="flex flex-wrap gap-1.5">
                  {relatedTags.map(([relTag, count]) => (
                    <Link
                      key={relTag}
                      href={`/knowledge/${encodeURIComponent(relTag)}`}
                      className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-muted text-foreground no-underline hover:bg-emerald-50 hover:text-emerald-700 transition-colors border border-foreground/5"
                    >
                      {relTag}
                      <span className="text-muted-foreground">({count})</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* 科目篩選 */}
            {availableSubjects.length > 1 && (
              <div className="card-brutal bg-card rounded-lg p-5">
                <h3 className="font-display text-sm font-bold mb-3">篩選科目</h3>
                <div className="space-y-1.5">
                  <button
                    onClick={() => setFilterSubject(null)}
                    className={`w-full text-left text-xs px-3 py-2 rounded-lg transition-all ${
                      !filterSubject ? "bg-foreground text-background font-bold" : "hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    全部 ({tagQuestions.length})
                  </button>
                  {availableSubjects.map((sk) => {
                    const s = SUBJECT_CONFIG.find((c) => c.key === sk);
                    return (
                      <button
                        key={sk}
                        onClick={() => setFilterSubject(sk)}
                        className={`w-full flex items-center gap-2 text-left text-xs px-3 py-2 rounded-lg transition-all ${
                          filterSubject === sk ? "bg-foreground text-background font-bold" : "hover:bg-muted text-muted-foreground"
                        }`}
                      >
                        <span style={{ color: filterSubject === sk ? "inherit" : s?.color }}>
                          {subjectIcons[sk]}
                        </span>
                        {s?.name} ({subjectGroups[sk]?.length || 0})
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ── 主內容欄 ── */}
          <div className="lg:col-span-3 space-y-5">

            {/* ══ 大補帖內容 ══ */}
            {kbNode && (
              <>
                {/* 核心概念 */}
                {kbNode.concept && (
                  <SectionCard
                    icon={<Lightbulb className="w-4 h-4" />}
                    title="核心概念"
                    color={primaryColor}
                  >
                    <p className="text-sm leading-relaxed text-foreground">{kbNode.concept}</p>
                  </SectionCard>
                )}

                {/* 作用機制 */}
                {kbNode.mechanism && kbNode.mechanism.length > 0 && (
                  <SectionCard
                    icon={<GitBranch className="w-4 h-4" />}
                    title="作用機制"
                    color="#0891b2"
                  >
                    <div className="space-y-2.5">
                      {kbNode.mechanism.map((m, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-blue-50/60 border border-blue-100 rounded-lg">
                          <span className="flex-shrink-0 text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full mt-0.5">
                            {m.type}
                          </span>
                          <span className="text-sm text-blue-900 leading-relaxed">{m.desc}</span>
                        </div>
                      ))}
                    </div>
                  </SectionCard>
                )}

                {/* 代表藥物 */}
                {kbNode.drugList && kbNode.drugList.length > 0 && (
                  <SectionCard
                    icon={<FlaskConical className="w-4 h-4" />}
                    title={`代表藥物（${kbNode.drugList.length} 種）`}
                    color="#7c3aed"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {kbNode.drugList.map((d, i) => (
                        <div key={i} className="p-3 bg-violet-50/60 border border-violet-100 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-display text-sm font-bold text-violet-900">{d.drug}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-100 text-violet-700 font-medium">
                              {d.category}
                            </span>
                          </div>
                          <p className="text-xs text-violet-700 leading-relaxed">{d.use}</p>
                        </div>
                      ))}
                    </div>
                  </SectionCard>
                )}

                {/* 比較表 */}
                {kbNode.comparison && kbNode.comparison.rows.length > 0 && (
                  <SectionCard
                    icon={<List className="w-4 h-4" />}
                    title="比較表"
                    color="#d97706"
                  >
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs border-collapse">
                        <thead>
                          <tr className="bg-amber-50">
                            {kbNode.comparison.headers.map((h, i) => (
                              <th
                                key={i}
                                className="text-left px-3 py-2 font-bold text-amber-800 border border-amber-200 whitespace-nowrap"
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {kbNode.comparison.rows.map((row, ri) => (
                            <tr key={ri} className={ri % 2 === 0 ? "bg-white" : "bg-amber-50/30"}>
                              {row.map((cell, ci) => (
                                <td
                                  key={ci}
                                  className={`px-3 py-2 border border-amber-100 leading-relaxed ${
                                    ci === 0 ? "font-semibold text-foreground" : "text-muted-foreground"
                                  }`}
                                >
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </SectionCard>
                )}

                {/* 常考陷阱 */}
                {kbNode.pitfalls && kbNode.pitfalls.length > 0 && (
                  <SectionCard
                    icon={<AlertTriangle className="w-4 h-4" />}
                    title="常考陷阱 ⚠️"
                    color="#ef4444"
                  >
                    <ul className="space-y-2">
                      {kbNode.pitfalls.map((p, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-red-100 text-red-600 text-[10px] font-bold flex items-center justify-center mt-0.5">
                            {i + 1}
                          </span>
                          <span className="text-sm text-foreground leading-relaxed">{p}</span>
                        </li>
                      ))}
                    </ul>
                  </SectionCard>
                )}

                {/* 考試重點 */}
                {kbNode.examFocus && kbNode.examFocus.length > 0 && (
                  <SectionCard
                    icon={<Target className="w-4 h-4" />}
                    title="考試重點"
                    color="#059669"
                  >
                    <ul className="space-y-2">
                      {kbNode.examFocus.map((f, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <CheckCircle2 className="flex-shrink-0 w-4 h-4 text-emerald-500 mt-0.5" />
                          <span className="text-sm text-foreground leading-relaxed">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </SectionCard>
                )}

                <div className="border-t-[2px] border-dashed border-foreground/15 my-2" />
              </>
            )}

            {/* ══ 相關題目 ══ */}
            <div>
              <h2 className="font-display text-base font-bold flex items-center gap-2 mb-4">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                相關題目
                <span className="text-xs font-normal text-muted-foreground">
                  ({displayQuestions.length} 題)
                </span>
              </h2>

              <div className="space-y-3">
                {displayQuestions.map((q, i) => {
                  const isExpanded = expandedQuestion === q.id;
                  const subjectKey = q.id.split("_")[0];
                  const subj = SUBJECT_CONFIG.find((s) => s.key === subjectKey);
                  const userAnswer = progress.answered[q.id];
                  const isAnswered = !!userAnswer;
                  const isCorrect = progress.correct[q.id];

                  return (
                    <motion.div
                      key={q.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(i * 0.03, 0.3) }}
                      className={`card-brutal bg-card rounded-lg overflow-hidden ${
                        isAnswered ? (isCorrect ? "border-emerald-200" : "border-red-200") : ""
                      }`}
                    >
                      <button
                        onClick={() => setExpandedQuestion(isExpanded ? null : q.id)}
                        className="w-full flex items-start gap-3 p-4 text-left hover:bg-muted/30 transition-colors"
                      >
                        <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                          isAnswered
                            ? isCorrect ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                            : "bg-muted text-muted-foreground"
                        }`}>
                          {q.number}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground line-clamp-2">{q.question}</p>
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: subj?.color + "15", color: subj?.color }}>
                              {subj?.name}
                            </span>
                            {q.tags.filter((t) => t !== tag).map((t) => (
                              <Link
                                key={t}
                                href={`/knowledge/${encodeURIComponent(t)}`}
                                onClick={(e) => e.stopPropagation()}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground no-underline hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                              >
                                {t}
                              </Link>
                            ))}
                            {isAnswered && (
                              <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                isCorrect ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                              }`}>
                                {isCorrect ? "已答對" : "已答錯"}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex-shrink-0 mt-1">
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
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
                              <p className="text-sm text-foreground mb-3 whitespace-pre-line leading-relaxed">{q.question}</p>
                              <div className="space-y-2 mb-3">
                                {Object.entries(q.options).sort(([a], [b]) => a.localeCompare(b)).map(([key, text]) => {
                                  const isCorrectOption = key === q.answer;
                                  const isUserChoice = key === userAnswer;
                                  let bg = "bg-white border-foreground/10";
                                  if (isAnswered) {
                                    if (isCorrectOption) bg = "bg-emerald-50 border-emerald-400";
                                    if (isUserChoice && !isCorrectOption) bg = "bg-red-50 border-red-400";
                                  }
                                  return (
                                    <div key={key} className={`flex items-start gap-2 p-2.5 rounded-lg border ${bg}`}>
                                      <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                        isAnswered && isCorrectOption ? "bg-emerald-600 text-white"
                                          : isAnswered && isUserChoice ? "bg-red-500 text-white"
                                          : "bg-muted text-muted-foreground"
                                      }`}>
                                        {key}
                                      </span>
                                      <span className="text-xs leading-relaxed flex-1">{text}</span>
                                      {isAnswered && isCorrectOption && <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
                                      {isAnswered && isUserChoice && !isCorrectOption && <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />}
                                    </div>
                                  );
                                })}
                              </div>
                              {isAnswered ? (
                                <div className="flex items-center gap-3 text-xs p-2.5 rounded-lg bg-muted/50">
                                  <span className="text-muted-foreground">你的答案：<span className={`font-bold ${isCorrect ? "text-emerald-600" : "text-red-500"}`}>{userAnswer}</span></span>
                                  <span className="text-muted-foreground">正確答案：<span className="font-bold text-emerald-600">{q.answer}</span></span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 text-xs p-2.5 rounded-lg bg-blue-50 border border-blue-200">
                                  <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                                  <span className="text-blue-700">尚未作答此題</span>
                                  <span className="text-blue-500 ml-1">正確答案：<span className="font-bold">{q.answer}</span></span>
                                </div>
                              )}
                              {/* detailed_explanation */}
                              {q.detailed_explanation?.concept_analysis && (
                                canViewExplanation ? (
                                  <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                                    <p className="text-[10px] font-bold text-blue-700 mb-1.5">觀念解析</p>
                                    <p className="text-xs text-blue-900 leading-relaxed whitespace-pre-line">{q.detailed_explanation.concept_analysis}</p>
                                  </div>
                                ) : (
                                  <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between">
                                    <p className="text-xs text-amber-700">今日詳解已達上限（{FREE_DAILY_LIMIT} 題）</p>
                                    <a href="/pricing" className="text-xs font-bold text-amber-600 hover:underline">升級無限 →</a>
                                  </div>
                                )
                              )}
                              {!isCorrect && q.detailed_explanation?.wrong_options_analysis && canViewExplanation && (
                                <div className="mt-2 p-3 bg-red-50 border border-red-100 rounded-lg">
                                  <p className="text-[10px] font-bold text-red-700 mb-1.5">錯誤選項分析</p>
                                  <p className="text-xs text-red-900 leading-relaxed whitespace-pre-line">{q.detailed_explanation.wrong_options_analysis}</p>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
