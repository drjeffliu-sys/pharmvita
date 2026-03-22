/*
 * Design: Clinical Pulse / Neo-Brutalism
 * Knowledge Map - Knowledge classification overview page
 * - Shows all knowledge categories organized by subject
 * - Each node links to its detail page (not quiz)
 * - Shows question count, study progress per node
 */
import { useState, useMemo } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  Map, BookOpen, Beaker, Microscope, Pill, Stethoscope,
  HeartPulse, Scale, CheckCircle2, Target, ArrowRight, Search, X
} from "lucide-react";
import Navbar from "@/components/Navbar";
import EcgLine from "@/components/EcgLine";
import { useAllTags, useQuestionBank } from "@/hooks/useQuestionBank";
import { useStudyProgress } from "@/hooks/useStudyProgress";
import { SUBJECT_CONFIG } from "@/lib/types";

const KNOWLEDGE_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663138142247/TsFkv5DzCufk7BzdVEQK48/knowledge-map-bg-2wVu9G8MBvban5hv3Km6aZ.webp";

const subjectIcons: Record<string, React.ReactNode> = {
  pharm1: <Beaker className="w-5 h-5" />,
  pharm2: <Microscope className="w-5 h-5" />,
  pharm3: <Pill className="w-5 h-5" />,
  pharm4: <Stethoscope className="w-5 h-5" />,
  pharm5: <HeartPulse className="w-5 h-5" />,
  pharm6: <Scale className="w-5 h-5" />,
};

const subjectIconsSmall: Record<string, React.ReactNode> = {
  pharm1: <Beaker className="w-4 h-4" />,
  pharm2: <Microscope className="w-4 h-4" />,
  pharm3: <Pill className="w-4 h-4" />,
  pharm4: <Stethoscope className="w-4 h-4" />,
  pharm5: <HeartPulse className="w-4 h-4" />,
  pharm6: <Scale className="w-4 h-4" />,
};

type ViewMode = "all" | "bySubject";

