
import React from 'react';
import ProfileVicesKinks from './ProfileVicesKinks';
import ProfilePhoto from './ProfilePhoto';

interface ProfileTagsPhotoSectionProps {
  vices?: string[];
  kinks?: string[];
  secondPhoto?: string;
  name: string;
}

const ProfileTagsPhotoSection = ({ vices, kinks, secondPhoto, name }: ProfileTagsPhotoSectionProps) => {
  const hasVices = vices && vices.length > 0;
  const hasKinks = kinks && kinks.length > 0;
  const hasVicesOrKinks = hasVices || hasKinks;
  const hasSecondPhoto = !!secondPhoto;
  
  if (!hasVicesOrKinks && !hasSecondPhoto) return null;
  
  return (
    <div className="bento-tags-photo-container">
      {(hasVices || hasKinks) && (
        <ProfileVicesKinks 
          vices={vices} 
          kinks={kinks} 
          hasSecondPhoto={hasSecondPhoto} 
        />
      )}

      {hasSecondPhoto && (
        <div className={`secondary-photo-container ${!hasVicesOrKinks ? 'w-full' : ''}`}>
          <div className="secondary-photo-card">
            <ProfilePhoto 
              src={secondPhoto} 
              alt={`${name} second photo`} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileTagsPhotoSection;
