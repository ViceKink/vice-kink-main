
import React, { useState } from 'react';
import { useAuth } from '@/context/auth';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LikesList from '@/components/messages/LikesList';
import MatchesList from '@/components/messages/MatchesList';
import ChatView from '@/components/messages/ChatView';
import { interactionService } from '@/utils/match';
import { MatchWithProfile } from '@/utils/match/types';
import { Json } from '@/integrations/supabase/types';

const Messages = () => {
  const { user } = useAuth();
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [selectedMatchName, setSelectedMatchName] = useState<string>('');
  
  // Fetch matches
  const { data: matches = [], isLoading: loadingMatches } = useQuery({
    queryKey: ['userMatches'],
    queryFn: async () => {
      if (!user?.id) return [];
      const matchesData = await interactionService.getMatches(user.id);
      // Transform data to ensure it matches the MatchWithProfile type
      return matchesData.map((match: any) => ({
        match_id: match.match_id,
        matched_at: match.matched_at,
        other_user_id: match.other_user_id,
        other_user: {
          id: match.other_user.id || match.other_user_id,
          name: match.other_user.name || 'User',
          avatar: match.other_user.avatar
        },
        last_message: match.last_message,
        unread_count: match.unread_count
      })) as MatchWithProfile[];
    },
    enabled: !!user?.id
  });
  
  // Fetch likes
  const { data: likes = [], isLoading: loadingLikes } = useQuery({
    queryKey: ['userLikes'],
    queryFn: async () => {
      if (!user?.id) return [];
      return await interactionService.getLikesForUser(user.id);
    },
    enabled: !!user?.id
  });

  return (
    <div className="min-h-screen pt-16 pb-20 px-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Messages</h1>
      
      <Tabs defaultValue="matches" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="matches">Matches</TabsTrigger>
          <TabsTrigger value="likes">Likes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="matches" className="space-y-4">
          {selectedMatchId ? (
            <ChatView 
              matchId={selectedMatchId} 
              matchName={selectedMatchName}
              onBack={() => setSelectedMatchId(null)} 
            />
          ) : (
            <MatchesList 
              matches={matches as MatchWithProfile[]} 
              isLoading={loadingMatches} 
              onSelectMatch={(matchId, name) => {
                setSelectedMatchId(matchId);
                setSelectedMatchName(name);
              }} 
            />
          )}
        </TabsContent>
        
        <TabsContent value="likes">
          <LikesList likes={likes} isLoading={loadingLikes} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Messages;
