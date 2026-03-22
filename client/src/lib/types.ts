export interface DetailedExplanation {
  correct_answer: string;
  concept_analysis: string;
  wrong_options_analysis: string;
  exam_focus: string;
}

export interface Question {
  id: string;
  number: number;
  subject: string;
  subtitle: string;
  year: string;
  question: string;
  options: Record<string, string>;
  answer: string;
  points: number;
  tags: string[];
  images: string[];
  explanation: string;
  detailed_explanation: DetailedExplanation;
}

export interface SubjectInfo {
  key: string;
  name: string;
  subtitle: string;
  questions: number; // 跨屆總題數
  color: string;
  icon: string;
}

export interface QuizState {
  currentIndex: number;
  answers: Record<string, string>;
  isRevealed: Record<string, boolean>;
  score: number;
  totalAnswered: number;
  correctCount: number;
  startTime: number;
}

export interface StudyProgress {
  subjectKey: string;
  totalQuestions: number;
  answeredQuestions: number;
  correctAnswers: number;
  lastStudyDate: string;
  weakTags: string[];
}

// 跨屆總題數
export const SUBJECT_CONFIG: SubjectInfo[] = [
  { key: "pharm1", name: "藥學(一)", subtitle: "藥理學與藥物化學", questions: 938, color: "#059669", icon: "Flask" },
  { key: "pharm2", name: "藥學(二)", subtitle: "藥物分析與生藥學(含中藥學)", questions: 956, color: "#0891b2", icon: "Microscope" },
  { key: "pharm3", name: "藥學(三)", subtitle: "藥劑學與生物藥劑學", questions: 950, color: "#7c3aed", icon: "Pill" },
  { key: "pharm4", name: "藥學(四)", subtitle: "調劑學與臨床藥學", questions: 959, color: "#dc2626", icon: "Stethoscope" },
  { key: "pharm5", name: "藥學(五)", subtitle: "藥物治療學", questions: 960, color: "#d97706", icon: "HeartPulse" },
  { key: "pharm6", name: "藥學(六)", subtitle: "藥事行政與法規", questions: 600, color: "#4338ca", icon: "Scale" },
];

// 所有屆別（依時間順序）
export const EXAM_YEARS = [
  "109-1", "109-2",
  "110-1", "110-2",
  "111-1", "111-2",
  "112-1", "112-2",
  "113-1", "113-2",
  "114-1", "114-2",
] as const;

export type ExamYear = typeof EXAM_YEARS[number];
