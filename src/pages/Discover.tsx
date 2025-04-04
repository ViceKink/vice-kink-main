
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/auth';
import { useProfileInteractions } from '@/hooks/useProfileInteractions';
import { matchingService } from '@/utils/match';
import MatchAnimation from '@/components/match/MatchAnimation';
import DiscoverFilters from '@/components/discover/DiscoverFilters';
import ProfilesGrid from '@/components/discover/ProfilesGrid';
import DiscoverLoading from '@/components/discover/DiscoverLoading';
import EmptyProfilesState from '@/components/discover/EmptyProfilesState';

// Distance options in kilometers
const distanceOptions = [5, 10, 25, 50, 100];

const Discover = () => {
  const { user } = useAuth();
  const userId = user?.id || '';
  
  // Filter state
  const [distance, setDistance] = useState<number>(25);
  const [sortOption, setSortOption] = useState<string>('most_recent');
  const [showMatchAnimation, setShowMatchAnimation] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState<any>(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  
  // Get profile interactions methods (like, reject)
  const { 
    likeProfile, 
    superLikeProfile,
    rejectProfile, 
    isLiking, 
    isSuperLiking,
    isRejecting 
  } = useProfileInteractions(userId);
  
  // Query compatible profiles
  const { 
    data: profiles = [], 
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ['discover', userId, distance, sortOption],
    queryFn: () => matchingService.getCompatibleProfiles(userId, distance, sortOption),
    enabled: !!userId,
  });
  
  // Handle like button click
  const handleLike = (profileId: string) => {
    likeProfile(profileId, {
      onSuccess: (result: any) => {
        if (result.isMatch) {
          // Show match animation
          const matchedProfile = profiles.find((p: any) => p.id === profileId);
          setMatchedProfile(matchedProfile);
          setShowMatchAnimation(true);
        }
      }
    });
  };
  
  // Handle super like button click
  const handleSuperLike = (profileId: string) => {
    superLikeProfile(profileId, {
      onSuccess: (result: any) => {
        if (result.isMatch) {
          // Show match animation
          const matchedProfile = profiles.find((p: any) => p.id === profileId);
          setMatchedProfile(matchedProfile);
          setShowMatchAnimation(true);
        }
      }
    });
  };
  
  // Handle filter changes
  const handleDistanceChange = (value: number) => {
    setDistance(value);
  };
  
  const handleSortChange = (value: string) => {
    setSortOption(value);
  };

  const handleOpenFilters = () => {
    setIsFiltersOpen(true);
  };

  const handleCloseFilters = () => {
    setIsFiltersOpen(false);
  };

  const handleApplyFilters = (preferences: any) => {
    // Update local filter state based on preferences
    if (preferences.max_distance) {
      setDistance(preferences.max_distance);
    }
    // Additional filter handling as needed
  };
  
  if (isLoading) {
    return <DiscoverLoading />;
  }
  
  return (
    <div className="container max-w-screen-xl mx-auto pt-20 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start mb-8">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">Discover</h1>
        
        <Button 
          onClick={handleOpenFilters}
          className="flex items-center gap-2"
        >
          <SlidersHorizontal size={18} />
          Filters
        </Button>
      </div>
      
      <DiscoverFilters
        isOpen={isFiltersOpen}
        onClose={handleCloseFilters}
        onApplyFilters={handleApplyFilters}
      />
      
      {isError ? (
        <div className="text-center py-10">
          <p className="text-red-500">Error loading profiles. Please try again.</p>
          <button
            onClick={() => refetch()}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      ) : profiles.length > 0 ? (
        <ProfilesGrid
          profiles={profiles}
          onLike={handleLike}
          onSuperLike={handleSuperLike}
          onDislike={rejectProfile}
          onViewProfile={() => {}}
        />
      ) : (
        <EmptyProfilesState onRefresh={refetch} />
      )}
      
      {showMatchAnimation && matchedProfile && (
        <MatchAnimation
          isOpen={showMatchAnimation}
          onClose={() => setShowMatchAnimation(false)}
          matchedProfile={matchedProfile}
        />
      )}
    </div>
  );
};

export default Discover;
