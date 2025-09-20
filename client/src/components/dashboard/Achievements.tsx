import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/apiClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy,
  Star,
  Target,
  Zap,
  BookOpen,
  Calendar,
  Award,
  Medal,
  Crown,
  Flame,
  CheckCircle,
  Lock
} from "lucide-react";

// Achievement definitions
const ACHIEVEMENT_DEFINITIONS = [
  {
    id: "first_quiz",
    title: "First Steps",
    description: "Complete your first quiz",
    icon: BookOpen,
    category: "Getting Started",
    points: 10,
    requirement: 1,
    type: "quiz_count"
  },
  {
    id: "quiz_master_10",
    title: "Quiz Master",
    description: "Complete 10 quizzes",
    icon: Trophy,
    category: "Milestones",
    points: 50,
    requirement: 10,
    type: "quiz_count"
  },
  {
    id: "perfect_score",
    title: "Perfect Score",
    description: "Score 100% in any quiz",
    icon: Star,
    category: "Performance",
    points: 100,
    requirement: 100,
    type: "best_score"
  },
  {
    id: "high_achiever",
    title: "High Achiever",
    description: "Score 80% or higher in 5 quizzes",
    icon: Target,
    category: "Performance",
    points: 75,
    requirement: 5,
    type: "high_scores"
  },
  {
    id: "mathematics_expert",
    title: "Mathematics Expert",
    description: "Complete 5 Mathematics quizzes",
    icon: Award,
    category: "Subject Mastery",
    points: 40,
    requirement: 5,
    type: "subject_mathematics"
  },
  {
    id: "english_master",
    title: "English Master",
    description: "Complete 5 English quizzes",
    icon: Medal,
    category: "Subject Mastery", 
    points: 40,
    requirement: 5,
    type: "subject_english"
  },
  {
    id: "science_genius",
    title: "Science Genius",
    description: "Complete quizzes in all 3 science subjects",
    icon: Crown,
    category: "Subject Mastery",
    points: 60,
    requirement: 3,
    type: "science_subjects"
  },
  {
    id: "streak_warrior",
    title: "Streak Warrior",
    description: "Practice for 7 consecutive days",
    icon: Flame,
    category: "Consistency",
    points: 80,
    requirement: 7,
    type: "daily_streak"
  },
  {
    id: "speed_demon",
    title: "Speed Demon",
    description: "Complete a quiz in under 15 minutes",
    icon: Zap,
    category: "Performance",
    points: 30,
    requirement: 15,
    type: "fast_completion"
  },
  {
    id: "dedicated_student",
    title: "Dedicated Student",
    description: "Answer 100 questions correctly",
    icon: CheckCircle,
    category: "Milestones",
    points: 70,
    requirement: 100,
    type: "correct_answers"
  }
];

