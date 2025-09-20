import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/apiClient";
import { SubjectProgress, UserProgress } from "@/types";
import { QUIZ_CONFIG } from "@/utils/constants";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

export function useProgress() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: progressData, isLoading, error } = useQuery({
    queryKey: ["/api/progress"],
    retry: false,
    queryFn: async () => {
      const res = await apiFetch("/api/progress");
      if (!res.ok) throw new Error(`${res.status}`);
      return res.json();
    },
  });

  const updateProgressMutation = useMutation({
    mutationFn: async (progressUpdate: Partial<UserProgress>) => {
      const response = await apiFetch("/api/progress/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(progressUpdate),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`${response.status}: ${text}`);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        // Do not auto-redirect; allow auth to recover and retry queries
        toast({
          title: "Session issue",
          description: "We couldn't update progress. Please refresh or re-login if the issue persists.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Error",
        description: "Failed to update progress. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getSubjectProgress = (subject: string): SubjectProgress | null => {
    if (!progressData) return null;

    const subjectData = progressData.filter((p: UserProgress) => p.subject === subject);
    
    if (subjectData.length === 0) return null;

    const totalAttempted = subjectData.reduce((sum: number, p: UserProgress) => sum + (p.questionsAttempted || 0), 0);
    const totalCorrect = subjectData.reduce((sum: number, p: UserProgress) => sum + (p.questionsCorrect || 0), 0);
    const totalEnergyPoints = subjectData.reduce((sum: number, p: UserProgress) => sum + (p.energyPoints || 0), 0);
    
    // Calculate overall mastery level for the subject
    const masteryLevel = totalAttempted > 0 ? (totalCorrect / totalAttempted) : 0;

    return {
      subject,
      progress: subjectData,
      masteryLevel,
      questionsAttempted: totalAttempted,
      questionsCorrect: totalCorrect,
      energyPoints: totalEnergyPoints,
    };
  };

  const getMasteryLevel = (subject: string): number => {
    const subjectProgress = getSubjectProgress(subject);
    return subjectProgress?.masteryLevel || 0;
  };

  const isMastered = (subject: string): boolean => {
    return getMasteryLevel(subject) >= QUIZ_CONFIG.masteryThreshold / 100;
  };

  const getOverallStats = () => {
    if (!progressData || progressData.length === 0) {
      return {
        totalQuestions: 0,
        totalCorrect: 0,
        overallAccuracy: 0,
        totalEnergyPoints: 0,
        masteredSubjects: 0,
      };
    }

    const totalQuestions = progressData.reduce((sum: number, p: UserProgress) => sum + (p.questionsAttempted || 0), 0);
    const totalCorrect = progressData.reduce((sum: number, p: UserProgress) => sum + (p.questionsCorrect || 0), 0);
    const totalEnergyPoints = progressData.reduce((sum: number, p: UserProgress) => sum + (p.energyPoints || 0), 0);
    
    const overallAccuracy = totalQuestions > 0 ? (totalCorrect / totalQuestions) : 0;
    
    // Count mastered subjects
    const subjectMap = new Map<string, { attempted: number; correct: number }>();
    
    progressData.forEach((p: UserProgress) => {
      const existing = subjectMap.get(p.subject) || { attempted: 0, correct: 0 };
      subjectMap.set(p.subject, {
        attempted: existing.attempted + (p.questionsAttempted || 0),
        correct: existing.correct + (p.questionsCorrect || 0),
      });
    });

    let masteredSubjects = 0;
    subjectMap.forEach(({ attempted, correct }) => {
      const accuracy = attempted > 0 ? (correct / attempted) : 0;
      if (accuracy >= QUIZ_CONFIG.masteryThreshold / 100) {
        masteredSubjects++;
      }
    });

    return {
      totalQuestions,
      totalCorrect,
      overallAccuracy,
      totalEnergyPoints,
      masteredSubjects,
    };
  };

  const getProgressChartData = () => {
    if (!progressData) return [];

    const subjectMap = new Map<string, { attempted: number; correct: number }>();
    
    progressData.forEach((p: UserProgress) => {
      const existing = subjectMap.get(p.subject) || { attempted: 0, correct: 0 };
      subjectMap.set(p.subject, {
        attempted: existing.attempted + (p.questionsAttempted || 0),
        correct: existing.correct + (p.questionsCorrect || 0),
      });
    });

    return Array.from(subjectMap.entries()).map(([subject, { attempted, correct }]) => ({
      subject,
      attempted,
      correct,
      accuracy: attempted > 0 ? Math.round((correct / attempted) * 100) : 0,
      mastery: attempted > 0 ? (correct / attempted) >= (QUIZ_CONFIG.masteryThreshold / 100) : false,
    }));
  };

  const updateProgress = (progressUpdate: Partial<UserProgress>) => {
    updateProgressMutation.mutate(progressUpdate);
  };

  return {
    progressData,
    isLoading,
    error,
    getSubjectProgress,
    getMasteryLevel,
    isMastered,
    getOverallStats,
    getProgressChartData,
    updateProgress,
    isUpdating: updateProgressMutation.isPending,
  };
}
