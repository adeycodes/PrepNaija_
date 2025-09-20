      
import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { QuizState } from "@/types";
import { useQuiz } from "@/hooks/useQuiz";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Clock, ChevronLeft, ChevronRight, Flag, CheckCircle, XCircle, Lightbulb } from "lucide-react";
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

  // Load quiz on mount - fixed dependency issue
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

  // Do not auto-navigate on completion; we'll show a results modal instead.

  const handleSubmitQuiz = useCallback(async () => {
    try {
      setShowConfirmSubmit(false);
      console.log('QuizInterface - Starting quiz submission...');
      
      // Show loading state
      toast({
        title: "Submitting Quiz",
        description: "Please wait while we process your answers...",
        variant: "default",
      });
      
      // Prepare quiz data for submission
      const quizData = {
        subject,
        examType,
        totalQuestions: quizState.questions.length,
        correctAnswers: quizState.questions.filter((q: QuestionWithOptions) => q.userAnswer && q.userAnswer === q.correctAnswer).length,
        wrongAnswers: quizState.questions.filter((q: QuestionWithOptions) => q.userAnswer && q.userAnswer !== q.correctAnswer).length,
        timeSpent: Math.floor((new Date().getTime() - quizState.startTime.getTime()) / 1000), // in seconds
        questionsAnswered: quizState.questions.map((q: QuestionWithOptions) => ({
          questionId: q.id,
          isCorrect: q.userAnswer === q.correctAnswer,
          userAnswer: q.userAnswer || '',
          correctAnswer: q.correctAnswer,
          questionText: q.questionText,
          optionA: q.options.A,
          optionB: q.options.B,
          optionC: q.options.C,
          optionD: q.options.D
        }))
      };
      
      console.log('Submitting quiz data:', quizData);
      
      // Call the submitQuiz function with the prepared data
      const result = await submitQuiz(quizData);
      console.log('QuizInterface - Quiz submission result:', result);
      
      // If we have a session ID, show popup with results instead of navigating
      if (result?.sessionId) {
        console.log('QuizInterface - Showing results modal with sessionId:', result.sessionId);

        // Show success message
        toast({
          title: "Quiz Submitted!",
          description: "Your results are ready.",
          variant: "default",
        });

        // Compute summary for display
        const totalQuestions = quizState.questions.length;
        const correctAnswers = quizState.questions.filter((q: QuestionWithOptions) => q.userAnswer && q.userAnswer === q.correctAnswer).length;
        const wrongAnswers = quizState.questions.filter((q: QuestionWithOptions) => q.userAnswer && q.userAnswer !== q.correctAnswer).length;
        const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
        const timeSpent = Math.floor((new Date().getTime() - quizState.startTime.getTime()) / 1000);

        setLastResult({
          sessionId: result.sessionId,
          score,
          totalQuestions,
          correctAnswers,
          wrongAnswers,
          timeSpent,
        });
        setShowResultsModal(true);
      }
      
      // If we don't have a session ID but the quiz is marked as submitted, try to use the one from state
      if (quizState.isSubmitted && quizState.sessionId) {
        console.log('QuizInterface - Using sessionId from quizState:', quizState.sessionId);
        // Prefer showing modal rather than immediate navigation
        const totalQuestions = quizState.questions.length;
        const correctAnswers = quizState.questions.filter((q: QuestionWithOptions) => q.userAnswer && q.userAnswer === q.correctAnswer).length;
        const wrongAnswers = quizState.questions.filter((q: QuestionWithOptions) => q.userAnswer && q.userAnswer !== q.correctAnswer).length;
        const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
        const timeSpent = Math.floor((new Date().getTime() - quizState.startTime.getTime()) / 1000);

        setLastResult({
          sessionId: quizState.sessionId,
          score,
          totalQuestions,
          correctAnswers,
          wrongAnswers,
          timeSpent,
        });
        setShowResultsModal(true);
        toast({
          title: 'Results Ready',
          description: 'Session saved. You can view full breakdown anytime.',
          variant: 'default',
        });
        return;
      }

      // As a final fallback, compute summary locally and show modal even if the session was not saved
      console.warn('QuizInterface - No sessionId returned; showing local summary modal as fallback');
      const totalQuestions = quizState.questions.length;
      const correctAnswers = quizState.questions.filter((q: QuestionWithOptions) => q.userAnswer && q.userAnswer === q.correctAnswer).length;
      const wrongAnswers = quizState.questions.filter((q: QuestionWithOptions) => q.userAnswer && q.userAnswer !== q.correctAnswer).length;
      const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
      const timeSpent = Math.floor((new Date().getTime() - quizState.startTime.getTime()) / 1000);

      setLastResult({
        sessionId: 'N/A',
        score,
        totalQuestions,
        correctAnswers,
        wrongAnswers,
        timeSpent,
      });
      setShowResultsModal(true);
      toast({
        title: 'Results Shown (Not Saved)',
        description: 'We could not save this session. Please check your login status and try again.',
        variant: 'destructive',
      });
      return;
      
    } catch (error) {
      console.error('QuizInterface - Error submitting quiz:', error);
      
      // Show error to user
      const errorMessage = error instanceof Error ? error.message : "Failed to submit quiz. Please try again.";
      
      toast({
        title: "Submission Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      // If we have a session ID despite the error, still try to navigate to results
      if (quizState.sessionId) {
        console.log('QuizInterface - Error occurred but found sessionId in state, navigating to results');
        onQuizComplete(quizState.sessionId);
      }
    }
  }, [submitQuiz, quizState.isSubmitted, onQuizComplete, toast]);

  const handleRetryLoad = useCallback(() => {
    console.log('QuizInterface - Retrying quiz load...');
    setHasTriedLoad(false);
    memoizedLoadQuiz();
  }, [memoizedLoadQuiz]);

  const handleExplain = useCallback(async () => {
    if (!currentQuestion) return;
    setIsLoadingExplanation(true);
    setExplanationText(null);
    const explanationResult = await getExplanation(currentQuestion.id);
    setIsLoadingExplanation(false);
    if (explanationResult && explanationResult.explanation) {
      setExplanationText(explanationResult.explanation);
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
              <p className="text-xs text-muted-foreground mt-2">
                Debug: hasTriedLoad={hasTriedLoad.toString()}, questionsLength={quizState.questions.length}
              </p>
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
            <p className="text-xs text-gray-500 mb-4">
              Debug info: subject={subject}, examType={examType}, count={count}
            </p>
            <Button onClick={handleRetryLoad} data-testid="button-retry-quiz">
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
            <p className="text-muted-foreground mb-4">Please try again or contact support.</p>
            <p className="text-xs text-gray-500 mb-4">
              Debug: hasTriedLoad={hasTriedLoad.toString()}, isLoading={isLoading.toString()}
            </p>
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
            <p className="text-muted-foreground mb-4">Questions count: {quizState.questions.length}, Current index: {quizState.currentQuestionIndex}</p>
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
          
          {/* Progress Bar */}
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
          {/* Options with immediate feedback */}
          <div className="space-y-3">
            {options.map((option) => {
              const isSelected = selectedAnswer === option.key;
              const isOptionCorrect = option.key === currentQuestion.correctAnswer;
              const feedbackClass =
                selectedAnswer
                  ? isOptionCorrect
                    ? "border-green-500 bg-green-50 text-green-900"
                    : isSelected
                      ? "border-red-500 bg-red-50 text-red-900"
                      : "border-border bg-card"
                  : isSelected
                    ? "selected border-primary bg-primary text-primary-foreground success-bounce"
                    : "border-border bg-card hover:border-primary hover:bg-muted";

              return (
                <button
                  key={option.key}
                  onClick={() => selectAnswer(currentQuestion.id, option.key as 'A' | 'B' | 'C' | 'D')}
                  className={cn(
                    "option-button w-full p-4 text-left rounded-lg border-2 btn-animate transition-all duration-200",
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

          {/* Explanation trigger */}
          <div className="pt-2 flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExplain} disabled={isLoadingExplanation}>
              <Lightbulb size={16} className="mr-2" />
              {isLoadingExplanation ? "Loading..." : "Explain this question"}
            </Button>
          </div>

          {explanationText && (
            <div className="mt-3 rounded-md border p-3 bg-muted/50">
              <p className="text-sm whitespace-pre-wrap">{explanationText}</p>
            </div>
          )}
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
              className="btn-animate"
              data-testid="button-previous-question"
            >
              <ChevronLeft size={16} className="mr-1" />
              Previous
            </Button>

            <div className="flex items-center space-x-2">
              {/* Question Navigator */}
              <div className="hidden md:flex items-center space-x-1">
                {quizState.questions.slice(0, 10).map((q, index) => {
                  // Create a unique key by combining the question ID and its index
                  const uniqueKey = `${q.id}-${index}`;
                  return (
                    <button
                      key={uniqueKey}
                      onClick={() => {
                        // Add navigation logic if needed
                        // For example: goToQuestion(index);
                      }}
                      className={cn(
                        "w-8 h-8 rounded-full text-xs font-medium transition-colors",
                        index === quizState.currentQuestionIndex
                          ? "bg-primary text-primary-foreground"
                          : quizState.selectedAnswers[q.id.toString()]
                          ? "bg-accent text-accent-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted-foreground hover:text-muted"
                      )}
                      data-testid={`question-nav-${index + 1}`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
                {quizState.questions.length > 10 && (
                  <span className="text-muted-foreground text-xs">...</span>
                )}
              </div>

              {/* Submit Button */}
              <Button
                onClick={() => setShowConfirmSubmit(true)}
                disabled={quizState.isSubmitted || isSubmitting}
                className="btn-animate"
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
              className="btn-animate"
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={(e) => {
          if (e.target === e.currentTarget) setShowConfirmSubmit(false);
        }}>
          <Card className="max-w-md mx-4">
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
    </div>
  );
}