
import React, { useState } from 'react';
import ProfileItem from './ProfileItem';
import { Button } from '@/components/ui/button';
import { ProfileWithInteraction } from '@/models/profileTypes';
import { useAdCoins } from '@/hooks/useAdCoins';
import { AdCoinFeature } from '@/utils/match/types';

interface LikesProps {
  likes: ProfileWithInteraction[];
}

export const Likes: React.FC<LikesProps> = ({ likes }) => {
  const { purchaseFeature } = useAdCoins();
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
  
  const handleRevealAll = async () => {
    try {
      const result = await purchaseFeature('REVEAL_PROFILE');
      if (result.success) {
        const allIds = likes.map(like => like.id);
        setRevealedIds(new Set([...revealedIds, ...allIds]));
      }
    } catch (error) {
      console.error('Error revealing all profiles:', error);
    }
  };
  
  const handleRevealProfile = (profileId: string) => {
    setRevealedIds(new Set([...revealedIds, profileId]));
  };

  return (
    <div className="space-y-4">
      {likes.length > 1 && (
        <div className="flex justify-end mb-2">
          <Button variant="outline" onClick={handleRevealAll} className="text-sm">
            Reveal All Profiles
          </Button>
        </div>
      )}
      
      {likes.map(profile => (
        <ProfileItem
          key={profile.id}
          profile={profile}
          isRevealed={revealedIds.has(profile.id)}
          onReveal={() => handleRevealProfile(profile.id)}
        />
      ))}
    </div>
  );
};

export default Likes;
