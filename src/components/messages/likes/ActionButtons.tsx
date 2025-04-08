
import React from 'react';
import { Button } from '@/components/ui/button';
import { Heart, X, User } from 'lucide-react';
import { toast } from 'sonner';
import { likeProfile } from '@/utils/matchUtils';
import { useAuth } from '@/context/auth';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

export interface ActionButtonsProps {
  profileId: string;
  onSelectLike: () => void;
  onViewProfile?: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  profileId,
  onSelectLike,
  onViewProfile
}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  const handleLikeBack = async () => {
    if (!user?.id) {
      toast.error("You need to be logged in");
      return;
    }
    
    try {
      await likeProfile(user.id, profileId);
      toast.success("Profile liked!");
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['likes'] });
      onSelectLike();
    } catch (error) {
      console.error("Error liking profile:", error);
      toast.error("Failed to like profile");
    }
  };

  const handleReject = () => {
    // Implement rejection functionality if needed
    toast.info("Profile rejected");
    queryClient.invalidateQueries({ queryKey: ['likes'] });
  };

  const handleViewProfile = () => {
    if (profileId) {
      navigate(`/profile/${profileId}`);
    } else {
      toast.error("Could not load profile");
    }
  };
  
  return (
    <div className="p-4 flex gap-2 justify-center">
      <Button
        onClick={handleLikeBack}
        className="bg-slate-900 hover:bg-slate-800 text-white"
        aria-label="Like"
      >
        <Heart className="h-5 w-5 mr-1" />
        Like
      </Button>
      
      <Button
        onClick={handleViewProfile}
        className="bg-slate-900 hover:bg-slate-800 text-white"
        aria-label="View Profile"
      >
        <User className="h-5 w-5 mr-1" />
        View Profile
      </Button>
      
      <Button
        onClick={handleReject}
        className="bg-slate-900 hover:bg-slate-800 text-white"
        aria-label="Reject"
      >
        <X className="h-5 w-5 mr-1" />
        Pass
      </Button>
    </div>
  );
};

export default ActionButtons;
