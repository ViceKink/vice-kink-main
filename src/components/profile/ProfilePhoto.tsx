
import React from 'react';

interface ProfilePhotoProps {
  src: string;
  alt: string;
  className?: string;
}

const ProfilePhoto = ({ src, alt, className = '' }: ProfilePhotoProps) => {
  return (
    <div className={`${className || 'w-full h-full'} bg-black rounded-2xl overflow-hidden`}>
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
      />
    </div>
  );
};

export default ProfilePhoto;
