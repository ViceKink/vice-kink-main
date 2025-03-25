
import React from 'react';
import { UserProfile } from '@/types/auth';
import { cn } from '@/lib/utils';
import { Ruler, Sun, Church, Languages, Heart, Search, Cigarette, Wine, Briefcase, User } from 'lucide-react';

interface ProfileDetailsCardProps {
  profile: UserProfile;
  className?: string;
}

const ProfileDetailsCard = ({ profile, className }: ProfileDetailsCardProps) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'height':
        return <Ruler className="w-4 h-4" />;
      case 'zodiac':
        return <Sun className="w-4 h-4" />;
      case 'religion':
        return <Church className="w-4 h-4" />;
      case 'language':
        return <Languages className="w-4 h-4" />;
      case 'sexuality':
        return <Heart className="w-4 h-4" />;
      case 'smoking':
        return <Cigarette className="w-4 h-4" />;
      case 'drinking':
        return <Wine className="w-4 h-4" />;
      case 'flirting':
        return <Heart className="w-4 h-4" />;
      case 'looking':
        return <Search className="w-4 h-4" />;
      case 'occupation':
        return <Briefcase className="w-4 h-4" />;
      case 'status':
        return <User className="w-4 h-4" />;
      default:
        return null;
    }
  };
  
  // Add debug logging for troubleshooting
  console.log("Profile details card data:", {
    height: profile.about?.height,
    zodiac: profile.about?.zodiac,
    religion: profile.about?.religion,
    languages: profile.about?.languages,
    sexuality: profile.about?.sexuality,
    occupation: profile.about?.occupation,
    status: profile.about?.status
  });
  
  return (
    <div className={cn("bg-white dark:bg-card p-4 rounded-2xl", className)}>
      {/* First row of details */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {profile.about?.status && (
          <div className="flex items-center gap-2">
            <span className="text-vice-purple">{getIcon('status')}</span>
            <span className="text-sm">{profile.about.status}</span>
          </div>
        )}
        
        {profile.about?.height && (
          <div className="flex items-center gap-2">
            <span className="text-vice-purple">{getIcon('height')}</span>
            <span className="text-sm">{profile.about.height}</span>
          </div>
        )}
        
        {profile.about?.zodiac && (
          <div className="flex items-center gap-2">
            <span className="text-vice-purple">{getIcon('zodiac')}</span>
            <span className="text-sm">{profile.about.zodiac}</span>
          </div>
        )}
        
        {profile.about?.religion && (
          <div className="flex items-center gap-2">
            <span className="text-vice-purple">{getIcon('religion')}</span>
            <span className="text-sm">{profile.about.religion}</span>
          </div>
        )}
        
        {profile.about?.languages && profile.about.languages.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-vice-purple">{getIcon('language')}</span>
            <span className="text-sm">{profile.about.languages.join(', ')}</span>
          </div>
        )}
        
        {profile.about?.sexuality && (
          <div className="flex items-center gap-2">
            <span className="text-vice-purple">{getIcon('sexuality')}</span>
            <span className="text-sm">{profile.about.sexuality}</span>
          </div>
        )}
        
        {profile.about?.occupation && (
          <div className="flex items-center gap-2">
            <span className="text-vice-purple">{getIcon('occupation')}</span>
            <span className="text-sm">{profile.about.occupation}</span>
          </div>
        )}
      </div>
      
      {/* Row 2: Flirting Style */}
      {profile.flirtingStyle && (
        <div className="mt-4">
          <div className="flex items-center gap-2">
            <span className="text-vice-purple">{getIcon('flirting')}</span>
            <span className="text-sm">
              {typeof profile.flirtingStyle === 'string' ? profile.flirtingStyle : 'Playful and fun'}
            </span>
          </div>
        </div>
      )}
      
      {/* Row 3: Looking For */}
      {profile.lookingFor && (
        <div className="mt-4">
          <div className="flex items-center gap-2">
            <span className="text-vice-purple">{getIcon('looking')}</span>
            <span className="text-sm">{profile.lookingFor}</span>
          </div>
        </div>
      )}
      
      {/* Additional lifestyle items if needed */}
      <div className="mt-4 grid grid-cols-2 gap-4">
        {profile.about?.lifestyle?.smoking !== undefined && (
          <div className="flex items-center gap-2">
            <span className="text-vice-purple">{getIcon('smoking')}</span>
            <span className="text-sm">{profile.about.lifestyle.smoking ? 'Smoker' : 'Non-smoker'}</span>
          </div>
        )}
        
        {profile.about?.lifestyle?.drinking && (
          <div className="flex items-center gap-2">
            <span className="text-vice-purple">{getIcon('drinking')}</span>
            <span className="text-sm">{profile.about.lifestyle.drinking}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileDetailsCard;
