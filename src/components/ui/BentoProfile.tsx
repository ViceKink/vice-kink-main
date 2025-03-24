
import React from 'react';
import { UserProfile } from '@/types/auth';
import { useIsMobile } from '@/hooks/use-mobile';
import { MapPin } from 'lucide-react';
import ProfileDetailsCard from '@/components/profile/ProfileDetailsCard';
import '../ui/bento-grid.css';

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
    <div className="bento-grid w-full mx-auto">
      {/* Main Container with 60/40 split maintained on both desktop and mobile */}
      <div className="bento-main-container">
        {/* Left side - Main Photo - 60% width on both desktop and mobile */}
        <div className="main-photo-container">
          <div className="main-photo">
            {hasPhotos ? (
              <>
                <img
                  src={profile.photos[0]}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
                {hasSecondaryPhotos && (
                  <div className="photo-count">
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
        </div>

        {/* Right side - User Info & Bio - 40% width on both desktop and mobile */}
        <div className="user-details-container">
          {/* User Info Card */}
          <div className="bento-section user-info rounded-2xl">
            <div className="flex flex-col">
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
              
              {/* Relationship status */}
              {profile.about?.status && (
                <div className="mt-3">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                    profile.about?.status === 'single' ? 'bg-vice-purple/10 text-vice-purple' : 
                    profile.about?.status === 'married' ? 'bg-vice-red/10 text-vice-red' : 
                    'bg-vice-orange/10 text-vice-orange'
                  }`}>
                    {profile.about?.status}
                  </span>
                </div>
              )}
              
              {/* Occupation */}
              {profile.about?.occupation && (
                <div className="mt-3">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-secondary text-secondary-foreground">
                    {profile.about?.occupation}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Bio Section */}
          {hasBio && (
            <div className="bento-section bio rounded-2xl">
              <p className={`${isMobile ? 'text-xs' : 'text-sm'}`}>{profile.bio}</p>
            </div>
          )}
        </div>
      </div>

      {/* Remaining sections (kept for other parts of the profile) */}
      {/* Audio Player Section */}
      {hasAudio && profile.audio && (
        <div className="bento-section audio rounded-2xl bg-vice-purple/10 p-0 overflow-hidden">
          <div className="w-full bg-vice-purple/10 p-4">
            <div className="flex items-center gap-3">
              <div className="bg-vice-purple text-white rounded-full p-2 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <path d="M12 18.5a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13Z"></path>
                  <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"></path>
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">{profile.audio.title || "Voice Note"}</div>
                <div className="text-xs text-foreground/60">Tap to play</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Details Section */}
      {hasAboutDetails && (
        <ProfileDetailsCard 
          profile={profile}
          className="bento-section details rounded-2xl"
        />
      )}

      {/* Vices Section */}
      {hasVices && (
        <div className="bento-section vices bg-white dark:bg-card p-4 rounded-2xl">
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
        <div className="bento-section kinks bg-white dark:bg-card p-4 rounded-2xl">
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
        <div className="bento-section photos bg-black rounded-2xl overflow-hidden">
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
        <div className="bento-section flirting bg-white dark:bg-card p-4 rounded-2xl">
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
        <div className="bento-section passion bg-vice-orange p-4 text-white rounded-2xl">
          <div className="flex flex-col h-full justify-center">
            <p className="text-sm">
              I am passionate about: <span className="font-medium">{profile.passions[0]}</span>
            </p>
          </div>
        </div>
      )}

      {/* Quote Section */}
      <div className="bento-section quote bg-vice-orange p-4 text-white rounded-2xl">
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
