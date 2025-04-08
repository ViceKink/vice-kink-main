
import { useState } from 'react';
import { useAdCoins } from '@/hooks/useAdCoins';
import { toast } from 'sonner';
import { interactionService } from '@/utils/match';
import { useQueryClient } from '@tanstack/react-query';
import { ProfileWithInteraction } from '@/models/profileTypes';

interface UseWatchAdRevealProps {
  setIsProcessing: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedProfileId: React.Dispatch<React.SetStateAction<string | null>>;
  setLocalLikes: React.Dispatch<React.SetStateAction<ProfileWithInteraction[]>>;
}

export const useWatchAdReveal = ({
  setIsProcessing,
  setSelectedProfileId,
  setLocalLikes
}: UseWatchAdRevealProps) => {
  const { showRewardedAd } = useAdCoins();
  const queryClient = useQueryClient();

  const watchAdToReveal = async (profileId: string) => {
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
          
          // Invalidate queries to refresh data from server
          await queryClient.invalidateQueries({ queryKey: ['likes'] });
          
          // Store the revealed status in localStorage for additional persistence
          const revealedProfiles = JSON.parse(localStorage.getItem('revealedProfiles') || '{}');
          revealedProfiles[profileId] = true;
          localStorage.setItem('revealedProfiles', JSON.stringify(revealedProfiles));
          
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

  return { watchAdToReveal };
};
