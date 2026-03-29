/*
 * Design: Clinical Pulse / Neo-Brutalism
 * - Hero with dark emerald bg + ECG line overlay
 * - Vital signs stat bar
 * - Subject cards with thick borders and shadow offsets
 * - Capsule-shaped CTAs
 */
import { FREE_MODE } from '../lib/config';
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  Pill, BookOpen, Map, ClipboardCheck, BarChart3,
  ArrowRight, Zap, Target, TrendingUp, Calendar,
  Beaker, Microscope, Stethoscope, HeartPulse, Scale
} from "lucide-react";
import Navbar from "@/components/Navbar";
import EcgLine from "@/components/EcgLine";
import { useStudyProgress } from "@/hooks/useStudyProgress";
import { useQuestionBank } from "@/hooks/useQuestionBank";
import { SUBJECT_CONFIG } from "@/lib/types";

const HERO_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663138142247/TsFkv5DzCufk7BzdVEQK48/hero-bg-3DmjEHk7yeTVmuUcFrDY9b.webp";
const STUDY_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663138142247/TsFkv5DzCufk7BzdVEQK48/study-illustration-PQD6nvKNPXTW9D5fM7i9T2.webp";
const EXAM_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663138142247/TsFkv5DzCufk7BzdVEQK48/exam-practice-5NTvZM5QqqkECxcNgmrrKt.webp";

const subjectIcons: Record<string, React.ReactNode> = {
  pharm1: <Beaker className="w-6 h-6" />,
  pharm2: <Microscope className="w-6 h-6" />,
  pharm3: <Pill className="w-6 h-6" />,
  pharm4: <Stethoscope className="w-6 h-6" />,
  pharm5: <HeartPulse className="w-6 h-6" />,
  pharm6: <Scale className="w-6 h-6" />,
};

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

export default function Home() {
  const { progress, getAccuracy, getSubjectProgress } = useStudyProgress();
  const bank = useQuestionBank();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${HERO_BG})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/90 via-emerald-900/80 to-emerald-800/70" />
        <div className="relative container py-20 md:py-28">
          <motion.div {...fadeUp} className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-xs font-medium mb-6">
              <Zap className="w-3.5 h-3.5" />
