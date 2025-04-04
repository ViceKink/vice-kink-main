
import React, { useState, useEffect } from 'react';
import ProfileItem from './ProfileItem';
import { ProfileWithInteraction } from '@/models/profileTypes';
import { useAdCoins } from '@/hooks/useAdCoins';
import { toast } from 'sonner';
import { AdCoinFeature } from '@/models/adCoinsTypes';
import { interactionService } from '@/utils/match';
import { useQueryClient } from '@tanstack/react-query';

interface LikesProps {
  likes: ProfileWithInteraction[];
}

export const Likes: React.FC<LikesProps> = ({ likes }) => {
  const { purchaseFeature, showRewardedAd } = useAdCoins();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [localLikes, setLocalLikes] = useState<ProfileWithInteraction[]>([]);
  const queryClient = useQueryClient();
  
  // Update local state whenever props change
  useEffect(() => {
    console.log("Likes component received updated likes data:", likes);
    setLocalLikes(likes);
  }, [likes]);

  // Function to handle revealing a profile
  const handleRevealProfile = async (profileId: string) => {
    try {
      setIsProcessing(true);
      setSelectedProfileId(profileId);
      
      // Purchase the feature with AdCoins
      const result = await purchaseFeature('REVEAL_PROFILE' as AdCoinFeature);
      
      if (result) {
        try {
          // Update the profile interaction in database
          await interactionService.revealProfile(profileId);
          
          // Update local state to immediately show revealed profile
          setLocalLikes(currentLikes => 
            currentLikes.map(profile => 
              profile.id === profileId 
                ? { ...profile, is_revealed: true } 
                : profile
            )
          );
          
          // Force refetch to ensure data consistency
          await queryClient.invalidateQueries({ queryKey: ['likes'] });
          
          toast.success('Profile revealed successfully!');
        } catch (revealError) {
          console.error('Error revealing profile:', revealError);
          toast.error('Failed to reveal profile');
        }
      }
    } catch (error) {
      console.error('Error revealing profile:', error);
      toast.error('Failed to reveal profile');
    } finally {
      setIsProcessing(false);
      setSelectedProfileId(null);
    }
  };

  // Function to handle watching an ad to reveal a profile
  const handleWatchAd = async (profileId: string) => {
    try {
      setIsProcessing(true);
      setSelectedProfileId(profileId);
      
      const success = await showRewardedAd();
      if (success) {
        try {
          // Update the profile interaction in database
          await interactionService.revealProfile(profileId);
          
          // Update local state to immediately show revealed profile
          setLocalLikes(currentLikes => 
            currentLikes.map(profile => 
              profile.id === profileId 
                ? { ...profile, is_revealed: true } 
                : profile
            )
          );
          
          // Force refetch to ensure data consistency
          await queryClient.invalidateQueries({ queryKey: ['likes'] });
          
          toast.success('Profile revealed successfully!');
        } catch (revealError) {
          console.error('Error revealing profile:', revealError);
          toast.error('Failed to reveal profile');
        }
      }
    } catch (error) {
      console.error('Error watching ad:', error);
      toast.error('Failed to watch ad');
    } finally {
      setIsProcessing(false);
      setSelectedProfileId(null);
    }
  };

  const handleSelectLike = (profileId: string) => {
    console.log("Selected profile:", profileId);
    setSelectedProfileId(profileId);
  };

  console.log("Rendering Likes component with localLikes:", localLikes);

  return (
    <div className="space-y-4">
      {localLikes.map(profile => (
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
