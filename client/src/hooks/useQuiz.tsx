import { useState, useEffect, useCallback, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QuizState, Question } from "@/types";
import { QUIZ_CONFIG } from "@/utils/constants";
import { questionService } from "@/services/questionService";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { apiFetch } from "@/lib/apiClient";
import { getToken } from "@/lib/auth";

// ✅ Fixed ExplanationResponse type locally
export interface ExplanationResponseFixed {
  explanation: string;
  keyPoints: string[];
  studyTips: string[];
  questionId: string;
}

const initialQuizState: QuizState = {
  questions: [],
  currentQuestionIndex: 0,
  selectedAnswers: {},
  timeRemaining: QUIZ_CONFIG.timeLimit * 60,
  isSubmitted: false,
  startTime: new Date(),
  sessionId: undefined,
};

function getStorageKey(
  subject: string,
  examType: string,
  options?: { count?: number; difficulty?: string; topics?: string[] }
) {
  const parts = [`quizSession:${subject}:${examType}`];
  if (options) {
    if (typeof options.count !== "undefined") parts.push(`count=${options.count}`);
    if (options.difficulty) parts.push(`difficulty=${options.difficulty}`);
    if (options.topics && options.topics.length) parts.push(`topics=${options.topics.join(",")}`);
  }
  return parts.join("|");
}

