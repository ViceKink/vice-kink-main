
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Image } from "lucide-react";
import { FileInput } from "@/components/ui/file-input";
import { useToast } from "@/hooks/use-toast";
import { compressImage } from "@/utils/profile/photoUtils";

interface MessageInputProps {
  onSendMessage: (message: string, imageFile?: File) => void;
  isLoading: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, isLoading }) => {
  const [messageText, setMessageText] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleSend = () => {
    if ((messageText.trim() || selectedImage) && !isLoading && !isCompressing) {
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

  const compressAndSetImage = async (file: File) => {
    try {
      setIsCompressing(true);
      toast({
        title: "Compressing image...",
        description: "Please wait",
      });

      // Use the compressImage function from photoUtils
      const compressedBlob = await compressImage(file);
      
      // Create a new File object from the compressed blob
      const compressedFile = new File(
        [compressedBlob], 
        file.name, 
        { type: compressedBlob.type }
      );
      
      // Check if the compressed file is still too large
      if (compressedFile.size > 1 * 1024 * 1024) {
        toast({
          title: "Image still too large",
          description: "Even after compression, the image exceeds 1MB. Please try a smaller image.",
          variant: "destructive"
        });
        return null;
      }
      
      return compressedFile;
    } catch (error) {
      console.error("Error compressing image:", error);
      toast({
        title: "Error compressing image",
        description: "Please try again or use a different image",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsCompressing(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

      // Changed the file size limit to 1MB
      if (file.size > 1 * 1024 * 1024) { // 1MB limit
        toast({
          title: "File too large",
          description: "Image must be less than 1MB. Compressing...",
        });
        
        const compressedFile = await compressAndSetImage(file);
        if (compressedFile) {
          setSelectedImage(compressedFile);
          toast({
            title: "Image compressed and selected",
            description: `${compressedFile.name} (${(compressedFile.size / 1024).toFixed(1)}KB)`,
          });
        }
      } else {
        setSelectedImage(file);
        toast({
          title: "Image selected",
          description: file.name,
        });
      }
    }
  };

  return (
    <div className="border-t p-3 space-y-2">
      {selectedImage && (
        <div className="flex items-center text-sm text-muted-foreground bg-muted p-2 rounded-md">
          <span className="truncate flex-1">{selectedImage.name} ({(selectedImage.size / 1024).toFixed(1)}KB)</span>
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
          disabled={isLoading || isCompressing}
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
          disabled={isLoading || isCompressing}
          onClick={() => fileInputRef.current?.click()}
        >
          <Image className="h-5 w-5" />
        </Button>
        <Button 
          onClick={handleSend} 
          disabled={isLoading || isCompressing || (!messageText.trim() && !selectedImage)}
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
