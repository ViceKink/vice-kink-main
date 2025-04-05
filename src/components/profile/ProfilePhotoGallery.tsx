
import React from 'react';
import ProfilePhoto from './ProfilePhoto';

interface ProfilePhotoGalleryProps {
  photos: string[];
  name: string;
  startIndex: number;
}

const ProfilePhotoGallery = ({ photos, name, startIndex = 0 }: ProfilePhotoGalleryProps) => {
  if (!photos || photos.length <= startIndex) return null;
  
  return (
    <div className="flex flex-col gap-[0.3125rem] col-span-12 mt-[0.3125rem]">
      {photos.length > startIndex && (
        <div className="square-photo">
          <ProfilePhoto 
            src={photos[startIndex]} 
            alt={`${name} photo ${startIndex + 1}`} 
          />
        </div>
      )}
      
      {photos.length > startIndex + 1 && (
        <div className="square-photo mt-[0.3125rem]">
          <ProfilePhoto 
            src={photos[startIndex + 1]} 
            alt={`${name} photo ${startIndex + 2}`} 
          />
        </div>
      )}
    </div>
  );
};

export default ProfilePhotoGallery;
