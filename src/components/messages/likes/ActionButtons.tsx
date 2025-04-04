
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, Heart } from 'lucide-react';

export interface ActionButtonsProps {
  profileId: string;
  onSelectLike: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  profileId,
  onSelectLike
}) => {
  return (
    <div className="p-4 flex gap-2">
      <Button
        variant="outline"
        className="flex-1"
        onClick={onSelectLike}
      >
        <MessageSquare className="w-4 h-4 mr-2" />
        Message
      </Button>
      
      <Button
        className="flex-1"
      >
        <Heart className="w-4 h-4 mr-2" />
        Like Back
      </Button>
    </div>
  );
};

export default ActionButtons;
