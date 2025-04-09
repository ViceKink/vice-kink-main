
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Send, Image as ImageIcon, X, Lock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from '@tanstack/react-query';
import { v4 as uuidv4 } from 'uuid';
import { toast } from "sonner";
import { useAdCoins } from '@/hooks/useAdCoins';
import { Message } from '@/models/matchesTypes';

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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [revealingImage, setRevealingImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast: toastNotification } = useToast();
  const queryClient = useQueryClient();
  const { purchaseFeature } = useAdCoins();
  
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
            // Invalidate matches query to refresh the list with the new message
            queryClient.invalidateQueries({ queryKey: ['matches'] });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId, userId, partnerId, queryClient]);

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
      toastNotification({
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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image too large. Maximum size is 5MB.");
      return;
    }
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error("Only image files are supported.");
      return;
    }
    
    setImageFile(file);
    
    // Create a preview URL
    const objectUrl = URL.createObjectURL(file);
    setImagePreviewUrl(objectUrl);
  };

  const handleCancelImage = () => {
    setImageFile(null);
    setImagePreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      // Generate a unique filename to avoid collisions
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;
      
      console.log(`Trying to upload to: messages/${filePath}`);
      
      // Upload the file to Supabase Storage
      const { error: uploadError, data } = await supabase
        .storage
        .from('messages')
        .upload(filePath, file);
        
      if (uploadError) {
        console.error("Upload error details:", uploadError);
        throw uploadError;
      }
      
      console.log("Upload successful, data:", data);
      
      // Get the public URL for the file
      const { data: urlData } = supabase
        .storage
        .from('messages')
        .getPublicUrl(filePath);
        
      console.log("Generated public URL:", urlData.publicUrl);
      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error("Failed to upload image. Please try again.");
      return null;
    }
  };

  const handleSendMessage = async () => {
    const hasContent = messageText.trim().length > 0;
    const hasImage = imageFile !== null;
    
    if (!hasContent && !hasImage) return;
    
    try {
      setIsLoading(true);
      
      let imageUrl: string | null = null;
      
      // Upload image if present
      if (hasImage && imageFile) {
        imageUrl = await uploadImage(imageFile);
        if (!imageUrl && !hasContent) {
          return; // Don't send if image upload failed and there's no text
        }
      }
      
      // Send message with image if available
      const { data, error } = await supabase.rpc('send_message', {
        sender: userId,
        receiver: partnerId,
        message_content: messageText.trim() || ' ', // Send at least a space if no text
        image_url: imageUrl
      });
      
      if (error) {
        console.error("Error sending message:", error);
        throw error;
      }
      
      // Add the new message to the list
      const newMessage: Message = {
        id: data,
        sender_id: userId,
        receiver_id: partnerId,
        content: messageText.trim() || ' ',
        created_at: new Date().toISOString(),
        read: false,
        image_url: imageUrl ?? undefined,
        is_image_revealed: true // Your own images are always revealed
      };
      
      setMessages(prev => [...prev, newMessage]);
      setMessageText(""); // Clear input field
      handleCancelImage(); // Clear image preview
      
      // Invalidate matches query to refresh the list with the new message
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    } catch (error) {
      console.error('Error sending message:', error);
      toastNotification({
        title: "Failed to send message",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevealImage = async (messageId: string) => {
    try {
      setRevealingImage(messageId);
      
      // Use AdCoins to reveal the image
      const success = await purchaseFeature('REVEAL_IMAGE');
      
      if (success) {
        // Update the local state to show the image as revealed
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === messageId ? { ...msg, is_image_revealed: true } : msg
          )
        );
        
        // Update the database to mark the image as revealed
        const { error } = await supabase
          .from('messages')
          .update({ is_image_revealed: true })
          .eq('id', messageId);
          
        if (error) {
          console.error("Error updating message in database:", error);
        }
          
        toast.success("Image revealed!");
      } else {
        toast.error("Failed to reveal image. Check your AdCoins balance.");
      }
    } catch (error) {
      console.error("Error revealing image:", error);
      toast.error("Failed to reveal image. Please try again.");
    } finally {
      setRevealingImage(null);
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
                  {message.image_url && (
                    <div className="mb-2 relative">
                      {message.sender_id !== userId && !message.is_image_revealed ? (
                        <div className="relative">
                          <div className="w-full h-32 bg-gray-700 rounded-md flex flex-col items-center justify-center cursor-pointer">
                            <Lock className="w-8 h-8 text-gray-400 mb-2" />
                            <p className="text-sm text-gray-300">Image hidden</p>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="mt-2"
                              onClick={() => handleRevealImage(message.id)}
                              disabled={revealingImage === message.id}
                            >
                              {revealingImage === message.id ? 'Revealing...' : 'Reveal (1 AdCoin)'}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <img 
                          src={message.image_url} 
                          alt="Message attachment" 
                          className="max-w-full rounded-md cursor-pointer"
                          onClick={() => window.open(message.image_url, '_blank')}
                        />
                      )}
                    </div>
                  )}
                  <p className="break-words">{message.content !== ' ' ? message.content : ''}</p>
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
      
      {imagePreviewUrl && (
        <div className="border-t border-b p-2">
          <div className="relative inline-block">
            <img 
              src={imagePreviewUrl} 
              alt="Preview" 
              className="h-20 rounded-md"
            />
            <button 
              onClick={handleCancelImage}
              className="absolute -right-2 -top-2 bg-destructive text-destructive-foreground rounded-full p-1"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}
      
      <div className="border-t p-3">
        <div className="flex gap-2 items-center">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
            ref={fileInputRef}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            type="button"
          >
            <ImageIcon className="h-5 w-5" />
          </Button>
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
            disabled={isLoading || (!messageText.trim() && !imageFile)}
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
