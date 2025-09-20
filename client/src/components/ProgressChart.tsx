import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useProgress } from "@/hooks/useProgress";
import { SUBJECTS } from "@/utils/constants";
import { TrendingUp, Target, Award, Zap } from "lucide-react";

interface ProgressChartProps {
  data?: any[];
  quizHistory?: any[];
}

export default function ProgressChart({ data, quizHistory }: ProgressChartProps) {
  const { getOverallStats, getProgressChartData } = useProgress();
  const stats = getOverallStats();
  const chartData = getProgressChartData();

  // Calculate recent performance trend
  const recentQuizzes = quizHistory?.slice(0, 5) || [];
  const recentAverageScore = recentQuizzes.length > 0 
    ? Math.round(recentQuizzes.reduce((sum: number, quiz: any) => sum + parseFloat(quiz.scorePercentage || 0), 0) / recentQuizzes.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="text-primary" size={20} />
              <div>
                <p className="text-sm text-muted-foreground">Overall Accuracy</p>
                <p className="text-2xl font-bold text-card-foreground" data-testid="text-overall-accuracy">
                  {Math.round(stats.overallAccuracy * 100)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="text-accent" size={20} />
              <div>
                <p className="text-sm text-muted-foreground">Recent Average</p>
                <p className="text-2xl font-bold text-card-foreground" data-testid="text-recent-average">
                  {recentAverageScore}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Award className="text-primary" size={20} />
              <div>
                <p className="text-sm text-muted-foreground">Mastered</p>
                <p className="text-2xl font-bold text-card-foreground" data-testid="text-mastered-subjects">
                  {stats.masteredSubjects}/{SUBJECTS.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className="text-accent energy-points" size={20} />
              <div>
                <p className="text-sm text-muted-foreground">Energy Points</p>
                <p className="text-2xl font-bold text-card-foreground" data-testid="text-total-energy">
                  {stats.totalEnergyPoints}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subject Progress Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Subject Progress</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <div className="space-y-4">
              {chartData.map((subjectData) => (
                <div key={subjectData.subject} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-card-foreground">
                      {subjectData.subject}
                    </span>
                    <div className="flex items-center space-x-2">
                      {subjectData.mastery && (
                        <Award className="text-primary" size={14} />
                      )}
                      <span className="text-sm text-muted-foreground">
                        {subjectData.accuracy}%
                      </span>
                    </div>
                  </div>
                  <Progress 
                    value={subjectData.accuracy} 
                    className="h-2"
                    data-testid={`progress-${subjectData.subject.toLowerCase()}`}
                  />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{subjectData.correct} correct</span>
                    <span>{subjectData.attempted} attempted</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <TrendingUp className="mx-auto text-muted-foreground mb-4" size={48} />
              <p className="text-muted-foreground mb-2">No progress data yet</p>
              <p className="text-sm text-muted-foreground">
                Start taking quizzes to see your progress here
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Performance</CardTitle>
        </CardHeader>
        <CardContent>
          {recentQuizzes.length > 0 ? (
            <div className="space-y-3">
              {recentQuizzes.map((quiz: any, index: number) => (
                <div key={quiz.id} className="flex items-center space-x-4 p-3 bg-muted rounded-lg">
                  <div className="flex-shrink-0">
                    <div className={`w-3 h-3 rounded-full ${
                      parseFloat(quiz.scorePercentage) >= 70 ? 'bg-primary' : 'bg-destructive'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-card-foreground truncate">
                      {quiz.subject} Quiz
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(quiz.completedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className={`text-sm font-semibold ${
                      parseFloat(quiz.scorePercentage) >= 70 ? 'text-primary' : 'text-destructive'
                    }`}>
                      {Math.round(parseFloat(quiz.scorePercentage))}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <TrendingUp className="mx-auto text-muted-foreground mb-4" size={48} />
              <p className="text-muted-foreground">No quiz history yet</p>
              <p className="text-sm text-muted-foreground">
                Take your first quiz to start tracking performance
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
