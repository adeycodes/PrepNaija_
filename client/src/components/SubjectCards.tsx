import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useProgress } from "@/hooks/useProgress";
import { useOffline } from "@/hooks/useOffline";
import { SUBJECTS, SUBJECT_ICONS } from "@/utils/constants";
import { 
  Calculator, 
  Book, 
  Zap, 
  FlaskConical, 
  Leaf,
  Play,
  Download,
  CheckCircle,
  WifiOff
} from "lucide-react";

const iconMap = {
  Calculator,
  Book,
  Zap,
  FlaskConical,
  Leaf,
};

interface SubjectCardsProps {
  progress?: any[];
}

export default function SubjectCards({ progress }: SubjectCardsProps) {
  const { getMasteryLevel, isMastered } = useProgress();
  const { getCachedCount, hasCache, cacheQuestionsForSubject, isCaching } = useOffline();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {SUBJECTS.map((subject, index) => {
        const IconComponent = iconMap[SUBJECT_ICONS[subject as keyof typeof SUBJECT_ICONS] as keyof typeof iconMap] || Book;
        const masteryLevel = getMasteryLevel(subject);
        const isSubjectMastered = isMastered(subject);
        const cachedCount = getCachedCount(subject);
        const hasOfflineData = hasCache(subject);

        return (
          <Card key={subject} className={`subject-card btn-animate card-enter card-enter-active stagger-${(index % 6) + 1}`}>
            <CardContent className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <IconComponent className="text-primary" size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-card-foreground">{subject}</h3>
                    <p className="text-sm text-muted-foreground">
                      {Math.round(masteryLevel * 100)}% mastery
                    </p>
                  </div>
                </div>
                
                {isSubjectMastered && (
                  <Badge className="achievement-badge mastery-achieved">
                    <CheckCircle size={12} />
                    Mastered
                  </Badge>
                )}
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <Progress value={masteryLevel * 100} className="h-2" />
              </div>

              {/* Offline Status */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  {hasOfflineData ? (
                    <>
                      <CheckCircle className="text-primary" size={14} />
                      <span className="text-sm text-muted-foreground">
                        {cachedCount} questions cached
                      </span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="text-muted-foreground" size={14} />
                      <span className="text-sm text-muted-foreground">
                        No offline data
                      </span>
                    </>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => cacheQuestionsForSubject(subject)}
                  disabled={isCaching}
                  data-testid={`button-cache-${subject.toLowerCase()}`}
                  className="text-xs"
                >
                  <Download size={12} className="mr-1" />
                  {isCaching ? "Downloading..." : "Download"}
                </Button>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <Link href={`/quiz/${subject}`} className="w-full">
                  <Button 
                    className="w-full" 
                    size="sm"
                    data-testid={`button-practice-${subject.toLowerCase()}`}
                  >
                    <Play size={14} className="mr-2" />
                    Practice {subject}
                  </Button>
                </Link>
                
                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-2 pt-2 text-xs text-muted-foreground">
                  <div>
                    <span className="font-medium">Best Score:</span>
                    <div>85%</div>
                  </div>
                  <div>
                    <span className="font-medium">Last Practice:</span>
                    <div>2 days ago</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
