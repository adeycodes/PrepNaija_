import { useEffect, useState } from "react";
import { useLocation, useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import { 
  Trophy, 
  Target, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Brain,
  RotateCcw,
  Home,
  ChevronDown,
  ChevronUp,
  Lightbulb
} from "lucide-react";
import { ExplanationResponse } from "@/types";

interface QuizSession {
  id: string;
  subject: string;
  scorePercentage: string;
  correctAnswers: number;
  wrongAnswers: number;
  timeSpent: number;
  totalQuestions: number;
  questionsAnswered: Array<{
    questionId: string;
    isCorrect: boolean;
    userAnswer: string;
    correctAnswer: string;
    questionText: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
  }>;
}

export default function Results() {
  const [, params] = useRoute("/results/:sessionId");
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [explanations, setExplanations] = useState<Record<string, ExplanationResponse>>({});
  const [loadingExplanation, setLoadingExplanation] = useState<string | null>(null);

  const sessionId = params?.sessionId || "";

  // Redirect if not authenticated
  // Do not auto-redirect here; let the page load and show a helpful message if needed.

  // Fetch quiz history which includes session details
  const { data: quizHistory, isLoading: sessionLoading, error } = useQuery({
    queryKey: ["/api/quiz/history"],
    queryFn: async (): Promise<QuizSession[]> => {
      const response = await apiFetch("/api/quiz/history");
      if (response.status === 401) {
        throw new Error("Unauthorized");
      }
      if (!response.ok) {
        throw new Error("Failed to fetch quiz history");
      }
      const data = await response.json();
      if (!data.length) {
        toast({
          title: "No Results Found",
          description: "Could not find your quiz results.",
          variant: "destructive",
        });
      }
      return data;
    },
    enabled: !!sessionId, // don't gate on auth here to avoid false negatives
    retry: 1,
    staleTime: 0 // Always get fresh data
  });

  const currentSession = quizHistory?.find((q: QuizSession) => q.id === sessionId);
  
  useEffect(() => {
    if (currentSession) {
      // Log session data to help debug
      console.log("Quiz session loaded:", currentSession);
    } else if (quizHistory?.length) {
      console.log("Session not found. Available sessions:", quizHistory);
    }
  }, [currentSession, quizHistory]);

  const getExplanation = async (questionId: string, userAnswer: string, question: any) => {
    if (explanations[questionId] || loadingExplanation === questionId) return;

    setLoadingExplanation(questionId);

    try {
      const response = await apiFetch("/api/explain", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          questionText: question.questionText,
          options: {
            A: question.optionA,
            B: question.optionB,
            C: question.optionC,
            D: question.optionD,
          },
          correctAnswer: question.correctAnswer,
          subject: question.subject,
          userAnswer,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get explanation");
      }

      const explanation = await response.json();
      
      setExplanations(prev => ({
        ...prev,
        [questionId]: explanation,
      }));

    } catch (error) {
      console.error("Failed to get explanation:", error);
      toast({
        title: "Explanation Unavailable",
        description: "Failed to load explanation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingExplanation(null);
    }
  };

  // Show loading state
  if (isLoading || sessionLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <div className="loading-spinner w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <h2 className="text-xl font-semibold text-foreground">Loading your results...</h2>
            <p className="text-muted-foreground mt-2">Please wait while we prepare your quiz results.</p>
            
            {/* Debug info */}
            <div className="mt-8 p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground max-w-lg w-full">
              <p className="font-medium mb-2">Debug Information:</p>
              <p>Session ID: <code className="bg-muted px-2 py-1 rounded">{sessionId || 'Not found'}</code></p>
              <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
              <p>Session Loading: {sessionLoading ? 'Yes' : 'No'}</p>
              <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
              <p>Session Found: {currentSession ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Handle authentication check
  if (!isAuthenticated) {
    // Redirect to login
    window.location.href = "/login";
    return null;
  }
  
  // Handle error state
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <XCircle className="mx-auto text-destructive mb-4" size={48} />
            <h1 className="text-2xl font-bold text-foreground mb-4">Error Loading Results</h1>
            <p className="text-muted-foreground mb-6">
              There was a problem loading your quiz results. Please try again.
            </p>
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </main>
      </div>
    );
  }

  if (!currentSession) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <XCircle className="mx-auto text-destructive mb-4" size={48} />
            <h1 className="text-2xl font-bold text-foreground mb-4">Results Not Found</h1>
            <p className="text-muted-foreground mb-6">
              We couldn't find the quiz results you're looking for.
            </p>
            
            <div className="bg-muted/50 p-6 rounded-lg max-w-2xl mx-auto text-left mb-6">
              <h3 className="font-medium text-foreground mb-3">Debug Information:</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Session ID from URL:</span> <code className="bg-muted px-2 py-1 rounded">{sessionId}</code></p>
                <p><span className="font-medium">Total Sessions Found:</span> {quizHistory?.length || 0}</p>
                <p><span className="font-medium">Available Session IDs:</span> {quizHistory?.map(s => s.id).join(', ') || 'None'}</p>
                <p><span className="font-medium">Is Loading:</span> {isLoading ? 'Yes' : 'No'}</p>
                <p><span className="font-medium">Is Authenticated:</span> {isAuthenticated ? 'Yes' : 'No'}</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => window.location.href = '/'}>
                <Home className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
              <Button variant="outline" onClick={() => window.location.reload()}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </div>
            <XCircle className="mx-auto text-destructive mb-4" size={48} />
            <h1 className="text-2xl font-bold text-foreground mb-4">Quiz Results Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The requested quiz results could not be found.
            </p>
            <Link href="/">
              <Button>Back to Dashboard</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const scorePercentage = parseFloat(currentSession.scorePercentage || "0");
  const isPassed = scorePercentage >= 70;
  const questionsAnswered = currentSession.questionsAnswered || [];

  // Performance analysis
  const getPerformanceMessage = () => {
    if (scorePercentage >= 90) return "Excellent work! You've mastered this topic.";
    if (scorePercentage >= 80) return "Great job! You're doing really well.";
    if (scorePercentage >= 70) return "Good work! Keep practicing to improve further.";
    if (scorePercentage >= 60) return "Not bad! Focus on your weak areas.";
    return "Keep practicing! You'll improve with more study.";
  };

  const toggleQuestionExpansion = (questionId: string) => {
    if (expandedQuestion === questionId) {
      setExpandedQuestion(null);
    } else {
      setExpandedQuestion(questionId);
      // Load explanation if not already loaded
      const questionData = questionsAnswered.find((q: any) => q.questionId === questionId);
      if (questionData && !questionData.isCorrect) {
        // In a real app, we would fetch the full question data
        // For now, we'll show a placeholder
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            {isPassed ? (
              <Trophy className="text-primary" size={48} />
            ) : (
              <Target className="text-muted-foreground" size={48} />
            )}
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-results-title">
            Quiz Results - {currentSession.subject}
          </h1>
          <p className="text-muted-foreground">
            {getPerformanceMessage()}
          </p>
        </div>

        {/* Score Overview */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className={`text-4xl font-bold mb-2 ${isPassed ? 'text-primary' : 'text-destructive'}`}>
                  {Math.round(scorePercentage)}%
                </div>
                <p className="text-muted-foreground">Final Score</p>
              </div>
              
              <div>
                <div className="text-4xl font-bold text-primary mb-2">
                  {currentSession.correctAnswers}
                </div>
                <p className="text-muted-foreground">Correct Answers</p>
              </div>
              
              <div>
                <div className="text-4xl font-bold text-muted-foreground mb-2">
                  {Math.floor((currentSession.timeSpent || 0) / 60)}m
                </div>
                <p className="text-muted-foreground">Time Taken</p>
              </div>
            </div>

            <div className="mt-6">
              <Progress 
                value={scorePercentage} 
                className="h-3"
                data-testid="progress-final-score"
              />
            </div>

            <div className="flex items-center justify-center mt-6 space-x-4">
              <Badge variant={isPassed ? "default" : "destructive"} className="px-4 py-2">
                {isPassed ? "Passed" : "Needs Improvement"}
              </Badge>
              
              {scorePercentage >= 80 && (
                <Badge variant="secondary" className="px-4 py-2">
                  <Trophy size={14} className="mr-1" />
                  High Performance
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Performance Breakdown */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target size={20} />
              <span>Performance Breakdown</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <CheckCircle className="text-primary" size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-card-foreground">
                    {currentSession.correctAnswers}
                  </p>
                  <p className="text-muted-foreground">Correct Answers</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center">
                  <XCircle className="text-destructive" size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-card-foreground">
                    {currentSession.wrongAnswers}
                  </p>
                  <p className="text-muted-foreground">Wrong Answers</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Clock className="text-accent" size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-card-foreground">
                    {Math.floor(((currentSession.timeSpent || 0) / currentSession.totalQuestions) / 60)}m
                  </p>
                  <p className="text-muted-foreground">Avg Time/Question</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Trophy className="text-primary" size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-card-foreground">
                    {currentSession.correctAnswers * 10}
                  </p>
                  <p className="text-muted-foreground">Energy Points Earned</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Question Review */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain size={20} />
              <span>Question Review</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {questionsAnswered.map((answer: any, index: number) => (
                <div 
                  key={answer.questionId} 
                  className="border rounded-lg p-4 transition-all hover:border-primary"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-muted-foreground">
                        Question {index + 1}
                      </span>
                      {answer.isCorrect ? (
                        <CheckCircle className="text-primary" size={16} />
                      ) : (
                        <XCircle className="text-destructive" size={16} />
                      )}
                      <Badge variant={answer.isCorrect ? "default" : "destructive"}>
                        {answer.isCorrect ? "Correct" : "Wrong"}
                      </Badge>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleQuestionExpansion(answer.questionId)}
                      data-testid={`button-expand-question-${index + 1}`}
                    >
                      {expandedQuestion === answer.questionId ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                    </Button>
                  </div>

                  {expandedQuestion === answer.questionId && (
                    <div className="space-y-4 pt-4 border-t">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Your Answer:</p>
                          <Badge variant={answer.isCorrect ? "default" : "destructive"}>
                            Option {answer.userAnswer || "Not answered"}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Correct Answer:</p>
                          <Badge variant="default">
                            Option {answer.correctAnswer}
                          </Badge>
                        </div>
                      </div>

                      {!answer.isCorrect && (
                        <div className="bg-muted p-4 rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <Lightbulb className="text-accent" size={16} />
                            <span className="text-sm font-medium">AI Explanation</span>
                          </div>
                          
                          {explanations[answer.questionId] ? (
                            <div className="space-y-3">
                              <p className="text-sm text-muted-foreground">
                                {explanations[answer.questionId].explanation}
                              </p>
                              
                              {explanations[answer.questionId].keyPoints.length > 0 && (
                                <div>
                                  <p className="text-sm font-medium mb-2">Key Points:</p>
                                  <ul className="text-sm text-muted-foreground space-y-1">
                                    {explanations[answer.questionId].keyPoints.map((point, i) => (
                                      <li key={i} className="flex items-start space-x-2">
                                        <span>•</span>
                                        <span>{point}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-center py-4">
                              {loadingExplanation === answer.questionId ? (
                                <div className="loading-spinner w-4 h-4 border border-accent border-t-transparent rounded-full mx-auto"></div>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => getExplanation(answer.questionId, answer.userAnswer, {})}
                                  data-testid={`button-get-explanation-${index + 1}`}
                                >
                                  Get AI Explanation
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href={`/quiz/${currentSession.subject}`}>
            <Button className="w-full sm:w-auto" data-testid="button-retake-quiz">
              <RotateCcw size={16} className="mr-2" />
              Retake Quiz
            </Button>
          </Link>
          
          <Link href="/">
            <Button variant="outline" className="w-full sm:w-auto" data-testid="button-back-dashboard">
              <Home size={16} className="mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
