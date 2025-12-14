import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  BookOpen,
  ChevronRight,
  CheckCircle2,
  Circle,
  Lock,
  Play,
  ArrowLeft,
  Sparkles,
  Brain,
  MessageSquare,
  Loader2,
  Lightbulb,
  Target,
  Send,
  AlertCircle,
  Wifi,
  WifiOff,
  Trophy,
  Clock,
  Zap,
  Award,
  TrendingUp,
  Star,
  Flame,
  BookMarked,
  BarChart3,
  Calendar,
  Timer,
  Rocket,
  PartyPopper,
  ThumbsUp,
  Coffee,
  BookmarkPlus,
  Share2,
  Download,
  ChevronDown,
  ChevronUp,
  Repeat,
  PenTool
} from "lucide-react";

// Import actual syllabus data
import {
  getAllSubjects,
  getSubjectData,
  getTotalTopicsCount,
  type SubjectName,
  type Topic,
  type Section
} from "../../utils/syllabusData"
// ========================================
// CONFETTI ANIMATION
// ========================================
const Confetti = ({ show }: { show: boolean }) => {
  if (!show) return null;
  
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-bounce"
          style={{
            left: `${Math.random() * 100}%`,
            top: `-20px`,
            animation: `fall ${2 + Math.random() * 3}s linear`,
            animationDelay: `${Math.random() * 0.5}s`,
          }}
        >
          <div 
            className="w-3 h-3 rounded-full"
            style={{
              backgroundColor: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'][Math.floor(Math.random() * 5)]
            }}
          />
        </div>
      ))}
      <style>{`
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

// ========================================
// ACHIEVEMENT TOAST
// ========================================
const AchievementToast = ({ achievement, onClose }: { achievement: string | null; onClose: () => void }) => {
  useEffect(() => {
    if (achievement) {
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [achievement, onClose]);

  if (!achievement) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-5">
      <Card className="border-2 border-yellow-400 bg-gradient-to-r from-yellow-50 to-orange-50 shadow-2xl">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center animate-pulse">
            <Trophy className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="font-bold text-lg">Achievement Unlocked! 🎉</p>
            <p className="text-sm text-muted-foreground">{achievement}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ========================================
// STUDY TIMER
// ========================================
const StudyTimer = () => {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const formatTime = (secs: number) => {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Timer className="h-5 w-5 text-purple-600" />
            <div>
              <p className="text-xs text-muted-foreground">Study Time</p>
              <p className="text-2xl font-bold text-purple-600">{formatTime(seconds)}</p>
            </div>
          </div>
          <Button
            size="sm"
            variant={isActive ? "destructive" : "default"}
            onClick={() => setIsActive(!isActive)}
            className="gap-2"
          >
            {isActive ? "Pause" : "Start"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// ========================================
// QUICK QUIZ COMPONENT
// ========================================
const QuickQuiz = ({ topic, onComplete }: { topic: Topic; onComplete: () => void }) => {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  
  // Mock quiz data
  const quizQuestion = {
    question: `What is a key concept in ${topic.title}?`,
    options: topic.subtopics.slice(0, 4),
    correctAnswer: 0
  };

  const handleSubmit = () => {
    setShowResult(true);
    if (selectedAnswer === quizQuestion.correctAnswer) {
      setTimeout(onComplete, 2000);
    }
  };

  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Target className="h-5 w-5" />
          Quick Knowledge Check
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="font-medium">{quizQuestion.question}</p>
        
        <div className="space-y-2">
          {quizQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => !showResult && setSelectedAnswer(index)}
              className={`
                w-full p-3 rounded-lg border-2 text-left transition-all
                ${selectedAnswer === index 
                  ? 'border-blue-500 bg-blue-100' 
                  : 'border-gray-200 hover:border-blue-300'
                }
                ${showResult && index === quizQuestion.correctAnswer
                  ? 'border-green-500 bg-green-100'
                  : ''
                }
                ${showResult && selectedAnswer === index && index !== quizQuestion.correctAnswer
                  ? 'border-red-500 bg-red-100'
                  : ''
                }
              `}
            >
              <span className="font-medium">{String.fromCharCode(65 + index)}.</span> {option}
            </button>
          ))}
        </div>

        {!showResult ? (
          <Button 
            onClick={handleSubmit} 
            disabled={selectedAnswer === null}
            className="w-full"
          >
            Submit Answer
          </Button>
        ) : (
          <div className={`p-4 rounded-lg ${selectedAnswer === quizQuestion.correctAnswer ? 'bg-green-100 border-2 border-green-500' : 'bg-red-100 border-2 border-red-500'}`}>
            <p className="font-bold flex items-center gap-2">
              {selectedAnswer === quizQuestion.correctAnswer ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  Correct! Well done! 🎉
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  Not quite. The correct answer is {String.fromCharCode(65 + quizQuestion.correctAnswer)}.
                </>
              )}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ========================================
// MAIN COMPONENT
// ========================================
export default function JAMBStudyPath() {
  // View State
  const [view, setView] = useState<"subjects" | "sections" | "topics" | "learning">("subjects");
  const [selectedSubject, setSelectedSubject] = useState<SubjectName | null>(null);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

  // Learning State
  const [completedTopics, setCompletedTopics] = useState<string[]>([]);
  const [chatMessages, setChatMessages] = useState<{ role: "assistant" | "user"; content: string }[]>([]);
  const [userQuestion, setUserQuestion] = useState("");
  const [isLoadingResponse, setIsLoadingResponse] = useState(false);
  const [bookmarkedTopics, setBookmarkedTopics] = useState<string[]>([]);
  const [userNotes, setUserNotes] = useState<{[key: string]: string}>({});
  const [showNotes, setShowNotes] = useState(false);

  // Gamification State
  const [xpPoints, setXpPoints] = useState(0);
  const [level, setLevel] = useState(1);
  const [studyStreak, setStudyStreak] = useState(3);
  const [showConfetti, setShowConfetti] = useState(false);
  const [achievement, setAchievement] = useState<string | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [dailyGoal, setDailyGoal] = useState({ current: 2, target: 5 });

  // Refs
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Calculate level from XP
  useEffect(() => {
    const newLevel = Math.floor(xpPoints / 100) + 1;
    if (newLevel > level) {
      setLevel(newLevel);
      setAchievement(`Reached Level ${newLevel}!`);
    }
  }, [xpPoints, level]);

  // Mock learning function
  const startLearning = async (topic: Topic) => {
    setSelectedTopic(topic);
    setView("learning");
    
    const mockLesson = `# ${topic.title}

## 📚 Learning Objectives

Today we'll master these key concepts:

${topic.objectives.map((obj, i) => `${i + 1}. ${obj}`).join('\n')}

## 🎯 What We'll Cover

${topic.subtopics.map((sub, i) => `**${i + 1}. ${sub}**`).join('\n\n')}

---

## 💡 Let's Get Started!

I'm here to help you understand **${topic.title}** step by step. Feel free to:

• Ask questions about any concept
• Request examples and explanations  
• Test your knowledge with quizzes
• Get help with practice problems

What would you like to explore first?`;

    setChatMessages([{ role: "assistant", content: mockLesson }]);
  };

  // Mock chat function
  const askQuestion = async () => {
    if (!userQuestion.trim() || isLoadingResponse) return;

    const question = userQuestion.trim();
    setChatMessages(prev => [...prev, { role: "user", content: question }]);
    setUserQuestion("");
    setIsLoadingResponse(true);

    // Simulate AI response
    setTimeout(() => {
      const response = `Great question! Let me explain that concept clearly.

${question.includes("example") ? "Here's a practical example:" : "Here's what you need to know:"}

This is a detailed explanation that would come from your AI backend. The system would provide comprehensive, exam-focused answers tailored to JAMB preparation.

Key points to remember:
• Important concept 1
• Important concept 2  
• Important concept 3

Would you like me to elaborate on any of these points?`;
      
      setChatMessages(prev => [...prev, { role: "assistant", content: response }]);
      setIsLoadingResponse(false);
      setXpPoints(prev => prev + 5);
    }, 1500);
  };

  // Mark topic complete
  const markTopicComplete = () => {
    if (selectedTopic && !completedTopics.includes(selectedTopic.id)) {
      setCompletedTopics(prev => [...prev, selectedTopic.id]);
      setXpPoints(prev => prev + 50);
      setDailyGoal(prev => ({ ...prev, current: prev.current + 1 }));
      setShowConfetti(true);
      setAchievement("Topic Mastered! +50 XP");
      setTimeout(() => setShowConfetti(false), 4000);
      
      // Check for streak achievement
      if ((completedTopics.length + 1) % 5 === 0) {
        setTimeout(() => setAchievement(`${completedTopics.length + 1} Topics Mastered! 🔥`), 3000);
      }
    }
    setView("topics");
  };

  // Toggle bookmark
  const toggleBookmark = (topicId: string) => {
    setBookmarkedTopics(prev => 
      prev.includes(topicId) 
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    );
  };

  // Calculate progress
  const getSubjectProgress = (subject: SubjectName) => {
    const total = getTotalTopicsCount(subject);
    return Math.round((completedTopics.length / total) * 100);
  };

  // ========================================
  // SUBJECTS VIEW
  // ========================================
  if (view === "subjects") {
    const subjects = getAllSubjects();

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <Confetti show={showConfetti} />
        <AchievementToast achievement={achievement} onClose={() => setAchievement(null)} />
        
        <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
          {/* Hero Header */}
          <div className="text-center space-y-4 py-8">
            <div className="inline-block">
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-pulse">
                JAMB Study Path
              </h1>
              <p className="text-lg text-muted-foreground mt-2">Your Journey to Excellence Starts Here 🚀</p>
            </div>
          </div>

          {/* Stats Dashboard */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 hover:scale-105 transition-transform">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-2">
                  <Star className="h-6 w-6 text-white" />
                </div>
                <p className="text-3xl font-bold text-blue-600">{xpPoints}</p>
                <p className="text-sm text-muted-foreground">XP Points</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 hover:scale-105 transition-transform">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-2">
                  <Rocket className="h-6 w-6 text-white" />
                </div>
                <p className="text-3xl font-bold text-purple-600">Level {level}</p>
                <p className="text-sm text-muted-foreground">Current Level</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100 hover:scale-105 transition-transform">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mb-2">
                  <Flame className="h-6 w-6 text-white" />
                </div>
                <p className="text-3xl font-bold text-orange-600">{studyStreak}</p>
                <p className="text-sm text-muted-foreground">Day Streak 🔥</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-green-100 hover:scale-105 transition-transform">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-2">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
                <p className="text-3xl font-bold text-green-600">{completedTopics.length}</p>
                <p className="text-sm text-muted-foreground">Topics Done</p>
              </CardContent>
            </Card>
          </div>

          {/* Daily Goal Progress */}
          <Card className="border-2 border-yellow-200 bg-gradient-to-r from-yellow-50 to-amber-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Target className="h-6 w-6 text-yellow-600" />
                  <div>
                    <p className="font-bold text-lg">Daily Goal</p>
                    <p className="text-sm text-muted-foreground">
                      {dailyGoal.current} of {dailyGoal.target} topics completed today
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-yellow-600">
                    {Math.round((dailyGoal.current / dailyGoal.target) * 100)}%
                  </p>
                </div>
              </div>
              <Progress 
                value={(dailyGoal.current / dailyGoal.target) * 100} 
                className="h-3"
              />
            </CardContent>
          </Card>

          {/* Subjects Grid */}
          <div>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <BookOpen className="h-6 w-6" />
              Choose Your Subject
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {subjects.map((subjectName) => {
                const subjectData = getSubjectData(subjectName);
                const Icon = subjectData.icon;
                const progress = getSubjectProgress(subjectName);

                return (
                  <Card
                    key={subjectName}
                    className="group hover:shadow-2xl transition-all cursor-pointer border-2 hover:border-blue-400 hover:-translate-y-2 relative overflow-hidden"
                    onClick={() => {
                      setSelectedSubject(subjectName);
                      setView("sections");
                    }}
                  >
                    {/* Animated gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent to-blue-100 opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <CardHeader className="relative">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${subjectData.color} flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all shadow-xl`}>
                          <Icon className="h-8 w-8 text-white" />
                        </div>
                        <ChevronRight className="h-6 w-6 text-muted-foreground group-hover:translate-x-2 transition-transform" />
                      </div>
                      
                      <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
                        {subjectName}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        50 topics available
                      </p>
                    </CardHeader>

                    <CardContent className="relative space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <Badge variant="secondary" className="font-bold">
                          {progress}%
                        </Badge>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Motivational Quote */}
          <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 via-pink-50 to-blue-50">
            <CardContent className="p-6 text-center">
              <Sparkles className="h-8 w-8 mx-auto mb-3 text-purple-600" />
              <p className="text-lg font-medium italic">
                "Success is the sum of small efforts repeated day in and day out."
              </p>
              <p className="text-sm text-muted-foreground mt-2">- Robert Collier</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ========================================
  // SECTIONS VIEW
  // ========================================
  if (view === "sections" && selectedSubject) {
    const subjectData = getSubjectData(selectedSubject);
    const Icon = subjectData.icon;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
          <Button variant="ghost" onClick={() => setView("subjects")} className="group">
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Subjects
          </Button>

          {/* Subject Header with Stats */}
          <Card className="border-2 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${subjectData.color} flex items-center justify-center shadow-xl`}>
                  <Icon className="h-10 w-10 text-white" />
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold">{selectedSubject}</h1>
                  <p className="text-muted-foreground">3 sections • 50 topics</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600">
                    {getSubjectProgress(selectedSubject)}%
                  </div>
                  <p className="text-sm text-muted-foreground">Complete</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sections */}
          <div className="space-y-4">
            {subjectData.sections.map((section, idx) => (
              <Card
                key={section.id}
                className="group hover:shadow-xl transition-all cursor-pointer border-2 hover:border-blue-400"
                onClick={() => {
                  setSelectedSection(section);
                  setView("topics");
                }}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                        {idx + 1}
                      </div>
                      <div>
                        <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
                          {section.title}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {section.topics.length} topics in this section
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-6 w-6 text-muted-foreground group-hover:translate-x-2 transition-transform" />
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ========================================
  // TOPICS VIEW
  // ========================================
  if (view === "topics" && selectedSection) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
          <Button variant="ghost" onClick={() => setView("sections")} className="group">
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Sections
          </Button>

          <div>
            <h1 className="text-3xl font-bold">{selectedSection.title}</h1>
            <p className="text-muted-foreground">Master these topics step by step</p>
          </div>

          {/* Topics List */}
          <div className="space-y-4">
            {selectedSection.topics.map((topic, index) => {
              const isCompleted = completedTopics.includes(topic.id);
              const isBookmarked = bookmarkedTopics.includes(topic.id);
              const isUnlocked = index === 0 || completedTopics.includes(selectedSection.topics[index - 1].id);

              return (
                <Card
                  key={topic.id}
                  className={`
                    group transition-all border-2
                    ${!isUnlocked ? 'opacity-60' : 'hover:shadow-xl cursor-pointer hover:-translate-y-1'}
                    ${isCompleted ? 'border-green-400 bg-green-50/50' : isUnlocked ? 'border-blue-300' : 'border-gray-300'}
                  `}
                >
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      {/* Status Badge */}
                      <div className="flex-shrink-0">
                        {isCompleted ? (
                          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg animate-pulse">
                            <CheckCircle2 className="h-8 w-8 text-white" />
                          </div>
                        ) : isUnlocked ? (
                          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg">
                            <Play className="h-7 w-7 text-white ml-1" />
                          </div>
                        ) : (
                          <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center">
                            <Lock className="h-7 w-7 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-xl">{topic.title}</CardTitle>
                              {isBookmarked && (
                                <BookMarked className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                              )}
                            </div>

                            {/* Subtopics Preview */}
                            <div className="mt-3 space-y-1">
                              {topic.subtopics.slice(0, 3).map((sub, i) => (
                                <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                  {sub}
                                </div>
                              ))}
                              {topic.subtopics.length > 3 && (
                                <p className="text-sm text-blue-600 font-medium ml-3.5">
                                  +{topic.subtopics.length - 3} more topics
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-col gap-2">
                            <Button
                              onClick={() => startLearning(topic)}
                              disabled={!isUnlocked}
                              size="lg"
                              className={`${isCompleted ? 'bg-green-600 hover:bg-green-700' : ''}`}
                            >
                              {isCompleted ? (
                                <>
                                  <Repeat className="h-4 w-4 mr-2" />
                                  Review
                                </>
                              ) : (
                                <>
                                  <Play className="h-4 w-4 mr-2" />
                                  Start
                                </>
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleBookmark(topic.id);
                              }}
                            >
                              <BookmarkPlus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ========================================
  // LEARNING VIEW
  // ========================================
  if (view === "learning" && selectedTopic) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <Confetti show={showConfetti} />
        <AchievementToast achievement={achievement} onClose={() => setAchievement(null)} />
        
        <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <Button variant="ghost" onClick={() => setView("topics")} className="group">
              <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back
            </Button>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setShowQuiz(!showQuiz)}
                className="gap-2"
              >
                <Target className="h-4 w-4" />
                {showQuiz ? 'Hide' : 'Take'} Quiz
              </Button>
              
              <Button
                onClick={markTopicComplete}
                size="lg"
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 gap-2"
              >
                <CheckCircle2 className="h-5 w-5" />
                Mark Complete
              </Button>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Learning Area */}
            <div className="lg:col-span-2 space-y-6">
              {/* Topic Header */}
              <Card className="border-2 border-blue-200">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                      <Sparkles className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-2xl">{selectedTopic.title}</CardTitle>
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <Badge variant="secondary">{selectedSubject}</Badge>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          2-3 hours
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          <span className="font-semibold">+50 XP</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Quiz Section */}
              {showQuiz && (
                <QuickQuiz 
                  topic={selectedTopic} 
                  onComplete={() => {
                    setShowQuiz(false);
                    setXpPoints(prev => prev + 25);
                    setAchievement("Quiz Completed! +25 XP");
                  }}
                />
              )}

              {/* Chat Interface */}
              <Card className="border-2 border-blue-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Brain className="h-5 w-5" />
                      AI Learning Assistant
                    </CardTitle>
                    <Badge variant="secondary" className="gap-1">
                      <Wifi className="h-3 w-3" />
                      Active
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Chat Messages */}
                  <ScrollArea className="h-[500px] pr-4">
                    <div className="space-y-4">
                      {chatMessages.map((msg, index) => (
                        <div
                          key={index}
                          className={`
                            ${msg.role === "assistant"
                              ? "bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200"
                              : "bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200"
                            }
                            rounded-xl p-4 shadow-sm animate-in slide-in-from-bottom-5
                          `}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`
                              w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                              ${msg.role === "assistant"
                                ? "bg-gradient-to-br from-blue-500 to-purple-600"
                                : "bg-gradient-to-br from-green-500 to-emerald-600"
                              }
                            `}>
                              {msg.role === "assistant" ? (
                                <Brain className="h-5 w-5 text-white" />
                              ) : (
                                <MessageSquare className="h-5 w-5 text-white" />
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-muted-foreground mb-2">
                                {msg.role === "assistant" ? "AI Tutor" : "You"}
                              </p>
                              <div className="prose prose-sm max-w-none">
                                {msg.content.split('\n').map((line, i) => {
                                  if (line.startsWith('# ')) {
                                    return <h1 key={i} className="text-2xl font-bold mt-4 mb-2">{line.slice(2)}</h1>;
                                  }
                                  if (line.startsWith('## ')) {
                                    return <h2 key={i} className="text-xl font-bold mt-3 mb-2">{line.slice(3)}</h2>;
                                  }
                                  if (line.includes('**')) {
                                    const parts = line.split('**');
                                    return (
                                      <p key={i} className="mb-2">
                                        {parts.map((part, j) =>
                                          j % 2 === 1 ? <strong key={j}>{part}</strong> : part
                                        )}
                                      </p>
                                    );
                                  }
                                  if (line.trim().startsWith('•')) {
                                    return <li key={i} className="ml-4 mb-1">{line.trim().slice(1).trim()}</li>;
                                  }
                                  if (/^\d+\./.test(line.trim())) {
                                    return <li key={i} className="ml-4 mb-1">{line.trim().replace(/^\d+\.\s*/, '')}</li>;
                                  }
                                  if (line.trim() === '---') {
                                    return <hr key={i} className="my-3 border-t-2" />;
                                  }
                                  return line.trim() ? <p key={i} className="mb-2">{line}</p> : <br key={i} />;
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {isLoadingResponse && (
                        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 animate-pulse">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                              <Loader2 className="h-5 w-5 text-white animate-spin" />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground mb-1">AI Tutor</p>
                              <p className="text-sm text-muted-foreground">Thinking...</p>
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={chatEndRef} />
                    </div>
                  </ScrollArea>

                  {/* Input Area */}
                  <div className="border-t-2 pt-4">
                    <div className="flex gap-3">
                      <Textarea
                        value={userQuestion}
                        onChange={(e) => setUserQuestion(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            askQuestion();
                          }
                        }}
                        placeholder="Ask me anything about this topic..."
                        className="resize-none min-h-[80px]"
                        disabled={isLoadingResponse}
                      />
                      <Button
                        onClick={askQuestion}
                        disabled={!userQuestion.trim() || isLoadingResponse}
                        size="lg"
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                        <Send className="h-5 w-5" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Lightbulb className="h-3 w-3" />
                        Press Enter to send • Shift+Enter for new line
                      </p>
                      <p className="text-xs text-blue-600 font-medium">+5 XP per question</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Study Timer */}
              <StudyTimer />

              {/* XP Progress */}
              <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Rocket className="h-5 w-5 text-purple-600" />
                      <span className="font-bold">Level {level}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{xpPoints} XP</span>
                  </div>
                  <Progress value={(xpPoints % 100)} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-2">
                    {100 - (xpPoints % 100)} XP to Level {level + 1}
                  </p>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start gap-2"
                    onClick={() => setShowNotes(!showNotes)}
                  >
                    <PenTool className="h-4 w-4" />
                    {showNotes ? 'Hide' : 'Show'} Notes
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Share2 className="h-4 w-4" />
                    Share Progress
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Download className="h-4 w-4" />
                    Download Summary
                  </Button>
                </CardContent>
              </Card>

              {/* Notes Section */}
              {showNotes && (
                <Card className="border-2 border-yellow-200 bg-yellow-50">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <PenTool className="h-4 w-4" />
                      Your Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={userNotes[selectedTopic.id] || ''}
                      onChange={(e) => setUserNotes(prev => ({ ...prev, [selectedTopic.id]: e.target.value }))}
                      placeholder="Take notes while learning..."
                      className="resize-none min-h-[150px] bg-white"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Notes are saved automatically
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Study Tips */}
              <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Pro Tips
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <ThumbsUp className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Take regular breaks every 25 minutes</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <ThumbsUp className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Ask specific questions for better answers</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <ThumbsUp className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Test yourself with quizzes regularly</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <ThumbsUp className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Review completed topics weekly</span>
                  </div>
                </CardContent>
              </Card>

              {/* Achievements Preview */}
              <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    Recent Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 p-2 bg-white rounded-lg">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">First Topic Done!</p>
                      <p className="text-xs text-muted-foreground">+50 XP</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-white rounded-lg">
                    <Flame className="h-5 w-5 text-orange-500" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">3 Day Streak!</p>
                      <p className="text-xs text-muted-foreground">Keep it up!</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}