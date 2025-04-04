
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNavigate } from 'react-router-dom';
import { useAdCoins } from '@/hooks/useAdCoins';
import { useToast } from '@/hooks/use-toast';
import { matchingService } from '@/utils/match';
import { useAuth } from '@/context/auth';
import { Skeleton } from '@/components/ui/skeleton';
import { ProfileItem } from './ProfileItem';

// Type for the likes list
export type LikeProfile = {
  id: string;
  name: string;
  age: number;
  location: string;
  avatar: string;
  verified: boolean;
  interaction_type: string;
  is_matched: boolean;
  is_revealed: boolean;
};

interface LikesListProps {
  likes: LikeProfile[] | null;
  isLoading: boolean;
  mutate: () => void;
}

export const LikesList: React.FC<LikesListProps> = ({ likes, isLoading, mutate }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  const { 
    adCoins, 
    deductCoins,
    isAdReady,
    showRewardedAd,
    isAdLoading 
  } = useAdCoins();

  // Group likes by whether they've been revealed or not
  const revealedLikes = likes?.filter(like => like.is_revealed) || [];
  const hiddenLikes = likes?.filter(like => !like.is_revealed) || [];
  
  const handleLike = async (profileId: string) => {
    if (!user) return;
    
    setProcessingId(profileId);
    try {
      await matchingService.createMatch(profileId);
      toast({
        title: "It's a match!",
        description: "You have a new match!",
      });
      mutate();
    } catch (error) {
      console.error('Error creating match:', error);
      toast({
        title: 'Error',
        description: 'Failed to like the profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };
  
  const handleReject = async (profileId: string) => {
    if (!user) return;
    
    setProcessingId(profileId);
    try {
      await matchingService.rejectProfile(profileId);
      toast({
        description: 'Profile rejected',
      });
      mutate();
    } catch (error) {
      console.error('Error rejecting profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject the profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };
  
  const handleReveal = async (profileId: string) => {
    if (!user || adCoins < 1) return;
    
    setProcessingId(profileId);
    try {
      await matchingService.revealProfile(profileId);
      await deductCoins(1);
      mutate();
      toast({
        title: 'Profile Revealed',
        description: 'You have revealed a new profile!',
      });
    } catch (error) {
      console.error('Error revealing profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to reveal the profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };
  
  const handleWatchAd = async (profileId: string) => {
    if (!isAdReady || isAdLoading) return;
    
    setProcessingId(profileId);
    try {
      const rewarded = await showRewardedAd();
      if (rewarded) {
        await matchingService.revealProfile(profileId);
        mutate();
        toast({
          title: 'Profile Revealed',
          description: 'You have revealed a new profile!',
        });
      }
    } catch (error) {
      console.error('Error watching ad or revealing profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to watch ad or reveal the profile.',
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };
  
  const handleViewProfile = (profileId: string) => {
    navigate(`/profile/${profileId}`);
  };
  
  if (isLoading) {
    return (
      <Card className="h-full">
        <CardContent className="p-4">
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-3 pb-3 border-b">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <div className="flex gap-1">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!likes || likes.length === 0) {
    return (
      <Card className="h-full">
        <CardContent className="p-4">
          <div className="text-center py-8">
            <p className="text-muted-foreground">No one has liked you yet. Keep exploring!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardContent className="p-4 h-full">
        <ScrollArea className="h-full pr-4">
          {revealedLikes.length > 0 && (
            <div className="space-y-4 mb-6">
              <h3 className="text-sm font-medium text-muted-foreground">
                Revealed Likes
              </h3>
              
              <div className="space-y-3">
                {revealedLikes.map(profile => (
                  <ProfileItem
                    key={profile.id}
                    profile={profile}
                    onLike={handleLike}
                    onReject={handleReject}
                    onViewProfile={handleViewProfile}
                    isProcessing={processingId === profile.id}
                    isRevealed={true}
                  />
                ))}
              </div>
            </div>
          )}
          
          {hiddenLikes.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">
                Hidden Likes {hiddenLikes.length > 0 && `(${hiddenLikes.length})`}
              </h3>
              
              <div className="space-y-3">
                {hiddenLikes.map(profile => (
                  <ProfileItem
                    key={profile.id}
                    profile={profile}
                    onReveal={() => handleReveal(profile.id)}
                    onWatchAd={() => handleWatchAd(profile.id)}
                    isProcessing={processingId === profile.id}
                    isRevealed={false}
                    adCoins={adCoins}
                    isAdReady={isAdReady}
                  />
                ))}
              </div>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default LikesList;
