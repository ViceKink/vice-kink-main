
import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from "@/hooks/use-toast";
import { Message } from '@/models/matchesTypes';

interface UseChatProps {
  matchId: string;
  userId: string;
  partnerId: string;
}

export const useChat = ({ matchId, userId, partnerId }: UseChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const fetchMessages = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${userId},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${userId})`)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('Error fetching messages:', error);
        setErrorMessage("Failed to load messages. Please try again later.");
        throw error;
      }
      
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setErrorMessage("Failed to load messages. Please try again later.");
      toast({
        title: "Failed to load messages",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [userId, partnerId, toast]);

  const markMessagesAsRead = useCallback(async () => {
    try {
      await supabase.rpc('mark_messages_as_read', {
        user_id: userId,
        other_user_id: partnerId
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, [userId, partnerId]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: userId,
          receiver_id: partnerId,
          content: content.trim(),
          read: false
        })
        .select()
        .single();
        
      if (error) {
        console.error("Error sending message:", error);
        toast({
          title: "Failed to send message",
          description: "Please try again later",
          variant: "destructive"
        });
        throw error;
      }
      
      if (data) {
        setMessages(prev => [...prev, data]);
      }
      
      // Invalidate matches query to refresh the list with the new message
      queryClient.invalidateQueries({ queryKey: ['matches'] });
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
  }, [userId, partnerId, queryClient, toast]);

  useEffect(() => {
    fetchMessages();
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
            queryClient.invalidateQueries({ queryKey: ['matches'] });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId, userId, partnerId, queryClient, fetchMessages, markMessagesAsRead]);

  return {
    messages,
    isLoading,
    errorMessage,
    sendMessage,
    fetchMessages
  };
};
