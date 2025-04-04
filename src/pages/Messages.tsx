
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/auth';
import { useAdCoins } from '@/hooks/useAdCoins';
import { interactionService } from '@/utils/match/interactionService';
import LikesList from '@/components/messages/LikesList';
import MatchesList from '@/components/messages/MatchesList';
import ChatView from '@/components/messages/ChatView';
import { Separator } from '@/components/ui/separator';

const Messages = () => {
  const { user } = useAuth();
  const userId = user?.id || '';
  
  // State for the currently selected conversation
  const [activeMatchId, setActiveMatchId] = useState<string | null>(null);
  const [activeLikeId, setActiveLikeId] = useState<string | null>(null);
  
  // Get adCoins balance for profile reveal feature
  const { 
    adCoins, 
    balance, 
    isAdCoinsLoading,
    isAdReady,
    showRewardedAd 
  } = useAdCoins();
  
  // Fetch likes (profiles who liked the current user)
  const { 
    data: likesData, 
    isLoading: isLikesLoading,
    refetch: refetchLikes
  } = useQuery({
    queryKey: ['likes', userId],
    queryFn: () => interactionService.getLikesForUser(userId),
    enabled: !!userId,
  });
  
  // Fetch matches
  const { 
    data: matchesData, 
    isLoading: isMatchesLoading,
    refetch: refetchMatches
  } = useQuery({
    queryKey: ['matches', userId],
    queryFn: () => interactionService.getMatches(userId),
    enabled: !!userId,
  });
  
  // Handle Ad reward completion
  const handleWatchAd = async () => {
    try {
      await showRewardedAd();
      refetchLikes();
    } catch (error) {
      console.error("Error watching ad:", error);
    }
  };
  
  // Handle selecting a match to chat with
  const handleSelectMatch = (matchId: string) => {
    setActiveMatchId(matchId);
    setActiveLikeId(null);
  };
  
  // Handle selecting a like to potentially match with
  const handleSelectLike = (likeId: string) => {
    setActiveLikeId(likeId);
    setActiveMatchId(null);
  };
  
  // Reset selections when tab changes
  const handleTabChange = (value: string) => {
    if (value === 'matches') {
      setActiveLikeId(null);
    } else if (value === 'likes') {
      setActiveMatchId(null);
    }
  };
  
  // If a match is created from a like, refresh the matches list
  useEffect(() => {
    if (matchesData) {
      // Check if we need to update the active match after creating a new match
      const newMatch = matchesData.find(match => 
        match.profile_id === activeLikeId
      );
      
      if (newMatch) {
        setActiveLikeId(null);
        setActiveMatchId(newMatch.match_id);
      }
    }
  }, [matchesData, activeLikeId]);
  
  // Count of likes and matches for tab labels
  const likesCount = likesData?.length || 0;
  const matchesCount = matchesData?.length || 0;
  
  // Find the current active match data
  const activeMatch = activeMatchId 
    ? matchesData?.find(match => match.match_id === activeMatchId)
    : null;

  return (
    <div className="container max-w-screen-xl mx-auto pt-20 pb-10 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Messages</h1>
      
      <Tabs defaultValue="matches" className="w-full" onValueChange={handleTabChange}>
        <TabsList className="mb-6">
          <TabsTrigger value="matches">
            Matches {matchesCount > 0 && `(${matchesCount})`}
          </TabsTrigger>
          <TabsTrigger value="likes">
            Likes {likesCount > 0 && `(${likesCount})`}
          </TabsTrigger>
        </TabsList>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1">
            <TabsContent value="matches" className="m-0">
              <MatchesList 
                matches={matchesData || []}
                isLoading={isMatchesLoading} 
                activeMatchId={activeMatchId}
                onSelectMatch={handleSelectMatch}
              />
            </TabsContent>
            
            <TabsContent value="likes" className="m-0">
              <LikesList
                isLoading={isLikesLoading}
                onSelectLike={handleSelectLike}
                balance={balance}
                isAdReady={isAdReady}
                onWatchAd={handleWatchAd}
                userId={userId}
              />
            </TabsContent>
          </div>
          
          <div className="lg:col-span-2">
            {activeMatchId && activeMatch && (
              <ChatView 
                matchId={activeMatchId}
                partnerId={activeMatch.profile_id}
                partnerName={activeMatch.name}
                partnerAvatar={activeMatch.avatar_url}
              />
            )}
            
            {!activeMatchId && !activeLikeId && (
              <div className="h-full flex items-center justify-center bg-muted/30 rounded-lg p-8">
                <div className="text-center">
                  <h3 className="text-xl font-medium mb-2">Select a conversation</h3>
                  <p className="text-muted-foreground">
                    Choose a match to start chatting or reveal who liked you
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Tabs>
    </div>
  );
};

export default Messages;
