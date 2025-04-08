
import { useState, useCallback } from 'react';
import { useAuth } from '@/context/auth';
import { UserProfile } from '@/types/auth';
import { toast } from 'sonner';

export const useProfileFetcher = (profileId?: string) => {
  const { user, fetchProfile, isAuthenticated, isLoading: authLoading } = useAuth();
  const [profileUser, setProfileUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  return {
    profileUser,
    isLoading,
    error,
    getProfileData,
    isCurrentUser,
    currentProfileId,
    setIsLoading,
    fetchAttempts
  };
};
