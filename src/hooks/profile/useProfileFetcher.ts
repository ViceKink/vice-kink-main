
import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/context/auth';
import { UserProfile } from '@/types/auth';
import { toast } from 'sonner';
import { fetchProfileById } from '@/utils/match/profileService';

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
    console.log("Fetching profile attempt", fetchAttempts + 1, "for profile ID:", currentProfileId);
    
    try {
      let profile = null;
      
      if (isCurrentUser && user) {
        console.log("Using existing user profile:", user);
        profile = user;
      } 
      else if (currentProfileId) {
        console.log("Fetching profile data for", currentProfileId);
        
        // First try using fetchProfileById from profileService
        try {
          profile = await fetchProfileById(currentProfileId);
          console.log("Profile fetched from profileService:", profile);
        } catch (profileError) {
          console.error("Error fetching from profileService:", profileError);
          // Fallback to fetchProfile from auth context
          profile = await fetchProfile(currentProfileId);
        }
        
        console.log("Final profile data fetched:", profile);
      }
      
      if (profile) {
        setProfileUser(profile);
      } else {
        if (!authLoading && isAuthenticated) {
          setError("Could not load profile data. Please try again.");
          toast.error("Failed to load profile data");
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setError("An error occurred while loading the profile.");
      toast.error("Error loading profile");
    } finally {
      setIsLoading(false);
      setFetchAttempts(prev => prev + 1);
    }
  }, [profileId, user, fetchProfile, isAuthenticated, authLoading, isCurrentUser, fetchAttempts, currentProfileId]);

  // Auto-fetch on mount or when dependencies change
  useEffect(() => {
    if (currentProfileId && !profileUser && !isLoading && fetchAttempts === 0) {
      getProfileData();
    }
  }, [currentProfileId, profileUser, isLoading, fetchAttempts, getProfileData]);

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
