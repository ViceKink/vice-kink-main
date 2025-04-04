
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth';
import { useQuery } from '@tanstack/react-query';
import DiscoverFilters from '@/components/discover/DiscoverFilters';
import ProfilesGrid from '@/components/discover/ProfilesGrid';
import DiscoverLoading from '@/components/discover/DiscoverLoading';
import EmptyProfilesState from '@/components/discover/EmptyProfilesState';
import { DiscoverProfile } from '@/utils/match/types';
import { matchingService } from '@/utils/matchUtils';

const Discover = () => {
  const { user } = useAuth();
  const [distance, setDistance] = useState(50);
  const [sortOption, setSortOption] = useState('distance');

  // Fetch profiles
  const { data: profiles = [], isLoading, refetch } = useQuery({
    queryKey: ['discoverProfiles', distance, sortOption],
    queryFn: async () => {
      if (!user) return [];
      return await matchingService.getCompatibleProfiles(user.id, distance, sortOption);
    },
    enabled: !!user?.id
  });

  return (
    <div className="min-h-screen pt-16 pb-20">
      <DiscoverFilters 
        distance={distance}
        setDistance={setDistance}
        sortOption={sortOption}
        setSortOption={setSortOption}
      />
      
      {isLoading ? (
        <DiscoverLoading />
      ) : profiles.length === 0 ? (
        <EmptyProfilesState refetch={refetch} />
      ) : (
        <ProfilesGrid 
          profiles={profiles as DiscoverProfile[]} 
        />
      )}
    </div>
  );
};

export default Discover;
