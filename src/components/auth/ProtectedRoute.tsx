
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Progress } from '@/components/ui/progress';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  // Simulate loading progress
  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setLoadingProgress((prev) => {
          const newValue = prev + Math.random() * 15;
          return newValue >= 90 ? 90 : newValue;
        });
      }, 400);
      
      return () => clearInterval(interval);
    } else {
      setLoadingProgress(100);
    }
  }, [isLoading]);
  
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center flex-col p-4">
        <div className="text-center mb-4">
          <h2 className="text-2xl font-semibold mb-2">Loading...</h2>
          <p className="text-sm text-foreground/70 mb-4">Please wait a moment</p>
          <Progress value={loadingProgress} className="w-60 h-2" />
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    // Preserve the intended destination to return after login
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;
