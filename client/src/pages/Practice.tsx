import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import { useProgress } from '@/hooks/useProgress';
import { useOffline } from '@/hooks/useOffline';
import { 
  Calculator, 
  Book, 
  Atom, 
  Beaker, 
  Dna,
  Clock,
  Target,
  Trophy,
  Zap,
  Play,
  Download,
  WifiOff
} from 'lucide-react';

const SUBJECTS = [
  {
    name: 'Mathematics',
    icon: Calculator,
    color: 'bg-blue-500',
    description: 'Algebra, Geometry, Calculus, Statistics',
    topics: ['Algebra', 'Geometry', 'Trigonometry', 'Statistics', 'Calculus'],
  },
  {
    name: 'English',
    icon: Book,
    color: 'bg-green-500',
    description: 'Grammar, Comprehension, Literature',
    topics: ['Grammar', 'Comprehension', 'Literature', 'Writing', 'Vocabulary'],
  },
  {
    name: 'Physics',
    icon: Atom,
    color: 'bg-purple-500',
    description: 'Mechanics, Waves, Electricity, Modern Physics',
    topics: ['Mechanics', 'Waves', 'Electricity', 'Magnetism', 'Modern Physics'],
  },
  {
    name: 'Chemistry',
    icon: Beaker,
    color: 'bg-orange-500',
    description: 'Organic, Inorganic, Physical Chemistry',
    topics: ['Organic', 'Inorganic', 'Physical', 'Analytical', 'Environmental'],
  },
  {
    name: 'Biology',
    icon: Dna,
    color: 'bg-emerald-500',
    description: 'Cell Biology, Genetics, Ecology, Evolution',
    topics: ['Cell Biology', 'Genetics', 'Ecology', 'Evolution', 'Human Biology'],
  },
];

const EXAM_TYPES = [
  {
    name: 'JAMB',
    description: 'Joint Admissions and Matriculation Board',
    duration: '3 hours',
    questions: '180 questions',
    badge: 'University Entrance',
  },
  {
    name: 'WAEC',
    description: 'West African Senior School Certificate',
    duration: '3 hours',
    questions: '60 questions',
    badge: 'Secondary Certificate',
  },
  {
    name: 'NECO',
    description: 'National Examinations Council',
    duration: '2.5 hours',
    questions: '60 questions',
    badge: 'Secondary Certificate',
  },
];

