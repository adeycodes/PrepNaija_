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
  History,
  LogOut,
  Bell,
  Search
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const sidebarItems = [
  {
    id: 'overview',
    label: 'Dashboard',
    icon: LayoutDashboard,
    description: 'Overview & stats'
  },
  {
    id: 'subjects',
    label: 'Study Subjects',
    icon: BookOpen,
    description: 'Practice questions'
  },
  {
    id: 'study-path',
    label: 'Study Path',
    icon: Zap,
    description: 'Personalized learning'
  },
  {
    id: 'progress',
    label: 'My Progress',
    icon: BarChart3,
    description: 'Track performance'
  },
  {
    id: 'history',
    label: 'Quiz History',
    icon: History,
    description: 'Past sessions'
  },
  {
    id: 'achievements',
    label: 'Achievements',
    icon: Trophy,
    description: 'Badges & rewards'
  },
  {
    id: 'profile',
    label: 'My Profile',
    icon: User,
    description: 'Account details'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    description: 'Preferences'
  }
];

export default function DashboardLayout({ children, activeTab, onTabChange }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();

  const userName = user?.profile?.fullName || user?.firstName || user?.name || "Student";
  const userEmail = user?.email || "student@example.com";

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-slate-200/50 dark:border-slate-800/50 shadow-2xl transform transition-transform duration-300 ease-out lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo/Brand */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200/50 dark:border-slate-800/50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">PrepNaija</span>
                <p className="text-xs text-slate-500 dark:text-slate-400">JAMB Excellence</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* User info */}
          <div className="p-4 border-b border-slate-200/50 dark:border-slate-800/50">
            <div className="flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-100 dark:border-blue-900/30">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-md">
                <span className="text-base font-bold text-white">
                  {getInitials(userName)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{userName}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 truncate">{userEmail}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 px-3 py-4">
            <nav className="space-y-1">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                  <Button
                    key={item.id}
                    variant="ghost"
                    className={cn(
                      "w-full justify-start h-auto py-3 px-4 rounded-xl transition-all duration-200",
                      isActive 
                        ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:from-blue-600 hover:to-indigo-700" 
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100"
                    )}
                    onClick={() => {
                      onTabChange(item.id);
                      setSidebarOpen(false);
                    }}
                  >
                    <Icon className={cn(
                      "mr-3 h-5 w-5 flex-shrink-0 transition-transform duration-200",
                      isActive && "scale-110"
                    )} />
                    <div className="text-left flex-1">
                      <div className="text-sm font-semibold">{item.label}</div>
                      <div className={cn(
                        "text-xs",
                        isActive ? "opacity-90" : "opacity-60"
                      )}>{item.description}</div>
                    </div>
                  </Button>
                );
              })}
            </nav>
          </ScrollArea>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200/50 dark:border-slate-800/50 space-y-3">
            <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <Target className="h-3.5 w-3.5" />
              <span className="font-medium">JAMB 2025 Preparation</span>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="w-full justify-start border-slate-200 dark:border-slate-700 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-900 transition-colors"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 gap-4">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden flex-shrink-0 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            {/* Page title */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent truncate">
                {activeTab === 'overview' ? 'Dashboard' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {activeTab === 'overview' && 'Welcome back, keep up the great work!'}
                {activeTab === 'subjects' && 'Choose a subject to practice'}
                {activeTab === 'study-path' && 'Follow your personalized study path'}
                {activeTab === 'progress' && 'Track your learning journey'}
                {activeTab === 'history' && 'Review your past quiz sessions'}
                {activeTab === 'achievements' && 'Celebrate your milestones'}
                {activeTab === 'profile' && 'Manage your account information'}
                {activeTab === 'settings' && 'Customize your experience'}
              </p>
            </div>

            {/* Right side actions */}
            <div className="flex items-center space-x-2 flex-shrink-0">
              {/* Search button (hidden on mobile) */}
              <Button
                variant="ghost"
                size="icon"
                className="hidden md:flex hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </Button>

              {/* Notifications button (hidden on mobile) */}
              <Button
                variant="ghost"
                size="icon"
                className="hidden md:flex hover:bg-slate-100 dark:hover:bg-slate-800 relative"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
              </Button>

              {/* User menu (desktop) */}
              <div className="hidden sm:flex items-center space-x-3 pl-3 border-l border-slate-200 dark:border-slate-700">
                <div className="flex flex-col text-right">
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[120px]">{userName}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[120px]">{userEmail}</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                  <span className="text-sm font-bold text-white">
                    {getInitials(userName)}
                  </span>
                </div>
              </div>

              {/* Mobile user avatar */}
              <div className="sm:hidden w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                <span className="text-xs font-bold text-white">
                  {getInitials(userName)}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}