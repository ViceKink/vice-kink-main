
import React, { useState } from 'react';
import ProfileItem from './ProfileItem';
import { ProfileWithInteraction } from '@/models/profileTypes';
import { useAdCoins } from '@/hooks/useAdCoins';
import { toast } from 'sonner';
import { AdCoinFeature } from '@/models/adCoinsTypes';

interface LikesProps {
  likes: ProfileWithInteraction[];
}

export const Likes: React.FC<LikesProps> = ({ likes }) => {
  const { purchaseFeature, showRewardedAd } = useAdCoins();
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  
  // Function to handle revealing a profile
  const handleRevealProfile = async (profileId: string) => {
    try {
      setIsProcessing(true);
      const result = await purchaseFeature('REVEAL_PROFILE' as AdCoinFeature);
      
      if (result) {
        setRevealedIds(prev => new Set([...prev, profileId]));
        toast.success('Profile revealed successfully!');
      }
    } catch (error) {
      console.error('Error revealing profile:', error);
      toast.error('Failed to reveal profile');
    } finally {
      setIsProcessing(false);
    }
  };

  // Function to handle watching an ad to reveal a profile
  const handleWatchAd = async (profileId: string) => {
    try {
      const success = await showRewardedAd();
      if (success) {
        setRevealedIds(prev => new Set([...prev, profileId]));
        toast.success('Profile revealed successfully!');
      }
    } catch (error) {
      console.error('Error watching ad:', error);
      toast.error('Failed to watch ad');
    }
  };

  const handleSelectLike = (profileId: string) => {
    setSelectedProfileId(profileId);
  };

  // Update the likes with revealed state
  const likesWithRevealedState = likes.map(profile => ({
    ...profile,
    is_revealed: revealedIds.has(profile.id)
  }));

  return (
    <div className="space-y-4">
      {likesWithRevealedState.map(profile => (
        <ProfileItem
          key={profile.id}
          profile={profile}
          onReveal={() => handleRevealProfile(profile.id)}
          onSelectLike={() => handleSelectLike(profile.id)}
          onWatchAd={() => handleWatchAd(profile.id)}
          isProcessing={isProcessing && selectedProfileId === profile.id}
          canUseCoins={true}
          isAdReady={true}
        />
      ))}
    </div>
  );
};

export default Likes;
