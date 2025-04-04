import React from 'react';
import ProfileCard from './ProfileCard';
import { DiscoverProfile } from '@/utils/match/types';

interface ProfilesGridProps {
  profiles: DiscoverProfile[];
}

const ProfilesGrid: React.FC<ProfilesGridProps> = ({ profiles }) => {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {profiles.map((profile) => (
        <ProfileCard key={profile.id} profile={profile} />
      ))}
    </div>
  );
};

export default ProfilesGrid;
