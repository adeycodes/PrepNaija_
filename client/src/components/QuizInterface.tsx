import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { QuizState } from "@/types";
import { useQuiz } from "@/hooks/useQuiz";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Clock, ChevronLeft, ChevronRight, Flag, CheckCircle, XCircle, Lightbulb, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// Define the shape of a question with options
interface QuestionWithOptions {
  id: string;
  subject: string;
  topic: string | null;
  questionText: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: string;
  difficulty: string | null;
  explanation: string | null;
  examType: string;
  year: number | null;
  userAnswer?: string;
}

// Define the shape of the useQuiz hook's return value
interface QuizHookReturnValue {
  quizState: QuizState & { questions: QuestionWithOptions[] };
  isLoading: boolean;
  error: string | null;
  loadQuiz: () => Promise<void>;
  selectAnswer: (questionId: string, answer: string) => void;
  navigateToQuestion: (index: number) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  submitQuiz: (quizData: any) => Promise<any>;
  getExplanation: (questionId: string) => Promise<any | null>;
  getCurrentQuestion: () => QuestionWithOptions | null;
  getProgress: () => { answered: number; total: number };
  formatTime: (seconds: number) => string;
  getQuizResults: () => any;
  isSubmitting: boolean;
  authLoading: boolean;
  isAuthenticated: boolean;
}

interface QuizInterfaceProps {
  subject: string;
  examType?: string;
  onQuizComplete: (sessionId: string) => void;
  count?: number;
  difficulty?: string;
  topics?: string[];
}

