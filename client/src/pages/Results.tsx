/*
 * Design: Clinical Pulse / Neo-Brutalism
 * - Dashboard-style layout with vital signs cards
 * - Subject progress bars with individual colors
 * - Study streak calendar
 * - 新增：進度匯出/匯入、書籤統計
 */
import { useRef, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  BarChart3, Target, TrendingUp, Calendar, Zap, RotateCcw,
  BookOpen, Beaker, Microscope, Pill,
  Stethoscope, HeartPulse, Scale, ArrowRight,
  Download, Upload, Bookmark, CheckCircle2
} from "lucide-react";
import Navbar from "@/components/Navbar";
import EcgLine from "@/components/EcgLine";
import { useStudyProgress } from "@/hooks/useStudyProgress";
import { useQuestionBank } from "@/hooks/useQuestionBank";
import { SUBJECT_CONFIG } from "@/lib/types";

const subjectIcons: Record<string, React.ReactNode> = {
  pharm1: <Beaker className="w-5 h-5" />,
  pharm2: <Microscope className="w-5 h-5" />,
  pharm3: <Pill className="w-5 h-5" />,
  pharm4: <Stethoscope className="w-5 h-5" />,
  pharm5: <HeartPulse className="w-5 h-5" />,
  pharm6: <Scale className="w-5 h-5" />,
};

