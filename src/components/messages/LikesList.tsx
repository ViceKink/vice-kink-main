
import React from 'react';
import { useAuth } from '@/context/auth';
import { useAdCoins } from '@/hooks/useAdCoins';
import { Likes } from './likes';
import { Skeleton } from '@/components/ui/skeleton';

export interface LikesListProps {
  isLoading: boolean;
  onSelectLike: (profileId: string) => void;
  balance: number;
  isAdReady: boolean;
  onWatchAd: () => Promise<void>;
  userId: string;
}

// Create a profile card skeleton component
const ProfileCardSkeleton = () => {
  return (
    <div className="border rounded-lg p-4 shadow-sm space-y-2">
      <Skeleton className="h-40 w-full" />
      <div className="space-y-2">
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
};

const LikesList = ({
  isLoading,
  onSelectLike,
  balance,
  isAdReady,
  onWatchAd,
  userId
}: LikesListProps) => {
  const { user } = useAuth();
  const { adCoins } = useAdCoins();
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        {[...Array(4)].map((_, i) => (
          <ProfileCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div>
      <Likes
        userId={userId}
        onSelectLike={onSelectLike}
        balance={balance}
        isAdReady={isAdReady}
        onWatchAd={onWatchAd}
      />
    </div>
  );
};

export default LikesList;
