
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Image } from "lucide-react";
import { FileInput } from "@/components/ui/file-input";
import { useToast } from "@/hooks/use-toast";

interface MessageInputProps {
  onSendMessage: (message: string, imageFile?: File) => void;
  isLoading: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, isLoading }) => {
  const [messageText, setMessageText] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleSend = () => {
    if ((messageText.trim() || selectedImage) && !isLoading) {
      onSendMessage(messageText.trim(), selectedImage || undefined);
      setMessageText("");
      setSelectedImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Only image files are allowed",
          variant: "destructive"
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Image must be less than 5MB",
          variant: "destructive"
        });
        return;
      }

      setSelectedImage(file);
      toast({
        title: "Image selected",
        description: file.name,
      });
    }
  };

  return (
    <div className="border-t p-3 space-y-2">
      {selectedImage && (
        <div className="flex items-center text-sm text-muted-foreground bg-muted p-2 rounded-md">
          <span className="truncate flex-1">{selectedImage.name}</span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setSelectedImage(null)}
          >
            Remove
          </Button>
        </div>
      )}
      <div className="flex gap-2 items-center">
        <Input
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="rounded-full"
          disabled={isLoading}
        />
        <input 
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="rounded-full h-10 w-10"
          disabled={isLoading}
          onClick={() => fileInputRef.current?.click()}
        >
          <Image className="h-5 w-5" />
        </Button>
        <Button 
          onClick={handleSend} 
          disabled={isLoading || (!messageText.trim() && !selectedImage)}
          size="icon"
          className="rounded-full h-10 w-10"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default MessageInput;
