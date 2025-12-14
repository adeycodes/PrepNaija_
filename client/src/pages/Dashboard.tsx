import React, { useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import DashboardLayout from "@/components/DashboardLayout";
import Overview from "@/components/dashboard/Overview";
import Subjects from "@/components/dashboard/Subjects";
import Progress from "@/components/dashboard/Progress";
import History from "@/components/dashboard/History";
import Achievements from "@/components/dashboard/Achievements";
import Profile from "@/components/dashboard/Profile";
import StudyPath from "./StudyPath";  
import { Import } from "lucide-react";
import StudyPathSystem from "@/components/dashboard/StudyPathSystem";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, isLoading } = useAuth();
  const isAuthenticated = !!user;
  const [activeTab, setActiveTab] = useState("overview");

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        setLocation("/login");
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <Overview />;
      case 'subjects':
        return <Subjects />;
      case 'study-path':
        return <StudyPathSystem />;
      case 'learn':
        return <StudyPathSystem />; 
      
      case 'progress':
        return <Progress />;
      case 'history':
        return <History />;
      case 'achievements':
        return <Achievements />;
      case 'profile':
        return <Profile />;
      case 'settings':
        return (
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Settings</h2>
            <p className="text-muted-foreground">App settings coming soon...</p>
          </div>
        );
      default:
        return <Overview />;
    }
  };

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </DashboardLayout>
  );
}
