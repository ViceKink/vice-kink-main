
import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { IconButton } from '@/components/ui/icon-button';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, User2, X, Coins, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/auth';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { createInteraction } from '@/utils/match';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAdCoins } from '@/hooks/useAdCoins';
import { AdCoinFeature } from '@/models/adCoinsTypes';

interface Profile {
  id: string;
  name: string;
  age?: number;
  location?: string;
  avatar?: string;
  interactionType?: 'like' | 'superlike';
}

interface LikesListProps {
  profiles: Profile[];
  isLoading: boolean;
  onSelectLike: (profileId: string) => void;
}

const LikesList: React.FC<LikesListProps> = ({ profiles, isLoading, onSelectLike }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const [revealedProfiles, setRevealedProfiles] = useState<Record<string, boolean>>({});
  const { balance, purchaseFeature, showRewardedAd, isAdReady } = useAdCoins();
  
  const interactionMutation = useMutation({
    mutationFn: async ({ 
      profileId, 
      interactionType 
    }: { 
      profileId: string, 
      interactionType: 'like' | 'dislike' | 'superlike' 
    }) => {
      if (!user?.id) throw new Error('User not authenticated');
      console.log('Creating interaction with profile', profileId, 'as', interactionType);
      const result = await createInteraction(user.id, profileId, interactionType);
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

  const handleLikeProfile = (profileId: string, interactionType: 'like' | 'superlike') => {
    interactionMutation.mutate({ profileId, interactionType });
  };
  
  const handleRejectProfile = (profileId: string) => {
    interactionMutation.mutate({ profileId, interactionType: 'dislike' });
  };
  
  const handleRevealProfile = async (profileId: string) => {
    // Try to purchase the view_like feature
    const success = await purchaseFeature('view_like');
    
    if (success) {
      // If successful, update the local state to mark this profile as revealed
      setRevealedProfiles(prev => ({
        ...prev,
        [profileId]: true
      }));
      toast.success("Profile revealed!");
    }
  };
  
  const handleWatchAd = async () => {
    if (!isAdReady) {
      toast.error("Ads aren't ready yet. Please try again later.");
      return;
    }
    
    const success = await showRewardedAd();
    if (success) {
      toast.success("Thanks for watching! AdCoins added to your balance.");
    }
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
      {profiles.map((profile) => {
        const isRevealed = revealedProfiles[profile.id] || false;
        
        return (
          <Card key={profile.id} className="hover:bg-accent/50 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-start">
                <Avatar className="h-12 w-12 mr-3 flex-shrink-0">
                  {isRevealed ? (
                    <>
                      <AvatarImage src={profile.avatar} />
                      <AvatarFallback>{profile.name?.charAt(0) || '?'}</AvatarFallback>
                    </>
                  ) : (
                    <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                      <User2 className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between items-baseline">
                    <h3 className="text-sm font-medium truncate">
                      {isRevealed ? profile.name : "Mystery Admirer"}
                    </h3>
                    <Badge variant={profile.interactionType === 'superlike' ? 'destructive' : 'outline'}>
                      {profile.interactionType === 'superlike' ? 'Super Like' : 'Like'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {isRevealed ? (
                      <>{profile.age && `${profile.age} • `}{profile.location}</>
                    ) : (
                      "Hidden Profile"
                    )}
                  </p>
                  
                  {isRevealed ? (
                    <div className="flex gap-2">
                      <IconButton
                        size="sm"
                        variant="default"
                        className="h-8 w-8"
                        icon={<Heart className="h-4 w-4" />}
                        label="Like Back"
                        onClick={() => handleLikeProfile(profile.id, 'like')}
                      />
                      <IconButton
                        size="sm"
                        variant="outline"
                        className="h-8 w-8"
                        icon={<User2 className="h-4 w-4" />}
                        label="View Profile"
                        onClick={() => navigate(`/profile/${profile.id}`)}
                      />
                      <IconButton
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        icon={<X className="h-4 w-4" />}
                        label="Reject"
                        onClick={() => handleRejectProfile(profile.id)}
                      />
                    </div>
                  ) : (
                    <div>
                      {balance > 0 ? (
                        <Button 
                          size="sm" 
                          variant="default"
                          className="w-full"
                          onClick={() => handleRevealProfile(profile.id)}
                        >
                          <Eye className="mr-1 h-4 w-4" />
                          Reveal for <Coins className="mx-1 h-4 w-4 text-yellow-500" />1
                        </Button>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-xs text-muted-foreground">
                            You've run out of AdCoins... Watch an Ad instead?
                          </p>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="w-full"
                            onClick={handleWatchAd}
                            disabled={!isAdReady}
                          >
                            Watch Ad to Earn <Coins className="ml-1 h-4 w-4 text-yellow-500" />
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default LikesList;
