
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Send } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useChat } from "@/hooks/useChat";
import { formatDistanceToNow } from "date-fns";

const ChatView = ({ userId, partnerId, partnerName, partnerAvatar, onBack }) => {
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef(null);
  const { messages, isSending, sendTextMessage } = useChat({ userId, partnerId });
  const nameInitial = partnerName?.[0] || '?';
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;
    const success = await sendTextMessage(messageText);
    if (success) setMessageText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="border-b p-3 flex items-center gap-3">
        <Button onClick={onBack} variant="ghost" size="icon">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        
        <Avatar className="h-8 w-8">
          <AvatarImage src={partnerAvatar} />
          <AvatarFallback>{nameInitial}</AvatarFallback>
        </Avatar>
        
        <h3 className="font-semibold">{partnerName || 'User'}</h3>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.length === 0 ? (
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
                  <p>{message.content}</p>
                  {message.image_url && (
                    <img 
                      src={message.image_url} 
                      alt="Attachment" 
                      className="mt-2 rounded max-w-full max-h-60 object-contain"
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  )}
                  <p className="text-xs mt-1 text-muted-foreground">
                    {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
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
            disabled={isSending}
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={isSending || !messageText.trim()}
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
