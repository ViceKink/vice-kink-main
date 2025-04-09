
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Message } from '@/models/messageTypes';
import { useQueryClient } from '@tanstack/react-query';

interface UseChatProps {
  userId: string;
  partnerId: string;
}

export const useChat = ({ userId, partnerId }: UseChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const queryClient = useQueryClient();

  // Fetch messages
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

  // Mark messages as read
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

  // Send a text message
  const sendTextMessage = async (content: string) => {
    try {
      setIsSending(true);
      
      // Fix: Provide both input and output type parameters to rpc
      const { data, error } = await supabase.rpc<{ id: string }, string>('send_text_message', {
        sender: userId,
        receiver: partnerId,
        message_content: content.trim()
      });
      
      if (error) {
        throw error;
      }
      
      const newMessage: Message = {
        id: data as string,
        sender_id: userId,
        receiver_id: partnerId,
        content: content.trim(),
        created_at: new Date().toISOString(),
        read: false
      };
      
      setMessages(prev => [...prev, newMessage]);
      
      // Invalidate matches query to refresh the list with the new message
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Failed to send message",
        description: "Please try again later",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsSending(false);
    }
  };

  // Set up subscription for real-time messages
  useEffect(() => {
    fetchMessages();
    markMessagesAsRead();
    
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
            queryClient.invalidateQueries({ queryKey: ['matches'] });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, partnerId, queryClient]);

  return {
    messages,
    isLoading,
    isSending,
    sendTextMessage,
    markMessagesAsRead
  };
};
