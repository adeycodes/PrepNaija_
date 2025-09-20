import type { Question, QuizSession, UserProgress, Profile, Achievement, User } from "@shared/schema";

export interface QuizState {
  questions: Question[];
  currentQuestionIndex: number;
  selectedAnswers: Record<string, string>;
  timeRemaining: number;
  isSubmitted: boolean;
  startTime: Date;
  sessionId?: string;
}

export interface QuizAnswer {
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  timeSpent: number;
}

export interface QuizResults {
  session: QuizSession;
  answers: QuizAnswer[];
  explanations: Record<string, ExplanationResponse>;
}

export interface ExplanationResponse {
  explanation: string;
  keyPoints: string[];
  studyTips: string[];
}

export interface SubjectProgress {
  subject: string;
  progress: UserProgress[];
  masteryLevel: number;
  questionsAttempted: number;
  questionsCorrect: number;
  energyPoints: number;
}

export interface OfflineQuestion extends Question {
  cached: boolean;
  cacheDate: Date;
}

export interface AppStats {
  totalQuizzes: number;
  averageScore: number;
  totalQuestions: number;
  energyPoints: number;
  streak: number;
  masteriedTopics: number;
}

export interface AuthUser extends User {
  profile?: Profile;
}

export { Question, QuizSession, UserProgress, Profile, Achievement };