export function useQuiz(
  subject: string,
  examType: string = "JAMB",
  options?: { count?: number; difficulty?: string; topics?: string[] }
) {
  const [quizState, setQuizState] = useState<QuizState>(initialQuizState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [explanations, setExplanations] = useState<Record<string, ExplanationResponseFixed>>({});

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { isLoading: authLoading, isAuthenticated } = useAuth();

  const stableOptions = useMemo(
    () => options,
    [options?.count, options?.difficulty, JSON.stringify(options?.topics || [])]
  );

  // Persist quiz state to localStorage
  useEffect(() => {
    if (quizState.questions.length === 0) return;
    const key = getStorageKey(subject, examType, stableOptions);
    const payload = { version: 1, savedAt: Date.now(), state: quizState, subject, examType };
    try { localStorage.setItem(key, JSON.stringify(payload)); } catch {}
  }, [quizState, subject, examType]);

  // Attempt recovery on mount
  useEffect(() => {
    const key = getStorageKey(subject, examType, stableOptions);
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return;
      const payload = JSON.parse(raw);
      if (!payload?.state) return;
      if (payload.state.isSubmitted || payload.state.timeRemaining <= 0) return;
      setQuizState({ ...payload.state, startTime: new Date(payload.state.startTime) });
    } catch {}
  }, [subject, examType]);

  // --- SUBMIT QUIZ MUTATION ---
  const submitQuizMutation = useMutation({
    mutationFn: async (quizData: any) => {
      const token = getToken();
      if (!token) throw new Error("No token provided");

      const response = await apiFetch("/api/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quizData),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to submit quiz");
      }

      const data = await response.json();
      const sessionId = data.sessionId || data.id || data.data?.sessionId || data.data?.id;

      if (!sessionId) throw new Error("No session ID received from server");

      return { ...data, sessionId };
    },
    onSuccess: (data) => {
      setQuizState(prev => ({ ...prev, isSubmitted: true, sessionId: data.sessionId }));
      localStorage.removeItem(getStorageKey(subject, examType, stableOptions));
      queryClient.invalidateQueries({ queryKey: ["quiz-history"] });
      queryClient.invalidateQueries({ queryKey: ["progress"] });
      queryClient.invalidateQueries({ queryKey: ["achievements"] });
    },
    onError: (err: any) => {
      toast({
        title: "Submission Failed",
        description: err instanceof Error ? err.message : "Failed to submit quiz",
        variant: "destructive",
      });
    },
  });

  // --- HANDLE QUIZ SUBMISSION ---
  const handleSubmitQuiz = useCallback(async (): Promise<{ sessionId: string }> => {
    if (quizState.isSubmitted && quizState.sessionId) return { sessionId: quizState.sessionId };

    const correctAnswers = quizState.questions.filter(
      q => quizState.selectedAnswers[q.id.toString()] === q.correctAnswer
    ).length;

    const wrongAnswers = quizState.questions.filter(
      q => quizState.selectedAnswers[q.id.toString()] && quizState.selectedAnswers[q.id.toString()] !== q.correctAnswer
    ).length;

    const quizData = {
      subject,
      examType,
      totalQuestions: quizState.questions.length,
      correctAnswers,
      wrongAnswers,
      timeSpent: QUIZ_CONFIG.timeLimit * 60 - quizState.timeRemaining,
      questionsAnswered: quizState.questions.map(q => ({
        questionId: q.id,
        selectedAnswer: quizState.selectedAnswers[q.id.toString()],
        correctAnswer: q.correctAnswer,
        isCorrect: quizState.selectedAnswers[q.id.toString()] === q.correctAnswer,
      })),
    };

    try {
      const result = await submitQuizMutation.mutateAsync(quizData);
      setQuizState(prev => ({ ...prev, isSubmitted: true, sessionId: result.sessionId }));
      return { sessionId: result.sessionId };
    } catch (err) {
      console.error(err);
      return { sessionId: `local-${Date.now()}` }; // fallback local ID
    }
  }, [quizState, subject, examType, submitQuizMutation]);

  // --- TIMER ---
  useEffect(() => {
    if (quizState.isSubmitted || quizState.timeRemaining <= 0 || quizState.questions.length === 0) return;
    const timer = setInterval(() => {
      setQuizState(prev => {
        const newTime = prev.timeRemaining - 1;
        if (newTime <= 0) handleSubmitQuiz();
        return { ...prev, timeRemaining: newTime };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [quizState.isSubmitted, quizState.timeRemaining, quizState.questions.length, handleSubmitQuiz]);

  // --- LOAD QUIZ ---
  const loadQuiz = useCallback(async () => {
    if (authLoading) return;
    if (!isAuthenticated) {
      toast({ title: "Authentication Required", description: "Log in to start quiz.", variant: "destructive" });
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      if (quizState.questions.length > 0 && !quizState.isSubmitted) {
        setIsLoading(false);
        return;
      }

      let questions: Question[] = [];
      if (stableOptions && (stableOptions.count || stableOptions.difficulty || (stableOptions.topics?.length ?? 0))) {
        questions = await questionService.getQuestionsFiltered({
          subject,
          count: stableOptions.count ?? QUIZ_CONFIG.questionsPerSession,
          examType,
          difficulty: stableOptions.difficulty,
          topics: stableOptions.topics,
        });
      } else {
        questions = await questionService.getQuestions(subject, QUIZ_CONFIG.questionsPerSession, examType);
      }

      if (questions.length === 0) throw new Error(`No questions available for ${subject}`);

      setQuizState({ ...initialQuizState, questions, timeRemaining: QUIZ_CONFIG.timeLimit * 60, startTime: new Date() });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load quiz");
      toast({ title: "Error Loading Quiz", description: err instanceof Error ? err.message : "Failed to load quiz", variant: "destructive" });
    } finally { setIsLoading(false); }
  }, [subject, examType, stableOptions, authLoading, isAuthenticated, quizState.questions.length, quizState.isSubmitted, toast]);

  // --- ANSWER HANDLERS ---
  const selectAnswer = useCallback((questionId: string, answer: string) => {
    setQuizState(prev => ({ ...prev, selectedAnswers: { ...prev.selectedAnswers, [questionId]: answer } }));
  }, []);

  const navigateToQuestion = useCallback((index: number) => {
    if (index >= 0 && index < quizState.questions.length) setQuizState(prev => ({ ...prev, currentQuestionIndex: index }));
  }, [quizState.questions.length]);

  const nextQuestion = useCallback(() => navigateToQuestion(quizState.currentQuestionIndex + 1), [quizState.currentQuestionIndex, navigateToQuestion]);
  const previousQuestion = useCallback(() => navigateToQuestion(quizState.currentQuestionIndex - 1), [quizState.currentQuestionIndex, navigateToQuestion]);

  // --- AI EXPLANATION ---
  const getExplanation = useCallback(async (questionId: string): Promise<ExplanationResponseFixed | null> => {
    if (explanations[questionId]) return explanations[questionId];

    try {
      const response = await apiFetch(`/api/questions/${questionId}/explanation`);
      if (!response.ok) throw new Error(`Failed to fetch explanation (${response.status})`);
      const data = await response.json();

      const explanationObj: ExplanationResponseFixed = {
        explanation: data.explanation,
        questionId: questionId,
        keyPoints: Array.isArray(data.keyPoints) ? data.keyPoints : [],
        studyTips: Array.isArray(data.studyTips) ? data.studyTips : [],
      };

      setExplanations(prev => ({ ...prev, [questionId]: explanationObj }));
      return explanationObj;
    } catch (err) {
      toast({ title: "Failed to Load Explanation", description: err instanceof Error ? err.message : "Unknown error", variant: "destructive" });
      return null;
    }
  }, [explanations, toast]);

  // --- UTILITIES ---
  const getCurrentQuestion = () => quizState.questions[quizState.currentQuestionIndex] ?? null;
  const getProgress = () => ({ answered: Object.keys(quizState.selectedAnswers).length, total: quizState.questions.length });
  const formatTime = (seconds: number) => `${Math.floor(seconds/60).toString().padStart(2,'0')}:${(seconds%60).toString().padStart(2,'0')}`;
  const getQuizResults = () => {
    const correct = quizState.questions.filter(q => quizState.selectedAnswers[q.id.toString()] === q.correctAnswer).length;
    return { correct, total: quizState.questions.length, percentage: Math.round(correct / quizState.questions.length * 100), timeSpent: QUIZ_CONFIG.timeLimit*60 - quizState.timeRemaining };
  };

  return {
    quizState,
    isLoading,
    error,
    loadQuiz,
    selectAnswer,
    navigateToQuestion,
    nextQuestion,
    previousQuestion,
    submitQuiz: handleSubmitQuiz,
    getExplanation,
    getCurrentQuestion,
    getProgress,
    formatTime,
    getQuizResults,
    isSubmitting: submitQuizMutation.isPending,
    authLoading,
    isAuthenticated,
  };
}
