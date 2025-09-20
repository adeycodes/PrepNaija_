import { useState, useEffect, useCallback, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QuizState, Question, ExplanationResponse } from "@/types";
import { QUIZ_CONFIG } from "@/utils/constants";
import { questionService } from "@/services/questionService";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth"; // 👈 useAuth from AuthProvider
import { apiFetch } from "@/lib/apiClient";
import { getToken } from "@/lib/auth";

// Inside submit mutation


const initialQuizState: QuizState = {
  questions: [],
  currentQuestionIndex: 0,
  selectedAnswers: {},
  timeRemaining: QUIZ_CONFIG.timeLimit * 60, // seconds
  isSubmitted: false,
  startTime: new Date(),
};

function getStorageKey(subject: string, examType: string) {
  return `quizSession:${subject}:${examType}`;
}

export function useQuiz(
  subject: string,
  examType: string = "JAMB",
  options?: { count?: number; difficulty?: string; topics?: string[] }
) {
  const [quizState, setQuizState] = useState<QuizState>(initialQuizState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [explanations, setExplanations] = useState<
    Record<string, ExplanationResponse>
  >({});

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { isLoading: authLoading, isAuthenticated } = useAuth();

  // Stable options object
  const stableOptions = useMemo(
    () => options,
    [options?.count, options?.difficulty, JSON.stringify(options?.topics || [])]
  );

  // Persist quiz state to localStorage (lightweight)
  useEffect(() => {
    if (quizState.questions.length === 0) return;

    const key = getStorageKey(subject, examType);
    const payload = {
      version: 1,
      savedAt: Date.now(),
      state: quizState,
      subject,
      examType,
    } as const;

    try {
      localStorage.setItem(key, JSON.stringify(payload));
    } catch (e) {
      // Ignore quota errors
    }
  }, [quizState, subject, examType]);

  // Attempt recovery on mount
  useEffect(() => {
    const key = getStorageKey(subject, examType);
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return;
      const payload = JSON.parse(raw);
      if (!payload?.state) return;

      // If already submitted, don't restore
      if (payload.state.isSubmitted) return;

      // If timeRemaining is 0 or negative, skip restore
      if (payload.state.timeRemaining <= 0) return;

      setQuizState({ ...payload.state, startTime: new Date(payload.state.startTime) });
    } catch (e) {
      // Ignore parse errors
    }
  }, [subject, examType]);

  // --- SUBMIT QUIZ MUTATION ---
  const submitQuizMutation = useMutation({
    mutationFn: async (quizData: any) => {
      console.log('Submitting quiz data:', quizData);
      // Ensure we have a token before attempting submission
      const token = getToken();
      if (!token) {
        console.error('Quiz submission blocked: No token in storage');
        throw new Error('No token provided');
      }
      try {
        const masked = `${token.slice(0, 6)}…${token.slice(-4)}`;
        console.log('useQuiz.submitQuiz - Using token:', masked);
      } catch {}
      const response = await apiFetch("/api/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quizData),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        console.error('Quiz submission failed:', error);
        throw new Error(error.error || "Failed to submit quiz");
      }
      
      const responseData = await response.json();
      console.log('Quiz submission response:', responseData);
      
      // Check for session ID in both sessionId and id fields for backward compatibility
      const sessionId = responseData.sessionId || responseData.id;
      
      if (!sessionId) {
        console.error('No session ID found in response:', responseData);
        throw new Error('No session ID received from server');
      }
      
      // Return the session ID in a consistent format
      return {
        ...responseData,
        sessionId: sessionId
      };
    },
    onSuccess: (data) => {
      console.log('Quiz submission successful, sessionId:', data.sessionId);
      
      // Update the state to mark as submitted and store the session ID
      setQuizState(prev => {
        const newState = {
          ...prev,
          isSubmitted: true,
          sessionId: data.sessionId,
        };
        console.log('Updated quiz state:', newState);
        return newState;
      });
      
      // Clear persisted session on success
      try {
        localStorage.removeItem(getStorageKey(subject, examType));
      } catch (error) {
        console.error('Error clearing localStorage:', error);
      }
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["quiz-history"] });
      queryClient.invalidateQueries({ queryKey: ["progress"] });
      queryClient.invalidateQueries({ queryKey: ["achievements"] });
      
      console.log('Quiz submission completed, sessionId available for redirection');
    },
    onError: (error: any) => {
      console.error("Quiz submission failed:", error);

      if (
        error.message.includes("No token") ||
        error.message.includes("401") ||
        error.message.includes("Unauthorized")
      ) {
        toast({
          title: "Authentication Required",
          description: "Please log in again to submit your quiz.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Submission Failed",
          description: error.message || "Failed to submit quiz. Please try again.",
          variant: "destructive",
        });
      }
    },
  });

  // --- SUBMIT HANDLER ---
  const handleSubmitQuiz = useCallback(async (): Promise<{ sessionId: string }> => {
    console.log('[handleSubmitQuiz] Starting quiz submission process...');
    
    if (quizState.isSubmitted && quizState.sessionId) {
      console.log('[handleSubmitQuiz] Quiz already submitted, returning existing sessionId:', quizState.sessionId);
      return { sessionId: quizState.sessionId };
    }

    console.log('[handleSubmitQuiz] Preparing quiz data for submission...');
    
    const correctAnswers = Object.values(quizState.selectedAnswers).filter(
      (answer, index) => answer === quizState.questions[index]?.correctAnswer
    ).length;
      
    const wrongAnswers = Object.values(quizState.selectedAnswers).filter(
      (answer, index) => answer !== quizState.questions[index]?.correctAnswer
    ).length;
    
    const quizData = {
      subject,
      examType,
      totalQuestions: quizState.questions.length,
      correctAnswers,
      wrongAnswers,
      timeSpent: QUIZ_CONFIG.timeLimit * 60 - quizState.timeRemaining,
      questionsAnswered: quizState.questions.map((q) => ({
        questionId: q.id,
        selectedAnswer: quizState.selectedAnswers[q.id.toString()],
        correctAnswer: q.correctAnswer,
        isCorrect: quizState.selectedAnswers[q.id.toString()] === q.correctAnswer,
      })),
    };

    console.log('[handleSubmitQuiz] Quiz data prepared:', {
      subject,
      examType,
      totalQuestions: quizData.totalQuestions,
      correctAnswers,
      wrongAnswers,
      timeSpent: quizData.timeSpent,
      questionsCount: quizData.questionsAnswered.length
    });
    
    try {
      console.log('[handleSubmitQuiz] Calling submitQuizMutation.mutateAsync...');
      const result = await submitQuizMutation.mutateAsync(quizData);
      console.log('[handleSubmitQuiz] submitQuizMutation completed with result:', result);
      
      if (!result || !result.sessionId) {
        console.error('[handleSubmitQuiz] No sessionId in result:', result);
        throw new Error('No session ID received from server');
      }
      
      console.log('[handleSubmitQuiz] Updating quiz state with sessionId:', result.sessionId);
      
      // Update the state with the session ID
      setQuizState(prev => ({
        ...prev,
        sessionId: result.sessionId,
        isSubmitted: true
      }));
      
      console.log('[handleSubmitQuiz] Quiz state updated successfully');
      
      return { sessionId: result.sessionId };
    } catch (error) {
      console.error('[handleSubmitQuiz] Error in quiz submission:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      
      // If we have a session ID in the state, use it
      if (quizState.sessionId) {
        console.log('[handleSubmitQuiz] Using existing sessionId from state due to error:', quizState.sessionId);
        return { sessionId: quizState.sessionId };
      }
      
      throw error;
    }
  }, [subject, examType, quizState, submitQuizMutation]);

  // --- TIMER ---
  useEffect(() => {
    if (
      quizState.isSubmitted ||
      quizState.timeRemaining <= 0 ||
      quizState.questions.length === 0
    ) {
      return;
    }

    const timer = setInterval(() => {
      setQuizState((prev) => {
        const newTimeRemaining = prev.timeRemaining - 1;

        if (newTimeRemaining <= 0) {
          handleSubmitQuiz();
        }

        return { ...prev, timeRemaining: newTimeRemaining };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [
    quizState.isSubmitted,
    quizState.timeRemaining,
    quizState.questions.length,
    handleSubmitQuiz,
  ]);

  // --- LOAD QUIZ ---
  const loadQuiz = useCallback(async () => {
    console.log("useQuiz - loadQuiz called for:", { subject, examType });

    if (authLoading) {
      console.log("useQuiz - Waiting for auth check...");
      return;
    }

    if (!isAuthenticated) {
      console.log("useQuiz - User not authenticated");
      toast({
        title: "Authentication Required",
        description: "Please log in to start a quiz.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // If we already have questions (possibly restored), skip fetching
      if (quizState.questions.length > 0 && !quizState.isSubmitted) {
        setIsLoading(false);
        return;
      }

      let questions: Question[] = [];
      if (
        stableOptions &&
        (stableOptions.count ||
          stableOptions.difficulty ||
          (stableOptions.topics && stableOptions.topics.length))
      ) {
        questions = await questionService.getQuestionsFiltered({
          subject,
          count: stableOptions.count ?? QUIZ_CONFIG.questionsPerSession,
          examType,
          difficulty: stableOptions.difficulty,
          topics: stableOptions.topics,
        });
      } else {
        questions = await questionService.getQuestions(
          subject,
          QUIZ_CONFIG.questionsPerSession,
          examType
        );
      }

      if (questions.length === 0) {
        throw new Error(
          `No questions available for ${subject}. Please try again later.`
        );
      }

      setQuizState({
        ...initialQuizState,
        questions,
        timeRemaining: QUIZ_CONFIG.timeLimit * 60,
        startTime: new Date(),
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load quiz questions";
      console.error("useQuiz - Error loading quiz:", errorMessage);
      setError(errorMessage);
      toast({
        title: "Error Loading Quiz",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [subject, examType, stableOptions, toast, authLoading, isAuthenticated, quizState.questions.length, quizState.isSubmitted]);

  // --- QUIZ HELPERS ---
  const selectAnswer = useCallback((questionId: string, answer: string) => {
    setQuizState((prev) => ({
      ...prev,
      selectedAnswers: {
        ...prev.selectedAnswers,
        [questionId]: answer,
      },
    }));
  }, []);

  const navigateToQuestion = useCallback(
    (index: number) => {
      if (index >= 0 && index < quizState.questions.length) {
        setQuizState((prev) => ({ ...prev, currentQuestionIndex: index }));
      }
    },
    [quizState.questions.length]
  );

  const nextQuestion = useCallback(() => {
    if (quizState.currentQuestionIndex < quizState.questions.length - 1) {
      setQuizState((prev) => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
      }));
    }
  }, [quizState.currentQuestionIndex, quizState.questions.length]);

  const previousQuestion = useCallback(() => {
    if (quizState.currentQuestionIndex > 0) {
      setQuizState((prev) => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex - 1,
      }));
    }
  }, [quizState.currentQuestionIndex]);

  const getExplanation = useCallback(
    async (questionId: string) => {
      if (explanations[questionId]) {
        return explanations[questionId];
      }

      try {
        const response = await fetch(`/api/questions/${questionId}/explanation`, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch explanation");
        }

        const explanation = await response.json();
        setExplanations((prev) => ({ ...prev, [questionId]: explanation }));
        return explanation;
      } catch (error) {
        console.error("Failed to get explanation:", error);
        return null;
      }
    },
    [explanations]
  );

  const getCurrentQuestion = (): Question | null => {
    if (quizState.questions.length === 0) return null;
    return quizState.questions[quizState.currentQuestionIndex] || null;
  };

  const getProgress = () => {
    const answeredCount = Object.keys(quizState.selectedAnswers).length;
    const totalCount = quizState.questions.length;
    return { answered: answeredCount, total: totalCount };
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  const getQuizResults = () => {
    const correctCount = Object.values(quizState.selectedAnswers).filter(
      (answer, index) => answer === quizState.questions[index]?.correctAnswer
    ).length;

    const totalCount = quizState.questions.length;
    const percentage =
      totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

    return {
      correct: correctCount,
      total: totalCount,
      percentage,
      timeSpent: QUIZ_CONFIG.timeLimit * 60 - quizState.timeRemaining,
    };
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
