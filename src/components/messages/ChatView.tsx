
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MessageSquare, Send } from 'lucide-react';
import { useAuth } from '@/context/auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/models/matchesTypes';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface ChatViewProps {
  matchId?: string | null;
}

interface MatchDetails {
  id: string;
  user_id_1: string;
  user_id_2: string;
  matched_at: string;
  other_user: {
    id: string;
    name: string;
    avatar?: string;
  };
}

const ChatView: React.FC<ChatViewProps> = ({ matchId }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [messageText, setMessageText] = useState('');
  const messageContainerRef = useRef<HTMLDivElement>(null);

  // Get match details
  const { data: match } = useQuery<MatchDetails | null>({
    queryKey: ['match', matchId],
    queryFn: async () => {
      if (!matchId || !user?.id) return null;
      
      const { data, error } = await supabase
        .from('matches')
        .select(`
          id,
          user_id_1,
          user_id_2,
          matched_at,
          profiles!user_id_1(id, name, avatar),
          profiles!user_id_2(id, name, avatar)
        `)
        .eq('id', matchId)
        .single();
        
      if (error) {
        console.error('Error fetching match:', error);
        return null;
      }
      
      // Determine which user is the other user
      const otherUser = data.user_id_1 === user.id 
        ? data.profiles!user_id_2 
        : data.profiles!user_id_1;
        
      return {
        ...data,
        other_user: otherUser
      };
    },
    enabled: !!matchId && !!user?.id
  });

  // Get conversation messages
  const { data: messages = [], isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ['messages', match?.other_user?.id],
    queryFn: async () => {
      if (!user?.id || !match?.other_user?.id) return [];
      
      console.log('Fetching conversation between', user.id, 'and', match.other_user.id);
      const { data, error } = await supabase.rpc('get_conversation', {
        user1: user.id,
        user2: match.other_user.id
      });
      
      if (error) {
        console.error('Error fetching messages:', error);
        return [];
      }
      
      console.log('Messages fetched:', data?.length || 0);
      return data || [];
    },
    enabled: !!user?.id && !!match?.other_user?.id,
    refetchInterval: match?.other_user?.id ? 5000 : false // Poll every 5 seconds when conversation is selected
  });

  // Mark messages as read
  useEffect(() => {
    const markMessagesAsRead = async () => {
      if (!user?.id || !match?.other_user?.id) return;
      
      console.log('Marking messages as read from', match.other_user.id, 'to', user.id);
      const { error } = await supabase.rpc('mark_messages_as_read', {
        user_id: user.id,
        other_user_id: match.other_user.id
      });
      
      if (error) {
        console.error('Error marking messages as read:', error);
      } else {
        console.log('Messages marked as read successfully');
        queryClient.invalidateQueries({ queryKey: ['userMatches'] });
      }
    };
    
    if (match?.other_user?.id) {
      markMessagesAsRead();
    }
  }, [match?.other_user?.id, user?.id, queryClient]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (message: { content: string, receiver_id: string }) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      console.log('Sending message from', user.id, 'to', message.receiver_id, ':', message.content);
      const { data, error } = await supabase.rpc('send_message', {
        sender: user.id,
        receiver: message.receiver_id,
        message_content: message.content
      });
      
      if (error) {
        console.error('Error in send_message RPC call:', error);
        throw error;
      }
      
      console.log('Message sent successfully, ID:', data);
      return { success: true };
    },
    onSuccess: () => {
      setMessageText('');
      queryClient.invalidateQueries({ queryKey: ['messages', match?.other_user?.id] });
      queryClient.invalidateQueries({ queryKey: ['userMatches'] });
    },
    onError: (error) => {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  });

  const handleSendMessage = () => {
    if (!messageText.trim() || !match?.other_user?.id) return;
    
    sendMessageMutation.mutate({
      content: messageText.trim(),
      receiver_id: match.other_user.id
    });
  };

  if (!matchId) {
    return (
      <Card className="h-full flex flex-col">
        <CardContent className="flex flex-col items-center justify-center h-full text-center p-6">
          <MessageSquare className="w-16 h-16 mb-4 text-gray-300" />
          <h3 className="text-lg font-medium">Select a conversation</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Choose a match from the list to start chatting
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!match) {
    return (
      <Card className="h-full flex flex-col">
        <CardContent className="p-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="p-4 border-b">
        <div className="flex items-center">
          <Avatar className="h-10 w-10 mr-3">
            <AvatarImage src={match.other_user.avatar} />
            <AvatarFallback>{match.other_user.name?.charAt(0) || '?'}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-sm font-medium">
              {match.other_user.name}
            </h3>
            <span 
              className="text-xs text-primary cursor-pointer"
              onClick={() => navigate(`/profile/${match.other_user.id}`)}
            >
              View profile
            </span>
          </div>
        </div>
      </CardHeader>
      
      <div 
        ref={messageContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{ minHeight: "300px" }}
      >
        {messagesLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <h3 className="text-lg font-medium">No messages yet</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Start the conversation with {match.other_user.name}
            </p>
          </div>
        ) : (
          messages.map((message: Message) => {
            const isSentByMe = message.sender_id === user?.id;
            
            return (
              <div
                key={message.id}
                className={`flex ${isSentByMe ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] px-4 py-2 rounded-lg text-sm ${
                    isSentByMe
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p>{message.content}</p>
                  <div className={`text-xs mt-1 ${isSentByMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                    {format(new Date(message.created_at), 'p')}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      
      <CardContent className="p-4 border-t mt-auto">
        <div className="flex gap-2">
          <Input
            placeholder="Type a message..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button
            size="icon"
            onClick={handleSendMessage}
            disabled={!messageText.trim() || sendMessageMutation.isPending}
          >
            <Send size={18} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatView;
