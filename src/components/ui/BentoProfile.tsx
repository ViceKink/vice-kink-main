
import React from 'react';
import { UserProfile } from '@/types/auth';
import { useIsMobile } from '@/hooks/use-mobile';
import { MapPin, Play } from 'lucide-react';
import ProfileDetailsCard from '@/components/profile/ProfileDetailsCard';
import ProfileAudio from '@/components/profile/ProfileAudio';
import ProfileTag from '@/components/ui/ProfileTag';
import '../ui/bento-grid.css';

interface BentoProfileProps {
  profile: UserProfile;
  isCurrentUser?: boolean;
}

const BentoProfile = ({ profile, isCurrentUser = false }: BentoProfileProps) => {
  const isMobile = useIsMobile();
  
  const hasContent = (item: any[] | undefined | null): boolean => {
    return !!item && item.length > 0;
  };
  
  const hasPhotos = hasContent(profile.photos);
  const hasSecondPhoto = profile.photos && profile.photos.length > 1;
  const hasVices = hasContent(profile.vices);
  const hasKinks = hasContent(profile.kinks);
  const hasPassions = hasContent(profile.passions);
  const hasFlirtingStyle = !!profile.flirtingStyle;
  const hasBio = !!profile.bio;
  const hasAudio = !!profile.audio;
  const hasAboutDetails = !!(
    profile.about?.height || 
    profile.about?.zodiac || 
    profile.about?.religion || 
    profile.about?.languages?.length || 
    profile.lookingFor ||
    profile.flirtingStyle ||
    profile.about?.lifestyle?.smoking !== undefined || 
    profile.about?.lifestyle?.drinking ||
    profile.about?.status // Added status to details card
  );
  
  return (
    <div className="w-full mx-auto">
      {/* Top section with main photo and user details */}
      <div className="bento-main-container">
        <div className="main-photo-container">
          <div className="main-photo">
            {hasPhotos ? (
              <img
                src={profile.photos[0]}
                alt={profile.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">No photo available</span>
              </div>
            )}
          </div>
        </div>

        <div className="user-details-container">
          <div className="bento-section user-info rounded-2xl">
            <div className="flex flex-col h-full">
              <div className="flex items-baseline">
                <h2 className={`font-bold ${isMobile ? 'text-lg' : 'text-xl'}`}>{profile.name}</h2>
                {profile.verified && (
                  <span className="ml-1 text-blue-500">✓</span>
                )}
              </div>
              
              <div className={isMobile ? 'text-lg' : 'text-xl'}>{profile.age}</div>
              
              {profile.location && (
                <div className="text-sm text-foreground/70 mt-2 flex items-center">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-red-400" />
                  {profile.location}
                </div>
              )}
              
              {/* Relationship status moved to the details card */}
            </div>
          </div>

          {/* Quote Card */}
          <div className="bento-section quote-card rounded-2xl">
            <h3 className="text-sm font-semibold mb-1">Favorite Quote</h3>
            <p className={`${isMobile ? 'text-xs' : 'text-sm'} italic`}>
              {profile.quote || "https://www.linkedin.com/in/tejasv-kumar/"}
            </p>
          </div>
        </div>
      </div>

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

        {/* Vices/Kinks on left, Photo on right - side by side */}
        {(hasVices || hasKinks || hasSecondPhoto) && (
          <div className="bento-tags-photo-container">
            {/* Left side: Vices and Kinks stacked in column */}
            {(hasVices || hasKinks) && (
              <div className="tags-container">
                {/* Vices card */}
                {hasVices && (
                  <div className="vices-card bento-card p-4">
                    <h3 className="text-base font-semibold mb-2">Vices</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.vices.map((vice, index) => (
                        <ProfileTag key={index} label={vice} type="vice" />
                      ))}
                    </div>
                  </div>
                )}

                {/* Kinks card */}
                {hasKinks && (
                  <div className="kinks-card bento-card p-4">
                    <h3 className="text-base font-semibold mb-2">Kinks</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.kinks.map((kink, index) => (
                        <ProfileTag key={index} label={kink} type="kink" />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Right side: Secondary photo */}
            {hasSecondPhoto && (
              <div className="secondary-photo-container">
                <div className="secondary-photo-card">
                  <img
                    src={profile.photos[1]}
                    alt={`${profile.name} second photo`}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {hasFlirtingStyle && (
          <div className="bg-white dark:bg-card p-4 rounded-2xl col-span-12 mt-[0.3125rem]">
            <div className="flex flex-col h-full justify-center">
              <p className="text-base">
                <span className="font-medium">My idea of flirting is: </span>
                {typeof profile.flirtingStyle === 'string' ? profile.flirtingStyle : 'to be playful and fun'}
              </p>
            </div>
          </div>
        )}

        {hasPassions && (
          <div className="bg-vice-orange p-4 text-white rounded-2xl col-span-6 mt-[0.3125rem]">
            <div className="flex flex-col h-full justify-center">
              <p className="text-sm">
                I am passionate about: <span className="font-medium">{profile.passions[0]}</span>
              </p>
            </div>
          </div>
        )}

        <div className="bg-vice-orange p-4 text-white rounded-2xl col-span-6 mt-[0.3125rem]">
          <div className="flex flex-col h-full justify-center">
            <h3 className="text-sm font-semibold mb-1">Favorite Quote</h3>
            <p className="text-sm italic">
              {profile.quote || "https://www.linkedin.com/in/tejasv-kumar/"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BentoProfile;
