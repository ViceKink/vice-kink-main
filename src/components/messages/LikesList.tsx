
import React from 'react';
import { useAuth } from '@/context/auth';
import { useAdCoins } from '@/hooks/useAdCoins';
import { ProfileCardSkeleton } from '@/components/messages/likes/ProfileCard';
import { Likes } from './likes';

export interface LikesListProps {
  isLoading: boolean;
  onSelectLike: (profileId: string) => void;
  balance: number;
  isAdReady: boolean;
  onWatchAd: () => Promise<void>;
  userId: string;
}

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
