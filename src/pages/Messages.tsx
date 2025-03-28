
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/auth';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Send,
  Search,
  User2
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MatchWithProfile, Message } from '@/models/matchesTypes';

const Messages = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const messageContainerRef = useRef<HTMLDivElement>(null);

  const [selectedMatch, setSelectedMatch] = useState<MatchWithProfile | null>(null);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch user matches
  const { data: matches = [], isLoading: matchesLoading } = useQuery({
    queryKey: ['userMatches'],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase.rpc('get_user_matches', { 
        user_id: user.id 
      });
      
      if (error) {
        console.error('Error fetching matches:', error);
        return [];
      }
      
      // Process matches to add last message and unread count
      const matchesWithExtras = await Promise.all(
        data.map(async (match: any) => {
          // Get last message
          const { data: lastMessage, error: messageError } = await supabase.rpc(
            'get_last_message', 
            { 
              user1: user.id, 
              user2: match.other_user_id 
            }
          );
          
          // Get unread count
          const { data: countData, error: countError } = await supabase.rpc(
            'count_unread_messages', 
            { 
              user_id: user.id, 
              other_user_id: match.other_user_id 
            }
          );
          
          if (messageError) console.error('Error fetching last message:', messageError);
          if (countError) console.error('Error counting unread messages:', countError);
          
          return {
            ...match,
            last_message: lastMessage && lastMessage.length > 0 ? lastMessage[0].content : '',
            unread_count: countData || 0
          };
        })
      );
      
      // Sort by most recent message first
      return matchesWithExtras.sort((a, b) => {
        if (!a.last_message && !b.last_message) return 0;
        if (!a.last_message) return 1;
        if (!b.last_message) return -1;
        return new Date(b.matched_at).getTime() - new Date(a.matched_at).getTime();
      });
    },
    enabled: !!user?.id
  });

  // Fetch messages for selected match
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['messages', selectedMatch?.other_user_id],
    queryFn: async () => {
      if (!user?.id || !selectedMatch?.other_user_id) return [];
      
      const { data, error } = await supabase.rpc('get_conversation', {
        user1: user.id,
        user2: selectedMatch.other_user_id
      });
      
      if (error) {
        console.error('Error fetching messages:', error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!user?.id && !!selectedMatch?.other_user_id
  });

  // Mark messages as read when conversation is opened
  useEffect(() => {
    const markMessagesAsRead = async () => {
      if (!user?.id || !selectedMatch?.other_user_id) return;
      
      const { error } = await supabase.rpc('mark_messages_as_read', {
        user_id: user.id,
        other_user_id: selectedMatch.other_user_id
      });
      
      if (error) {
        console.error('Error marking messages as read:', error);
      } else {
        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['userMatches'] });
      }
    };
    
    if (selectedMatch) {
      markMessagesAsRead();
    }
  }, [selectedMatch, user?.id, queryClient]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (message: { content: string, receiver_id: string }) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase.rpc('send_message', {
        sender: user.id,
        receiver: message.receiver_id,
        message_content: message.content
      });
      
      if (error) throw error;
      
      return { success: true };
    },
    onSuccess: () => {
      setMessageText('');
      queryClient.invalidateQueries({ queryKey: ['messages', selectedMatch?.other_user_id] });
      queryClient.invalidateQueries({ queryKey: ['userMatches'] });
    },
    onError: (error) => {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  });

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedMatch) return;
    
    sendMessageMutation.mutate({
      content: messageText.trim(),
      receiver_id: selectedMatch.other_user_id
    });
  };

  const filteredMatches = matches.filter((match: MatchWithProfile) => 
    match.other_user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Show loading UI
  if (matchesLoading && !matches.length) {
    return (
      <div className="min-h-screen pt-24 px-4 pb-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Messages</h1>
          <div className="animate-pulse">
            <div className="h-12 bg-gray-200 rounded-lg mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="h-[500px] bg-gray-200 rounded-lg"></div>
              <div className="h-[500px] bg-gray-200 rounded-lg md:col-span-2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 px-4 pb-4 md:px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Messages</h1>
        
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Search conversations..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-180px)]">
          {/* Matches List */}
          <Card className="md:h-full overflow-hidden">
            <CardContent className="p-0 h-full">
              <div className="h-full overflow-y-auto">
                {filteredMatches.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center p-6 h-full">
                    <User2 className="w-12 h-12 mb-2 text-gray-400" />
                    <h3 className="text-lg font-medium">No matches yet</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Start liking profiles to get matches
                    </p>
                    <Button 
                      className="mt-4" 
                      onClick={() => navigate('/discover')}
                    >
                      Discover
                    </Button>
                  </div>
                ) : (
                  <ul className="divide-y">
                    {Array.isArray(filteredMatches) && filteredMatches.map((match: MatchWithProfile) => (
                      <li
                        key={match.match_id}
                        className={`cursor-pointer hover:bg-gray-50 ${
                          selectedMatch?.match_id === match.match_id ? 'bg-gray-100' : ''
                        }`}
                        onClick={() => setSelectedMatch(match)}
                      >
                        <div className="flex items-start p-4">
                          <Avatar className="h-12 w-12 mr-3 flex-shrink-0">
                            <AvatarImage src={match.other_user.avatar} />
                            <AvatarFallback>{match.other_user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <div className="flex justify-between items-baseline">
                              <h3 className="text-sm font-medium truncate">
                                {match.other_user.name}
                              </h3>
                              <span className="text-xs text-gray-500">
                                {format(new Date(match.matched_at), 'P')}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 truncate">
                              {match.last_message || "No messages yet"}
                            </p>
                            {match.unread_count > 0 && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary text-primary-foreground mt-1">
                                {match.unread_count}
                              </span>
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Messages */}
          <Card className="md:col-span-2 md:h-full flex flex-col">
            {selectedMatch ? (
              <>
                <div className="p-4 border-b flex items-center">
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarImage src={selectedMatch.other_user.avatar} />
                    <AvatarFallback>{selectedMatch.other_user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-sm font-medium">
                      {selectedMatch.other_user.name}
                    </h3>
                    <span 
                      className="text-xs text-primary cursor-pointer"
                      onClick={() => navigate(`/profile/${selectedMatch.other_user_id}`)}
                    >
                      View profile
                    </span>
                  </div>
                </div>
                
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
                      <p className="text-sm text-gray-500 mt-1">
                        Start the conversation with {selectedMatch.other_user.name}
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
                            <div className={`text-xs mt-1 ${isSentByMe ? 'text-primary-foreground/70' : 'text-gray-500'}`}>
                              {format(new Date(message.created_at), 'p')}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
                
                <div className="p-4 border-t">
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
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <h3 className="text-lg font-medium">Select a conversation</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Choose a match from the list to start chatting
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Messages;
