/*
 * Design: Clinical Pulse / Neo-Brutalism
 * - Subject cards with individual color coding
 * - Tag chips for each subject's knowledge points
 * - Progress indicators
 */
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  Pill, BookOpen, Microscope, Stethoscope, HeartPulse, Scale,
  ArrowRight, Tag, Beaker
} from "lucide-react";
import Navbar from "@/components/Navbar";
import EcgLine from "@/components/EcgLine";
import { useStudyProgress } from "@/hooks/useStudyProgress";
import { useSubjectTags, useSubjectQuestions } from "@/hooks/useQuestionBank";
import { SUBJECT_CONFIG } from "@/lib/types";

const subjectIcons: Record<string, React.ReactNode> = {
  pharm1: <Beaker className="w-7 h-7" />,
  pharm2: <Microscope className="w-7 h-7" />,
  pharm3: <Pill className="w-7 h-7" />,
  pharm4: <Stethoscope className="w-7 h-7" />,
  pharm5: <HeartPulse className="w-7 h-7" />,
  pharm6: <Scale className="w-7 h-7" />,
};

function SubjectSection({ subject }: { subject: typeof SUBJECT_CONFIG[0] }) {
  const tags = useSubjectTags(subject.key);
  const allSubjectQuestions = useSubjectQuestions(subject.key);
  const totalQ = allSubjectQuestions.length || subject.questions;
  const { getSubjectProgress } = useStudyProgress();
  const prog = getSubjectProgress(subject.key);
  const pct = totalQ > 0 ? Math.round((prog.answered / totalQ) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-brutal bg-card rounded-lg overflow-hidden"
    >
      {/* Header */}
      <div
        className="p-5 flex items-center gap-4"
        style={{ backgroundColor: subject.color + "10" }}
      >
        <div
          className="w-14 h-14 rounded-lg flex items-center justify-center border-[2.5px] border-foreground shadow-[3px_3px_0px_rgba(0,0,0,0.9)]"
          style={{ backgroundColor: subject.color, color: "white" }}
        >
          {subjectIcons[subject.key]}
        </div>
        <div className="flex-1">
          <h3 className="font-display text-xl font-bold text-card-foreground">
            {subject.name}
          </h3>
          <p className="text-sm text-muted-foreground">{subject.subtitle}</p>
        </div>
        <Link
          href={`/quiz/${subject.key}`}
          className="btn-capsule flex items-center gap-1.5 px-5 py-2.5 text-sm text-white no-underline"
          style={{ backgroundColor: subject.color }}
        >
          開始練習
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Progress */}
      <div className="px-5 pt-4 pb-2">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-muted-foreground">
            已完成 {prog.answered} / {totalQ} 題 ({pct}%)
          </span>
          {prog.answered > 0 && (
            <span style={{ color: subject.color }} className="font-medium">
              正確率 {Math.round((prog.correct / prog.answered) * 100)}%
            </span>
          )}
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden border border-foreground/10">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, backgroundColor: subject.color }}
          />
        </div>
      </div>

      {/* Tags */}
      <div className="p-5 pt-3">
        <div className="flex items-center gap-1.5 mb-3">
          <Tag className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">知識分類</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map(({ tag, count }) => (
            <Link
              key={tag}
              href={`/quiz/${subject.key}/${encodeURIComponent(tag)}`}
              className="no-underline"
            >
              <span
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-full border-[1.5px] transition-all hover:shadow-[2px_2px_0px_rgba(0,0,0,0.1)]"
                style={{
                  borderColor: subject.color + "40",
                  backgroundColor: subject.color + "08",
                  color: subject.color,
                }}
              >
                {tag}
                <span className="text-[10px] opacity-60">({count})</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function Subjects() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container py-8 md:py-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-emerald-600 border-[2.5px] border-foreground shadow-[3px_3px_0px_rgba(0,0,0,0.9)] flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">科目題庫</h1>
            <p className="text-sm text-muted-foreground">選擇科目或知識分類開始練習</p>
          </div>
        </div>

        <EcgLine className="mb-8 opacity-40" />

        <div className="space-y-6">
          {SUBJECT_CONFIG.map((subject) => (
            <SubjectSection key={subject.key} subject={subject} />
          ))}
        </div>
      </div>
    </div>
  );
}
