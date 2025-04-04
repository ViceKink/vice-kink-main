
import React, { useState } from 'react';
import ProfileItem from './ProfileItem';
import { Button } from '@/components/ui/button';
import { ProfileWithInteraction } from '@/models/profileTypes';
import { useAdCoins } from '@/hooks/useAdCoins';
import { toast } from 'sonner';

interface LikesProps {
  likes: ProfileWithInteraction[];
}

export const Likes: React.FC<LikesProps> = ({ likes }) => {
  const { purchaseFeature } = useAdCoins();
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  
  const handleRevealAll = async () => {
    try {
      setIsProcessing(true);
      // Since AdCoinFeature doesn't include 'REVEAL_PROFILE', handle it generically
      const result = await purchaseFeature('REVEAL_PROFILE' as any);
      if (result && typeof result === 'object' && 'success' in result && result.success === true) {
        const allIds = likes.map(like => like.id);
        setRevealedIds(new Set([...revealedIds, ...allIds]));
      }
    } catch (error) {
      console.error('Error revealing all profiles:', error);
      toast.error('Failed to reveal all profiles');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleRevealProfile = (profileId: string) => {
    setRevealedIds(new Set([...revealedIds, profileId]));
  };

  const handleSelectLike = (profileId: string) => {
    setSelectedProfileId(profileId);
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
          onReveal={() => handleRevealProfile(profile.id)}
          onSelectLike={handleSelectLike}
          onWatchAd={() => {}} // Placeholder
          isProcessing={isProcessing}
          canUseCoins={true} // Placeholder
          isAdReady={true} // Placeholder
        />
      ))}
    </div>
  );
};

export default Likes;
