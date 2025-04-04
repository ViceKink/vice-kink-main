
import React, { useState } from 'react';
import { useAuth } from '@/context/auth';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LikesList from '@/components/messages/LikesList';
import MatchesList from '@/components/messages/MatchesList';
import ChatView from '@/components/messages/ChatView';
import { interactionService } from '@/utils/match';

const Messages = () => {
  const { user } = useAuth();
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [selectedMatchName, setSelectedMatchName] = useState<string>('');
  
  // Fetch matches
  const { data: matches = [], isLoading: loadingMatches } = useQuery({
    queryKey: ['userMatches'],
    queryFn: async () => {
      if (!user?.id) return [];
      return await interactionService.getMatches(user.id);
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
              otherUserId={selectedMatchId}
              otherUserName={selectedMatchName}
              onBack={() => setSelectedMatchId(null)} 
            />
          ) : (
            <MatchesList 
              matches={matches} 
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
