
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import ProfileCard from './ProfileCard';
import RevealButton from './RevealButton';
import ActionButtons from './ActionButtons';

interface Profile {
  id: string;
  name: string;
  age?: number;
  location?: string;
  avatar?: string;
  interactionType?: 'like' | 'superlike';
  isRevealed?: boolean;
}

interface ProfileItemProps {
  profile: Profile;
  balance: number;
  isAdReady: boolean;
  onReveal: (profileId: string) => void;
  onWatchAd: () => void;
  onLike: (profileId: string) => void;
  onReject: (profileId: string) => void;
  onViewProfile: (profileId: string) => void;
}

const ProfileItem: React.FC<ProfileItemProps> = ({
  profile,
  balance,
  isAdReady,
  onReveal,
  onWatchAd,
  onLike,
  onReject,
  onViewProfile
}) => {
  const isRevealed = profile.isRevealed || false;

  return (
    <Card key={profile.id} className="hover:bg-accent/50 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start">
          <ProfileCard profile={profile} />
          
          <div className="min-w-0 flex-1">
            {isRevealed ? (
              <ActionButtons 
                profileId={profile.id}
                onLike={onLike}
                onReject={onReject}
                onViewProfile={() => onViewProfile(profile.id)}
              />
            ) : (
              <RevealButton 
                balance={balance}
                onReveal={() => onReveal(profile.id)}
                onWatchAd={onWatchAd}
                isAdReady={isAdReady}
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileItem;
