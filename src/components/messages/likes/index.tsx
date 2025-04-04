
import React, { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { interactionService } from '@/utils/match/interactionService';
import { useAuth } from '@/context/auth';
import { useAdCoins } from '@/hooks/useAdCoins';
import { toast } from '@/components/ui/use-toast';
import ProfileItem from './ProfileItem';
import { AdCoinFeature } from '@/models/adCoinsTypes';

interface LikesProps {
  userId: string;
  onSelectLike: (profileId: string) => void;
  balance: number;
  isAdReady: boolean;
  onWatchAd: () => Promise<void>;
}

export const Likes = ({
  userId,
  onSelectLike,
  balance,
  isAdReady,
  onWatchAd
}: LikesProps) => {
  const { adCoins, purchaseFeature } = useAdCoins();
  const [processingIds, setProcessingIds] = useState<string[]>([]);
  
  // Query to get profiles who liked the current user
  const { data: profiles, isLoading, refetch } = useQuery({
    queryKey: ['likes', userId],
    queryFn: () => interactionService.getLikesForUser(userId),
    enabled: !!userId,
  });
  
  // Reveal profile mutation
  const revealMutation = useMutation({
    mutationFn: async ({ profileId, useCoins }: { profileId: string; useCoins: boolean }) => {
      setProcessingIds(prev => [...prev, profileId]);
      
      // If using AdCoins, purchase the reveal feature
      if (useCoins) {
        await purchaseFeature(AdCoinFeature.REVEAL_PROFILE);
      }
      
      // Reveal the profile
      return await interactionService.revealProfile(userId, profileId);
    },
    onSuccess: () => {
      refetch();
      toast({
        title: "Profile revealed!",
        description: "Now you can see who liked you",
      });
    },
    onError: (error) => {
      toast({
        title: "Error revealing profile",
        description: String(error),
        variant: "destructive",
      });
    },
    onSettled: (_, __, variables) => {
      setProcessingIds(prev => prev.filter(id => id !== variables.profileId));
    }
  });
  
  // Handle revealing a profile
  const handleRevealProfile = (profileId: string, useCoins = true) => {
    revealMutation.mutate({ profileId, useCoins });
  };

  if (!profiles || profiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 bg-muted/30 rounded-lg">
        <p className="text-xl font-medium mb-2">No likes yet</p>
        <p className="text-muted-foreground text-center">
          When someone likes you, they'll appear here
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-2">
      {profiles.map(profile => (
        <ProfileItem
          key={profile.id}
          profile={profile}
          onSelectLike={onSelectLike}
          onReveal={() => handleRevealProfile(profile.id)}
          onWatchAd={() => {
            handleRevealProfile(profile.id, false);
            onWatchAd();
          }}
          isProcessing={processingIds.includes(profile.id)}
          canUseCoins={balance >= 50}
          isAdReady={isAdReady}
        />
      ))}
    </div>
  );
};
