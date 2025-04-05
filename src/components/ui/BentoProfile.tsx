
import React from 'react';
import { UserProfile } from '@/types/auth';
import { useIsMobile } from '@/hooks/use-mobile';
import { MapPin, UserRound, Pencil, ArrowRight } from 'lucide-react';
import ProfileDetailsCard from '@/components/profile/ProfileDetailsCard';
import ProfileAudio from '@/components/profile/ProfileAudio';
import ProfileTag from '@/components/ui/ProfileTag';
import ProfileBio from '@/components/profile/ProfileBio';
import ProfileQuote from '@/components/profile/ProfileQuote';
import ProfileFlirtingStyle from '@/components/profile/ProfileFlirtingStyle';
import ProfilePassion from '@/components/profile/ProfilePassion';
import ProfileSecondaryPhotos from '@/components/profile/ProfileSecondaryPhotos';
import { NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';
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
  
  // If profile is empty and it's the current user, show empty state
  if (isProfileEmpty && isCurrentUser) {
    return (
      <div className="p-8 bg-white dark:bg-card rounded-2xl shadow-md text-center">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-vice-purple/10 rounded-full">
            <UserRound className="w-12 h-12 text-vice-purple" />
          </div>
        </div>
        <h3 className="text-xl font-bold mb-4">Your Profile is Empty</h3>
        <p className="text-foreground/70 mb-6">
          Your profile is waiting to be filled with your personality, photos, and interests. 
          Complete your profile to connect with others!
        </p>
        <NavLink to="/edit-profile">
          <Button 
            className="bg-vice-purple hover:bg-vice-dark-purple flex items-center gap-2"
          >
            <Pencil className="w-4 h-4" /> Edit Your Profile <ArrowRight className="w-4 h-4" />
          </Button>
        </NavLink>
      </div>
    );
  }
  
  // If profile is empty but not the current user, show a different message
  if (isProfileEmpty && !isCurrentUser) {
    return (
      <div className="p-8 bg-white dark:bg-card rounded-2xl shadow-md text-center">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-vice-purple/10 rounded-full">
            <UserRound className="w-12 h-12 text-vice-purple" />
          </div>
        </div>
        <h3 className="text-xl font-bold mb-4">Profile Incomplete</h3>
        <p className="text-foreground/70 mb-6">
          This user hasn't completed their profile yet.
        </p>
      </div>
    );
  }
  
  return (
    <div className="w-full mx-auto">
      {/* Top section with main photo and user details */}
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
            </div>

            <div className="quote-card">
              <ProfileQuote quote={profile.quote || ""} />
            </div>
          </div>
        )}
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

        {(hasVicesOrKinks || hasSecondPhoto) && (
          <div className="bento-tags-photo-container">
            {(hasVices || hasKinks) && (
              <div className={`tags-container ${!hasSecondPhoto ? 'w-full' : ''}`}>
                {hasVices && (
                  <div className="vices-card bento-card p-4">
                    <h3 className="text-base font-semibold mb-2">Vices</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.vices?.slice(0, 5).map((vice, index) => (
                        <ProfileTag key={index} label={vice} type="vice" />
                      ))}
                    </div>
                  </div>
                )}

                {hasKinks && (
                  <div className="kinks-card bento-card p-4">
                    <h3 className="text-base font-semibold mb-2">Kinks</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.kinks?.slice(0, 5).map((kink, index) => (
                        <ProfileTag key={index} label={kink} type="kink" />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {hasSecondPhoto && (
              <div className={`secondary-photo-container ${!hasVicesOrKinks ? 'w-full' : ''}`}>
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
              <p className="text-base whitespace-normal break-words">
                <span className="font-medium">My idea of flirting is: </span>
                {typeof profile.flirtingStyle === 'string' 
                  ? profile.flirtingStyle 
                  : 'to be playful and fun'}
              </p>
            </div>
          </div>
        )}
        
        {/* Third photo after flirting style - now with square aspect ratio */}
        {hasThirdPhoto && (
          <div className="square-photo col-span-12 mt-[0.3125rem] bg-black rounded-2xl overflow-hidden">
            <img
              src={profile.photos[2]}
              alt={`${profile.name} third photo`}
              className="w-full h-full object-cover"
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
        
        {/* Fourth photo with passion (full width for each if one is missing) */}
        {(hasFourthPhoto || hasPassions) && (
          <div className="flex flex-row gap-[0.3125rem] w-full col-span-12 mt-[0.3125rem]">
            {hasFourthPhoto && (
              <div className={`${hasPassions ? 'w-1/2' : 'w-full'} bg-black rounded-2xl overflow-hidden h-[300px]`}>
                <img
                  src={profile.photos[3]}
                  alt={`${profile.name} fourth photo`}
                  className="w-full h-full object-cover"
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
        
        {/* Fifth and sixth photos stacked - now with square aspect ratio */}
        {(hasFifthPhoto || hasSixthPhoto) && (
          <div className="flex flex-col gap-[0.3125rem] col-span-12 mt-[0.3125rem]">
            {hasFifthPhoto && (
              <div className="square-photo bg-black rounded-2xl overflow-hidden">
                <img
                  src={profile.photos[4]}
                  alt={`${profile.name} fifth photo`}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            {hasSixthPhoto && (
              <div className="square-photo bg-black rounded-2xl overflow-hidden mt-[0.3125rem]">
                <img
                  src={profile.photos[5]}
                  alt={`${profile.name} sixth photo`}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BentoProfile;