export default function Practice() {
  const [, navigate] = useLocation();
  const [selectedExamType, setSelectedExamType] = useState('JAMB');
  const { getSubjectProgress } = useProgress();
  const { isOnline, getCachedCount, cacheQuestionsForSubject, isCaching } = useOffline();

  const startQuiz = (subject: string) => {
    navigate(`/quiz?subject=${subject}&exam=${selectedExamType}`);
  };

  const downloadForOffline = (subject: string) => {
    cacheQuestionsForSubject(subject);
  };

  const SubjectCard = ({ subject }: { subject: typeof SUBJECTS[0] }) => {
    const Icon = subject.icon;
    const progress = getSubjectProgress(subject.name);
    const masteryPercentage = progress ? Math.round(progress.masteryLevel * 100) : 0;
    const cachedCount = getCachedCount(subject.name);

    return (
      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 ${subject.color} rounded-lg flex items-center justify-center text-white`}>
                <Icon size={24} />
              </div>
              <div>
                <CardTitle className="text-lg">{subject.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{subject.description}</p>
              </div>
            </div>
            {masteryPercentage >= 80 && (
              <Badge variant="secondary" className="flex items-center space-x-1">
                <Trophy size={12} />
                <span>Mastered</span>
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Progress Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">{masteryPercentage}%</p>
              <p className="text-xs text-muted-foreground">Mastery</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-accent">{progress?.questionsAttempted || 0}</p>
              <p className="text-xs text-muted-foreground">Questions</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-500">{progress?.energyPoints || 0}</p>
              <p className="text-xs text-muted-foreground">Energy</p>
            </div>
          </div>

          {/* Topics */}
          <div>
            <p className="text-sm font-medium mb-2">Key Topics:</p>
            <div className="flex flex-wrap gap-1">
              {subject.topics.map((topic) => (
                <Badge key={topic} variant="outline" className="text-xs">
                  {topic}
                </Badge>
              ))}
            </div>
          </div>

          {/* Offline Status */}
          {!isOnline && cachedCount > 0 && (
            <div className="flex items-center space-x-2 text-sm text-green-600 bg-green-50 p-2 rounded">
              <WifiOff size={14} />
              <span>{cachedCount} questions available offline</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Button 
              onClick={() => startQuiz(subject.name)}
              className="flex-1 flex items-center justify-center space-x-2"
            >
              <Play size={16} />
              <span>Start Quiz</span>
            </Button>
            
            {isOnline && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadForOffline(subject.name)}
                disabled={isCaching}
                className="flex items-center space-x-1"
              >
                <Download size={14} />
                <span className="hidden sm:inline">Offline</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Practice Center</h1>
          <p className="text-muted-foreground">
            Choose a subject and start practicing with authentic exam questions.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Target className="text-primary" size={20} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Today's Goal</p>
                <p className="text-2xl font-bold">20</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center space-x-3">
              <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                <Clock className="text-accent" size={20} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Time Left</p>
                <p className="text-2xl font-bold">42m</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center">
                <Zap className="text-green-500" size={20} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Energy Points</p>
                <p className="text-2xl font-bold">1,250</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-500/10 rounded-full flex items-center justify-center">
                <Trophy className="text-orange-500" size={20} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Streak</p>
                <p className="text-2xl font-bold">7 days</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Practice Options */}
        <Tabs value={selectedExamType} onValueChange={setSelectedExamType} className="space-y-6">
          {/* Exam Type Selection */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Choose Exam Type</h2>
            <TabsList className="grid w-full grid-cols-3 max-w-md">
              {EXAM_TYPES.map((exam) => (
                <TabsTrigger key={exam.name} value={exam.name}>
                  {exam.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Exam Type Details and Subjects */}
          {EXAM_TYPES.map((exam) => (
            <TabsContent key={exam.name} value={exam.name} className="space-y-6">
              {/* Exam Info */}
              <Card className="bg-gradient-to-r from-primary/5 to-accent/5">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{exam.name} Practice</h3>
                      <p className="text-muted-foreground">{exam.description}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <Badge>{exam.badge}</Badge>
                      <div className="text-sm text-muted-foreground">
                        <div>{exam.duration}</div>
                        <div>{exam.questions}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Subject Grid */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Select Subject</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {SUBJECTS.map((subject) => (
                    <SubjectCard key={subject.name} subject={subject} />
                  ))}
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                className="h-auto p-4 justify-start"
                onClick={() => navigate('/quiz?subject=Mathematics&exam=JAMB')}
              >
                <div className="flex items-center space-x-3">
                  <Target className="text-primary" size={20} />
                  <div className="text-left">
                    <div className="font-medium">Random Quiz</div>
                    <div className="text-sm text-muted-foreground">Mix of all subjects</div>
                  </div>
                </div>
              </Button>

              <Button 
                variant="outline" 
                className="h-auto p-4 justify-start"
                onClick={() => navigate('/profile')}
              >
                <div className="flex items-center space-x-3">
                  <Trophy className="text-accent" size={20} />
                  <div className="text-left">
                    <div className="font-medium">Review Mistakes</div>
                    <div className="text-sm text-muted-foreground">Focus on weak areas</div>
                  </div>
                </div>
              </Button>

              <Button 
                variant="outline" 
                className="h-auto p-4 justify-start"
                onClick={() => navigate('/dashboard')}
              >
                <div className="flex items-center space-x-3">
                  <Zap className="text-orange-500" size={20} />
                  <div className="text-left">
                    <div className="font-medium">View Progress</div>
                    <div className="text-sm text-muted-foreground">Check your stats</div>
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
