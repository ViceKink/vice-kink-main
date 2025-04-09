
import React, { useRef, useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Message } from '@/models/matchesTypes';
import { Skeleton } from '@/components/ui/skeleton';

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

  const handleImageError = (messageId: string) => {
    setImageLoadErrors(prev => ({
      ...prev,
      [messageId]: true
    }));
  };

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
            {message.content && <p className="break-words">{message.content}</p>}
            
            {message.image_url && !imageLoadErrors[message.id] && (
              <div className="mt-2 relative">
                <img 
                  src={message.image_url}
                  alt="Message attachment" 
                  className="rounded-md max-h-60 max-w-full object-contain"
                  onError={() => handleImageError(message.id)}
                />
              </div>
            )}

            {message.image_url && imageLoadErrors[message.id] && (
              <div className="mt-1 text-sm italic">
                {message.sender_id === userId 
                  ? "Image could not be displayed" 
                  : "Image attachment"}
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
