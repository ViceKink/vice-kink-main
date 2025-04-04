import React from 'react';

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
  return (
    <div>
      <h2>Chat with {partnerName}</h2>
      <p>Match ID: {matchId}</p>
      <button onClick={onBack}>Back to Messages</button>
    </div>
  );
};

export default ChatView;
