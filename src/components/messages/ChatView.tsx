
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth';
import { supabase } from '@/integrations/supabase/client';
import { Send } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  receiver_id: string;
  created_at: string;
  read: boolean;
}

interface ChatViewProps {
  matchId: string | null;
}

const ChatView: React.FC<ChatViewProps> = ({ matchId }) => {
  const { user } = useAuth();
  const [messageText, setMessageText] = useState('');
  const queryClient = useQueryClient();
  const [otherUser, setOtherUser] = useState<{ id: string; name: string; avatar?: string } | null>(null);

  // Query to fetch match details
  const { data: matchData, isLoading: matchLoading } = useQuery({
    queryKey: ['match', matchId],
    queryFn: async () => {
      if (!matchId || !user?.id) return null;
      
      // Fetch match using RPC function for better performance
      const { data, error } = await supabase
        .rpc('get_user_matches', { user_id: user.id });
      
      if (error) {
        console.error('Error fetching match:', error);
        return null;
      }
      
      // Find the specific match we're looking for
      const specificMatch = data?.find(match => match.match_id === matchId);
      if (!specificMatch) {
        console.log('Match not found:', matchId);
        return null;
      }
      
      console.log('Found match:', specificMatch);
      return specificMatch;
    },
    enabled: !!matchId && !!user?.id
  });

  // Set other user information when match data changes
  useEffect(() => {
    if (matchData && matchData.other_user) {
      setOtherUser({
        id: matchData.other_user_id,
        name: matchData.other_user.name || 'Unknown User',
        avatar: matchData.other_user.avatar || ''
      });
    }
  }, [matchData]);

  // Query to fetch conversation messages
  const { 
    data: messages = [], 
    isLoading: messagesLoading,
    refetch: refetchMessages
  } = useQuery({
    queryKey: ['conversation', otherUser?.id],
    queryFn: async () => {
      if (!user?.id || !otherUser?.id) return [];
      
      // Mark messages as read when loading conversation
      await supabase.rpc('mark_messages_as_read', {
        user_id: user.id,
        other_user_id: otherUser.id
      });
      
      const { data, error } = await supabase
        .rpc('get_conversation', {
          user1: user.id,
          user2: otherUser.id
        });
      
      if (error) {
        console.error('Error fetching conversation:', error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!user?.id && !!otherUser?.id,
    refetchInterval: 3000 // Refresh every 3 seconds
  });

  // Mutation to send a new message
  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      if (!user?.id || !otherUser?.id) throw new Error('Missing user IDs');
      
      const { data, error } = await supabase
        .rpc('send_message', {
          sender: user.id,
          receiver: otherUser.id,
          message_content: message
        });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      setMessageText('');
      refetchMessages();
      
      // Also update the matches list to show the new message
      queryClient.invalidateQueries({ queryKey: ['userMatches'] });
    },
    onError: (error) => {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    
    sendMessageMutation.mutate(messageText);
  };

  // If no match is selected, show a placeholder
  if (!matchId) {
    return (
      <Card className="h-[70vh] flex flex-col items-center justify-center text-center p-6">
        <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
        <p className="text-sm text-muted-foreground">
          Choose a match to start chatting
        </p>
      </Card>
    );
  }

  // Loading state
  if (matchLoading) {
    return (
      <Card className="h-[70vh] flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="mt-4 text-sm text-muted-foreground">Loading conversation...</p>
      </Card>
    );
  }

  // Error state - match not found
  if (!matchData) {
    return (
      <Card className="h-[70vh] flex flex-col items-center justify-center text-center p-6">
        <h3 className="text-lg font-medium mb-2">Conversation not found</h3>
        <p className="text-sm text-muted-foreground">
          This match may no longer exist
        </p>
      </Card>
    );
  }

  return (
    <Card className="h-[70vh] flex flex-col">
      {/* Chat header */}
      <div className="p-4 border-b flex items-center">
        <Avatar className="h-10 w-10 mr-3">
          <AvatarImage src={otherUser?.avatar} />
          <AvatarFallback>{otherUser?.name?.charAt(0) || '?'}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-medium">{otherUser?.name}</h3>
        </div>
      </div>
      
      {/* Messages container */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col">
        {messagesLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-center">
            <div>
              <p className="text-sm text-muted-foreground mb-2">No messages yet</p>
              <p className="text-xs text-muted-foreground">Send a message to start the conversation</p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.sender_id === user?.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {new Date(message.created_at).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          ))
        )}
      </CardContent>
      
      {/* Message input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-2">
        <Textarea
          placeholder="Type a message..."
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          className="resize-none"
          rows={1}
        />
        <Button type="submit" size="icon" disabled={sendMessageMutation.isPending}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </Card>
  );
};

export default ChatView;
