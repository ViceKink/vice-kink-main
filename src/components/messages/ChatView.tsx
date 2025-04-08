
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  // Default to '?' if name is undefined or empty
  const nameInitial = partnerName && partnerName.length > 0 ? partnerName.charAt(0) : '?';
  
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
        <div className="text-center text-muted-foreground py-6">
          You matched with {partnerName || 'this user'}. Say hello!
        </div>
        
        {/* Messages will be displayed here */}
      </div>
      
      <div className="border-t p-3">
        <div className="flex gap-2">
          <input 
            type="text" 
            className="flex-1 px-3 py-2 border rounded-full bg-background border-input"
            placeholder="Type a message..."
          />
          <Button>Send</Button>
        </div>
      </div>
    </div>
  );
};

export default ChatView;
