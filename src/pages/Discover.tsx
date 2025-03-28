
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth';
import MatchAnimation from '@/components/match/MatchAnimation';
import DiscoverFilters from '@/components/discover/DiscoverFilters';
import { useQuery } from '@tanstack/react-query';
import ProfilesGrid from '@/components/discover/ProfilesGrid';
import DiscoverLoading from '@/components/discover/DiscoverLoading';
import EmptyProfilesState from '@/components/discover/EmptyProfilesState';
import { useProfileInteractions } from '@/hooks/useProfileInteractions';

import { fetchProfilesToDiscover } from '@/utils/match/profileService';
import { getUserInteractions } from '@/utils/match/interactionService';

const Discover = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<any>(user?.preferences || null);
  
  // Fetch user interactions
  const { data: userInteractions = [], isLoading: interactionsLoading } = useQuery({
    queryKey: ['userInteractions'],
    queryFn: async () => {
      if (!user?.id) return [];
      console.log('Fetching user interactions for:', user.id);
      return getUserInteractions(user.id);
    },
    enabled: !!user?.id
  });
  
  const interactedProfileIds = userInteractions.map((i: any) => i.target_profile_id);
  
  // Fetch profiles to discover
  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['discoverProfiles', interactedProfileIds, activeFilters],
    queryFn: async () => {
      if (!user?.id) return [];
      console.log('Fetching discover profiles for user:', user.id);
      console.log('Already interacted with:', interactedProfileIds.length, 'profiles');
      console.log('Filters:', activeFilters);
      return fetchProfilesToDiscover(user.id, interactedProfileIds, activeFilters);
    },
    enabled: !!user?.id
  });
  
  // Profile interaction handlers
  const { 
    matchedProfile, 
    showMatchAnimation,
    handleLike,
    handleDislike,
    handleSuperLike,
    handleCloseMatchAnimation
  } = useProfileInteractions(user?.id, profiles);
  
  const handleViewProfile = (profileId: string) => {
    navigate(`/profile/${profileId}`);
  };
  
  const handleApplyFilters = (preferences: any) => {
    setActiveFilters(preferences);
  };
  
  // Enhance profiles with rating if missing
  const enhanceProfiles = (profiles: any[]) => {
    return profiles.map(profile => ({
      ...profile,
      rating: profile.rating || Math.floor(Math.random() * 5) + 1,
      distance: profile.distance || `${Math.floor(Math.random() * 10) + 1} kms away`
    }));
  }
  
  // Display fallback profiles if none are available
  const displayProfiles = enhanceProfiles(profiles.length > 0 ? profiles : [
    {
      id: "profile-1",
      name: "Samuel John",
      age: 29,
      location: "Mumbai",
      distance: "4 kms away",
      photos: [
        "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=1000&auto=format&fit=crop",
      ],
      occupation: "Interior Designer",
      religion: "Christian",
      height: "5'10\"",
      verified: true
    },
    {
      id: "profile-2",
      name: "Dhruv Solanki",
      age: 31,
      location: "Mumbai",
      distance: "1.8 kms away",
      photos: [
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1000&auto=format&fit=crop",
      ],
      occupation: "Entrepreneur",
      religion: "Hindu",
      height: "6'1\"",
      verified: true
    },
    {
      id: "profile-3",
      name: "Shubh Dubey",
      age: 27,
      location: "Mumbai",
      distance: "2 kms away",
      photos: [
        "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=1000&auto=format&fit=crop",
      ],
      occupation: "Data Analyst",
      religion: "Hindu",
      height: "5'9\"",
      verified: true
    },
    {
      id: "profile-4",
      name: "Kunal Pandey",
      age: 27,
      location: "Mumbai",
      distance: "2 kms away",
      photos: [
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1000&auto=format&fit=crop",
      ],
      occupation: "Web Developer",
      religion: "Hindu",
      height: "5'8\"",
      verified: false
    }
  ]);
  
  return (
    <div className="min-h-screen py-24 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Discover</h1>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={() => setShowFilters(true)}
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>
        
        {isLoading || interactionsLoading ? (
          <DiscoverLoading />
        ) : displayProfiles.length === 0 ? (
          <EmptyProfilesState />
        ) : (
          <ProfilesGrid
            profiles={displayProfiles}
            onLike={handleLike}
            onDislike={handleDislike}
            onSuperLike={handleSuperLike}
            onViewProfile={handleViewProfile}
          />
        )}
        
        <div className="mt-8 text-center">
          <p className="text-sm text-foreground/60">
            You have 20 likes remaining today
          </p>
        </div>
      </div>
      
      {matchedProfile && (
        <MatchAnimation 
          isOpen={showMatchAnimation}
          onClose={handleCloseMatchAnimation}
          matchedProfile={matchedProfile}
        />
      )}
      
      <DiscoverFilters 
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        onApplyFilters={handleApplyFilters}
      />
    </div>
  );
};

export default Discover;
