
import React from 'react';
import { Card } from '@/components/ui/card';
import ProfileCard from './ProfileCard';
import RevealButton from './RevealButton';
import ActionButtons from './ActionButtons';

interface ProfileItemProps {
  profile: any;
  onSelectLike: (profileId: string) => void;
  onViewProfile: (profileId: string) => void;
  onReveal: () => void;
  onWatchAd: () => void;
  isProcessing: boolean;
  canUseCoins: boolean;
  isAdReady: boolean;
}

const ProfileItem: React.FC<ProfileItemProps> = ({
  profile,
  onSelectLike,
  onViewProfile,
  onReveal,
  onWatchAd,
  isProcessing,
  canUseCoins,
  isAdReady
}) => {
  // Debug log to check if profile.is_revealed value is consistent
  console.log(`ProfileItem rendering for ${profile.id}, is_revealed: ${profile.is_revealed}`);
  
  return (
    <Card className="overflow-hidden">
      <ProfileCard 
        profile={profile}
        onSelectLike={() => onSelectLike(profile.id)}
        onViewProfile={() => onViewProfile(profile.id)}
      />
      
      {!profile.is_revealed ? (
        <RevealButton
          onReveal={onReveal}
          onWatchAd={onWatchAd}
          isProcessing={isProcessing}
          canUseCoins={canUseCoins}
          isAdReady={isAdReady}
        />
      ) : (
        <ActionButtons
          profileId={profile.id}
          onSelectLike={() => onSelectLike(profile.id)}
          onViewProfile={() => onViewProfile(profile.id)}
        />
      )}
    </Card>
  );
};

export default ProfileItem;
