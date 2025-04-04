
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export interface ProfileCardProps {
  profile: any;
  onSelectLike: () => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ profile, onSelectLike }) => {
  const initials = profile.name ? profile.name.split(' ').map((n: string) => n[0]).join('') : '?';
  
  return (
    <div 
      className="relative cursor-pointer group"
      onClick={onSelectLike}
    >
      <div className="bg-muted p-4 flex items-center">
        <Avatar className="w-14 h-14 mr-4">
          <AvatarImage src={profile.avatar} alt={profile.name} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        
        <div>
          <h3 className="font-semibold text-lg">{profile.is_revealed ? profile.name : 'Hidden Profile'}</h3>
          {profile.is_revealed ? (
            <p className="text-sm text-muted-foreground">{profile.age} • {profile.location}</p>
          ) : (
            <p className="text-sm text-muted-foreground">Reveal to see details</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
