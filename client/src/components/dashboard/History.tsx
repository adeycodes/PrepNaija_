import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Clock, 
  Trophy, 
  BookOpen, 
  Target,
  TrendingUp,
  Filter,
  Download
} from "lucide-react";

export default function History() {
  const { data: quizHistory = [] } = useQuery({
    queryKey: ["/api/quiz/history"],
    retry: false,
  });

  const quizHistoryArray = Array.isArray(quizHistory) ? quizHistory : [];

  // Calculate summary stats
  const totalQuizzes = quizHistoryArray.length;
  const averageScore = totalQuizzes > 0
    ? Math.round(quizHistoryArray.reduce((sum, quiz) => sum + parseFloat(quiz.scorePercentage || 0), 0) / totalQuizzes)
    : 0;
  const totalQuestions = quizHistoryArray.reduce((sum, quiz) => sum + quiz.totalQuestions, 0);
  const bestScore = totalQuizzes > 0
    ? Math.max(...quizHistoryArray.map(quiz => parseFloat(quiz.scorePercentage || 0)))
    : 0;

  // Group by subject
  const subjectStats = quizHistoryArray.reduce((acc, quiz) => {
    if (!acc[quiz.subject]) {
      acc[quiz.subject] = { count: 0, totalScore: 0, totalQuestions: 0 };
    }
    acc[quiz.subject].count++;
    acc[quiz.subject].totalScore += parseFloat(quiz.scorePercentage || 0);
    acc[quiz.subject].totalQuestions += quiz.totalQuestions;
    return acc;
  }, {} as { [key: string]: { count: number; totalScore: number; totalQuestions: number } });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ${seconds % 60}s`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-100";
    if (score >= 70) return "text-blue-600 bg-blue-100";
    if (score >= 60) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getPerformanceIcon = (score: number) => {
    if (score >= 80) return <Trophy className="h-4 w-4" />;
    if (score >= 70) return <Target className="h-4 w-4" />;
    return <BookOpen className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quiz History</h1>
          <p className="text-muted-foreground">Track your quiz performance over time</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Quizzes</p>
                <p className="text-2xl font-bold">{totalQuizzes}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Score</p>
                <p className="text-2xl font-bold">{averageScore}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Best Score</p>
                <p className="text-2xl font-bold">{Math.round(bestScore)}%</p>
              </div>
              <Trophy className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Questions Solved</p>
                <p className="text-2xl font-bold">{totalQuestions}</p>
              </div>
              <Target className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Subject Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Subject Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(subjectStats).map(([subject, stats]) => {
              // const avgScore = Math.round(stats.totalScore / stats.count);
              return (
                <div key={subject} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{subject}</p>
                    <p className="text-sm text-muted-foreground">
                      {stats.count} quiz{stats.count !== 1 ? 'es' : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`px-2 py-1 rounded text-sm font-medium ${getScoreColor(avgScore)}`}>
                      {avgScore}%
                    </div>
                  </div>
                </div>
              );
            })}

            {Object.keys(subjectStats).length === 0 && (
              <div className="text-center py-8">
                <BookOpen className="mx-auto text-muted-foreground mb-4" size={48} />
                <p className="text-muted-foreground">No quizzes taken yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quiz History */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Quizzes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {quizHistoryArray.slice(0, 10).map((quiz) => {
                  const score = Math.round(parseFloat(quiz.scorePercentage || 0));
                  return (
                    <div key={quiz.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getScoreColor(score)}`}>
                          {getPerformanceIcon(score)}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium">{quiz.subject} Quiz</h3>
                            <Badge variant="outline" className="text-xs">
                              {quiz.totalQuestions} questions
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(quiz.completedAt)}</span>
                            </span>
                            {quiz.timeSpent && (
                              <span className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>{formatDuration(quiz.timeSpent)}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-lg font-bold">{score}%</div>
                        <div className="text-sm text-muted-foreground">
                          {quiz.correctAnswers}/{quiz.totalQuestions} correct
                        </div>
                      </div>
                    </div>
                  );
                })}

                {quizHistoryArray.length === 0 && (
                  <div className="text-center py-12">
                    <BookOpen className="mx-auto text-muted-foreground mb-4" size={64} />
                    <h3 className="text-lg font-medium mb-2">No quiz history</h3>
                    <p className="text-muted-foreground mb-4">
                      You haven't taken any quizzes yet. Start practicing to see your history here.
                    </p>
                    <Button>Start Your First Quiz</Button>
                  </div>
                )}

                {quizHistoryArray.length > 10 && (
                  <div className="text-center pt-4">
                    <Button variant="outline">View More History</Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
