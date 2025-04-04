
import React from 'react';
import { IconButton } from '@/components/ui/icon-button';
import { Heart, User2, X } from 'lucide-react';

interface ActionButtonsProps {
  profileId: string;
  onLike: (profileId: string) => void;
  onReject: (profileId: string) => void;
  onViewProfile: (profileId: string) => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  profileId,
  onLike,
  onReject,
  onViewProfile
}) => {
  return (
    <div className="flex gap-2">
      <IconButton
        size="sm"
        variant="default"
        className="h-8 w-8"
        icon={<Heart className="h-4 w-4" />}
        label="Like Back"
        onClick={() => onLike(profileId)}
      />
      <IconButton
        size="sm"
        variant="outline"
        className="h-8 w-8"
        icon={<User2 className="h-4 w-4" />}
        label="View Profile"
        onClick={() => onViewProfile(profileId)}
      />
      <IconButton
        size="sm"
        variant="outline"
        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
        icon={<X className="h-4 w-4" />}
        label="Reject"
        onClick={() => onReject(profileId)}
      />
    </div>
  );
};

export default ActionButtons;
