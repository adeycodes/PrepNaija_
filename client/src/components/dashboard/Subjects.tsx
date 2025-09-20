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
  Clock
} from "lucide-react";

const SUBJECTS = [
  {
    id: "Mathematics",
    name: "Mathematics",
    icon: Calculator,
    color: "bg-blue-500",
    description: "Numbers, algebra, geometry, and calculations"
  },
  {
    id: "English",
    name: "English Language",
    icon: BookText,
    color: "bg-green-500",
    description: "Grammar, comprehension, and vocabulary"
  },
  {
    id: "Physics",
    name: "Physics",
    icon: Atom,
    color: "bg-purple-500",
    description: "Motion, forces, energy, and matter"
  },
  {
    id: "Chemistry",
    name: "Chemistry",
    icon: FlaskConical,
    color: "bg-orange-500",
    description: "Elements, compounds, and reactions"
  },
  {
    id: "Biology",
    name: "Biology",
    icon: Dna,
    color: "bg-emerald-500",
    description: "Living organisms and life processes"
  }
];

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
          <p className="text-muted-foreground">Choose a subject to start practicing</p>
        </div>
      </div>

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

                {/* Action Buttons */}
                <div className="flex space-x-2 pt-2">
                  <Button 
                    className="flex-1" 
                    size="sm"
                    onClick={() => setLocation('/quiz-selector')}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start Quiz
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setLocation('/dashboard')} // Will show progress for this subject
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Progress
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Subject Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Recommendations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Calculator className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="font-medium">Focus on Mathematics</p>
                  <p className="text-sm text-muted-foreground">You haven't practiced this subject recently</p>
                </div>
              </div>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setLocation('/quiz-selector')}
              >
                Practice Now
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Clock className="h-8 w-8 text-green-600" />
                <div>
                  <p className="font-medium">Daily Goal</p>
                  <p className="text-sm text-muted-foreground">Complete 20 questions across all subjects</p>
                </div>
              </div>
              <div className="text-sm font-medium text-green-600">
                Progress: 60%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
