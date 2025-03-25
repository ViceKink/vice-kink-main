
import React from 'react';
import ProfileSection from '@/components/profile/ProfileSection';
import { Verified, Heart, MapPin } from 'lucide-react';
import { UserProfile } from '@/context/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';

interface ProfileHeaderProps {
  profile: UserProfile;
  isCurrentUser: boolean;
  hasPhotos: boolean;
  currentRow: number;
}

const ProfileHeader = ({ profile, isCurrentUser, hasPhotos, currentRow }: ProfileHeaderProps) => {
  const isMobile = useIsMobile();
  
  return (
    <>
      {/* Main Photo - only show if photos exist */}
      {hasPhotos && (
        <ProfileSection 
          gridSpan={{
            cols: isMobile ? "col-span-6" : "col-span-7",
            rows: "row-span-4",
            colsStart: "col-start-1",
            rowsStart: `row-start-${currentRow.toString()}`
          }}
          className="relative bg-black"
        >
          <img
            src={profile.photos[0]}
            alt={profile.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white">
            <div className="flex items-baseline">
              <h2 className="text-2xl font-bold">{profile.name}</h2>
              {profile.verified && (
                <Verified className="w-5 h-5 ml-1 text-vice-purple" />
              )}
            </div>
            <div className="flex items-center text-sm mt-1">
              <MapPin className="w-3 h-3 mr-1" />
              <span>{profile.location || 'No location'}</span>
            </div>
          </div>
        </ProfileSection>
      )}

      {/* User Info - always show */}
      <ProfileSection
        gridSpan={{
          cols: isMobile ? "col-span-6" : "col-span-5",
          rows: "row-span-2",
          colsStart: isMobile ? "col-start-1" : (hasPhotos ? "col-start-8" : "col-start-1"),
          rowsStart: isMobile && hasPhotos ? `row-start-${(currentRow + 1).toString()}` : "row-start-1"
        }}
        className="bg-white dark:bg-card p-4"
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between">
            {/* Remove duplicate name, just show age */}
            <h3 className="text-lg font-semibold">
              {!hasPhotos && <span>{profile.name} </span>}
              <span className="text-vice-purple">{profile.age}</span>
            </h3>
            {!isCurrentUser && (
              <button className="rounded-full p-2 bg-vice-purple/10 hover:bg-vice-purple/20 text-vice-purple transition-all">
                <Heart className="w-4 h-4" />
              </button>
            )}
          </div>
          
          <div className="mt-2 flex items-center">
            {profile.about?.status && (
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                profile.about?.status === 'single' ? 'bg-vice-purple/10 text-vice-purple' : 
                profile.about?.status === 'married' ? 'bg-vice-red/10 text-vice-red' : 
                'bg-vice-orange/10 text-vice-orange'
              }`}>
                {profile.about?.status}
              </span>
            )}
          </div>
          
          {profile.about?.occupation && (
            <div className="mt-3 flex items-center">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-secondary text-secondary-foreground">
                {profile.about?.occupation}
              </span>
            </div>
          )}
          
          <div className="mt-auto">
            <div className="flex flex-wrap gap-2 mt-2">
              {profile.about?.height && (
                <div className="flex items-center text-xs text-foreground/70">
                  <span className="font-semibold">{profile.about?.height}</span>
                </div>
              )}
              
              {profile.about?.zodiac && (
                <div className="flex items-center text-xs text-foreground/70">
                  <span>{profile.about.zodiac}</span>
                </div>
              )}
              
              {profile.about?.religion && (
                <div className="flex items-center text-xs text-foreground/70">
                  <span>{profile.about.religion}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </ProfileSection>
    </>
  );
};

export default ProfileHeader;