109～114年 · 12屆完整題庫
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-white leading-tight mb-4">
              藥命
              <span className="text-emerald-300"> PharmVita</span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 leading-relaxed mb-8 max-w-lg">
              系統化的藥師國考學習平台。109～114年六大科目完整題庫、知識分類串聯、智慧刷題，助你一次通過國考。
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/subjects"
                className="btn-capsule inline-flex items-center gap-2 px-7 py-3 bg-white text-emerald-900 text-sm no-underline border-white"
              >
                開始刷題
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/pricing"
                className="btn-capsule inline-flex items-center gap-2 px-7 py-3 bg-emerald-800/60 text-white text-sm no-underline border-emerald-700"
              >
                查看付費方案
              </Link>
              <Link
                href="/mock-exam"
                className="btn-capsule inline-flex items-center gap-2 px-7 py-3 bg-transparent text-white text-sm no-underline border-white/50"
              >
                模擬考試
                <ClipboardCheck className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>
        <EcgLine className="absolute bottom-0 left-0 right-0 opacity-30" color="#6ee7b7" />
      </section>

      {/* Vital Signs Bar */}
      <section className="border-b-[2.5px] border-foreground bg-card">
        <div className="container py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "題庫總量", value: bank.total_questions.toString(), icon: BookOpen, suffix: "題" },
              { label: "已作答", value: progress.totalAnswered.toString(), icon: Target, suffix: "題" },
              { label: "正確率", value: getAccuracy().toString(), icon: TrendingUp, suffix: "%" },
              { label: "學習天數", value: progress.studyDays.length.toString(), icon: Calendar, suffix: "天" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3 p-3"
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-50 border-[2px] border-emerald-200 flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <div className="font-display text-2xl font-bold text-foreground">
                    {stat.value}<span className="text-sm font-medium text-muted-foreground ml-0.5">{stat.suffix}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Subject Cards */}
      <section className="container py-12 md:py-16">
        <motion.div {...fadeUp}>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-emerald-600 border-[2.5px] border-foreground shadow-[3px_3px_0px_rgba(0,0,0,0.9)] flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold">六大科目題庫</h2>
              <p className="text-sm text-muted-foreground">選擇科目開始練習</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {SUBJECT_CONFIG.map((subject, i) => {
            const prog = getSubjectProgress(subject.key);
            const pct = subject.questions > 0 ? Math.round((prog.answered / subject.questions) * 100) : 0;
            const accuracy = prog.answered > 0 ? Math.round((prog.correct / prog.answered) * 100) : 0;

            return (
              <motion.div
                key={subject.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <Link href={`/quiz/${subject.key}`} className="no-underline block">
                  <div className="card-brutal bg-card rounded-lg p-5 h-full hover:bg-muted/30 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center border-[2.5px] border-foreground shadow-[2px_2px_0px_rgba(0,0,0,0.9)]"
                        style={{ backgroundColor: subject.color + "15", color: subject.color }}
                      >
                        {subjectIcons[subject.key]}
                      </div>
                      <span className="text-xs font-mono text-muted-foreground">{subject.questions} 題</span>
                    </div>
                    <h3 className="font-display text-lg font-bold text-card-foreground mb-1">
                      {subject.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">{subject.subtitle}</p>

                    {/* Progress bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">完成度 {pct}%</span>
                        {prog.answered > 0 && (
                          <span className="text-emerald-600 font-medium">正確率 {accuracy}%</span>
                        )}
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden border border-foreground/10">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: subject.color,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Feature Cards */}
      <section className="bg-emerald-900 border-y-[2.5px] border-foreground">
        <div className="container py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <motion.div {...fadeUp}>
              <h2 className="font-display text-3xl font-bold text-white mb-4">
                知識圖譜式學習
              </h2>
              <p className="text-emerald-200 leading-relaxed mb-6">
                每道題目都對應到明確的知識點。透過知識圖譜，你可以清楚看到各科目的知識架構，找出自己的弱點區域，有系統地補強。
              </p>
              <Link
                href="/knowledge"
                className="btn-capsule inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-400 text-emerald-900 text-sm font-semibold no-underline border-white/30"
              >
                <Map className="w-4 h-4" />
                探索知識圖譜
              </Link>
            </motion.div>
            <div className="relative">
              <img
                src={STUDY_IMG}
                alt="學習插圖"
                className="w-full max-w-md mx-auto rounded-lg border-[2.5px] border-white/20 shadow-[6px_6px_0px_rgba(0,0,0,0.3)]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mock Exam CTA */}
      <section className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="order-2 md:order-1">
            <img
              src={EXAM_IMG}
              alt="模擬考試"
              className="w-full max-w-sm mx-auto rounded-lg border-[2.5px] border-foreground shadow-[6px_6px_0px_rgba(0,0,0,0.15)]"
            />
          </div>
          <motion.div {...fadeUp} className="order-1 md:order-2">
            <h2 className="font-display text-3xl font-bold text-foreground mb-4">
              模擬考試實戰演練
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              依照真實國考規格，從六大科目中隨機抽取題目進行模擬測驗。計時作答、即時評分，讓你在考前充分掌握自己的實力。
            </p>
            <Link
              href="/mock-exam"
              className="btn-capsule inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white text-sm no-underline"
            >
              <ClipboardCheck className="w-4 h-4" />
              開始模擬考試
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      {/* 付費方案快速入口 */}
{!FREE_MODE && <>
      <section className="py-14 border-t-[2.5px] border-foreground/10">
        <div className="container max-w-3xl mx-auto text-center">
          <h2 className="font-display text-2xl font-bold mb-2">無限詳解，一次解鎖</h2>
          <p className="text-muted-foreground text-sm mb-8">免費版每天 10 題詳解 · 付費版完全無限制</p>
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { plan: "免費版", price: "$0", note: "每天 10 題詳解" },
              { plan: "主力方案", price: "$399/月", note: "半年期，最多人選", highlight: true },
              { plan: "安心包", price: "$299/月", note: "年訂閱，月費最低" },
            ].map((p) => (
              <div key={p.plan}
                className={"card-brutal rounded-lg p-4 text-center" + (p.highlight ? " ring-2 ring-emerald-500" : "")}>
                <p className="text-xs text-muted-foreground mb-1">{p.plan}</p>
                <p className="font-display text-xl font-black">{p.price}</p>
                <p className="text-[11px] text-muted-foreground mt-1">{p.note}</p>
              </div>
            ))}
          </div>
          <Link href="/pricing"
            className="btn-capsule inline-flex items-center gap-2 px-8 py-3.5 bg-emerald-600 text-white text-sm no-underline">
            查看完整方案
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
      </>
      }

      <footer className="border-t-[2.5px] border-foreground bg-card">
        <div className="container py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-emerald-600 border-[2px] border-foreground flex items-center justify-center">
                <Pill className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold text-sm">藥命 PharmVita</span>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              109～114年藥師國考題庫 — 共 {bank.total_questions} 題
            </p>
            <p className="text-xs text-muted-foreground">
              本平台題目來源為藥師國家考試公開試題，僅供學習參考使用
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
