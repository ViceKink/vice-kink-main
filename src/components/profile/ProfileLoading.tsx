
import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface ProfileLoadingProps {
  type: 'initial' | 'auth' | 'timeout';
  progress: number;
  onRetry?: () => void;
}

const ProfileLoading = ({ type, progress, onRetry }: ProfileLoadingProps) => {
  return (
    <div className="flex min-h-screen items-center justify-center flex-col p-4">
      <div className="text-center mb-4 max-w-md">
        {type === 'initial' && (
          <>
            <h2 className="text-2xl font-semibold mb-2">Loading Profile...</h2>
            <p className="text-sm text-foreground/70 mb-6">Please wait a moment</p>
          </>
        )}
        
        {type === 'auth' && (
          <>
            <h2 className="text-2xl font-semibold mb-2">Loading Profile...</h2>
            <p className="text-sm text-foreground/70 mb-6">Checking authentication</p>
          </>
        )}
        
        {type === 'timeout' && (
          <>
            <h2 className="text-2xl font-semibold mb-2">Loading is taking longer than expected</h2>
            <p className="text-sm text-foreground/70 mb-6">
              There might be an issue loading your profile data
            </p>
          </>
        )}
        
        <div className="w-full mb-6">
          <Progress value={progress} className="w-full h-2" />
        </div>
        
        {type === 'timeout' && onRetry && (
          <Button 
            onClick={onRetry}
            className="bg-vice-purple hover:bg-vice-dark-purple flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Retry
          </Button>
        )}
      </div>
    </div>
  );
};

export default ProfileLoading;
