import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/apiClient";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { 
  BookOpen,
  Target,
  TrendingUp,
  Zap,
  Clock,
  Trophy,
  Calendar,
  Award,
  ArrowRight
} from "lucide-react";

interface DashboardStats {
  totalQuizzes: number;
  averageScore: number;
  totalQuestions: number;
  energyPoints: number;
  streak: number;
  masteriedTopics: number;
}

export default function Overview() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  const { data: quizHistory } = useQuery({
    queryKey: ["/api/quiz/history"],
    retry: false,
    queryFn: async () => {
      const res = await apiFetch("/api/quiz/history");
      if (!res.ok) throw new Error(`${res.status}`);
      return res.json();
    },
  });

  const { data: progress } = useQuery({
    queryKey: ["/api/progress"],
    retry: false,
    queryFn: async () => {
      const res = await apiFetch("/api/progress");
      if (!res.ok) throw new Error(`${res.status}`);
      return res.json();
    },
  });

  const { data: achievements } = useQuery({
    queryKey: ["/api/achievements"],
    retry: false,
    queryFn: async () => {
      const res = await apiFetch("/api/achievements");
      if (!res.ok) throw new Error(`${res.status}`);
      return res.json();
    },
  });

  const quizHistoryArray = Array.isArray(quizHistory) ? quizHistory : [];
  const progressArray = Array.isArray(progress) ? progress : [];
  
  const stats: DashboardStats = {
    totalQuizzes: quizHistoryArray.length || 0,
    averageScore: quizHistoryArray.length 
      ? Math.round(quizHistoryArray.reduce((acc: number, quiz: any) => acc + parseFloat(quiz.scorePercentage || 0), 0) / quizHistoryArray.length)
      : 0,
    totalQuestions: quizHistoryArray.reduce((acc: number, quiz: any) => acc + quiz.totalQuestions, 0) || 0,
    energyPoints: progressArray.reduce((acc: number, p: any) => acc + (p.energyPoints || 0), 0) || 0,
    streak: 7,
    masteriedTopics: progressArray.filter((p: any) => parseFloat(p.masteryLevel) >= 0.8).length || 0,
  };

  const userName = user?.profile?.fullName || user?.firstName || "Student";
  const recentActivity = quizHistoryArray.slice(0, 3) || [];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          {greeting}, {userName}! 👋
        </h1>
        <p className="text-muted-foreground">
          Ready to continue your exam preparation journey?
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Quizzes Taken</p>
                <p className="text-2xl font-bold">{stats.totalQuizzes}</p>
              </div>
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Score</p>
                <p className="text-2xl font-bold">{stats.averageScore}%</p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Energy Points</p>
                <p className="text-2xl font-bold">{stats.energyPoints}</p>
              </div>
              <Zap className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Start</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              className="w-full justify-between" 
              size="lg"
              onClick={() => setLocation('/quiz?subject=Mathematics&exam=JAMB')}
            >
              <span>Start Mathematics Quiz</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-between" 
              size="lg"
              onClick={() => setLocation('/quiz?subject=English&exam=JAMB')}
            >
              <span>Practice English</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-between" 
              size="lg"
              onClick={() => setLocation('/quiz?subject=Biology&exam=JAMB')}
            >
              <span>Practice Biology</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-between" 
              size="lg"
              onClick={() => setLocation('/quiz?subject=Physics&exam=JAMB')}
            >
              <span>Practice Physics</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-between" 
              size="lg"
              onClick={() => setLocation('/quiz?subject=Chemistry&exam=JAMB')}
            >
              <span>Practice Chemistry</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Recent Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((quiz: any, index: number) => (
                  <div key={quiz.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        parseFloat(quiz.scorePercentage) >= 70 ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        <BookOpen className={`h-4 w-4 ${
                          parseFloat(quiz.scorePercentage) >= 70 ? 'text-green-600' : 'text-red-600'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium">{quiz.subject} Quiz</p>
                        <p className="text-xs text-muted-foreground">
                          {quiz.totalQuestions} questions
                        </p>
                      </div>
                    </div>
                    <Badge variant={parseFloat(quiz.scorePercentage) >= 70 ? "default" : "secondary"}>
                      {Math.round(parseFloat(quiz.scorePercentage))}%
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="mx-auto text-muted-foreground mb-4" size={48} />
                <p className="text-muted-foreground">No quizzes taken yet</p>
                <p className="text-sm text-muted-foreground">Start practicing to see your activity here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Today's Goal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Today's Goal</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Complete 2 practice quizzes</p>
              <div className="w-64 h-2 bg-muted rounded-full mt-2">
                <div className="w-1/3 h-full bg-primary rounded-full"></div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">1 of 2 completed</p>
            </div>
            <Trophy className="h-8 w-8 text-yellow-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
