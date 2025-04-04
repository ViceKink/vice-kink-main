
import React from 'react';
import { Heart } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { createInteraction } from '@/utils/match';
import { toast } from 'sonner';
import { revealProfileInteraction } from '@/utils/adCoins/adCoinsService';
import ProfileItem from './ProfileItem';

interface Profile {
  id: string;
  name: string;
  age?: number;
  location?: string;
  avatar?: string;
  interactionType?: 'like' | 'superlike';
  isRevealed?: boolean;
}

interface LikesListProps {
  profiles: Profile[];
  isLoading: boolean;
  onSelectLike: (profileId: string) => void;
  balance: number;
  isAdReady: boolean;
  onWatchAd: () => void;
  userId?: string;
}

const LikesList: React.FC<LikesListProps> = ({
  profiles,
  isLoading,
  onSelectLike,
  balance,
  isAdReady,
  onWatchAd,
  userId
}) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // Interaction mutation (like/dislike)
  const interactionMutation = useMutation({
    mutationFn: async ({ 
      profileId, 
      interactionType 
    }: { 
      profileId: string, 
      interactionType: 'like' | 'dislike' | 'superlike' 
    }) => {
      if (!userId) throw new Error('User not authenticated');
      console.log('Creating interaction with profile', profileId, 'as', interactionType);
      const result = await createInteraction(userId, profileId, interactionType);
      console.log('Interaction result:', result);
      return result;
    },
    onSuccess: (result, variables) => {
      if (variables.interactionType === 'dislike') {
        toast.success("Profile rejected");
      } else if (result.matched) {
        toast.success("It's a match! 🎉");
      } else {
        toast.success("Like sent!");
      }
      
      // Refresh queries to update UI
      queryClient.invalidateQueries({ queryKey: ['likedByProfiles'] });
      queryClient.invalidateQueries({ queryKey: ['userMatches'] });
    },
    onError: (error) => {
      console.error('Error with profile interaction:', error);
      toast.error('Failed to process interaction');
    }
  });

  // Reveal profile mutation
  const revealProfileMutation = useMutation({
    mutationFn: async (profileId: string) => {
      if (!userId) throw new Error('User not authenticated');
      return revealProfileInteraction(userId, profileId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['likedByProfiles'] });
      toast.success("Profile revealed!");
    }
  });
  
  // Handler functions
  const handleLikeProfile = (profileId: string) => {
    interactionMutation.mutate({ profileId, interactionType: 'like' });
  };
  
  const handleRejectProfile = (profileId: string) => {
    interactionMutation.mutate({ profileId, interactionType: 'dislike' });
  };
  
  const handleRevealProfile = async (profileId: string) => {
    // Try to reveal the profile and update the UI
    revealProfileMutation.mutate(profileId);
  };
  
  const handleViewProfile = (profileId: string) => {
    navigate(`/profile/${profileId}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-gray-200" />
                <div className="ml-3 space-y-2 flex-1">
                  <div className="h-4 w-1/2 bg-gray-200 rounded" />
                  <div className="h-3 w-4/5 bg-gray-200 rounded" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <Card className="h-full flex flex-col items-center justify-center text-center p-6">
        <Heart className="w-12 h-12 mb-2 text-gray-400" />
        <h3 className="text-lg font-medium">No likes yet</h3>
        <p className="text-sm text-muted-foreground mt-1">
          When someone likes you, they'll appear here
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-2 overflow-y-auto max-h-[70vh]">
      {profiles.map((profile) => (
        <ProfileItem
          key={profile.id}
          profile={profile}
          balance={balance}
          isAdReady={isAdReady}
          onReveal={handleRevealProfile}
          onWatchAd={onWatchAd}
          onLike={handleLikeProfile}
          onReject={handleRejectProfile}
          onViewProfile={handleViewProfile}
        />
      ))}
    </div>
  );
};

export default LikesList;
