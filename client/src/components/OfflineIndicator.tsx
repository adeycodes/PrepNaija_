import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff, Download, Check } from "lucide-react";

interface OfflineIndicatorProps {
  className?: string;
}

export default function OfflineIndicator({ className = "" }: OfflineIndicatorProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineMessage(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineMessage(true);
      // Auto-hide offline message after 5 seconds
      setTimeout(() => setShowOfflineMessage(false), 5000);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline && !showOfflineMessage) {
    return null; // Don't show anything when online
  }

  return (
    <div className={`fixed top-4 right-4 z-50 ${className}`}>
      {!isOnline && (
        <Badge 
          variant="destructive" 
          className="flex items-center space-x-2 px-3 py-2 text-sm font-medium animate-pulse"
        >
          <WifiOff className="h-4 w-4" />
          <span>Offline Mode</span>
        </Badge>
      )}

      {isOnline && showOfflineMessage && (
        <Badge 
          variant="default" 
          className="flex items-center space-x-2 px-3 py-2 text-sm font-medium animate-in slide-in-from-right-4"
        >
          <Wifi className="h-4 w-4" />
          <span>Back Online</span>
        </Badge>
      )}
    </div>
  );
}

// Offline status hook for other components to use
export function useOfflineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}

// Cache status component to show caching progress
export function CacheStatus({ subject, examType }: { subject?: string; examType?: string }) {
  const [cacheStats, setCacheStats] = useState<{ [key: string]: number }>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // This would be called from the questionService to get cache stats
    const loadCacheStats = async () => {
      try {
        // Placeholder - you'd implement getCacheStats in questionService
        const stats = {}; // await questionService.getCacheStats();
        setCacheStats(stats);
      } catch (error) {
        console.error("Failed to load cache stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCacheStats();
  }, []);

  if (isLoading) {
    return (
      <Badge variant="secondary" className="flex items-center space-x-2">
        <Download className="h-3 w-3 animate-spin" />
        <span>Loading cache...</span>
      </Badge>
    );
  }

  const subjectKey = subject?.toLowerCase();
  const cachedCount = subjectKey ? cacheStats[subjectKey] || 0 : 0;

  if (cachedCount === 0) {
    return (
      <Badge variant="outline" className="flex items-center space-x-2">
        <Download className="h-3 w-3" />
        <span>Not cached</span>
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className="flex items-center space-x-2">
      <Check className="h-3 w-3 text-green-600" />
      <span>{cachedCount} cached</span>
    </Badge>
  );
}
