
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ChatHeaderProps {
  onBack: () => void;
  partnerName: string;
  partnerAvatar?: string;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  onBack, 
  partnerName, 
  partnerAvatar 
}) => {
  const nameInitial = partnerName && partnerName.length > 0 ? partnerName.charAt(0) : '?';
  
  return (
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
  );
};

export default ChatHeader;