export default function Results() {
  const bank = useQuestionBank();
  const { progress, getAccuracy, getSubjectProgress, resetProgress, exportProgress, importProgress } = useStudyProgress();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<"idle" | "success" | "error">("idle");

  const subjectData = SUBJECT_CONFIG.map((s) => {
    const prog = getSubjectProgress(s.key);
    const totalQ = bank.questions.filter((q) => q.id.startsWith(s.key + "_")).length || s.questions;
    return {
      ...s,
      questions: totalQ,
      answered: prog.answered,
      correct: prog.correct,
      accuracy: prog.answered > 0 ? Math.round((prog.correct / prog.answered) * 100) : 0,
      completion: totalQ > 0 ? Math.round((prog.answered / totalQ) * 100) : 0,
    };
  });

  const weakSubjects = subjectData
    .filter((s) => s.answered > 0)
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 3);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ok = await importProgress(file);
    setImportStatus(ok ? "success" : "error");
    setTimeout(() => setImportStatus("idle"), 3000);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container py-8 md:py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-600 border-[2.5px] border-foreground shadow-[3px_3px_0px_rgba(0,0,0,0.9)] flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold">學習成果</h1>
              <p className="text-sm text-muted-foreground">追蹤你的學習進度</p>
            </div>
          </div>

          {/* 進度管理按鈕 */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* 匯入狀態訊息 */}
            {importStatus !== "idle" && (
              <span className={`text-xs px-3 py-1.5 rounded-full ${
                importStatus === "success"
                  ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                  : "bg-red-50 text-red-600 border border-red-200"
              }`}>
                {importStatus === "success" ? "✓ 匯入成功" : "✗ 格式不正確"}
              </span>
            )}
            <button
              onClick={exportProgress}
              disabled={progress.totalAnswered === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Download className="w-3.5 h-3.5" />
              匯出進度
            </button>
            <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              匯入進度
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImport}
              />
            </label>
            <button
              onClick={() => {
                if (confirm("確定要重置所有學習進度嗎？此操作無法復原。")) {
                  resetProgress();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-muted-foreground hover:text-destructive border border-foreground/10 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              重置
            </button>
          </div>
        </div>

        {/* Vital Signs Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "總作答數", value: progress.totalAnswered, suffix: "題", icon: Target, color: "#059669" },
            { label: "正確率", value: getAccuracy(), suffix: "%", icon: TrendingUp, color: getAccuracy() >= 60 ? "#059669" : "#ef4444" },
            { label: "學習天數", value: progress.studyDays.length, suffix: "天", icon: Calendar, color: "#d97706" },
            { label: "書籤題目", value: progress.bookmarks.length, suffix: "題", icon: Bookmark, color: "#f59e0b" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="card-brutal bg-card rounded-lg p-5"
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center border-[2px] border-foreground shadow-[2px_2px_0px_rgba(0,0,0,0.9)] mb-3"
                style={{ backgroundColor: stat.color, color: "white" }}
              >
                <stat.icon className="w-5 h-5" />
              </div>
              <div className="font-display text-3xl font-bold text-card-foreground">
                {stat.value}
                <span className="text-sm font-medium text-muted-foreground ml-0.5">{stat.suffix}</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        <EcgLine className="mb-8 opacity-30" />

        {/* 進度備份提示 */}
        {progress.totalAnswered > 0 && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
            <Download className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-blue-800 font-medium">定期備份你的學習進度</p>
              <p className="text-xs text-blue-600 mt-0.5">
                學習紀錄存於瀏覽器本地，清除瀏覽器資料或換裝置時會消失。建議定期點擊「匯出進度」下載備份。
              </p>
            </div>
            <button
              onClick={exportProgress}
              className="flex-shrink-0 text-xs px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              立即備份
            </button>
          </div>
        )}

        {/* Subject Progress */}
        <div className="mb-8">
          <h2 className="font-display text-lg font-bold mb-4">各科目進度</h2>
          <div className="space-y-4">
            {subjectData.map((subject, i) => (
              <motion.div
                key={subject.key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="card-brutal bg-card rounded-lg p-4"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center border-[2px] border-foreground shadow-[2px_2px_0px_rgba(0,0,0,0.9)]"
                    style={{ backgroundColor: subject.color, color: "white" }}
                  >
                    {subjectIcons[subject.key]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display text-sm font-bold">{subject.name}</h3>
                      <Link
                        href={`/quiz/${subject.key}`}
                        className="text-xs text-emerald-600 hover:underline no-underline flex items-center gap-0.5"
                      >
                        繼續練習 <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                    <p className="text-xs text-muted-foreground">{subject.subtitle}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div className="text-center p-2 rounded-lg bg-muted/50">
                    <div className="font-display text-lg font-bold">{subject.answered}</div>
                    <div className="text-[10px] text-muted-foreground">已作答</div>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-emerald-50">
                    <div className="font-display text-lg font-bold text-emerald-600">{subject.correct}</div>
                    <div className="text-[10px] text-emerald-700">答對</div>
                  </div>
                  <div className="text-center p-2 rounded-lg" style={{ backgroundColor: subject.color + "10" }}>
                    <div className="font-display text-lg font-bold" style={{ color: subject.color }}>
                      {subject.accuracy}%
                    </div>
                    <div className="text-[10px]" style={{ color: subject.color }}>正確率</div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>完成度</span>
                    <span>{subject.completion}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden border border-foreground/10">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${subject.completion}%`, backgroundColor: subject.color }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Weak Areas */}
        {weakSubjects.length > 0 && (
          <div className="card-brutal bg-amber-50 border-amber-400 rounded-lg p-5 mb-6">
            <h2 className="font-display text-lg font-bold text-amber-800 mb-3 flex items-center gap-2">
              <Target className="w-5 h-5" />
              需要加強的科目
            </h2>
            <div className="space-y-2">
              {weakSubjects.map((s) => (
                <Link
                  key={s.key}
                  href={`/quiz/${s.key}`}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-amber-200 no-underline hover:bg-amber-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span style={{ color: s.color }}>{subjectIcons[s.key]}</span>
                    <span className="text-sm font-medium text-foreground">{s.name}</span>
                  </div>
                  <span className="text-sm font-bold text-amber-600">{s.accuracy}%</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Bookmarks shortcut */}
        {progress.bookmarks.length > 0 && (
          <div className="card-brutal bg-amber-50 border-amber-300 rounded-lg p-5 mb-6">
            <h2 className="font-display text-base font-bold text-amber-800 mb-2 flex items-center gap-2">
              <Bookmark className="w-4 h-4" />
              書籤題目 ({progress.bookmarks.length} 題)
            </h2>
            <p className="text-xs text-amber-600 mb-3">
              前往科目刷題頁，切換到「書籤」分類即可複習書籤題目
            </p>
            <Link
              href="/subjects"
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white text-xs rounded-full no-underline hover:bg-amber-600 transition-colors"
            >
              前往科目頁 <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        )}

        {progress.totalAnswered === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-display text-lg font-bold text-muted-foreground mb-2">
              尚未開始學習
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              開始刷題後，你的學習進度將會顯示在這裡
            </p>
            <Link
              href="/subjects"
              className="btn-capsule inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white text-sm no-underline"
            >
              開始刷題
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t-[2.5px] border-foreground bg-card mt-8">
        <div className="container py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-emerald-600 border-[2px] border-foreground flex items-center justify-center">
                <Pill className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold text-sm">藥命 PharmVita</span>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              本平台題目來源為藥師國家考試公開試題，僅供學習參考使用
            </p>
            <p className="text-xs text-muted-foreground">
              學習進度儲存於本機瀏覽器，請定期備份
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
