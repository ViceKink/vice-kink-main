
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
      <div className="aspect-[4/5] overflow-hidden bg-muted">
        {profile.is_revealed ? (
          <img
            src={profile.avatar || 'https://via.placeholder.com/400x500?text=No+Image'}
            alt={profile.name}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-pink-500/20">
            <Avatar className="w-24 h-24">
              <AvatarImage src={profile.avatar} alt={profile.name} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-lg">{profile.is_revealed ? profile.name : 'Hidden Profile'}</h3>
        {profile.is_revealed ? (
          <p className="text-sm text-muted-foreground">{profile.age} • {profile.location}</p>
        ) : (
          <p className="text-sm text-muted-foreground">Reveal to see details</p>
        )}
      </div>
    </div>
  );
};

export default ProfileCard;
