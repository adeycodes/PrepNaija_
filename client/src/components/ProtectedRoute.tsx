import React from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/lib/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading, token } = useAuth();
  const [, navigate] = useLocation();

  React.useEffect(() => {
    // Only redirect if we've finished loading and have neither user nor token
    if (!isLoading && !user && !token) {
      navigate('/login');
    }
  }, [user, token, isLoading, navigate]);

  // While loading or we have a token but user not yet populated, show a loader
  if (isLoading || (!!token && !user)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user && !token) {
    return null;
  }

  return <>{children}</>;
}
