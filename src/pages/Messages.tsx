
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { TabsContent, Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/context/auth';
import { useQuery } from '@tanstack/react-query';
import { interactionService } from '@/utils/match';
import LikesList from '@/components/messages/LikesList';
import MatchesList from '@/components/messages/MatchesList';
import ChatView from '@/components/messages/ChatView';
import { MatchWithProfile } from '@/models/matchesTypes';

const Messages = () => {
  const { user } = useAuth();
  const [activeMatch, setActiveMatch] = useState<MatchWithProfile | null>(null);
  const [activeTab, setActiveTab] = useState('matches');

  const { data: matches = [], isLoading: isLoadingMatches, refetch: refetchMatches } = useQuery({
    queryKey: ['matches'],
    queryFn: async () => {
      if (!user?.id) return [];
      const matchData = await interactionService.getMatches(user.id);
      // Transform data to ensure it matches MatchWithProfile type
      return matchData.map((match: any) => ({
        match_id: match.match_id,
        matched_at: match.matched_at,
        other_user_id: match.other_user_id,
        other_user: {
          id: match.other_user.id || match.other_user_id,
          name: match.other_user.name || 'User',
          avatar: match.other_user.avatar
        },
        last_message: match.last_message,
        unread_count: match.unread_count || 0
      })) as MatchWithProfile[];
    },
    enabled: !!user?.id,
    refetchInterval: 10000, // Refetch every 10 seconds to ensure latest messages
  });

  const { data: likes = [], isLoading: isLoadingLikes } = useQuery({
    queryKey: ['likes'],
    queryFn: async () => {
      if (!user?.id) return [];
      console.log("Fetching likes data in Messages component");
      const likesData = await interactionService.getLikesForUser(user.id);
      console.log("Fetched likes data in Messages:", likesData);
      return likesData;
    },
    enabled: !!user?.id,
    refetchOnWindowFocus: true,
    refetchOnMount: true, // Ensure fresh data when returning to the component
    staleTime: 0, // Consider data always stale to force refresh
  });

  const handleBackFromChat = () => {
    setActiveMatch(null);
    // Refresh the matches when going back to matches list
    refetchMatches();
  };

  const handleOpenChat = (matchId: string) => {
    const selectedMatch = matches.find(m => m.match_id === matchId);
    if (selectedMatch) {
      setActiveMatch(selectedMatch);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Force refetch when switching to likes tab
    if (value === 'likes') {
      // This will trigger a refetch of the likes data
    } else if (value === 'matches') {
      refetchMatches();
    }
  };

  return (
    <div className="h-screen pt-14 pb-14 overflow-y-auto">
      {activeMatch ? (
        <div className="h-full">
          <ChatView 
            matchId={activeMatch.match_id}
            userId={user?.id || ''}
            partnerId={activeMatch.other_user_id}
            partnerName={activeMatch.other_user.name || 'User'}
            partnerAvatar={activeMatch.other_user.avatar || ''}
            onBack={handleBackFromChat} 
          />
        </div>
      ) : (
        <div className="container mx-auto max-w-2xl p-4">
          <Tabs defaultValue="matches" value={activeTab} onValueChange={handleTabChange}>
            <div className="flex justify-between items-center mb-6">
              <TabsList>
                <TabsTrigger value="matches">Matches</TabsTrigger>
                <TabsTrigger value="likes">Likes</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="matches" className="space-y-4">
              <MatchesList 
                matches={matches} 
                isLoading={isLoadingMatches}
                onSelectMatch={handleOpenChat}
              />
            </TabsContent>

            <TabsContent value="likes" className="space-y-4">
              <LikesList 
                likes={likes} 
                isLoading={isLoadingLikes}
              />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default Messages;
