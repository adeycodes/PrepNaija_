import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Calculator,
  BookText,
  Atom,
  FlaskConical,
  Dna,
  Play,
  TrendingUp,
  Target,
  Clock,
  BookOpen,
  GraduationCap
} from "lucide-react";

const SUBJECTS = [
  {
    id: "Mathematics",
    name: "Mathematics",
    icon: Calculator,
    color: "bg-blue-500",
    gradient: "from-blue-500 to-indigo-600",
    description: "Numbers, algebra, geometry, and calculations"
  },
  {
    id: "English",
    name: "Use of English",
    icon: BookText,
    color: "bg-green-500",
    gradient: "from-green-500 to-emerald-600",
    description: "Grammar, comprehension, and vocabulary"
  },
  {
    id: "Physics",
    name: "Physics",
    icon: Atom,
    color: "bg-purple-500",
    gradient: "from-purple-500 to-pink-600",
    description: "Motion, forces, energy, and matter"
  },
  {
    id: "Chemistry",
    name: "Chemistry",
    icon: FlaskConical,
    color: "bg-orange-500",
    gradient: "from-orange-500 to-red-600",
    description: "Elements, compounds, and reactions"
  },
  {
    id: "Biology",
    name: "Biology",
    icon: Dna,
    color: "bg-emerald-500",
    gradient: "from-emerald-500 to-teal-600",
    description: "Living organisms and life processes"
  }
];

// File: client/src/components/dashboard/Subjects.tsx
export default function Subjects() {
  const [, setLocation] = useLocation();
  const { data: progress } = useQuery({
    queryKey: ["/api/progress"],
    retry: false,
  });

  const progressArray = Array.isArray(progress) ? progress : [];

  const getSubjectProgress = (subjectId: string) => {
    const subjectProgress = progressArray.filter(p => p.subject === subjectId);
    if (subjectProgress.length === 0) {
      return { masteryLevel: 0, questionsAttempted: 0, energyPoints: 0 };
    }

    const totalAttempted = subjectProgress.reduce((sum, p) => sum + (p.questionsAttempted || 0), 0);
    const totalCorrect = subjectProgress.reduce((sum, p) => sum + (p.questionsCorrect || 0), 0);
    const totalEnergyPoints = subjectProgress.reduce((sum, p) => sum + (p.energyPoints || 0), 0);
    const avgMastery = totalAttempted > 0 ? (totalCorrect / totalAttempted) * 100 : 0;

    return {
      masteryLevel: Math.round(avgMastery),
      questionsAttempted: totalAttempted,
      energyPoints: totalEnergyPoints
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Subjects</h1>
          <p className="text-muted-foreground">Learn concepts, then practice with quizzes</p>
        </div>
      </div>

      {/* Learning Path Banner */}
      <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-none">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <GraduationCap className="h-6 w-6" />
                <h3 className="text-xl font-bold">AI-Powered Study Path</h3>
              </div>
              <p className="text-blue-50">
                Learn each topic with AI guidance before taking practice quizzes
              </p>
            </div>
            <BookOpen className="h-16 w-16 opacity-20" />
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SUBJECTS.map((subject) => {
          const Icon = subject.icon;
          const subjectProgress = getSubjectProgress(subject.id);
          
          return (
            <Card key={subject.id} className="relative overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-lg ${subject.color} flex items-center justify-center`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <Badge variant="outline">
                    {subjectProgress.masteryLevel}% mastery
                  </Badge>
                </div>
                <CardTitle className="text-lg">{subject.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{subject.description}</p>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{subjectProgress.masteryLevel}%</span>
                  </div>
                  <Progress value={subjectProgress.masteryLevel} className="h-2" />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center">
                    <p className="font-semibold text-lg">{subjectProgress.questionsAttempted}</p>
                    <p className="text-muted-foreground">Questions</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-lg">{subjectProgress.energyPoints}</p>
                    <p className="text-muted-foreground">Points</p>
                  </div>
                </div>

                {/* Learning Recommendation */}
                {subjectProgress.questionsAttempted === 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs text-blue-800 flex items-center">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Start by learning the concepts first!
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-2 pt-2">
                  {/* Learn Button - Primary Action */}
                  <Button 
                    className={`w-full bg-gradient-to-r ${subject.gradient} hover:opacity-90`}
                    size="sm"
                    onClick={() => setLocation(`/study-path?subject=${subject.id}`)}
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Learn Topics
                  </Button>
                  
                  {/* Secondary Actions */}
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => setLocation('/quiz-selector')}
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Practice
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setLocation('/dashboard')}
                    >
                      <TrendingUp className="h-4 w-4 mr-1" />
                      Progress
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Learning Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Study Recommendations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <BookOpen className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="font-medium">Learn Before Practice</p>
                  <p className="text-sm text-muted-foreground">
                    Use AI-powered lessons to understand concepts deeply
                  </p>
                </div>
              </div>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setLocation('/study-path')}
              >
                Start Learning
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Clock className="h-8 w-8 text-green-600" />
                <div>
                  <p className="font-medium">Daily Goal</p>
                  <p className="text-sm text-muted-foreground">
                    Complete 3 topics and 20 practice questions daily
                  </p>
                </div>
              </div>
              <div className="text-sm font-medium text-green-600">
                On Track! 🎯
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <GraduationCap className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="font-medium">Sequential Learning</p>
                  <p className="text-sm text-muted-foreground">
                    Topics unlock as you complete previous ones
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}