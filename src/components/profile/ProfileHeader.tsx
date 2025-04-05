
import React from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronLeft, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BoostButton } from '@/components/boost/BoostButton';

interface ProfileHeaderProps {
  isCurrentUser: boolean;
  profileId?: string;
  navigateToDiscover: () => void;
}

const ProfileHeader = ({ isCurrentUser, profileId, navigateToDiscover }: ProfileHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-4">
      {!isCurrentUser ? (
        <NavLink
          to="/discover"
          className="flex items-center text-foreground/70 hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back to Discover
        </NavLink>
      ) : (
        <div className="flex items-center">
        </div>
      )}
      
      {isCurrentUser && (
        <div className="flex items-center justify-center w-full gap-6">
          {profileId && (
            <BoostButton 
              entityId={profileId} 
              entityType="profile"
              className="flex items-center text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
            />
          )}
          
          <NavLink
            to="/edit-profile"
            className="flex items-center text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
          >
            <Pencil className="w-4 h-4 mr-1" />
            Edit Profile
          </NavLink>
        </div>
      )}
    </div>
  );
};

export default ProfileHeader;
