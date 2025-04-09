
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Message } from '@/models/messageTypes';
import { useQueryClient } from '@tanstack/react-query';

export const useChat = ({ userId, partnerId }) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const queryClient = useQueryClient();

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.rpc('get_conversation', { user1: userId, user2: partnerId });
      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({ title: "Failed to load messages", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const markRead = async () => {
    await supabase.rpc('mark_messages_as_read', { user_id: userId, other_user_id: partnerId })
      .catch(error => console.error('Error marking messages as read:', error));
  };

  const sendTextMessage = async (content) => {
    if (!content.trim()) return false;
    
    try {
      setIsSending(true);
      const { data, error } = await supabase
        .from('messages')
        .insert({ sender_id: userId, receiver_id: partnerId, content: content.trim() })
        .select('id')
        .single();
      
      if (error) throw error;
      
      setMessages(prev => [...prev, {
        id: data.id,
        sender_id: userId,
        receiver_id: partnerId,
        content: content.trim(),
        created_at: new Date().toISOString(),
        read: false
      }]);
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      toast({ title: "Failed to send message", variant: "destructive" });
      return false;
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    markRead();
    
    const channel = supabase
      .channel('messages-channel')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `receiver_id=eq.${userId}`
      }, payload => {
        const newMessage = payload.new;
        if (newMessage.sender_id === partnerId) {
          setMessages(prev => [...prev, newMessage]);
          markRead();
          queryClient.invalidateQueries({ queryKey: ['matches'] });
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId, partnerId, queryClient]);

  return { messages, isLoading, isSending, sendTextMessage };
};
