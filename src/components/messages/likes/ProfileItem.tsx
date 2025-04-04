
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ProfileCard from './ProfileCard';
import RevealButton from './RevealButton';
import ActionButtons from './ActionButtons';

interface ProfileItemProps {
  profile: any;
  onSelectLike: (profileId: string) => void;
  onReveal: () => void;
  onWatchAd: () => void;
  isProcessing: boolean;
  canUseCoins: boolean;
  isAdReady: boolean;
}

const ProfileItem: React.FC<ProfileItemProps> = ({
  profile,
  onSelectLike,
  onReveal,
  onWatchAd,
  isProcessing,
  canUseCoins,
  isAdReady
}) => {
  return (
    <Card className="overflow-hidden">
      <ProfileCard 
        profile={profile}
        onSelectLike={() => onSelectLike(profile.id)}
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
        />
      )}
    </Card>
  );
};

export default ProfileItem;
