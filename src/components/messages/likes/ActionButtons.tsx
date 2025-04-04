
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, Heart } from 'lucide-react';
import { toast } from 'sonner';
import { likeProfile } from '@/utils/matchUtils';
import { useAuth } from '@/context/auth';
import { useQueryClient } from '@tanstack/react-query';

export interface ActionButtonsProps {
  profileId: string;
  onSelectLike: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  profileId,
  onSelectLike
}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const handleLikeBack = async () => {
    if (!user?.id) {
      toast.error("You need to be logged in");
      return;
    }
    
    try {
      await likeProfile(user.id, profileId);
      toast.success("Profile liked!");
      queryClient.invalidateQueries({ queryKey: ['userMatches'] });
      queryClient.invalidateQueries({ queryKey: ['userLikes'] });
      onSelectLike();
    } catch (error) {
      console.error("Error liking profile:", error);
      toast.error("Failed to like profile");
    }
  };
  
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
        onClick={handleLikeBack}
      >
        <Heart className="w-4 h-4 mr-2" />
        Like Back
      </Button>
    </div>
  );
};

export default ActionButtons;
