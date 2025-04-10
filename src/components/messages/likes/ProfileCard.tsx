
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

export interface ProfileCardProps {
  profile: any;
  onSelectLike: () => void;
  onViewProfile?: () => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ profile, onSelectLike, onViewProfile }) => {
  const profileName = profile.name || 'Deleted User';
  const initials = profileName !== 'Deleted User' ? 
    profileName.split(' ').map((n: string) => n[0]).join('') : 
    'DU';
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (profile.is_revealed && onViewProfile) {
      onViewProfile();
    } else if (profile.is_revealed && profile.id) {
      navigate(`/profile/${profile.id}`);
    } else {
      onSelectLike();
    }
  };
  
  return (
    <div 
      className="relative cursor-pointer group bg-card"
      onClick={handleClick}
    >
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center">
          <Avatar className="w-12 h-12 mr-4">
            <AvatarImage src={profile.avatar} alt={profileName} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          
          <div>
            <h3 className="font-semibold text-lg">{profile.is_revealed ? profileName : 'Hidden Profile'}</h3>
            {profile.is_revealed ? (
              <p className="text-sm text-muted-foreground">{profile.age} • {profile.location}</p>
            ) : (
              <p className="text-sm text-muted-foreground">Reveal to see details</p>
            )}
          </div>
        </div>
        
        {profile.interaction_type === 'superlike' && (
          <Badge className="bg-red-500 hover:bg-red-600">Super Like</Badge>
        )}
        
        {profile.interaction_type === 'like' && profile.is_revealed && (
          <Badge className="bg-blue-500 hover:bg-blue-600">Like</Badge>
        )}
      </div>
    </div>
  );
};

export default ProfileCard;
