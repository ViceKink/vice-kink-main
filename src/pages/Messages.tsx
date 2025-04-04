
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

  const { data: matches = [], isLoading: isLoadingMatches } = useQuery({
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
  });

  const { data: likes = [], isLoading: isLoadingLikes } = useQuery({
    queryKey: ['likes'],
    queryFn: async () => {
      if (!user?.id) return [];
      return await interactionService.getLikesForUser(user.id);
    },
    enabled: !!user?.id,
  });

  const handleBackFromChat = () => {
    setActiveMatch(null);
  };

  const handleOpenChat = (matchId: string) => {
    const selectedMatch = matches.find(m => m.match_id === matchId);
    if (selectedMatch) {
      setActiveMatch(selectedMatch);
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
            partnerAvatar={activeMatch.other_user.avatar}
            onBack={handleBackFromChat} 
          />
        </div>
      ) : (
        <div className="container mx-auto max-w-2xl p-4">
          <Tabs defaultValue="matches">
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
