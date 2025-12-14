import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import OfflineIndicator from "@/components/OfflineIndicator";

import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Quiz from "@/pages/Quiz";
import Results from "@/pages/Results";
import Profile from "@/pages/Profile";
import Settings from "@/pages/Settings";
import Practice from "@/pages/Practice";
import QuizSelectorPage from "@/pages/QuizSelector";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import AuthConfirmed from "@/pages/AuthConfirmed";
import AuthError from "@/pages/AuthError";
import NotFound from "@/pages/not-found";
import StudyPath from "@/pages/StudyPath";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/auth/confirmed" component={AuthConfirmed} />
      <Route path="/auth/error" component={AuthError} />
      <Route path="/" component={Landing} />

      {/* Protected Routes */}
      <Route path="/dashboard">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>

      <Route path="/quiz-selector">
        <ProtectedRoute>
          <QuizSelectorPage />
        </ProtectedRoute>
      </Route>

      <Route path="/quiz" component={Quiz} />

      <Route path="/results/:sessionId">
        <ProtectedRoute>
          <Results />
        </ProtectedRoute>
      </Route>

      <Route path="/profile">
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      </Route>

      <Route path="/settings">
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      </Route>

      <Route path="/practice">
        <ProtectedRoute>
          <Practice />
        </ProtectedRoute>
      </Route>

      <Route path="/study-path">
        <ProtectedRoute>
          <StudyPath />
        </ProtectedRoute>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}


function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <OfflineIndicator />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
