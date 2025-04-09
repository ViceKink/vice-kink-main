
import React, { useRef, useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Message } from '@/models/matchesTypes';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, ExternalLink } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";

interface MessageListProps {
  messages: Message[];
  userId: string;
  isLoading: boolean;
  errorMessage: string | null;
  fetchMessages: () => void;
}

const MessageList: React.FC<MessageListProps> = ({ 
  messages, 
  userId, 
  isLoading,
  errorMessage,
  fetchMessages
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [imageLoadErrors, setImageLoadErrors] = useState<Record<string, boolean>>({});
  const [imageLoading, setImageLoading] = useState<Record<string, boolean>>({});
  const [imageSrcs, setImageSrcs] = useState<Record<string, string>>({});
  const { toast } = useToast();
  
  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize image sources when messages change
  useEffect(() => {
    const newImageSrcs: Record<string, string> = {};
    messages.forEach(message => {
      if (message.image_url && !imageSrcs[message.id]) {
        // Make sure we're using the correct bucket name 'messages' (not 'message')
        const correctedUrl = message.image_url?.replace('/message/', '/messages/');
        newImageSrcs[message.id] = correctedUrl;
      }
    });
    
    if (Object.keys(newImageSrcs).length > 0) {
      setImageSrcs(prev => ({...prev, ...newImageSrcs}));
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatMessageDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Enhanced error handling with logging
  const handleImageError = (messageId: string, imageUrl: string) => {
    // Log the error with the URL for debugging
    console.error(`Image failed to load: ${imageUrl}`, new Error().stack);
    
    // Check if URL contains 'message/' instead of 'messages/'
    if (imageUrl?.includes('/message/')) {
      // Correct the URL
      const correctedUrl = imageUrl.replace('/message/', '/messages/');
      console.log(`Fixing incorrect bucket name, using: ${correctedUrl}`);
      setImageSrcs(prev => ({...prev, [messageId]: correctedUrl}));
      
      // Don't mark as error yet, let the corrected URL load
      setImageLoading(prev => ({...prev, [messageId]: true}));
    } else {
      // Mark as error if the URL was already correct but still failed
      setImageLoadErrors(prev => ({
        ...prev,
        [messageId]: true
      }));
      setImageLoading(prev => {
        const newState = { ...prev };
        delete newState[messageId];
        return newState;
      });
    }
  };

  const handleImageLoad = (messageId: string) => {
    console.log(`Image loaded successfully: ${messageId}`);
    setImageLoading(prev => {
      const newState = { ...prev };
      delete newState[messageId];
      return newState;
    });
    // Clear any error state
    setImageLoadErrors(prev => {
      if (prev[messageId]) {
        const newState = { ...prev };
        delete newState[messageId];
        return newState;
      }
      return prev;
    });
  };

  const handleImageLoadStart = (messageId: string) => {
    setImageLoading(prev => ({
      ...prev,
      [messageId]: true
    }));
  };

  // Improved retry mechanism with multiple approaches
  const retryLoadImage = (messageId: string, imageUrl: string) => {
    // Clear the error state
    setImageLoadErrors(prev => {
      const newState = { ...prev };
      delete newState[messageId];
      return newState;
    });
    
    // Set loading state
    handleImageLoadStart(messageId);
    
    // Fix the bucket name if it's wrong
    let newSrc = imageUrl;
    if (newSrc?.includes('/message/')) {
      newSrc = newSrc.replace('/message/', '/messages/');
      console.log("Correcting bucket name from 'message' to 'messages':", newSrc);
    }
    
    // Add a timestamp to bust cache
    newSrc = `${newSrc}?t=${Date.now()}`;
    
    console.log("Retrying image load with URL:", newSrc);
    
    // Update the image source
    setImageSrcs(prev => ({
      ...prev,
      [messageId]: newSrc
    }));
    
    // Show feedback to user
    toast({
      title: "Retrying image load",
      description: "Attempting to reload the image..."
    });
    
    return newSrc;
  };

  // Open image in new tab for fallback viewing
  const openImageInNewTab = (imageUrl: string) => {
    // Fix URL if it's using the wrong bucket name
    let correctedUrl = imageUrl;
    if (correctedUrl?.includes('/message/')) {
      correctedUrl = correctedUrl.replace('/message/', '/messages/');
    }
    window.open(correctedUrl, '_blank');
  };

  // Handle main message display logic
  if (errorMessage) {
    return (
      <div className="p-4 mb-4 text-white bg-destructive rounded-md text-center">
        {errorMessage}
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-2 bg-transparent border-white text-white hover:bg-white/20"
          onClick={fetchMessages}
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (isLoading && messages.length === 0) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
            <Skeleton className={`h-14 ${i % 2 === 0 ? 'w-32' : 'w-40'} rounded-lg`} />
          </div>
        ))}
      </div>
    );
  }

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="text-center text-muted-foreground py-6">
        Say hello to start the conversation!
      </div>
    );
  }

  return (
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
            {/* Only show content if it's more than just a space character (for image-only messages) */}
            {message.content && message.content.trim() && <p className="break-words">{message.content}</p>}
            
            {/* Image handling with improved reliability */}
            {message.image_url && !imageLoadErrors[message.id] && (
              <div className="mt-2 relative">
                {imageLoading[message.id] && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/30 rounded-md">
                    <Spinner className="h-8 w-8" />
                  </div>
                )}
                <img 
                  src={imageSrcs[message.id] || message.image_url.replace('/message/', '/messages/')}
                  alt="Message attachment" 
                  className="rounded-md max-h-60 max-w-full object-contain"
                  onError={() => handleImageError(message.id, imageSrcs[message.id] || message.image_url)}
                  onLoad={() => handleImageLoad(message.id)}
                  onLoadStart={() => handleImageLoadStart(message.id)}
                  crossOrigin="anonymous"
                />
              </div>
            )}

            {/* Error state with improved retry options */}
            {message.image_url && imageLoadErrors[message.id] && (
              <div className="mt-2 text-center p-3 bg-muted/50 rounded-md">
                <p className="text-sm text-muted-foreground mb-1">Image failed to load</p>
                <div className="flex space-x-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1 flex items-center justify-center gap-1"
                    onClick={() => {
                      const newSrc = retryLoadImage(
                        message.id, 
                        message.image_url!.replace('/message/', '/messages/')
                      );
                      // Force a reload of the image element
                      const img = new Image();
                      img.src = newSrc;
                      img.onload = () => handleImageLoad(message.id);
                    }}
                  >
                    <RefreshCw className="h-3 w-3" />
                    Retry
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center justify-center gap-1"
                    onClick={() => openImageInNewTab(message.image_url!)}
                  >
                    <ExternalLink className="h-3 w-3" />
                    Open
                  </Button>
                </div>
              </div>
            )}
            
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
  );
};

export default MessageList;
