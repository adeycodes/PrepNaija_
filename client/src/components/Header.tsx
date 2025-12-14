import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useOffline } from "@/hooks/useOffline";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import PrepNaija from "@/assets/prepnaija_logo.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  GraduationCap, 
  Menu, 
  X, 
  User, 
  Settings, 
  LogOut, 
  WifiOff,
  Wifi,
  Home,
  BookOpen
} from "lucide-react";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const { isOnline } = useOffline();

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const userName = user?.profile?.fullName || user?.firstName || "Student";
  const userInitials = userName.split(' ').map((n: string) => n[0]).join('').toUpperCase();

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Practice", href: "/practice", icon: BookOpen },
  ];

  return (
    <>
      {/* Offline Indicator */}
      {!isOnline && (
        <div className="offline-indicator">
          <div className="flex items-center justify-center space-x-2">
            <WifiOff size={16} />
            <span>You're offline - Using cached questions</span>
          </div>
        </div>
      )}

      <header className="bg-background border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <img src={PrepNaija} alt="PrepNaija Logo" className="w-10 h-10" />
              </div>
              
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-2 text-sm font-medium transition-colors ${
                      isActive 
                        ? "text-primary" 
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    data-testid={`nav-${item.name.toLowerCase()}`}
                  >
                    <Icon size={16} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right Side */}
            <div className="flex items-center space-x-4">
              {/* Connection Status */}
              <div className="hidden sm:flex items-center space-x-2">
                {isOnline ? (
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <Wifi size={12} />
                    <span>Online</span>
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="flex items-center space-x-1">
                    <WifiOff size={12} />
                    <span>Offline</span>
                  </Badge>
                )}
              </div>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="relative h-8 w-8 rounded-full"
                    data-testid="button-user-menu"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.profileImageUrl || undefined} alt={userName} />
                      <AvatarFallback>{userInitials}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{userName}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setLocation("/profile")} data-testid="menu-profile">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLocation("/settings")} data-testid="menu-settings">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} data-testid="menu-logout">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile Menu Button */}
              <div className="md:hidden">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  data-testid="button-mobile-menu"
                >
                  {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-border py-4 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-3 px-4 py-2 text-sm font-medium transition-colors ${
                      isActive 
                        ? "text-primary bg-primary/10" 
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    data-testid={`mobile-nav-${item.name.toLowerCase()}`}
                  >
                    <Icon size={16} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              
              <div className="px-4 py-2">
                {isOnline ? (
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Wifi size={16} />
                    <span>Connected</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 text-sm text-destructive">
                    <WifiOff size={16} />
                    <span>Offline Mode</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  );
}
