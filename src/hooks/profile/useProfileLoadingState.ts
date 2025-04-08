
import { useState, useEffect } from 'react';

export const useProfileLoadingState = (isLoading: boolean) => {
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  // Loading effects
  useEffect(() => {
    return () => {
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

  return {
    loadingTimeout,
    loadingProgress,
    setLoadingTimeout
  };
};
