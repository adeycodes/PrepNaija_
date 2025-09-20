import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress as ProgressBar } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Target, 
  BookOpen, 
  Zap, 
  Calendar,
  Trophy,
  Clock,
  Star
} from "lucide-react";

const SUBJECTS = ["Mathematics", "English", "Physics", "Chemistry", "Biology"];

export default function Progress() {
  const { data: progress = [] } = useQuery({
    queryKey: ["/api/progress"],
    retry: false,
  });

  const { data: quizHistory = [] } = useQuery({
    queryKey: ["/api/quiz/history"],
    retry: false,
  });

  const progressArray = Array.isArray(progress) ? progress : [];
  const quizHistoryArray = Array.isArray(quizHistory) ? quizHistory : [];

  // Calculate overall stats
  const totalQuestions = progressArray.reduce((sum, p) => sum + (p.questionsAttempted || 0), 0);
  const totalCorrect = progressArray.reduce((sum, p) => sum + (p.questionsCorrect || 0), 0);
  const totalEnergyPoints = progressArray.reduce((sum, p) => sum + (p.energyPoints || 0), 0);
  const overallAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  // Get subject-wise progress
  const subjectProgress = SUBJECTS.map(subject => {
    const subjectData = progressArray.filter(p => p.subject === subject);
    const attempted = subjectData.reduce((sum, p) => sum + (p.questionsAttempted || 0), 0);
    const correct = subjectData.reduce((sum, p) => sum + (p.questionsCorrect || 0), 0);
    const points = subjectData.reduce((sum, p) => sum + (p.energyPoints || 0), 0);
    const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
    const mastery = attempted > 0 ? Math.min(accuracy, 100) : 0;

    return {
      subject,
      attempted,
      correct,
      points,
      accuracy,
      mastery,
      lastPracticed: subjectData.length > 0 ? subjectData[0].lastPracticed : null
    };
  });

  // Recent performance trend (last 10 quizzes)
  const recentQuizzes = quizHistoryArray.slice(0, 10);
  const averageRecentScore = recentQuizzes.length > 0
    ? Math.round(recentQuizzes.reduce((sum, quiz) => sum + parseFloat(quiz.scorePercentage || 0), 0) / recentQuizzes.length)
    : 0;

  // Streak calculation (simplified)
  const streak = Math.min(7, quizHistoryArray.length);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Progress Tracking</h1>
          <p className="text-muted-foreground">Monitor your exam preparation journey</p>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overall Accuracy</p>
                <p className="text-2xl font-bold">{overallAccuracy}%</p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
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
              <BookOpen className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Energy Points</p>
                <p className="text-2xl font-bold">{totalEnergyPoints}</p>
              </div>
              <Zap className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Study Streak</p>
                <p className="text-2xl font-bold">{streak} days</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Subject Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Subject Progress</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {subjectProgress.map((subject) => (
              <div key={subject.subject} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{subject.subject}</span>
                  <div className="flex items-center space-x-2">
                    <Badge variant={subject.mastery >= 80 ? "default" : subject.mastery >= 60 ? "secondary" : "outline"}>
                      {subject.mastery}% mastery
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {subject.attempted} questions
                    </span>
                  </div>
                </div>
                <ProgressBar value={subject.mastery} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{subject.correct} correct</span>
                  <span>{subject.points} points</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Performance Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="h-5 w-5" />
              <span>Recent Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">{averageRecentScore}%</div>
                <p className="text-sm text-muted-foreground">Average Score (Last 10 Quizzes)</p>
              </div>

              {recentQuizzes.slice(0, 5).map((quiz, index) => (
                <div key={quiz.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      parseFloat(quiz.scorePercentage) >= 70 ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {parseFloat(quiz.scorePercentage) >= 70 ? (
                        <Star className="h-4 w-4 text-green-600" />
                      ) : (
                        <Clock className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{quiz.subject}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(quiz.completedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{Math.round(parseFloat(quiz.scorePercentage))}%</div>
                    <div className="text-xs text-muted-foreground">
                      {quiz.correctAnswers}/{quiz.totalQuestions}
                    </div>
                  </div>
                </div>
              ))}

              {recentQuizzes.length === 0 && (
                <div className="text-center py-8">
                  <BookOpen className="mx-auto text-muted-foreground mb-4" size={48} />
                  <p className="text-muted-foreground">No quiz history yet</p>
                  <p className="text-sm text-muted-foreground">Start taking quizzes to see your progress</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Study Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Study Recommendations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {subjectProgress
              .filter(s => s.attempted > 0 && s.mastery < 70)
              .slice(0, 2)
              .map((subject) => (
                <div key={subject.subject} className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <BookOpen className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium">Focus on {subject.subject}</p>
                      <p className="text-sm text-muted-foreground">
                        {subject.mastery}% mastery - needs improvement
                      </p>
                    </div>
                  </div>
                </div>
              ))}

            {subjectProgress.filter(s => s.attempted === 0).length > 0 && (
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Star className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Start New Subjects</p>
                    <p className="text-sm text-muted-foreground">
                      Begin practicing {subjectProgress.filter(s => s.attempted === 0).map(s => s.subject).join(", ")}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
