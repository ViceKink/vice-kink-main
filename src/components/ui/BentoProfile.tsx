
import React from 'react';
import { UserProfile } from '@/context/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileBio from '@/components/profile/ProfileBio';
import ProfileAudio from '@/components/profile/ProfileAudio';
import ProfileTagsSection from '@/components/profile/ProfileTagsSection';
import ProfileSecondaryPhotos from '@/components/profile/ProfileSecondaryPhotos';
import ProfileFlirtingStyle from '@/components/profile/ProfileFlirtingStyle';
import ProfilePassion from '@/components/profile/ProfilePassion';
import ProfileQuote from '@/components/profile/ProfileQuote';

interface BentoProfileProps {
  profile: UserProfile;
  isCurrentUser?: boolean;
}

const BentoProfile = ({ profile, isCurrentUser = false }: BentoProfileProps) => {
  const isMobile = useIsMobile();
  
  // Calculate which rows to start on based on what exists
  let currentRow = 1;
  
  // Helper function to determine if a section should show
  const hasContent = (item: any[] | undefined | null): boolean => {
    return !!item && item.length > 0;
  };
  
  // Track if section was rendered to adjust positioning
  const hasPhotos = hasContent(profile.photos);
  const hasSecondaryPhotos = profile.photos && profile.photos.length > 1;
  const hasVices = hasContent(profile.vices);
  const hasKinks = hasContent(profile.kinks);
  const hasPassions = hasContent(profile.passions);
  const hasFlirtingStyle = !!profile.flirtingStyle;
  const hasBio = !!profile.bio;
  const hasAudio = !!profile.audio;
  
  // Dynamic row tracking functions
  const getNextRow = () => {
    const row = currentRow;
    currentRow++;
    return row;
  };
  
  return (
    <div className="bento-grid max-w-[60%] mx-auto">
      {/* Header Section with Main Photo and User Info */}
      <ProfileHeader 
        profile={profile}
        isCurrentUser={isCurrentUser}
        hasPhotos={hasPhotos}
        currentRow={getNextRow()}
      />

      {/* Bio - only show if exists */}
      {hasBio && (
        <ProfileBio
          bio={profile.bio}
          hasPhotos={hasPhotos}
          currentRow={getNextRow()}
        />
      )}

      {/* Audio - only show if exists */}
      {hasAudio && (
        <ProfileAudio
          audio={profile.audio}
          currentRow={getNextRow()}
        />
      )}

      {/* Vices - only show if exists */}
      {hasVices && (
        <ProfileTagsSection
          items={profile.vices}
          type="vice"
          title="Vices"
          currentRow={getNextRow()}
        />
      )}

      {/* Kinks - only show if exists */}
      {hasKinks && (
        <ProfileTagsSection
          items={profile.kinks}
          type="kink"
          title="Kinks"
          currentRow={getNextRow()}
        />
      )}

      {/* Secondary Photos - only show if more than 1 photo */}
      {hasSecondaryPhotos && (
        <ProfileSecondaryPhotos
          photos={profile.photos}
          name={profile.name}
          currentRow={getNextRow()}
        />
      )}

      {/* Flirting Style - only show if exists */}
      {hasFlirtingStyle && (
        <ProfileFlirtingStyle
          flirtingStyle={profile.flirtingStyle as any}
          currentRow={getNextRow()}
        />
      )}

      {/* Passion - only show if exists */}
      {hasPassions && (
        <ProfilePassion
          passion={profile.passions[0]}
          currentRow={getNextRow()}
          hasFlirtingStyle={hasFlirtingStyle}
        />
      )}

      {/* Quote - always show */}
      <ProfileQuote
        currentRow={getNextRow()}
        hasFlirtingStyle={hasFlirtingStyle}
        hasPassions={hasPassions}
      />
    </div>
  );
};

export default BentoProfile;
