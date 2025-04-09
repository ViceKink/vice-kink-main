
import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from "@/hooks/use-toast";
import { Message } from '@/models/matchesTypes';
import { v4 as uuidv4 } from 'uuid';

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
  
  // Define bucket name as a constant to ensure consistency
  const BUCKET_NAME = 'message';

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

  const createBucketIfNotExists = async () => {
    try {
      // First check if bucket exists
      const { data: buckets, error: bucketListError } = await supabase
        .storage
        .listBuckets();
      
      if (bucketListError) {
        console.error('Error listing buckets:', bucketListError);
        return false;
      }
      
      // If bucket doesn't exist, try to create it
      if (!buckets.some(b => b.name === BUCKET_NAME)) {
        console.log(`Bucket "${BUCKET_NAME}" not found, attempting to create it...`);
        
        const { data, error: createError } = await supabase
          .storage
          .createBucket(BUCKET_NAME, {
            public: true,
            fileSizeLimit: 5242880, // 5MB
            allowedMimeTypes: ['image/*']
          });
          
        if (createError) {
          console.error('Error creating bucket:', createError);
          toast({
            title: "Storage configuration error",
            description: "Could not create storage bucket. Please check the README-IMAGE-SETUP.md file for manual setup instructions.",
            variant: "destructive"
          });
          return false;
        }
        
        console.log(`Bucket "${BUCKET_NAME}" created successfully:`, data);
        
        // Now create the necessary policies (this might require manual setup)
        toast({
          title: "Storage bucket created",
          description: "New storage bucket was created. You might need to manually set up storage policies in Supabase.",
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error in bucket creation:', error);
      return false;
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      // First make sure the bucket exists
      const bucketExists = await createBucketIfNotExists();
      if (!bucketExists) {
        toast({
          title: "Storage setup required",
          description: "Please check README-IMAGE-SETUP.md for manual setup instructions",
          variant: "destructive"
        });
        return null;
      }
      
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}/${uuidv4()}.${fileExt}`;
      
      // Log additional debugging information
      console.log(`Attempting to upload image to bucket: "${BUCKET_NAME}"`);
      console.log(`File path: ${filePath}`);
      console.log(`User ID: ${userId}`);
      
      // Check if bucket exists before uploading
      const { data: buckets, error: bucketError } = await supabase
        .storage
        .listBuckets();
        
      if (bucketError) {
        console.error('Error listing buckets:', bucketError);
        toast({
          title: "Storage error",
          description: "Could not access storage buckets",
          variant: "destructive"
        });
        return null;
      }
      
      // Log available buckets for debugging
      console.log('Available buckets:', buckets.map(b => b.name));
      
      if (!buckets.some(b => b.name === BUCKET_NAME)) {
        console.error(`Bucket "${BUCKET_NAME}" does not exist!`);
        toast({
          title: "Storage error",
          description: `Bucket "${BUCKET_NAME}" not found. Please check README-IMAGE-SETUP.md for setup instructions.`,
          variant: "destructive"
        });
        return null;
      }
      
      const { error: uploadError, data } = await supabase
        .storage
        .from(BUCKET_NAME)
        .upload(filePath, file);
        
      if (uploadError) {
        console.error(`Error uploading image to ${BUCKET_NAME} bucket:`, uploadError);
        toast({
          title: "Failed to upload image",
          description: "Storage error: " + uploadError.message,
          variant: "destructive"
        });
        return null;
      }
      
      const { data: urlData } = supabase
        .storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);
        
      console.log(`Image uploaded successfully, URL:`, urlData.publicUrl);
      return urlData.publicUrl;
    } catch (error) {
      console.error('Error in image upload:', error);
      toast({
        title: "Failed to upload image",
        description: "Please try again later",
        variant: "destructive"
      });
      return null;
    }
  };

  const sendMessage = useCallback(async (content: string, imageFile?: File) => {
    try {
      setIsLoading(true);
      
      let imageUrl = null;
      
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
        if (!imageUrl && !content.trim()) {
          setIsLoading(false);
          return; // Don't send empty message if image upload failed
        }
      }
      
      const messageContent = content.trim() || (imageUrl ? " " : null);
      
      console.log('Sending message with content:', messageContent, 'image URL:', imageUrl);
      
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: userId,
          receiver_id: partnerId,
          content: messageContent,
          image_url: imageUrl,
          read: false
        })
        .select();
        
      if (error) {
        console.error("Error sending message:", error);
        toast({
          title: "Failed to send message",
          description: "Please try again later",
          variant: "destructive"
        });
        throw error;
      }
      
      if (data && data.length > 0) {
        setMessages(prev => [...prev, data[0]]);
        console.log("Message sent successfully:", data[0]);
      }
      
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
