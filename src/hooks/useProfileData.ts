
import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/context/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UserProfile } from '@/types/auth';

export const useProfileData = (profileId?: string) => {
  const { user, fetchProfile, isAuthenticated, isLoading: authLoading } = useAuth();
  const [profileUser, setProfileUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [fetchAttempts, setFetchAttempts] = useState(0);
  
  const isCurrentUser = !profileId || profileId === user?.id;
  const currentProfileId = profileId || user?.id;
  
  // Profile data fetching
  const getProfileData = useCallback(async () => {
    if (fetchAttempts > 3) {
      console.error("Maximum fetch attempts reached");
      setError("Failed to load profile after multiple attempts.");
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    console.log("Fetching profile attempt", fetchAttempts + 1);
    
    try {
      let profile = null;
      
      if (isCurrentUser && user) {
        console.log("Using existing user profile:", user);
        profile = user;
      } 
      else {
        console.log("Fetching profile data for", profileId || "current user");
        profile = await fetchProfile(profileId);
        console.log("Profile data fetched:", profile);
      }
      
      setProfileUser(profile);
      
      if (!profile && !authLoading && isAuthenticated) {
        setError("Could not load profile data. Please try again.");
        toast.error("Failed to load profile data");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setError("An error occurred while loading the profile.");
      toast.error("Error loading profile");
    } finally {
      setIsLoading(false);
      setFetchAttempts(prev => prev + 1);
    }
  }, [profileId, user, fetchProfile, isAuthenticated, authLoading, isCurrentUser, fetchAttempts]);
  
  // Loading effects
  useEffect(() => {
    return () => {
      setIsLoading(false);
      setLoadingTimeout(false);
    };
  }, []);
  
  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setLoadingProgress((prev) => {
          const newValue = prev + Math.random() * 10;
          return newValue >= 90 ? 90 : newValue;
        });
      }, 400);
      
      const timeout = setTimeout(() => {
        setLoadingTimeout(true);
      }, 10000);
      
      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    } else {
      setLoadingProgress(100);
    }
  }, [isLoading]);
  
  useEffect(() => {
    if (!authLoading) {
      if (isCurrentUser && !isAuthenticated) {
        console.log("User not authenticated, skipping profile fetch");
        setIsLoading(false);
        return;
      }
      
      if (!isLoading && !profileUser && fetchAttempts === 0) {
        console.log("Initial profile fetch");
        getProfileData();
      }
    }
  }, [authLoading, getProfileData, isAuthenticated, isCurrentUser, isLoading, profileUser, fetchAttempts]);
  
  const handleRetry = () => {
    setLoadingTimeout(false);
    setIsLoading(true);
    setLoadingProgress(0);
    getProfileData();
  };
  
  return {
    profileUser,
    isLoading,
    error,
    loadingTimeout,
    loadingProgress,
    isCurrentUser,
    currentProfileId,
    authLoading,
    isAuthenticated,
    handleRetry,
  };
};
