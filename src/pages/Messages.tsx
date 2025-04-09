
import React, { useState, useEffect } from 'react';
import { TabsContent, Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/context/auth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import MessageList from '@/components/messages/MessageList';
import ChatView from '@/components/messages/ChatView';
import { MatchWithProfile } from '@/models/messageTypes';
import LikesList from '@/components/messages/LikesList';

const Messages = () => {
  const { user } = useAuth();
  const [activeMatch, setActiveMatch] = useState<MatchWithProfile | null>(null);
  const [activeTab, setActiveTab] = useState('matches');

  // Function to fetch matches with profiles and last messages
  const fetchMatches = async () => {
    if (!user?.id) return [];
    
    // Get matches with user profiles
    const { data: matchesData, error: matchesError } = await supabase.rpc('get_user_matches', {
      user_id: user.id
    });
    
    if (matchesError) throw matchesError;
    
    // Enhance the matches with last message and unread count
    const enhancedMatches = await Promise.all(matchesData.map(async (match: any) => {
      // Get last message between users
      const { data: lastMessageData } = await supabase.rpc('get_last_message', {
        user1: user.id,
        user2: match.other_user_id
      });
      
      // Get unread count
      const { data: unreadCount } = await supabase.rpc('count_unread_messages', {
        user_id: user.id,
        other_user_id: match.other_user_id
      });
      
      return {
        ...match,
        last_message: lastMessageData?.[0]?.content || null,
        unread_count: unreadCount || 0
      };
    }));
    
    return enhancedMatches;
  };

  // Use React Query to fetch and cache matches
  const { data: matches = [], isLoading: isLoadingMatches, refetch: refetchMatches } = useQuery({
    queryKey: ['matches'],
    queryFn: fetchMatches,
    enabled: !!user?.id,
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Fetch likes (using existing component)
  const { data: likes = [], isLoading: isLoadingLikes } = useQuery({
    queryKey: ['likes'],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('profile_interactions')
        .select(`
          id,
          user_id,
          target_profile_id,
          interaction_type,
          created_at,
          profiles:user_id(id, name, avatar, verified)
        `)
        .eq('target_profile_id', user.id)
        .in('interaction_type', ['like', 'superlike']);
        
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const handleBackFromChat = () => {
    setActiveMatch(null);
    refetchMatches();
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
            partnerAvatar={activeMatch.other_user.avatar || ''}
            onBack={handleBackFromChat} 
          />
        </div>
      ) : (
        <div className="container mx-auto max-w-2xl p-4">
          <Tabs defaultValue="matches" value={activeTab} onValueChange={setActiveTab}>
            <div className="flex justify-between items-center mb-6">
              <TabsList>
                <TabsTrigger value="matches">Matches</TabsTrigger>
                <TabsTrigger value="likes">Likes</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="matches" className="space-y-4">
              <MessageList 
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
