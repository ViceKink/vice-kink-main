
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { TabsContent, Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/context/auth';
import { useQuery } from '@tanstack/react-query';
import { interactionService } from '@/utils/match';
import LikesList from '@/components/messages/LikesList';
import MatchesList from '@/components/messages/MatchesList';
import ChatView from '@/components/messages/ChatView';

const Messages = () => {
  const { user } = useAuth();
  const [activeChat, setActiveChat] = useState<{ matchId: string } | null>(null);

  const { data: matches = [], isLoading: isLoadingMatches } = useQuery({
    queryKey: ['matches'],
    queryFn: async () => {
      if (!user?.id) return [];
      return await interactionService.getMatches(user.id);
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
    setActiveChat(null);
  };

  const handleOpenChat = (matchId: string) => {
    setActiveChat({ matchId });
  };

  return (
    <div className="h-screen pt-14 pb-14 overflow-y-auto">
      {activeChat ? (
        <div className="h-full">
          <ChatView 
            matchId={activeChat.matchId} 
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
                loading={isLoadingMatches}
                onSelectMatch={handleOpenChat}
              />
            </TabsContent>

            <TabsContent value="likes" className="space-y-4">
              <LikesList 
                likes={likes} 
                loading={isLoadingLikes}
              />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default Messages;
