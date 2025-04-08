
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Send } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  read: boolean;
}

export interface ChatViewProps {
  matchId: string;
  userId: string;
  partnerId: string;
  partnerName: string;
  partnerAvatar?: string;
  onBack: () => void;
}

const ChatView: React.FC<ChatViewProps> = ({ 
  matchId, 
  userId, 
  partnerId, 
  partnerName, 
  partnerAvatar,
  onBack 
}) => {
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Default to '?' if name is undefined or empty
  const nameInitial = partnerName && partnerName.length > 0 ? partnerName.charAt(0) : '?';
  
  useEffect(() => {
    fetchMessages();
    
    // Mark messages as read
    markMessagesAsRead();
    
    // Subscribe to new messages
    const channel = supabase
      .channel('messages-channel')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `receiver_id=eq.${userId}`
        }, 
        (payload) => {
          const newMessage = payload.new as Message;
          if (newMessage.sender_id === partnerId) {
            setMessages(prev => [...prev, newMessage]);
            markMessagesAsRead();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId, userId, partnerId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.rpc('get_conversation', {
        user1: userId,
        user2: partnerId
      });
      
      if (error) {
        throw error;
      }
      
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Failed to load messages",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const markMessagesAsRead = async () => {
    try {
      await supabase.rpc('mark_messages_as_read', {
        user_id: userId,
        other_user_id: partnerId
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase.rpc('send_message', {
        sender: userId,
        receiver: partnerId,
        message_content: messageText.trim()
      });
      
      if (error) {
        throw error;
      }
      
      // Add the new message to the list
      const newMessage: Message = {
        id: data,
        sender_id: userId,
        receiver_id: partnerId,
        content: messageText.trim(),
        created_at: new Date().toISOString(),
        read: false
      };
      
      setMessages(prev => [...prev, newMessage]);
      setMessageText(""); // Clear input field
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Failed to send message",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessageDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="border-b p-3 flex items-center gap-3">
        <Button onClick={onBack} variant="ghost" size="icon">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        
        <Avatar className="h-8 w-8">
          <AvatarImage src={partnerAvatar} alt={partnerName || 'User'} />
          <AvatarFallback>{nameInitial}</AvatarFallback>
        </Avatar>
        
        <div>
          <h3 className="font-semibold">{partnerName || 'User'}</h3>
        </div>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.length === 0 && !isLoading ? (
          <div className="text-center text-muted-foreground py-6">
            You matched with {partnerName || 'this user'}. Say hello!
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div 
                key={message.id}
                className={`flex ${message.sender_id === userId ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[75%] px-4 py-2 rounded-lg ${
                    message.sender_id === userId 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'
                  }`}
                >
                  <p className="break-words">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.sender_id === userId 
                      ? 'text-primary-foreground/70' 
                      : 'text-muted-foreground'
                  }`}>
                    {formatMessageDate(message.created_at)}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      <div className="border-t p-3">
        <div className="flex gap-2 items-center">
          <Input
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="rounded-full"
            disabled={isLoading}
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={isLoading || !messageText.trim()}
            size="icon"
            className="rounded-full h-10 w-10"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatView;
