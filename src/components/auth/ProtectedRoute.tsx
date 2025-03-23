
import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const [isReadyToRender, setIsReadyToRender] = useState(false);
  
  useEffect(() => {
    console.log("ProtectedRoute: Authentication state", { isAuthenticated, isLoading });
    
    // Only set ready to render after we've confirmed auth state
    if (!isLoading) {
      const timer = setTimeout(() => {
        setIsReadyToRender(true);
      }, 100); // Small delay to prevent flickering
      
      return () => clearTimeout(timer);
    }
  }, [isLoading, isAuthenticated]);
  
  // If still loading or not ready, show loading state
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
  
  // If authenticated, render the protected content
  if (isAuthenticated) {
    console.log("ProtectedRoute: User is authenticated, rendering content");
    return <>{children}</>;
  }
  
  // If not authenticated after loading completes, redirect to auth
  console.log("ProtectedRoute: User is not authenticated, redirecting to auth");
  return <Navigate to="/auth" state={{ from: location }} replace />;
};

export default ProtectedRoute;