export default function QuizInterface({ subject, examType = 'JAMB', onQuizComplete, count, difficulty, topics }: QuizInterfaceProps) {
  console.log('QuizInterface - Props:', { subject, examType, count, difficulty, topics });
  
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  const {
    quizState,
    isLoading,
    error,
    loadQuiz,
    selectAnswer,
    nextQuestion,
    previousQuestion,
    submitQuiz,
    getExplanation,
    getCurrentQuestion,
    getProgress,
    formatTime,
    isSubmitting,
  } = useQuiz(subject, examType, { count, difficulty, topics }) as QuizHookReturnValue;
  
  const { toast } = useToast();

  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [lastResult, setLastResult] = useState<{
    sessionId: string;
    score: number;
    totalQuestions: number;
    correctAnswers: number;
    wrongAnswers: number;
    timeSpent: number;
  } | null>(null);
  const [hasTriedLoad, setHasTriedLoad] = useState(false);
  const [explanationText, setExplanationText] = useState<string | null>(null);
  const [isLoadingExplanation, setIsLoadingExplanation] = useState(false);
  const [explanationError, setExplanationError] = useState<string | null>(null);

  const currentQuestion = getCurrentQuestion();
  const progress = getProgress();
  const selectedAnswer = currentQuestion ? quizState.selectedAnswers[currentQuestion.id] : null;
  const isCorrect = currentQuestion && selectedAnswer ? selectedAnswer === currentQuestion.correctAnswer : null;

  // Debug logging
  console.log('QuizInterface - Debug Info:', {
    isLoading,
    error,
    questionsCount: quizState.questions.length,
    currentQuestionIndex: quizState.currentQuestionIndex,
    currentQuestion: currentQuestion ? 'exists' : 'null',
    progress
  });

  // Memoize loadQuiz to prevent unnecessary re-renders
  const memoizedLoadQuiz = useCallback(() => {
    if (loadQuiz) {
      loadQuiz();
    }
  }, [loadQuiz]);

  // Load quiz on mount
  useEffect(() => {
    console.log('QuizInterface - useEffect triggered:', {
      questionsLength: quizState.questions.length,
      isLoading,
      hasTriedLoad,
      authLoading,
      isAuthenticated,
    });
    
    if (quizState.questions.length === 0 && !isLoading && !hasTriedLoad && !authLoading) {
      console.log('QuizInterface - Loading quiz...');
      setHasTriedLoad(true);
      memoizedLoadQuiz();
    }
  }, [quizState.questions.length, isLoading, hasTriedLoad, memoizedLoadQuiz, authLoading, isAuthenticated]);

  // Clear explanation when question changes
  useEffect(() => {
    setExplanationText(null);
    setExplanationError(null);
  }, [currentQuestion?.id]);

  // ✅ FIXED SUBMIT HANDLER - Using quizState.selectedAnswers instead of q.userAnswer
  const handleSubmitQuiz = useCallback(async () => {
    try {
      setShowConfirmSubmit(false);
      console.log('QuizInterface - Starting quiz submission...');
      
      toast({
        title: "Submitting Quiz",
        description: "Please wait while we process your answers...",
        variant: "default",
      });
      
      // ✅ FIXED: Use quizState.selectedAnswers instead of q.userAnswer
      const correctAnswers = quizState.questions.filter((q: QuestionWithOptions) => {
        const userAnswer = quizState.selectedAnswers[q.id];
        return userAnswer && userAnswer === q.correctAnswer;
      }).length;
      
      const wrongAnswers = quizState.questions.filter((q: QuestionWithOptions) => {
        const userAnswer = quizState.selectedAnswers[q.id];
        return userAnswer && userAnswer !== q.correctAnswer;
      }).length;
      
      const quizData = {
        subject,
        examType,
        totalQuestions: quizState.questions.length,
        correctAnswers,
        wrongAnswers,
        timeSpent: Math.floor((new Date().getTime() - quizState.startTime.getTime()) / 1000),
        // ✅ FIXED: Map using quizState.selectedAnswers
        questionsAnswered: quizState.questions.map((q: QuestionWithOptions) => {
          const userAnswer = quizState.selectedAnswers[q.id];
          return {
            questionId: q.id,
            selectedAnswer: userAnswer || '',
            correctAnswer: q.correctAnswer,
            isCorrect: userAnswer === q.correctAnswer,
            questionText: q.questionText,
            optionA: q.options.A,
            optionB: q.options.B,
            optionC: q.options.C,
            optionD: q.options.D
          };
        })
      };
      
      console.log('QuizInterface - Submitting quiz data:', quizData);
      console.log('QuizInterface - Correct answers:', correctAnswers, 'Wrong answers:', wrongAnswers);
      
      const result = await submitQuiz(quizData);
      
      console.log('QuizInterface - Quiz submission result:', result);
      console.log('QuizInterface - result type:', typeof result);
      console.log('QuizInterface - result?.sessionId:', result?.sessionId);
      
      // Calculate results once
      const totalQuestions = quizState.questions.length;
      const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
      const timeSpent = Math.floor((new Date().getTime() - quizState.startTime.getTime()) / 1000);
      
      // ✅ Single if-else-else chain (not multiple independent ifs)
      if (result?.sessionId) {
        // SUCCESS PATH
        console.log('✅ QuizInterface - Success! Got sessionId:', result.sessionId);
        
        toast({
          title: "Quiz Submitted Successfully!",
          description: "Your results have been saved.",
          variant: "default",
        });

        setLastResult({
          sessionId: result.sessionId,
          score,
          totalQuestions,
          correctAnswers,
          wrongAnswers,
          timeSpent,
        });
        setShowResultsModal(true);
        
      } else if (quizState.isSubmitted && quizState.sessionId) {
        // FALLBACK 1: Use sessionId from state
        console.log('⚠️ QuizInterface - Using sessionId from quizState:', quizState.sessionId);
        
        toast({
          title: 'Results Ready',
          description: 'Session retrieved from state.',
          variant: 'default',
        });

        setLastResult({
          sessionId: quizState.sessionId,
          score,
          totalQuestions,
          correctAnswers,
          wrongAnswers,
          timeSpent,
        });
        setShowResultsModal(true);
        
      } else {
        // FALLBACK 2: No sessionId - show local results
        console.warn('❌ QuizInterface - No sessionId found, showing local results');
        
        toast({
          title: 'Results Shown (Not Saved)',
          description: 'Could not save this session. Please check your login status.',
          variant: 'destructive',
        });

        setLastResult({
          sessionId: 'LOCAL_ONLY',
          score,
          totalQuestions,
          correctAnswers,
          wrongAnswers,
          timeSpent,
        });
        setShowResultsModal(true);
      }
      
    } catch (error) {
      console.error('❌ QuizInterface - Error submitting quiz:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Failed to submit quiz. Please try again.";
      
      toast({
        title: "Submission Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      // ✅ FIXED: Calculate using quizState.selectedAnswers
      const totalQuestions = quizState.questions.length;
      const correctAnswers = quizState.questions.filter((q: QuestionWithOptions) => {
        const userAnswer = quizState.selectedAnswers[q.id];
        return userAnswer && userAnswer === q.correctAnswer;
      }).length;
      const wrongAnswers = quizState.questions.filter((q: QuestionWithOptions) => {
        const userAnswer = quizState.selectedAnswers[q.id];
        return userAnswer && userAnswer !== q.correctAnswer;
      }).length;
      const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
      const timeSpent = Math.floor((new Date().getTime() - quizState.startTime.getTime()) / 1000);

      setLastResult({
        sessionId: quizState.sessionId || 'ERROR_FALLBACK',
        score,
        totalQuestions,
        correctAnswers,
        wrongAnswers,
        timeSpent,
      });
      setShowResultsModal(true);
    }
  }, [submitQuiz, quizState, subject, examType, toast]);

  const handleRetryLoad = useCallback(() => {
    console.log('QuizInterface - Retrying quiz load...');
    setHasTriedLoad(false);
    memoizedLoadQuiz();
  }, [memoizedLoadQuiz]);

  // ✅ FIXED: Enhanced explanation handler with better error handling
  const handleExplain = useCallback(async () => {
    if (!currentQuestion) {
      console.error('❌ [handleExplain] No current question');
      return;
    }

    console.log('🔍 [handleExplain] Starting explanation request for question:', currentQuestion.id);
    
    setIsLoadingExplanation(true);
    setExplanationText(null);
    setExplanationError(null);
    
    try {
      const explanationResult = await getExplanation(currentQuestion.id);
      
      console.log('📦 [handleExplain] Received explanation result:', explanationResult);
      
      if (explanationResult && explanationResult.explanation) {
        console.log('✅ [handleExplain] Successfully loaded explanation');
        setExplanationText(explanationResult.explanation);
        setExplanationError(null);
      } else {
        console.error('❌ [handleExplain] No explanation in result');
        setExplanationError('No explanation available for this question.');
      }
    } catch (error) {
      console.error('❌ [handleExplain] Error loading explanation:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load explanation';
      setExplanationError(errorMessage);
    } finally {
      setIsLoadingExplanation(false);
    }
  }, [getExplanation, currentQuestion]);

  if (isLoading) {
    console.log('QuizInterface - Rendering loading state');
    return (
      <div className="quiz-interface">
        <Card className="max-w-4xl mx-auto">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="loading-spinner w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4 animate-spin"></div>
              <p className="text-muted-foreground">Loading {subject} questions...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    console.log('QuizInterface - Rendering error state:', error);
    return (
      <div className="quiz-interface">
        <Card className="max-w-4xl mx-auto">
          <CardContent className="text-center py-12">
            <XCircle className="mx-auto text-destructive mb-4" size={48} />
            <p className="text-sm text-destructive mt-2">Error: {error}</p>
            <Button onClick={handleRetryLoad} data-testid="button-retry-quiz" className="mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (quizState.questions.length === 0) {
    console.log('QuizInterface - No questions loaded');
    return (
      <div className="quiz-interface">
        <Card className="max-w-4xl mx-auto">
          <CardContent className="text-center py-12">
            <XCircle className="mx-auto text-destructive mb-4" size={48} />
            <p className="text-destructive mb-4">No questions available for {subject} ({examType}).</p>
            <Button onClick={handleRetryLoad} data-testid="button-retry-quiz">
              Load Questions
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentQuestion) {
    console.log('QuizInterface - No current question despite having questions');
    return (
      <div className="quiz-interface">
        <Card className="max-w-4xl mx-auto">
          <CardContent className="text-center py-12">
            <XCircle className="mx-auto text-destructive mb-4" size={48} />
            <p className="text-destructive mb-4">Error: Questions loaded but no current question found.</p>
            <Button onClick={handleRetryLoad} data-testid="button-retry-quiz">
              Reload Questions
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  console.log('QuizInterface - Rendering quiz interface with question:', currentQuestion.id);

  const options = currentQuestion ? [
    { key: 'A', text: currentQuestion.options.A },
    { key: 'B', text: currentQuestion.options.B },
    { key: 'C', text: currentQuestion.options.C },
    { key: 'D', text: currentQuestion.options.D },
  ] : [];

  return (
    <div className="quiz-interface max-w-4xl mx-auto space-y-6">
      {/* Quiz Header */}
      <Card className="quiz-timer">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Badge variant="secondary">
                {subject} Quiz ({examType})
              </Badge>
              <div className="flex items-center space-x-2 text-sm text-primary-foreground">
                <span>Question {quizState.currentQuestionIndex + 1} of {quizState.questions.length}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-primary-foreground">
                <Clock size={16} />
                <span className="font-mono text-lg" data-testid="text-timer">
                  {formatTime(quizState.timeRemaining)}
                </span>
              </div>
              <div className="text-sm text-primary-foreground">
                {progress.answered}/{progress.total} answered
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <Progress 
              value={(progress.answered / progress.total) * 100} 
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Question Card */}
      <Card className="question-card">
        <CardHeader>
          <CardTitle className="text-lg leading-relaxed">
            {currentQuestion.questionText}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {options.map((option) => {
              const isSelected = selectedAnswer === option.key;
              const isOptionCorrect = option.key === currentQuestion.correctAnswer;
              const feedbackClass =
                selectedAnswer
                  ? isOptionCorrect
                    ? "border-green-500 bg-green-50 text-green-900 dark:bg-green-900/20 dark:text-green-100"
                    : isSelected
                      ? "border-red-500 bg-red-50 text-red-900 dark:bg-red-900/20 dark:text-red-100"
                      : "border-border bg-card"
                  : isSelected
                    ? "selected border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card hover:border-primary hover:bg-muted";

              return (
                <button
                  key={option.key}
                  onClick={() => selectAnswer(currentQuestion.id, option.key as 'A' | 'B' | 'C' | 'D')}
                  className={cn(
                    "option-button w-full p-4 text-left rounded-lg border-2 transition-all duration-200",
                    feedbackClass
                  )}
                  disabled={quizState.isSubmitted}
                  data-testid={`option-${option.key.toLowerCase()}`}
                >
                  <div className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full border flex items-center justify-center text-sm font-semibold">
                      {option.key}
                    </span>
                    <span className="flex-1">{option.text}</span>
                    {selectedAnswer && isOptionCorrect && (
                      <CheckCircle className="text-green-600" size={18} />
                    )}
                    {selectedAnswer && isSelected && !isOptionCorrect && (
                      <XCircle className="text-red-600" size={18} />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* ✅ Enhanced Explanation Section */}
          <div className="pt-2 space-y-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleExplain} 
              disabled={isLoadingExplanation}
              className="w-full sm:w-auto"
            >
              <Lightbulb size={16} className="mr-2" />
              {isLoadingExplanation ? "Loading explanation..." : "Get AI Explanation"}
            </Button>

            {/* Loading State */}
            {isLoadingExplanation && (
              <div className="rounded-md border p-4 bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-sm text-muted-foreground">Generating explanation with AI...</p>
                </div>
              </div>
            )}

            {/* Explanation Text */}
            {explanationText && !isLoadingExplanation && (
              <div className="rounded-md border p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-2 mb-2">
                  <Lightbulb className="text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" size={18} />
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100">AI Explanation</h4>
                </div>
                <p className="text-sm text-blue-800 dark:text-blue-200 whitespace-pre-wrap leading-relaxed">
                  {explanationText}
                </p>
              </div>
            )}

            {/* Error State */}
            {explanationError && !isLoadingExplanation && (
              <div className="rounded-md border p-4 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
                <div className="flex items-start gap-2">
                  <AlertCircle className="text-red-600 dark:text-red-400 mt-1 flex-shrink-0" size={18} />
                  <div>
                    <h4 className="font-semibold text-red-900 dark:text-red-100 mb-1">Failed to Load Explanation</h4>
                    <p className="text-sm text-red-800 dark:text-red-200">{explanationError}</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleExplain}
                      className="mt-2"
                    >
                      Try Again
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <Card className="navigation-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Button
              onClick={previousQuestion}
              disabled={quizState.currentQuestionIndex === 0}
              variant="outline"
              data-testid="button-previous-question"
            >
              <ChevronLeft size={16} className="mr-1" />
              Previous
            </Button>

            <div className="flex items-center space-x-2">
              <Button
                onClick={() => setShowConfirmSubmit(true)}
                disabled={quizState.isSubmitted || isSubmitting}
                data-testid="button-submit-quiz"
              >
                <Flag size={16} className="mr-1" />
                {isSubmitting ? "Submitting..." : "Submit Quiz"}
              </Button>
            </div>

            <Button
              onClick={nextQuestion}
              variant="outline"
              disabled={quizState.currentQuestionIndex === quizState.questions.length - 1 || quizState.isSubmitted}
              data-testid="button-next-question"
            >
              Next
              <ChevronRight size={16} className="ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={(e) => {
          if (e.target === e.currentTarget) setShowConfirmSubmit(false);
        }}>
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Submit Quiz?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                You have answered {progress.answered} out of {progress.total} questions. 
                Are you sure you want to submit?
              </p>
              <div className="flex space-x-2">
                <Button
                  onClick={() => setShowConfirmSubmit(false)}
                  variant="outline"
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitQuiz}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Results Modal */}
      {showResultsModal && lastResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-lg w-full">
            <CardHeader>
              <CardTitle className="text-center text-2xl">
                {lastResult.sessionId === 'LOCAL_ONLY' || lastResult.sessionId === 'ERROR_FALLBACK' || lastResult.sessionId === 'N/A'
                  ? '⚠️ Quiz Completed (Not Saved)'
                  : '✅ Quiz Completed!'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-6xl font-bold text-primary mb-2">
                  {lastResult.score}%
                </div>
                <p className="text-muted-foreground">Your Score</p>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {lastResult.correctAnswers}
                  </div>
                  <p className="text-xs text-muted-foreground">Correct</p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {lastResult.wrongAnswers}
                  </div>
                  <p className="text-xs text-muted-foreground">Wrong</p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.floor(lastResult.timeSpent / 60)}:{(lastResult.timeSpent % 60).toString().padStart(2, '0')}
                  </div>
                  <p className="text-xs text-muted-foreground">Time</p>
                </div>
              </div>

              {(lastResult.sessionId === 'LOCAL_ONLY' || lastResult.sessionId === 'ERROR_FALLBACK' || lastResult.sessionId === 'N/A') && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    ⚠️ This quiz was not saved to the server. You may not be logged in or there was a connection issue.
                  </p>
                </div>
              )}

              <div className="text-xs text-muted-foreground text-center font-mono">
                Session ID: {lastResult.sessionId}
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1" 
                  onClick={() => { 
                    setShowResultsModal(false); 
                    setLastResult(null); 
                  }}
                >
                  Close
                </Button>
                <Button 
                  className="flex-1" 
                  onClick={() => {
                    if (lastResult.sessionId && 
                        lastResult.sessionId !== 'LOCAL_ONLY' && 
                        lastResult.sessionId !== 'ERROR_FALLBACK' && 
                        lastResult.sessionId !== 'N/A') {
                      onQuizComplete(lastResult.sessionId);
                    } else {
                      setShowResultsModal(false);
                      setLastResult(null);
                    }
                  }}
                >
                  {lastResult.sessionId && 
                   lastResult.sessionId !== 'LOCAL_ONLY' && 
                   lastResult.sessionId !== 'ERROR_FALLBACK' && 
                   lastResult.sessionId !== 'N/A' 
                    ? 'View Detailed Results' 
                    : 'Close'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}