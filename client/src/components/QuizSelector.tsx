import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calculator,
  BookText,
  Atom,
  FlaskConical,
  Dna,
  GraduationCap,
  Target,
  Play,
  ArrowLeft
} from "lucide-react";

const EXAM_TYPES = [
  {
    id: "JAMB",
    name: "JAMB UTME",
    description: "Joint Admissions and Matriculation Board",
    color: "bg-blue-500",
    icon: GraduationCap
  },
  {
    id: "WAEC",
    name: "WAEC SSCE",
    description: "West African Examinations Council",
    color: "bg-green-500", 
    icon: Target
  },
  {
    id: "NECO",
    name: "NECO SSCE",
    description: "National Examinations Council",
    color: "bg-purple-500",
    icon: Target
  }
];

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

interface QuizSelectorProps {
  onBack?: () => void;
}

export default function QuizSelector({ onBack }: QuizSelectorProps) {
  const [, setLocation] = useLocation();
  const [selectedExam, setSelectedExam] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [count, setCount] = useState<number>(20);
  const [difficulty, setDifficulty] = useState<string>("");
  const [topics, setTopics] = useState<string>("");

  const handleStartQuiz = () => {
    console.log('QuizSelector - handleStartQuiz called');
    console.log('QuizSelector - selectedExam:', selectedExam);
    console.log('QuizSelector - selectedSubject:', selectedSubject);
    console.log('QuizSelector - count:', count);
    console.log('QuizSelector - difficulty:', difficulty);
    console.log('QuizSelector - topics:', topics);
    
    if (selectedExam && selectedSubject) {
      const params = new URLSearchParams({ subject: selectedSubject, exam: selectedExam });
      if (count) params.set('count', String(count));
      if (difficulty) params.set('difficulty', difficulty);
      if (topics) params.set('topics', topics);
      const quizUrl = `/quiz?${params.toString()}`;
      console.log('QuizSelector - Final params:', params.toString());
      console.log('QuizSelector - Starting quiz with URL:', quizUrl);
      console.log('QuizSelector - About to navigate to:', quizUrl);
      setLocation(quizUrl);
    } else {
      console.error('QuizSelector - Missing selection:', { selectedSubject, selectedExam });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {onBack && (
            <Button variant="outline" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold">Start Quiz</h1>
            <p className="text-muted-foreground">Choose your exam type and subject</p>
          </div>
        </div>
      </div>

      {/* Step 1: Exam Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">1</span>
            <span>Select Exam Type</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {EXAM_TYPES.map((exam) => {
              const Icon = exam.icon;
              const isSelected = selectedExam === exam.id;
              
              return (
                <Card
                  key={exam.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    isSelected ? 'ring-2 ring-primary shadow-lg' : ''
                  }`}
                  onClick={() => setSelectedExam(exam.id)}
                >
                  <CardContent className="p-4 text-center">
                    <div className={`w-12 h-12 mx-auto rounded-lg ${exam.color} flex items-center justify-center mb-3`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold mb-1">{exam.name}</h3>
                    <p className="text-xs text-muted-foreground">{exam.description}</p>
                    {isSelected && (
                      <Badge className="mt-2" variant="default">Selected</Badge>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Step 2: Subject Selection */}
      <Card className={selectedExam ? 'opacity-100' : 'opacity-50'}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
              selectedExam ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>2</span>
            <span>Select Subject</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SUBJECTS.map((subject) => {
              const Icon = subject.icon;
              const isSelected = selectedSubject === subject.id;
              const isDisabled = !selectedExam;
              
              return (
                <Card
                  key={subject.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    isDisabled ? 'opacity-50 cursor-not-allowed' : ''
                  } ${isSelected ? 'ring-2 ring-primary shadow-lg' : ''}`}
                  onClick={() => !isDisabled && setSelectedSubject(subject.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg ${subject.color} flex items-center justify-center`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm">{subject.name}</h3>
                        <p className="text-xs text-muted-foreground">{subject.description}</p>
                      </div>
                      {isSelected && (
                        <Badge variant="default" className="ml-auto">Selected</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Step 3: Options */}
      <Card className={selectedSubject ? 'opacity-100' : 'opacity-50'}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
              selectedSubject ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>3</span>
            <span>Options</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Number of Questions</label>
              <select
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value))}
                className="mt-1 w-full border rounded-md p-2 bg-background"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={30}>30</option>
                <option value={50}>50</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="mt-1 w-full border rounded-md p-2 bg-background"
              >
                <option value="">Any</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Topics (comma-separated)</label>
              <input
                type="text"
                value={topics}
                onChange={(e) => setTopics(e.target.value)}
                placeholder="Algebra, Geometry"
                className="mt-1 w-full border rounded-md p-2 bg-background"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Start Quiz Button */}
      <div className="flex justify-center pt-4">
        <Button
          size="lg"
          onClick={handleStartQuiz}
          disabled={!selectedExam || !selectedSubject}
          className="px-8"
        >
          <Play className="h-4 w-4 mr-2" />
          Start {selectedSubject && selectedExam ? `${selectedSubject} Quiz (${selectedExam})` : 'Quiz'}
        </Button>
      </div>
    </div>
  );
}
