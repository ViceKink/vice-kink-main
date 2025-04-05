
import React from 'react';
import { UserProfile } from '@/types/auth';
import ProfileMainSection from '@/components/profile/ProfileMainSection';
import ProfileEmptyState from '@/components/profile/ProfileEmptyState';
import ProfileTagsPhotoSection from '@/components/profile/ProfileTagsPhotoSection';
import ProfileAudio from '@/components/profile/ProfileAudio';
import ProfileFlirtingStyle from '@/components/profile/ProfileFlirtingStyle';
import ProfilePhoto from '@/components/profile/ProfilePhoto';
import ProfilePhotoGallery from '@/components/profile/ProfilePhotoGallery';
import ProfileDetailsCard from '@/components/profile/ProfileDetailsCard';
import ProfilePassion from '@/components/profile/ProfilePassion';
import '../ui/bento-grid.css';

interface BentoProfileProps {
  profile: UserProfile;
  isCurrentUser?: boolean;
}

const BentoProfile = ({ profile, isCurrentUser = false }: BentoProfileProps) => {
  // Helper function to check if content exists
  const hasContent = (item: any[] | undefined | null): boolean => {
    return !!item && item.length > 0;
  };
  
  // Check for available content
  const hasPhotos = hasContent(profile.photos);
  const hasSecondPhoto = profile.photos && profile.photos.length > 1;
  const hasThirdPhoto = profile.photos && profile.photos.length > 2;
  const hasFourthPhoto = profile.photos && profile.photos.length > 3;
  const hasFifthPhoto = profile.photos && profile.photos.length > 4;
  const hasSixthPhoto = profile.photos && profile.photos.length > 5;
  const hasVices = hasContent(profile.vices);
  const hasKinks = hasContent(profile.kinks);
  const hasPassions = hasContent(profile.passions);
  const hasFlirtingStyle = !!profile.flirtingStyle;
  const hasBio = !!profile.bio;
  const hasQuote = !!profile.quote;
  const hasAudio = !!profile.audio;
  const hasVicesOrKinks = hasVices || hasKinks;
  const hasAboutDetails = !!(
    profile.about?.height || 
    profile.about?.zodiac || 
    profile.about?.religion || 
    profile.about?.languages?.length || 
    profile.lookingFor ||
    profile.flirtingStyle ||
    profile.about?.lifestyle?.smoking !== undefined || 
    profile.about?.lifestyle?.drinking ||
    profile.about?.status
  );
  
  // Check if the profile is effectively empty (no meaningful content)
  const isProfileEmpty = !hasPhotos && 
                        !hasBio && 
                        !hasQuote && 
                        !hasAudio && 
                        !hasAboutDetails && 
                        !hasVicesOrKinks && 
                        !hasPassions && 
                        !hasFlirtingStyle;
  
  // If profile is empty, show empty state
  if (isProfileEmpty) {
    return <ProfileEmptyState isCurrentUser={isCurrentUser} />;
  }
  
  return (
    <div className="w-full mx-auto">
      {/* Top section with main photo and user details */}
      <ProfileMainSection 
        profile={profile} 
        hasPhotos={hasPhotos} 
        hasQuote={hasQuote} 
      />

      {/* Grid layout for the bento cards */}
      <div className="bento-grid">
        {hasAudio && profile.audio && (
          <div className="audio-card">
            <ProfileAudio audio={profile.audio} />
          </div>
        )}

        {hasAboutDetails && (
          <ProfileDetailsCard 
            profile={profile}
            className="profile-details-card"
          />
        )}

        {/* Tags and second photo section */}
        {(hasVicesOrKinks || hasSecondPhoto) && (
          <ProfileTagsPhotoSection 
            vices={profile.vices}
            kinks={profile.kinks}
            secondPhoto={hasSecondPhoto ? profile.photos[1] : undefined}
            name={profile.name}
          />
        )}

        {/* Flirting style section */}
        {hasFlirtingStyle && (
          <div className="bg-white dark:bg-card p-4 rounded-2xl col-span-12 mt-[0.3125rem]">
            <ProfileFlirtingStyle 
              flirtingStyle={profile.flirtingStyle} 
              currentRow={1}  // Not used in this context
            />
          </div>
        )}
        
        {/* Third photo */}
        {hasThirdPhoto && (
          <div className="square-photo col-span-12 mt-[0.3125rem] bg-black rounded-2xl overflow-hidden">
            <ProfilePhoto 
              src={profile.photos[2]} 
              alt={`${profile.name} third photo`} 
            />
          </div>
        )}
        
        {/* Bio section (My Story) */}
        {hasBio && (
          <div className="bg-vice-red p-4 rounded-2xl col-span-12 mt-[0.3125rem] text-white">
            <h3 className="text-xl font-semibold mb-2">My story</h3>
            <p className="text-base">
              {profile.bio}
            </p>
          </div>
        )}
        
        {/* Fourth photo with passion */}
        {(hasFourthPhoto || hasPassions) && (
          <div className="flex flex-row gap-[0.3125rem] w-full col-span-12 mt-[0.3125rem]">
            {hasFourthPhoto && (
              <div className={`${hasPassions ? 'w-1/2' : 'w-full'} bg-black rounded-2xl overflow-hidden h-[300px]`}>
                <ProfilePhoto 
                  src={profile.photos[3]} 
                  alt={`${profile.name} fourth photo`} 
                />
              </div>
            )}
            
            {hasPassions && profile.passions && (
              <ProfilePassion 
                passion={profile.passions.slice(0, 5)} 
                fullWidth={!hasFourthPhoto}
              />
            )}
          </div>
        )}
        
        {/* Fifth and sixth photos */}
        {(hasFifthPhoto || hasSixthPhoto) && (
          <ProfilePhotoGallery 
            photos={profile.photos} 
            name={profile.name} 
            startIndex={4}
          />
        )}
      </div>
    </div>
  );
};

export default BentoProfile;
