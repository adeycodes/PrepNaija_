import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/lib/auth';
import { 
  LayoutDashboard,
  BookOpen,
  BarChart3,
  Trophy,
  Settings,
  User,
  Menu,
  X,
  Zap,
  Target,
  History
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const sidebarItems = [
  {
    id: 'overview',
    label: 'Overview',
    icon: LayoutDashboard,
    description: 'Dashboard home'
  },
  {
    id: 'subjects',
    label: 'Subjects',
    icon: BookOpen,
    description: 'Practice by subject'
  },
  {
    id: 'progress',
    label: 'Progress',
    icon: BarChart3,
    description: 'Track your progress'
  },
  {
    id: 'history',
    label: 'Quiz History',
    icon: History,
    description: 'Review past quizzes'
  },
  {
    id: 'achievements',
    label: 'Achievements',
    icon: Trophy,
    description: 'View your badges'
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: User,
    description: 'Account settings'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    description: 'App preferences'
  }
];

export default function DashboardLayout({ children, activeTab, onTabChange }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  const userName = user?.profile?.fullName || user?.firstName || "Student";

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo/Brand */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Zap className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">PrepNaija</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* User info */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <span className="text-sm font-medium text-primary-foreground">
                  {userName.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{userName}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 p-4">
            <nav className="space-y-2">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                  <Button
                    key={item.id}
                    variant={isActive ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start h-12",
                      isActive 
                        ? "bg-primary text-primary-foreground" 
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                    onClick={() => {
                      onTabChange(item.id);
                      setSidebarOpen(false);
                    }}
                  >
                    <Icon className="mr-3 h-4 w-4" />
                    <div className="text-left">
                      <div className="text-sm font-medium">{item.label}</div>
                      <div className="text-xs opacity-70">{item.description}</div>
                    </div>
                  </Button>
                );
              })}
            </nav>
          </ScrollArea>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Target className="h-3 w-3" />
              <span>JAMB 2024 Prep</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm border-b border-border">
          <div className="flex items-center justify-between px-4 py-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden"
            >
              <Menu className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-semibold text-foreground capitalize">
                {activeTab === 'overview' ? 'Dashboard' : activeTab}
              </h1>
            </div>

            <div className="w-9 lg:hidden" /> {/* Spacer for mobile */}
          </div>
        </div>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
