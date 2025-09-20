import { useState, useEffect } from "react";
import { questionService } from "@/services/questionService";
import { SUBJECTS } from "@/utils/constants";
import { useToast } from "@/hooks/use-toast";

export function useOffline() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [cacheStats, setCacheStats] = useState<{ [subject: string]: number }>({});
  const [isCaching, setIsCaching] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "Connection restored",
        description: "You're back online! Syncing your progress...",
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "Connection lost",
        description: "You're offline. Using cached questions for practice.",
        variant: "destructive",
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Load cache stats on mount
    loadCacheStats();

    // Clear expired cache on mount
    questionService.clearExpiredCache();

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [toast]);

  const loadCacheStats = async () => {
    try {
      const stats = await questionService.getCacheStats();
      setCacheStats(stats);
    } catch (error) {
      console.error("Failed to load cache stats:", error);
    }
  };

  const cacheQuestionsForSubject = async (subject: string) => {
    if (!isOnline) {
      toast({
        title: "Offline",
        description: "You need to be online to download questions.",
        variant: "destructive",
      });
      return false;
    }

    try {
      setIsCaching(true);
      await questionService.cacheQuestions(subject);
      await loadCacheStats();
      
      toast({
        title: "Success",
        description: `Downloaded questions for ${subject} offline use!`,
      });
      
      return true;
    } catch (error) {
      console.error("Failed to cache questions:", error);
      toast({
        title: "Error",
        description: `Failed to download questions for ${subject}.`,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsCaching(false);
    }
  };

  const cacheAllSubjects = async () => {
    if (!isOnline) {
      toast({
        title: "Offline",
        description: "You need to be online to download questions.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCaching(true);
      
      for (const subject of SUBJECTS) {
        await questionService.cacheQuestions(subject);
      }
      
      await loadCacheStats();
      
      toast({
        title: "Success",
        description: "Downloaded questions for all subjects!",
      });
    } catch (error) {
      console.error("Failed to cache all subjects:", error);
      toast({
        title: "Error",
        description: "Failed to download some questions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCaching(false);
    }
  };

  const getCachedCount = (subject: string): number => {
    return cacheStats[subject] || 0;
  };

  const getTotalCachedCount = (): number => {
    return Object.values(cacheStats).reduce((total, count) => total + count, 0);
  };

  const hasCache = (subject: string): boolean => {
    return getCachedCount(subject) > 0;
  };

  return {
    isOnline,
    cacheStats,
    isCaching,
    cacheQuestionsForSubject,
    cacheAllSubjects,
    getCachedCount,
    getTotalCachedCount,
    hasCache,
    loadCacheStats,
  };
}
