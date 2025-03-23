
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/auth';
import { Progress } from '@/components/ui/progress';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [hasTimedOut, setHasTimedOut] = useState(false);
  
  // Simulate loading progress
  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setLoadingProgress((prev) => {
          const newValue = prev + Math.random() * 15;
          return newValue >= 90 ? 90 : newValue;
        });
      }, 400);
      
      // Add a timeout to prevent infinite loading
      const timeout = setTimeout(() => {
        setLoadingTimeout(true);
        // If still loading after 15 seconds, assume auth failed
        if (isLoading) {
          setHasTimedOut(true);
        }
      }, 15000); // 15 seconds timeout
      
      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    } else {
      setLoadingProgress(100);
      // Reset timeout state when loading completes
      setLoadingTimeout(false);
    }
  }, [isLoading]);
  
  // Debug logs to trace auth state
  useEffect(() => {
    console.log("ProtectedRoute: Auth state updated", { 
      isLoading, 
      isAuthenticated, 
      userId: user?.id,
      path: location.pathname
    });
    
    // Check if auth has timed out
    if (hasTimedOut && isLoading) {
      console.error("Authentication check has timed out");
    }
  }, [isLoading, isAuthenticated, user, location.pathname, hasTimedOut]);
  
  // Force navigation if auth has timed out
  if (hasTimedOut) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }
  
  // Show timeout message if loading takes too long but hasn't completely timed out
  if (loadingTimeout && isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center flex-col p-4">
        <div className="text-center mb-4 max-w-md">
          <h2 className="text-2xl font-semibold mb-2">Loading is taking longer than expected</h2>
          <p className="text-sm text-foreground/70 mb-6">
            You can try refreshing the page or continue waiting
          </p>
          <div className="w-full mb-6">
            <Progress value={loadingProgress} className="w-full h-2" />
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-vice-purple hover:bg-vice-dark-purple text-white rounded-md transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }
  
  // Show loading state
  if (isLoading) {
    console.log("ProtectedRoute: Loading auth state...", { isLoading, isAuthenticated, userId: user?.id });
    return (
      <div className="flex min-h-screen items-center justify-center flex-col p-4">
        <div className="text-center mb-4 max-w-md">
          <h2 className="text-2xl font-semibold mb-2">Loading...</h2>
          <p className="text-sm text-foreground/70 mb-6">Please wait a moment</p>
          <div className="w-full">
            <Progress value={loadingProgress} className="w-full h-2" />
          </div>
        </div>
      </div>
    );
  }
  
  console.log("ProtectedRoute: Auth check complete", { isAuthenticated, path: location.pathname });
  
  // Redirect to auth page if not authenticated
  if (!isAuthenticated) {
    // Preserve the intended destination to return after login
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }
  
  // Render children if authenticated
  return <>{children}</>;
};

export default ProtectedRoute;
