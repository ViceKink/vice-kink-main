
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createInteraction } from '@/utils/match/interactionService';

export const useProfileInteractions = (userId: string | undefined, profiles: any[]) => {
  const queryClient = useQueryClient();
  const [matchedProfile, setMatchedProfile] = useState<{id: string; name: string; avatar?: string} | null>(null);
  const [showMatchAnimation, setShowMatchAnimation] = useState(false);
  
  const interactionMutation = useMutation({
    mutationFn: async ({ 
      profileId, 
      type 
    }: { 
      profileId: string, 
      type: 'like' | 'dislike' | 'superlike' 
    }) => {
      if (!userId) throw new Error('User not authenticated');
      console.log('Creating interaction:', userId, '->', profileId, ':', type);
      const result = await createInteraction(userId, profileId, type);
      console.log('Interaction result:', result);
      if (!result.success) throw new Error(`Failed to ${type} profile`);
      return { profileId, type, matched: result.matched };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['userInteractions'] });
      queryClient.invalidateQueries({ queryKey: ['discoverProfiles'] });
      
      if (data.matched) {
        console.log('Match found!', data);
        const matchedProfileData = profiles.find((p) => p.id === data.profileId);
        if (matchedProfileData) {
          setMatchedProfile({
            id: matchedProfileData.id,
            name: matchedProfileData.name,
            avatar: matchedProfileData.photos?.[0]
          });
          setShowMatchAnimation(true);
          
          // Update matches and likes data
          queryClient.invalidateQueries({ queryKey: ['userMatches'] });
          queryClient.invalidateQueries({ queryKey: ['likedByProfiles'] });
        }
      }
    },
    onError: (error) => {
      console.error('Error in interaction:', error);
      toast.error('Failed to interact with profile');
    }
  });
  
  const handleLike = (profileId: string) => {
    console.log('Like button clicked for', profileId);
    interactionMutation.mutate({ profileId, type: 'like' });
  };
  
  const handleDislike = (profileId: string) => {
    console.log('Dislike button clicked for', profileId);
    interactionMutation.mutate({ profileId, type: 'dislike' });
  };
  
  const handleSuperLike = (profileId: string) => {
    console.log('Super like button clicked for', profileId);
    interactionMutation.mutate({ profileId, type: 'superlike' });
    toast.success('Super like sent!');
  };
  
  const handleCloseMatchAnimation = () => {
    setShowMatchAnimation(false);
    setMatchedProfile(null);
  };
  
  return {
    matchedProfile,
    showMatchAnimation,
    handleLike,
    handleDislike,
    handleSuperLike,
    handleCloseMatchAnimation
  };
};
