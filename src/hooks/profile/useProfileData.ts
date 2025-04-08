
import { useEffect } from 'react';
import { useAuth } from '@/context/auth';
import { useProfileFetcher } from './useProfileFetcher';
import { useProfileLoadingState } from './useProfileLoadingState';

export const useProfileData = (profileId?: string) => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  const {
    profileUser,
    isLoading,
    error,
    getProfileData,
    isCurrentUser,
    currentProfileId,
    setIsLoading,
    fetchAttempts
  } = useProfileFetcher(profileId);
  
  const {
    loadingTimeout,
    loadingProgress,
    setLoadingTimeout
  } = useProfileLoadingState(isLoading);
  
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
  }, [authLoading, getProfileData, isAuthenticated, isCurrentUser, isLoading, profileUser, fetchAttempts, setIsLoading]);
  
  const handleRetry = () => {
    setLoadingTimeout(false);
    setIsLoading(true);
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
