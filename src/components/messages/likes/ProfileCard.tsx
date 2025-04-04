
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export interface ProfileCardProps {
  profile: any;
  onSelectLike: () => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ profile, onSelectLike }) => {
  const initials = profile.name ? profile.name.split(' ').map((n: string) => n[0]).join('') : '?';
  
  return (
    <div 
      className="relative cursor-pointer group bg-slate-50"
      onClick={onSelectLike}
    >
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center">
          <Avatar className="w-12 h-12 mr-4">
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
        
        {profile.type === 'superlike' && (
          <Badge className="bg-red-500 hover:bg-red-600">Super Like</Badge>
        )}
        
        {profile.type === 'like' && profile.is_revealed && (
          <Badge className="bg-blue-500 hover:bg-blue-600">Like</Badge>
        )}
      </div>
    </div>
  );
};

export default ProfileCard;