export default function Achievements() {
  const { data: achievements = [] } = useQuery({
    queryKey: ["/api/achievements"],
    retry: false,
    queryFn: async () => {
      const res = await apiFetch("/api/achievements");
      if (!res.ok) throw new Error(`${res.status}`);
      return res.json();
    },
  });

  const { data: quizHistory = [] } = useQuery({
    queryKey: ["/api/quiz/history"],
    retry: false,
    queryFn: async () => {
      const res = await apiFetch("/api/quiz/history");
      if (!res.ok) throw new Error(`${res.status}`);
      return res.json();
    },
  });

  const { data: progress = [] } = useQuery({
    queryKey: ["/api/progress"],
    retry: false,
    queryFn: async () => {
      const res = await apiFetch("/api/progress");
      if (!res.ok) throw new Error(`${res.status}`);
      return res.json();
    },
  });

  const achievementsArray = Array.isArray(achievements) ? achievements : [];
  const quizHistoryArray = Array.isArray(quizHistory) ? quizHistory : [];
  const progressArray = Array.isArray(progress) ? progress : [];

  // Calculate user stats for achievement progress
  const userStats = {
    totalQuizzes: quizHistoryArray.length,
    bestScore: quizHistoryArray.length > 0 
      ? Math.max(...quizHistoryArray.map(q => parseFloat(q.scorePercentage || 0)))
      : 0,
    highScores: quizHistoryArray.filter(q => parseFloat(q.scorePercentage || 0) >= 80).length,
    correctAnswers: quizHistoryArray.reduce((sum, q) => sum + q.correctAnswers, 0),
    subjectCounts: quizHistoryArray.reduce((acc, q) => {
      acc[q.subject.toLowerCase()] = (acc[q.subject.toLowerCase()] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number }),
    scienceSubjects: new Set(
      quizHistoryArray
        .filter(q => ['Physics', 'Chemistry', 'Biology'].includes(q.subject))
        .map(q => q.subject)
    ).size,
    fastestTime: quizHistoryArray.length > 0
      ? Math.min(...quizHistoryArray.map(q => q.timeSpent || Infinity).filter(t => t !== Infinity))
      : Infinity,
    dailyStreak: Math.min(7, quizHistoryArray.length) // Simplified calculation
  };

  // Check achievement progress
  const getAchievementProgress = (achievement: typeof ACHIEVEMENT_DEFINITIONS[0]) => {
    let currentValue = 0;
    
    switch (achievement.type) {
      case "quiz_count":
        currentValue = userStats.totalQuizzes;
        break;
      case "best_score":
        currentValue = userStats.bestScore;
        break;
      case "high_scores":
        currentValue = userStats.highScores;
        break;
      case "correct_answers":
        currentValue = userStats.correctAnswers;
        break;
      case "subject_mathematics":
        currentValue = userStats.subjectCounts.mathematics || 0;
        break;
      case "subject_english":
        currentValue = userStats.subjectCounts.english || 0;
        break;
      case "science_subjects":
        currentValue = userStats.scienceSubjects;
        break;
      case "daily_streak":
        currentValue = userStats.dailyStreak;
        break;
      case "fast_completion":
        currentValue = userStats.fastestTime !== Infinity ? Math.floor(userStats.fastestTime / 60) : 0;
        break;
      default:
        currentValue = 0;
    }

    const isUnlocked = currentValue >= achievement.requirement;
    const progress = Math.min((currentValue / achievement.requirement) * 100, 100);
    
    return { currentValue, isUnlocked, progress };
  };

  // Group achievements by category
  const achievementsByCategory = ACHIEVEMENT_DEFINITIONS.reduce((acc, achievement) => {
    if (!acc[achievement.category]) {
      acc[achievement.category] = [];
    }
    acc[achievement.category].push(achievement);
    return acc;
  }, {} as { [key: string]: typeof ACHIEVEMENT_DEFINITIONS });

  const totalPoints = achievementsArray.reduce((sum, achievement) => {
    const definition = ACHIEVEMENT_DEFINITIONS.find(def => def.title === achievement.title);
    return sum + (definition?.points || 0);
  }, 0);

  const unlockedCount = ACHIEVEMENT_DEFINITIONS.filter(achievement => {
    const { isUnlocked } = getAchievementProgress(achievement);
    return isUnlocked;
  }).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Achievements</h1>
          <p className="text-muted-foreground">Unlock rewards as you progress in your studies</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">{totalPoints} pts</div>
          <div className="text-sm text-muted-foreground">Total earned</div>
        </div>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Overall Progress</h3>
            <Badge variant="secondary">
              {unlockedCount}/{ACHIEVEMENT_DEFINITIONS.length} unlocked
            </Badge>
          </div>
          <Progress 
            value={(unlockedCount / ACHIEVEMENT_DEFINITIONS.length) * 100} 
            className="h-3"
          />
          <p className="text-sm text-muted-foreground mt-2">
            Keep practicing to unlock more achievements!
          </p>
        </CardContent>
      </Card>

      {/* Achievement Categories */}
      <div className="space-y-6">
        {Object.entries(achievementsByCategory).map(([category, categoryAchievements]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <span>{category}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryAchievements.map((achievement) => {
                  const { currentValue, isUnlocked, progress } = getAchievementProgress(achievement);
                  const Icon = achievement.icon;
                  
                  return (
                    <div
                      key={achievement.id}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        isUnlocked 
                          ? 'border-primary bg-primary/5 shadow-md' 
                          : 'border-muted bg-muted/20'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          isUnlocked ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                        }`}>
                          {isUnlocked ? (
                            <Icon className="h-6 w-6" />
                          ) : (
                            <Lock className="h-6 w-6" />
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-primary">
                            +{achievement.points} pts
                          </div>
                        </div>
                      </div>
                      
                      <h4 className={`font-medium mb-1 ${
                        isUnlocked ? 'text-foreground' : 'text-muted-foreground'
                      }`}>
                        {achievement.title}
                      </h4>
                      
                      <p className={`text-sm mb-3 ${
                        isUnlocked ? 'text-muted-foreground' : 'text-muted-foreground/70'
                      }`}>
                        {achievement.description}
                      </p>

                      {!isUnlocked && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span>Progress</span>
                            <span>{currentValue}/{achievement.requirement}</span>
                          </div>
                          <Progress value={progress} className="h-1" />
                        </div>
                      )}

                      {isUnlocked && (
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm font-medium text-green-600">Unlocked!</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <span>Recent Achievements</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {achievementsArray.length > 0 ? (
            <div className="space-y-3">
              {achievementsArray.slice(0, 3).map((achievement) => (
                <div key={achievement.id} className="flex items-center space-x-3 p-3 bg-primary/5 rounded-lg">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <Trophy className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{achievement.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Unlocked {new Date(achievement.earnedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Trophy className="mx-auto text-muted-foreground mb-4" size={48} />
              <p className="text-muted-foreground">No achievements yet</p>
              <p className="text-sm text-muted-foreground">Complete quizzes to start earning achievements!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