export default function KnowledgeMap() {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("bySubject");
  const [searchQuery, setSearchQuery] = useState("");
  const allTags = useAllTags();
  const bank = useQuestionBank();
  const { progress } = useStudyProgress();

  // Calculate per-tag progress
  const tagProgress = useMemo(() => {
    const result: Record<string, { answered: number; correct: number }> = {};
    Object.keys(allTags).forEach((tag) => {
      const questions = bank.questions.filter((q) => q.tags.includes(tag));
      let answered = 0;
      let correct = 0;
      questions.forEach((q) => {
        if (q.id in progress.answered) {
          answered++;
          if (progress.correct[q.id]) correct++;
        }
      });
      result[tag] = { answered, correct };
    });
    return result;
  }, [allTags, bank.questions, progress]);

  // Filter tags by selected subject and search query
  const filteredTags = useMemo(() => {
    let tags = selectedSubject
      ? Object.entries(allTags).filter(([_, info]) => info.subjects.includes(selectedSubject))
      : Object.entries(allTags);
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      tags = tags.filter(([tag]) => tag.toLowerCase().includes(q));
    }
    return tags;
  }, [allTags, selectedSubject, searchQuery]);

  const sortedTags = filteredTags.sort((a, b) => b[1].count - a[1].count);

  // Group tags by subject for bySubject view (also applies search filter)
  const tagsBySubject = useMemo(() => {
    const groups: Record<string, { tag: string; count: number; subjects: string[] }[]> = {};
    const q = searchQuery.trim().toLowerCase();
    SUBJECT_CONFIG.forEach((s) => {
      groups[s.key] = [];
    });
    Object.entries(allTags).forEach(([tag, info]) => {
      info.subjects.forEach((sk) => {
        if (groups[sk]) {
          groups[sk].push({ tag, count: info.count, subjects: info.subjects });
        }
      });
    });
    // Sort each group by count
    Object.keys(groups).forEach((key) => {
      groups[key].sort((a, b) => b.count - a.count);
    });
    return groups;
  }, [allTags]);

  // Total stats
  const totalTags = Object.keys(allTags).length;
  const totalQuestions = bank.total_questions;
  const masteredTags = Object.entries(tagProgress).filter(
    ([_, p]) => p.answered > 0 && p.correct / p.answered >= 0.8
  ).length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden border-b-[2.5px] border-foreground">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{ backgroundImage: `url(${KNOWLEDGE_BG})` }}
        />
        <div className="relative container py-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-emerald-600 border-[2.5px] border-foreground shadow-[3px_3px_0px_rgba(0,0,0,0.9)] flex items-center justify-center">
                <Map className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold">知識圖譜</h1>
                <p className="text-sm text-muted-foreground">
                  藥師國考知識分類總覽，點擊任一知識點查看詳細內容與相關題目
                </p>
              </div>
            </div>
          </div>

          {/* Overview Stats */}
          <div className="grid grid-cols-3 gap-3 mt-5">
            <div className="p-3 rounded-lg bg-card border-[2px] border-foreground/10">
              <div className="font-display text-2xl font-bold text-foreground">{totalTags}</div>
              <div className="text-[10px] text-muted-foreground font-medium">知識分類</div>
            </div>
            <div className="p-3 rounded-lg bg-card border-[2px] border-foreground/10">
              <div className="font-display text-2xl font-bold text-foreground">{totalQuestions}</div>
              <div className="text-[10px] text-muted-foreground font-medium">題目總數</div>
            </div>
            <div className="p-3 rounded-lg bg-emerald-50 border-[2px] border-emerald-200">
              <div className="font-display text-2xl font-bold text-emerald-600">{masteredTags}</div>
              <div className="text-[10px] text-emerald-700 font-medium">已掌握</div>
            </div>
          </div>
        </div>
      </section>

      {/* View Mode Toggle + Subject Filter */}
      <div className="border-b border-border bg-card sticky top-16 z-40">
        <div className="container py-3">
          <div className="flex items-center gap-3">
            {/* View mode toggle */}
            <div className="flex items-center bg-muted rounded-lg p-0.5 flex-shrink-0">
              <button
                onClick={() => { setViewMode("bySubject"); setSelectedSubject(null); }}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  viewMode === "bySubject" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                依科目
              </button>
              <button
                onClick={() => { setViewMode("all"); setSelectedSubject(null); }}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  viewMode === "all" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                全部
              </button>
            </div>

            {/* Subject filter (only in "all" mode) */}
            {viewMode === "all" && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                <button
                  onClick={() => setSelectedSubject(null)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border-[1.5px] transition-all ${
                    !selectedSubject
                      ? "bg-foreground text-background border-foreground"
                      : "bg-card text-muted-foreground border-foreground/15 hover:border-foreground/30"
                  }`}
                >
                  全部
                </button>
                {SUBJECT_CONFIG.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => setSelectedSubject(s.key)}
                    className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border-[1.5px] transition-all ${
                      selectedSubject === s.key
                        ? "text-white border-foreground"
                        : "bg-card text-muted-foreground border-foreground/15 hover:border-foreground/30"
                    }`}
                    style={selectedSubject === s.key ? { backgroundColor: s.color } : {}}
                  >
                    {subjectIconsSmall[s.key]}
                    {s.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container py-8">
        {viewMode === "bySubject" ? (
          /* By Subject View */
          <div className="space-y-10">
            {SUBJECT_CONFIG.map((subject) => {
              const tags = tagsBySubject[subject.key] || [];
              if (tags.length === 0) return null;

              return (
                <motion.section
                  key={subject.key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {/* Subject Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center border-[2px] border-foreground shadow-[2px_2px_0px_rgba(0,0,0,0.9)]"
                      style={{ backgroundColor: subject.color, color: "white" }}
                    >
                      {subjectIcons[subject.key]}
                    </div>
                    <div>
                      <h2 className="font-display text-lg font-bold">{subject.name}</h2>
                      <p className="text-xs text-muted-foreground">{subject.subtitle} — {tags.length} 個知識分類</p>
                    </div>
                  </div>

                  <EcgLine className="mb-4 opacity-20" />

                  {/* Tag Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {tags.map((t, i) => {
                      const prog = tagProgress[t.tag] || { answered: 0, correct: 0 };
                      const pct = t.count > 0 ? Math.round((prog.answered / t.count) * 100) : 0;
                      const accuracy = prog.answered > 0 ? Math.round((prog.correct / prog.answered) * 100) : 0;
                      const isMastered = prog.answered > 0 && accuracy >= 80;

                      return (
                        <motion.div
                          key={t.tag}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: Math.min(i * 0.04, 0.4) }}
                        >
                          <Link
                            href={`/knowledge/${encodeURIComponent(t.tag)}`}
                            className="no-underline block"
                          >
                            <div className={`rounded-lg p-4 border-[2px] transition-all hover:shadow-[3px_3px_0px_rgba(0,0,0,0.15)] ${
                              isMastered
                                ? "bg-emerald-50/50 border-emerald-300"
                                : "bg-card border-foreground/10 hover:border-foreground/30"
                            }`}>
                              <div className="flex items-start justify-between mb-2">
                                <h3 className="font-display text-sm font-bold text-foreground">{t.tag}</h3>
                                <span
                                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                                  style={{ backgroundColor: subject.color + "15", color: subject.color }}
                                >
                                  {t.count} 題
                                </span>
                              </div>

                              {/* Progress bar */}
                              <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-2">
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{ width: `${pct}%`, backgroundColor: subject.color }}
                                />
                              </div>

                              <div className="flex items-center justify-between text-[10px]">
                                <span className="text-muted-foreground">
                                  完成 {prog.answered}/{t.count}
                                </span>
                                {prog.answered > 0 && (
                                  <span className={`font-medium ${accuracy >= 80 ? "text-emerald-600" : accuracy >= 60 ? "text-amber-600" : "text-red-500"}`}>
                                    正確率 {accuracy}%
                                  </span>
                                )}
                                {isMastered && (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                )}
                              </div>
                            </div>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.section>
              );
            })}
          </div>
        ) : (
          /* All Tags View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedTags.map(([tag, info], i) => {
              const primarySubject = SUBJECT_CONFIG.find((s) => s.key === info.subjects[0]);
              const color = primarySubject?.color || "#059669";
              const prog = tagProgress[tag] || { answered: 0, correct: 0 };
              const pct = info.count > 0 ? Math.round((prog.answered / info.count) * 100) : 0;
              const accuracy = prog.answered > 0 ? Math.round((prog.correct / prog.answered) * 100) : 0;

              return (
                <motion.div
                  key={tag}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.5) }}
                >
                  <Link
                    href={`/knowledge/${encodeURIComponent(tag)}`}
                    className="no-underline block"
                  >
                    <div className="card-brutal bg-card rounded-lg p-4 h-full hover:bg-muted/30 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center border-[2px] border-foreground shadow-[2px_2px_0px_rgba(0,0,0,0.9)]"
                          style={{ backgroundColor: color, color: "white" }}
                        >
                          {subjectIcons[info.subjects[0]]}
                        </div>
                        <span
                          className="inline-flex items-center justify-center w-8 h-8 rounded-full font-display font-bold text-sm border-[2px]"
                          style={{ backgroundColor: color + "15", color: color, borderColor: color + "30" }}
                        >
                          {info.count}
                        </span>
                      </div>
                      <h3 className="font-display text-base font-bold text-card-foreground mb-1">{tag}</h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                        {info.subjects.map((sk) => {
                          const s = SUBJECT_CONFIG.find((c) => c.key === sk);
                          return s ? (
                            <span
                              key={sk}
                              className="px-2 py-0.5 rounded-full"
                              style={{ backgroundColor: s.color + "10", color: s.color }}
                            >
                              {s.name}
                            </span>
                          ) : null;
                        })}
                      </div>

                      {/* Progress */}
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-1.5">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${pct}%`, backgroundColor: color }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                        <span>完成 {prog.answered}/{info.count}</span>
                        {prog.answered > 0 && (
                          <span className={accuracy >= 80 ? "text-emerald-600" : accuracy >= 60 ? "text-amber-600" : "text-red-500"}>
                            {accuracy}%
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}

        {sortedTags.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            {searchQuery ? (
              <div>
                <p className="text-lg font-medium mb-2">找不到「{searchQuery}」相關的知識分類</p>
                <button onClick={() => setSearchQuery("")} className="text-emerald-600 text-sm underline">清除搜尋</button>
              </div>
            ) : (
              <p>沒有找到相關知識分類</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
