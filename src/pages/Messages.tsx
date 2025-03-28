
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, Heart, Send } from 'lucide-react';
import { useAuth } from '@/context/auth';
import { supabase } from '@/integrations/supabase/client';
import { getUserMatches } from '@/utils/matchUtils';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  read: boolean;
}

interface Match {
  match_id: string;
  matched_at: string;
  other_user_id: string;
  other_user: {
    id: string;
    name: string;
    avatar?: string;
  };
}

const Messages = () => {
  const { user } = useAuth();
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const queryClient = useQueryClient();
  
  // Fetch user matches
  const { data: matches = [], isLoading: matchesLoading } = useQuery({
    queryKey: ['userMatches'],
    queryFn: async () => {
      if (!user?.id) return [];
      return getUserMatches(user.id);
    },
    enabled: !!user?.id
  });
  
  // Fetch conversation messages
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['conversationMessages', activeConversation],
    queryFn: async () => {
      if (!user?.id || !activeConversation) return [];
      
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${activeConversation}),and(sender_id.eq.${activeConversation},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });
        
      if (error) {
        console.error('Error fetching messages:', error);
        return [];
      }
      
      // Mark received messages as read
      const unreadMessages = data.filter(msg => 
        msg.receiver_id === user.id && !msg.read
      );
      
      if (unreadMessages.length > 0) {
        const unreadIds = unreadMessages.map(msg => msg.id);
        
        await supabase
          .from('messages')
          .update({ read: true })
          .in('id', unreadIds);
      }
      
      return data || [];
    },
    enabled: !!user?.id && !!activeConversation,
    refetchInterval: 3000 // Poll for new messages every 3 seconds
  });
  
  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!user?.id || !activeConversation || !content.trim()) {
        throw new Error('Cannot send message');
      }
      
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: activeConversation,
          content: content.trim(),
          read: false
        })
        .select();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      setNewMessage('');
      queryClient.invalidateQueries({ queryKey: ['conversationMessages', activeConversation] });
    },
    onError: () => {
      toast.error('Failed to send message');
    }
  });
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      sendMessageMutation.mutate(newMessage);
    }
  };
  
  const timeAgo = (timestamp: string) => {
    const now = new Date();
    const date = new Date(timestamp);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) {
      return `${interval} year${interval === 1 ? '' : 's'} ago`;
    }
    
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) {
      return `${interval} month${interval === 1 ? '' : 's'} ago`;
    }
    
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) {
      return `${interval} day${interval === 1 ? '' : 's'} ago`;
    }
    
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) {
      return `${interval} hour${interval === 1 ? '' : 's'} ago`;
    }
    
    interval = Math.floor(seconds / 60);
    if (interval >= 1) {
      return `${interval} minute${interval === 1 ? '' : 's'} ago`;
    }
    
    return `${Math.floor(seconds)} second${seconds === 1 ? '' : 's'} ago`;
  };
  
  // Get unread messages count for a conversation
  const getUnreadCount = (otherUserId: string) => {
    return matches.find(match => match.other_user_id === otherUserId)?.unread_count || 0;
  };
  
  // Get last message for a conversation
  const getActiveMatchDetails = () => {
    return matches.find(match => match.other_user_id === activeConversation);
  };

  const isLoading = matchesLoading || (messagesLoading && !!activeConversation);
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 max-w-6xl pt-20 pb-24 md:pb-10">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">Messages</h1>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-300 rounded w-24"></div>
          <div className="h-[600px] bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 max-w-6xl pt-20 pb-24 md:pb-10">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Messages</h1>
      
      <Tabs defaultValue="messages" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="messages" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Messages
          </TabsTrigger>
          <TabsTrigger value="likes" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Matches
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="messages" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Conversations List */}
            <div className="md:col-span-1 bg-card rounded-lg shadow-sm border border-border overflow-hidden">
              <div className="p-3 border-b border-border">
                <h2 className="font-medium">Conversations</h2>
              </div>
              
              <div className="divide-y divide-border">
                {matches.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    No matches yet. Start liking profiles to find matches!
                  </div>
                ) : (
                  matches.map((match) => (
                    <div 
                      key={match.match_id}
                      className={`p-3 cursor-pointer transition-colors hover:bg-accent/50 ${
                        activeConversation === match.other_user_id ? 'bg-accent' : ''
                      }`}
                      onClick={() => setActiveConversation(match.other_user_id)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={match.other_user.avatar || undefined} alt={match.other_user.name} />
                          <AvatarFallback>{match.other_user.name[0]}</AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{match.other_user.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {timeAgo(match.matched_at)}
                            </span>
                          </div>
                          
                          <p className="text-sm text-muted-foreground truncate">
                            {match.last_message || "Start a conversation"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            {/* Messages */}
            <div className="md:col-span-2 bg-card rounded-lg shadow-sm border border-border overflow-hidden flex flex-col h-[600px]">
              {activeConversation ? (
                <>
                  <div className="p-3 border-b border-border">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage 
                          src={getActiveMatchDetails()?.other_user.avatar || undefined} 
                          alt={getActiveMatchDetails()?.other_user.name || 'User'} 
                        />
                        <AvatarFallback>
                          {getActiveMatchDetails()?.other_user.name?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">
                        {getActiveMatchDetails()?.other_user.name || 'User'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 ? (
                      <div className="flex h-full items-center justify-center">
                        <div className="text-center text-muted-foreground">
                          <p>No messages yet</p>
                          <p className="text-sm">Send a message to start a conversation</p>
                        </div>
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div 
                          key={message.id}
                          className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[70%] rounded-lg p-3 ${
                            message.sender_id === user?.id 
                              ? 'bg-vice-purple text-white rounded-br-none' 
                              : 'bg-accent rounded-bl-none'
                          }`}>
                            <p className="text-sm">{message.content}</p>
                            <span className={`text-xs mt-1 block ${
                              message.sender_id === user?.id ? 'text-white/70' : 'text-muted-foreground'
                            }`}>
                              {timeAgo(message.created_at)}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  
                  <div className="p-3 border-t border-border">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Type a message..." 
                        className="flex-1 rounded-full border border-input bg-background px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-vice-purple"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                      />
                      <button 
                        type="submit"
                        className="bg-vice-purple hover:bg-vice-dark-purple text-white rounded-full px-4 py-2 text-sm font-medium transition-colors flex items-center gap-1"
                        disabled={!newMessage.trim()}
                      >
                        <Send className="h-4 w-4" />
                        Send
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-6">
                  <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">Your Messages</h3>
                  <p className="text-muted-foreground max-w-md mb-4">
                    Select a conversation from the list to start chatting
                  </p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="likes" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {matches.length === 0 ? (
              <div className="col-span-full bg-card p-8 rounded-lg text-center">
                <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">No matches yet</h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-4">
                  When you and someone else like each other, you'll see them here
                </p>
              </div>
            ) : (
              matches.map((match) => (
                <div 
                  key={match.match_id}
                  className="bg-card rounded-lg shadow-sm overflow-hidden border border-border hover:shadow-md transition-shadow"
                >
                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={match.other_user.avatar || undefined} alt={match.other_user.name} />
                        <AvatarFallback>{match.other_user.name[0]}</AvatarFallback>
                      </Avatar>
                      
                      <div>
                        <h3 className="font-medium">{match.other_user.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          Matched {timeAgo(match.matched_at)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between gap-2 mt-4">
                      <button 
                        className="flex-1 bg-vice-purple hover:bg-vice-dark-purple text-white rounded-lg py-2 text-sm font-medium transition-colors"
                        onClick={() => setActiveConversation(match.other_user_id)}
                      >
                        Message
                      </button>
                      <button 
                        className="flex-1 bg-transparent border border-border hover:bg-accent rounded-lg py-2 text-sm font-medium transition-colors"
                        onClick={() => { window.location.href = `/profile/${match.other_user_id}`; }}
                      >
                        View Profile
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Messages;
