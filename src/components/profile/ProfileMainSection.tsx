
import React from 'react';
import { MapPin } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import ProfileQuote from '@/components/profile/ProfileQuote';
import { UserProfile } from '@/types/auth';

interface ProfileMainSectionProps {
  profile: UserProfile;
  hasPhotos: boolean;
  hasQuote: boolean;
}

const ProfileMainSection = ({ profile, hasPhotos, hasQuote }: ProfileMainSectionProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="bento-main-container">
      {hasPhotos && (
        <div className={`main-photo-container ${!hasQuote ? 'w-full' : ''}`}>
          <div className="main-photo">
            <img
              src={profile.photos[0]}
              alt={profile.name}
            />
          </div>
        </div>
      )}

      {(!hasPhotos && hasQuote) && (
        <div className="main-photo-container w-full">
          <div className="main-photo">
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500">No photo available</span>
            </div>
          </div>
        </div>
      )}

      {hasQuote && (
        <div className={`user-details-container ${!hasPhotos ? 'w-full' : ''}`}>
          <div className="user-info">
            <div className="flex items-baseline">
              <h2 className={`font-bold ${isMobile ? 'text-lg' : 'text-xl'} dark:text-foreground text-black`}>{profile.name}</h2>
              {profile.verified && (
                <span className="ml-1 text-blue-500">✓</span>
              )}
            </div>
            
            <div className={`${isMobile ? 'text-lg' : 'text-xl'} dark:text-foreground text-black`}>{profile.age}</div>
            
            {profile.location && (
              <div className="text-sm text-foreground/70 mt-2 flex items-center">
                <MapPin className="w-3.5 h-3.5 mr-1 text-red-400" />
                {profile.location}
              </div>
            )}
          </div>

          <div className="quote-card">
            <ProfileQuote quote={profile.quote || ""} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileMainSection;
