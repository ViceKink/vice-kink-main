
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const [isReadyToRender, setIsReadyToRender] = useState(false);
  
  // Add a small delay to prevent flickering during auth state changes
  useEffect(() => {
    // If not loading anymore, we can render
    if (!isLoading) {
      setIsReadyToRender(true);
    }
  }, [isLoading]);
  
  // While still loading and determining auth state, show loading screen
  if (isLoading || !isReadyToRender) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Loading...</h2>
          <p className="text-sm text-foreground/70">Please wait a moment</p>
        </div>
      </div>
    );
  }
  
  // If not authenticated after loading completes, redirect to auth
  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }
  
  // If authenticated and loading is done, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;
