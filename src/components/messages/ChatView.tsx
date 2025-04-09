
import React from 'react';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { useChat } from '@/hooks/useChat';

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
  const {
    messages,
    isLoading,
    errorMessage,
    sendMessage,
    fetchMessages
  } = useChat({ matchId, userId, partnerId });

  return (
    <div className="flex flex-col h-full">
      <ChatHeader 
        onBack={onBack} 
        partnerName={partnerName} 
        partnerAvatar={partnerAvatar} 
      />
      
      <div className="flex-1 p-4 overflow-y-auto">
        <MessageList 
          messages={messages}
          userId={userId}
          isLoading={isLoading}
          errorMessage={errorMessage}
          fetchMessages={fetchMessages}
        />
      </div>
      
      <MessageInput 
        onSendMessage={sendMessage}
        isLoading={isLoading}
      />
    </div>
  );
};

export default ChatView;
