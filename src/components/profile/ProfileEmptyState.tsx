
import React from 'react';
import { NavLink } from 'react-router-dom';
import { UserRound, Pencil, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProfileEmptyStateProps {
  isCurrentUser: boolean;
}

const ProfileEmptyState = ({ isCurrentUser }: ProfileEmptyStateProps) => {
  return (
    <div className="p-8 bg-white dark:bg-card rounded-2xl shadow-md text-center">
      <div className="flex justify-center mb-6">
        <div className="p-4 bg-vice-purple/10 rounded-full">
          <UserRound className="w-12 h-12 text-vice-purple" />
        </div>
      </div>
      <h3 className="text-xl font-bold mb-4">
        {isCurrentUser ? "Your Profile is Empty" : "Profile Incomplete"}
      </h3>
      <p className="text-foreground/70 mb-6">
        {isCurrentUser
          ? "Your profile is waiting to be filled with your personality, photos, and interests. Complete your profile to connect with others!"
          : "This user hasn't completed their profile yet."}
      </p>
      {isCurrentUser && (
        <div className="flex justify-center">
          <NavLink to="/edit-profile">
            <Button className="bg-vice-purple hover:bg-vice-dark-purple flex items-center gap-2">
              <Pencil className="w-4 h-4" /> Edit Your Profile <ArrowRight className="w-4 h-4" />
            </Button>
          </NavLink>
        </div>
      )}
    </div>
  );
};

export default ProfileEmptyState;
