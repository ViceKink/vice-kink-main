
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProfileWithInteraction } from '@/models/profileTypes';
import ProfileItem from './ProfileItem';
import { useRevealProfile } from './useRevealProfile';
import { useWatchAdReveal } from './useWatchAdReveal';

interface LikesContainerProps {
  likes: ProfileWithInteraction[];
}

const LikesContainer: React.FC<LikesContainerProps> = ({ likes }) => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [localLikes, setLocalLikes] = useState<ProfileWithInteraction[]>([]);
  
  // Update local state whenever props change
  useEffect(() => {
    console.log("Likes component received updated likes data:", likes);
    setLocalLikes(likes);
  }, [likes]);

  const { revealProfile } = useRevealProfile({
    setIsProcessing,
    setSelectedProfileId,
    setLocalLikes
  });

  const { watchAdToReveal } = useWatchAdReveal({
    setIsProcessing,
    setSelectedProfileId,
    setLocalLikes
  });

  const handleSelectLike = (profileId: string) => {
    console.log("Selected profile:", profileId);
    setSelectedProfileId(profileId);
  };

  const handleViewProfile = (profileId: string) => {
    console.log("Navigating to profile:", profileId);
    // Direct navigation without using onViewProfile prop
    navigate(`/profile/${profileId}`);
  };

  console.log("Rendering Likes component with localLikes:", localLikes);

  return (
    <div className="space-y-4">
      {localLikes.map(profile => (
        <ProfileItem
          key={profile.id}
          profile={profile}
          onReveal={() => revealProfile(profile.id)}
          onSelectLike={() => handleSelectLike(profile.id)}
          onViewProfile={() => handleViewProfile(profile.id)}
          onWatchAd={() => watchAdToReveal(profile.id)}
          isProcessing={isProcessing && selectedProfileId === profile.id}
          canUseCoins={true}
          isAdReady={true}
        />
      ))}
    </div>
  );
};

export default LikesContainer;
