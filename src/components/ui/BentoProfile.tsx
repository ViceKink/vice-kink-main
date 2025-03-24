
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
import ProfileDetailsCard from '@/components/profile/ProfileDetailsCard';
import { MapPin } from 'lucide-react';

interface BentoProfileProps {
  profile: UserProfile;
  isCurrentUser?: boolean;
}

const BentoProfile = ({ profile, isCurrentUser = false }: BentoProfileProps) => {
  const isMobile = useIsMobile();
  
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
  const hasAboutDetails = !!(
    profile.about?.height || 
    profile.about?.zodiac || 
    profile.about?.religion || 
    profile.about?.languages?.length || 
    profile.about?.lifestyle?.smoking !== undefined || 
    profile.about?.lifestyle?.drinking
  );
  
  return (
    <div className="bento-grid px-2.5 w-full mx-auto">
      {/* Main Container - 60/40 split */}
      <div className="bento-container flex flex-col md:flex-row md:gap-4 w-full">
        {/* Main Photo - 60% width on desktop */}
        <div className="bento-section main-photo md:w-[60%] rounded-2xl overflow-hidden relative">
          {hasPhotos ? (
            <>
              <img
                src={profile.photos[0]}
                alt={profile.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white">
                <div className="flex items-baseline">
                  <h2 className="text-2xl font-bold">{profile.name}</h2>
                  <span className="ml-2">{profile.age}</span>
                  {profile.verified && (
                    <span className="ml-1 text-vice-purple">●</span>
                  )}
                </div>
                {profile.location && (
                  <div className="flex items-center text-sm mt-1">
                    <MapPin className="w-3.5 h-3.5 mr-1" />
                    <span>{profile.location}</span>
                  </div>
                )}
              </div>
              {hasSecondaryPhotos && (
                <div className="absolute bottom-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-xs">
                  {profile.photos.length} photos
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500">No photo available</span>
            </div>
          )}
        </div>

        {/* Right side content - 40% width on desktop */}
        <div className="bento-right-column md:w-[40%] flex flex-col gap-4">
          {/* User Info Card */}
          <div className="bento-section user-info bg-white dark:bg-card rounded-2xl p-4">
            <div className="flex flex-col">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  {profile.name} <span className="text-vice-purple">{profile.age}</span>
                </h3>
              </div>

              {profile.location && (
                <div className="text-sm text-foreground/70 mb-2 flex items-center">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-red-400" />
                  {profile.location}
                </div>
              )}
              
              {profile.about?.status && (
                <span className={`self-start inline-flex items-center px-2 py-1 rounded-full text-xs mt-2 ${
                  profile.about?.status === 'single' ? 'bg-vice-purple/10 text-vice-purple' : 
                  profile.about?.status === 'married' ? 'bg-vice-red/10 text-vice-red' : 
                  'bg-vice-orange/10 text-vice-orange'
                }`}>
                  {profile.about?.status}
                </span>
              )}
              
              {profile.about?.occupation && (
                <div className="mt-3">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-secondary text-secondary-foreground">
                    {profile.about?.occupation}
                  </span>
                </div>
              )}
              
              {/* Display zodiac here instead of in its own box */}
              {profile.about?.zodiac && (
                <div className="mt-3 flex items-center text-sm">
                  <span className="mr-1">☀️</span>
                  <span>{profile.about.zodiac}</span>
                </div>
              )}
            </div>
          </div>

          {/* Bio Section */}
          {hasBio && (
            <div className="bento-section bio bg-vice-red p-4 text-white rounded-2xl">
              <h3 className="text-lg font-semibold mb-2">My story</h3>
              <p className="text-sm">{profile.bio}</p>
            </div>
          )}
        </div>
      </div>

      {/* Audio Player Section */}
      {hasAudio && (
        <div className="bento-section audio col-span-12 row-span-1 rounded-2xl bg-vice-purple/10 p-0 overflow-hidden mt-4">
          <ProfileAudio audio={profile.audio} />
        </div>
      )}

      {/* User Details Section - Height, Religion, Languages, etc */}
      {hasAboutDetails && (
        <ProfileDetailsCard 
          profile={profile}
          className="bento-section details col-span-12 row-span-1 rounded-2xl mt-4"
        />
      )}

      {/* Vices Section */}
      {hasVices && (
        <div className="bento-section vices col-span-6 bg-white dark:bg-card p-4 rounded-2xl mt-4">
          <h3 className="text-base font-semibold mb-2">Vices</h3>
          <div className="flex flex-wrap gap-2">
            {profile.vices.map((vice, index) => (
              <span key={index} className="inline-flex items-center px-3 py-1.5 rounded-full border border-[#ff52b1]/20 bg-[#ff52b1]/10 text-foreground/70 text-sm">
                {vice}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Kinks Section */}
      {hasKinks && (
        <div className="bento-section kinks col-span-6 bg-white dark:bg-card p-4 rounded-2xl mt-4">
          <h3 className="text-base font-semibold mb-2">Kinks</h3>
          <div className="flex flex-wrap gap-2">
            {profile.kinks.map((kink, index) => (
              <span key={index} className="inline-flex items-center px-3 py-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 text-foreground/70 text-sm">
                {kink}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Secondary Photos Section */}
      {hasSecondaryPhotos && (
        <div className="bento-section photos col-span-6 row-span-3 bg-black rounded-2xl overflow-hidden mt-4">
          <div className="grid grid-cols-2 grid-rows-2 gap-1 h-full">
            {profile.photos.slice(1, 5).map((photo, index) => (
              <div key={index} className="relative overflow-hidden">
                <img
                  src={photo}
                  alt={`${profile.name} photo ${index + 2}`}
                  className="w-full h-full object-cover"
                />
                {index === 2 && profile.photos.length > 5 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
                    <span className="text-lg font-semibold">+{profile.photos.length - 4} photos</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Flirting Style Section */}
      {hasFlirtingStyle && (
        <div className="bento-section flirting col-span-12 bg-white dark:bg-card p-4 rounded-2xl mt-4">
          <div className="flex flex-col h-full justify-center">
            <p className="text-base">
              <span className="font-medium">My idea of flirting is: </span>
              {typeof profile.flirtingStyle === 'string' ? profile.flirtingStyle : 'to be playful and fun'}
            </p>
          </div>
        </div>
      )}

      {/* Passion Section */}
      {hasPassions && (
        <div className="bento-section passion col-span-6 bg-vice-orange p-4 text-white rounded-2xl mt-4">
          <div className="flex flex-col h-full justify-center">
            <p className="text-sm">
              I am passionate about: <span className="font-medium">{profile.passions[0]}</span>
            </p>
          </div>
        </div>
      )}

      {/* Quote Section */}
      <div className="bento-section quote col-span-6 bg-vice-orange p-4 text-white rounded-2xl mt-4">
        <div className="flex flex-col h-full justify-center">
          <p className="text-sm italic">
            "I'm such a Virgo, even my horoscope tells me to stop worrying about being a Virgo"
          </p>
        </div>
      </div>
    </div>
  );
};

export default BentoProfile;
