
import React, { useState } from 'react';
import MatchAnimation from '@/components/match/MatchAnimation';
import { UserProfile } from '@/types/auth';

interface ProfileMatchHandlerProps {
  showMatchAnimation: boolean;
  matchedProfile: {
    id: string;
    name: string;
    avatar?: string;
  } | null;
  onClose: () => void;
}

const ProfileMatchHandler = ({ 
  showMatchAnimation, 
  matchedProfile, 
  onClose 
}: ProfileMatchHandlerProps) => {
  if (!matchedProfile) return null;
  
  return (
    <MatchAnimation 
      isOpen={showMatchAnimation}
      onClose={onClose}
      matchedProfile={matchedProfile}
    />
  );
};

export default ProfileMatchHandler;
