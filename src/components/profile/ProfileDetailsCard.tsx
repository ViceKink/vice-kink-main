
import React from 'react';
import { UserProfile } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

interface ProfileDetailsCardProps {
  profile: UserProfile;
  className?: string;
}

const ProfileDetailsCard = ({ profile, className }: ProfileDetailsCardProps) => {
  const getLifestyleIcon = (type: string) => {
    switch (type) {
      case 'height':
        return '📏';
      case 'zodiac':
        return '☀️';
      case 'religion':
        return '🙏';
      case 'language':
        return '🔤';
      case 'smoking':
        return profile.about?.lifestyle?.smoking ? '🚬' : '🚭';
      case 'drinking':
        return '🍷';
      case 'looking':
        return '👁️';
      case 'kids':
        return '👶';
      default:
        return '•';
    }
  };
  
  return (
    <div className={cn("bg-white dark:bg-card p-4", className)}>
      <div className="flex flex-wrap gap-3">
        {profile.about?.height && (
          <div className="flex items-center text-sm">
            <span className="mr-1">{getLifestyleIcon('height')}</span>
            <span>{profile.about.height}</span>
          </div>
        )}
        
        {profile.about?.zodiac && (
          <div className="flex items-center text-sm">
            <span className="mr-1">{getLifestyleIcon('zodiac')}</span>
            <span>{profile.about.zodiac}</span>
          </div>
        )}
        
        {profile.about?.religion && (
          <div className="flex items-center text-sm">
            <span className="mr-1">{getLifestyleIcon('religion')}</span>
            <span>{profile.about.religion}</span>
          </div>
        )}
        
        {profile.about?.languages && profile.about.languages.length > 0 && (
          <div className="flex items-center text-sm">
            <span className="mr-1">{getLifestyleIcon('language')}</span>
            <span>{profile.about.languages.join(', ')}</span>
          </div>
        )}
        
        {profile.about?.lifestyle?.smoking !== undefined && (
          <div className="flex items-center text-sm">
            <span className="mr-1">{getLifestyleIcon('smoking')}</span>
            <span>{profile.about.lifestyle.smoking ? 'smoker' : 'non-smoker'}</span>
          </div>
        )}
        
        {profile.about?.lifestyle?.drinking && (
          <div className="flex items-center text-sm">
            <span className="mr-1">{getLifestyleIcon('drinking')}</span>
            <span>{profile.about.lifestyle.drinking}</span>
          </div>
        )}
        
        {profile.lookingFor && (
          <div className="flex items-center text-sm">
            <span className="mr-1">{getLifestyleIcon('looking')}</span>
            <span>{profile.lookingFor}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileDetailsCard;
