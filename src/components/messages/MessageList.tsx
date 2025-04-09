
import React, { useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Message } from '@/models/matchesTypes';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw } from "lucide-react";
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
  const { toast } = useToast();
  
  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatMessageDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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

  const handleImageError = (url: string) => {
    console.error(`Failed to load image: ${url}`);
    console.error(`Image URL parsing: ${new URL(url).toString()}`);
    toast({
      title: "Image failed to load",
      description: "The image could not be displayed. Please check the console for details."
    });
  };

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
            {/* Display content if it exists and isn't just whitespace */}
            {message.content && message.content.trim() && (
              <p className="break-words">{message.content}</p>
            )}
            
            {/* Image handling */}
            {message.image_url && (
              <div className="mt-2 relative">
                <img 
                  src={message.image_url}
                  alt="Message attachment" 
                  className="rounded-md max-h-60 max-w-full object-contain"
                  onError={() => handleImageError(message.image_url || '')}
                  loading="lazy"
                />
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
