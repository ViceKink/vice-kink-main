
import React from 'react';
import { Button } from '@/components/ui/button';

interface ProfileErrorProps {
  error: string;
  onRetry: () => void;
  onNavigateToDiscover?: () => void;
  type: 'error' | 'not-found' | 'unauthenticated';
}

const ProfileError = ({ error, onRetry, onNavigateToDiscover, type }: ProfileErrorProps) => {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center max-w-md">
        {type === 'error' && (
          <>
            <h2 className="text-2xl font-semibold mb-4">Something went wrong</h2>
            <p className="text-foreground/70 mb-6">{error}</p>
            <Button 
              className="bg-vice-purple hover:bg-vice-dark-purple"
              onClick={onRetry}
            >
              Try Again
            </Button>
          </>
        )}
        
        {type === 'not-found' && (
          <>
            <h2 className="text-2xl font-semibold mb-4">Profile Not Found</h2>
            <p className="text-foreground/70 mb-6">
              We couldn't find the profile you're looking for.
            </p>
            <Button 
              className="bg-vice-purple hover:bg-vice-dark-purple"
              onClick={onNavigateToDiscover || onRetry}
            >
              Back to Discover
            </Button>
          </>
        )}
        
        {type === 'unauthenticated' && (
          <>
            <h2 className="text-2xl font-semibold mb-4">Sign in to view your profile</h2>
            <p className="text-foreground/70 mb-6">
              You need to be signed in to view and manage your profile.
            </p>
            <Button 
              className="bg-vice-purple hover:bg-vice-dark-purple"
              onClick={onRetry}
            >
              Sign In
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfileError;
