
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/auth';
import { supabase } from '@/integrations/supabase/client';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Spinner } from '@/components/ui/spinner';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';

type Message = {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  receiver_id: string;
  read: boolean;
};

interface ChatViewProps {
  matchId: string | null;
}

const ChatView: React.FC<ChatViewProps> = ({ matchId }) => {
  const { user } = useAuth();
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [otherUser, setOtherUser] = useState<{ id: string; name: string; avatar?: string } | null>(null);
  const queryClient = useQueryClient();
  
  const { data: match } = useQuery({
    queryKey: ['match', matchId],
    queryFn: async () => {
      if (!matchId || !user?.id) return null;
      
      const { data, error } = await supabase
        .rpc('get_user_matches', {
          user_id: user.id
        });
        
      if (error) {
        console.error('Error fetching match:', error);
        return null;
      }
      
      const matchData = data.find(m => m.match_id === matchId);
      
      if (matchData) {
        // Ensure we're working with an object that has name and avatar properties
        const otherUserData = matchData.other_user as { 
          id: string; 
          name: string; 
          avatar?: string 
        };
        
        setOtherUser({
          id: matchData.other_user_id,
          name: otherUserData.name || 'Unknown User',
          avatar: otherUserData.avatar || undefined
        });
        
        return matchData;
      }
      
      return null;
    },
    enabled: !!matchId && !!user?.id
  });
  
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['messages', matchId],
    queryFn: async () => {
      if (!matchId || !user?.id || !otherUser?.id) return [];
      
      // Mark messages as read
      await supabase.rpc('mark_messages_as_read', {
        user_id: user.id,
        other_user_id: otherUser.id
      });
      
      const { data, error } = await supabase.rpc('get_conversation', {
        user1: user.id,
        user2: otherUser.id
      });
      
      if (error) {
        console.error('Error fetching messages:', error);
        return [];
      }
      
      return data as Message[];
    },
    enabled: !!matchId && !!user?.id && !!otherUser?.id,
    refetchInterval: 3000 // Poll for new messages every 3 seconds
  });
  
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!user?.id || !otherUser?.id) {
        throw new Error('Missing user information');
      }
      
      const { data, error } = await supabase.rpc('send_message', {
        sender: user.id,
        receiver: otherUser.id,
        message_content: content
      });
      
      if (error) {
        console.error('Error sending message:', error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      // Clear input and refetch messages
      setInputValue('');
      queryClient.invalidateQueries({ queryKey: ['messages', matchId] });
    }
  });
  
  const handleSendMessage = () => {
    const trimmedMessage = inputValue.trim();
    if (trimmedMessage && !sendMessageMutation.isPending) {
      sendMessageMutation.mutate(trimmedMessage);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  if (!matchId) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-secondary/30 rounded-lg p-8 text-center">
        <h3 className="text-xl font-semibold mb-2">Select a conversation</h3>
        <p className="text-muted-foreground">
          Choose a match from the list to start chatting
        </p>
      </div>
    );
  }
  
  return (
    <div className="h-full flex flex-col rounded-lg border bg-card">
      {/* Chat header */}
      <div className="p-4 border-b flex items-center">
        {otherUser ? (
          <>
            <Avatar className="h-10 w-10 mr-3">
              <AvatarImage src={otherUser.avatar} />
              <AvatarFallback>{otherUser.name?.charAt(0) || '?'}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium">{otherUser.name}</h3>
            </div>
          </>
        ) : (
          <div className="flex items-center animate-pulse">
            <div className="h-10 w-10 rounded-full bg-muted mr-3" />
            <div className="h-5 w-32 bg-muted rounded" />
          </div>
        )}
      </div>
      
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messagesLoading ? (
          <div className="flex justify-center items-center h-full">
            <Spinner />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <p className="mb-2">No messages yet</p>
            <p className="text-sm">Say hello to start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isCurrentUser = message.sender_id === user?.id;
            
            return (
              <div 
                key={message.id} 
                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    isCurrentUser 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-secondary text-secondary-foreground'
                  }`}
                >
                  <div className="break-words">{message.content}</div>
                  <div 
                    className={`text-xs mt-1 ${
                      isCurrentUser ? 'text-primary-foreground/70' : 'text-muted-foreground'
                    }`}
                  >
                    {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message input */}
      <div className="p-4 border-t">
        <div className="flex items-center">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 bg-background border rounded-l-md p-2 resize-none focus:outline-none focus:ring-1 focus:ring-primary"
            rows={1}
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || sendMessageMutation.isPending}
            className="rounded-l-none"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatView;
