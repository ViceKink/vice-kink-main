
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import ProfileCard from '@/components/discover/ProfileCard';

interface Profile {
  id: string;
  name: string;
  age: number;
  location: string;
  distance: string;
  photos: string[];
  occupation?: string;
  religion?: string;
  height?: string;
  verified: boolean;
  rating?: number;
}

interface ProfilesGridProps {
  profiles: Profile[];
  onLike: (profileId: string) => void;
  onDislike: (profileId: string) => void;
  onSuperLike: (profileId: string) => void;
  onViewProfile: (profileId: string) => void;
}

const ProfilesGrid = ({ 
  profiles, 
  onLike, 
  onDislike, 
  onSuperLike, 
  onViewProfile 
}: ProfilesGridProps) => {
  return (
    <ScrollArea className="h-[calc(100vh-200px)]">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {profiles.map((profile) => (
          <ProfileCard 
            key={profile.id}
            profile={profile}
            onLike={() => onLike(profile.id)}
            onDislike={() => onDislike(profile.id)}
            onSuperLike={() => onSuperLike(profile.id)}
            onViewProfile={() => onViewProfile(profile.id)}
          />
        ))}
      </div>
    </ScrollArea>
  );
};

export default ProfilesGrid;
