import React, { useState, useEffect } from 'react';
import ProfileItem from './ProfileItem';
import { useAuth } from '@/context/auth';
import { useAdCoins } from '@/hooks/useAdCoins';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { interactionService } from '@/utils/match/interactionService';
import { AdCoinFeature } from '@/utils/match/types';

const LikesList = () => {
  const { user } = useAuth();
  const [selectedLike, setSelectedLike] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { 
    spendAdCoins, 
    canUseFeature, 
    watchAd,
    isAdReady 
  } = useAdCoins();
  const queryClient = useQueryClient();
  
  const { data: likes = [], isLoading } = useQuery({
    queryKey: ['userLikes', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const userLikes = await interactionService.getLikesForUser(user.id);
      console.log('Fetched likes:', userLikes);
      return userLikes || [];
    },
    enabled: !!user?.id
  });
  
  const handleSelectLike = (profileId: string) => {
    setSelectedLike(profileId);
  };

  const handleRevealProfile = async () => {
    if (!user?.id || !selectedLike) return;
    
    setIsProcessing(true);
    try {
      const featureName: AdCoinFeature = 'REVEAL_PROFILE';
      const canUse = await canUseFeature(featureName);
      
      if (!canUse) {
        toast.error('Not enough AdCoins to reveal this profile');
        return;
      }
      
      const spendSuccess = await spendAdCoins(featureName);
      if (!spendSuccess) {
        toast.error('Failed to spend AdCoins');
        return;
      }
      
      await interactionService.revealProfile(user.id, selectedLike);
      
      toast.success('Profile revealed!');
      queryClient.invalidateQueries({ queryKey: ['userLikes'] });
    } catch (error) {
      console.error('Error revealing profile:', error);
      toast.error('Failed to reveal profile');
    } finally {
      setIsProcessing(false);
      setSelectedLike(null);
    }
  };
  
  const handleWatchAd = async () => {
    if (!user?.id || !selectedLike) return;
    
    setIsProcessing(true);
    try {
      const success = await watchAd();
      
      if (!success) {
        toast.error('Failed to watch ad');
        return;
      }
      
      await interactionService.revealProfile(user.id, selectedLike);
      
      toast.success('Profile revealed!');
      queryClient.invalidateQueries({ queryKey: ['userLikes'] });
    } catch (error) {
      console.error('Error watching ad to reveal profile:', error);
      toast.error('Failed to reveal profile');
    } finally {
      setIsProcessing(false);
      setSelectedLike(null);
    }
  };

  return (
    <>
      {isLoading ? (
        <div>Loading...</div>
      ) : likes.length === 0 ? (
        <div>No likes yet</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {likes.map((profile) => (
            <ProfileItem
              key={profile.id}
              profile={profile}
              onSelectLike={handleSelectLike}
              onReveal={handleRevealProfile}
              onWatchAd={handleWatchAd}
              isProcessing={isProcessing && selectedLike === profile.id}
              canUseCoins={true}
              isAdReady={isAdReady}
            />
          ))}
        </div>
      )}
    </>
  );
};

export default LikesList;
