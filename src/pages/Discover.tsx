
import React, { useState, useEffect, useCallback } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { X, Heart, Star, Filter, Sliders } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import ProfileCard from '@/components/discover/ProfileCard';
import { useAuth } from '@/context/auth';
import { cn } from '@/lib/utils';
import MatchAnimation from '@/components/match/MatchAnimation';
import DiscoverFilters from '@/components/discover/DiscoverFilters';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { fetchProfilesToDiscover } from '@/utils/match/profileService';
import { getUserInteractions, createInteraction } from '@/utils/match/interactionService';

interface Profile {
  id: string;
  name: string;
  age: number;
  location: string;
  distance?: string;
  photos: string[];
  occupation?: string;
  religion?: string;
  height?: string;
  verified: boolean;
}

const Discover = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [matchedProfile, setMatchedProfile] = useState<{id: string; name: string; avatar?: string} | null>(null);
  const [showMatchAnimation, setShowMatchAnimation] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<any>(user?.preferences || null);
  
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
  
  const interactionMutation = useMutation({
    mutationFn: async ({ 
      profileId, 
      type 
    }: { 
      profileId: string, 
      type: 'like' | 'dislike' | 'superlike' 
    }) => {
      if (!user?.id) throw new Error('User not authenticated');
      console.log('Creating interaction:', user.id, '->', profileId, ':', type);
      const result = await createInteraction(user.id, profileId, type);
      console.log('Interaction result:', result);
      if (!result.success) throw new Error(`Failed to ${type} profile`);
      return { profileId, type, matched: result.matched };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['userInteractions'] });
      queryClient.invalidateQueries({ queryKey: ['discoverProfiles'] });
      
      if (data.matched) {
        console.log('Match found!', data);
        const matchedProfileData = profiles.find((p: Profile) => p.id === data.profileId);
        if (matchedProfileData) {
          setMatchedProfile({
            id: matchedProfileData.id,
            name: matchedProfileData.name,
            avatar: matchedProfileData.photos?.[0]
          });
          setShowMatchAnimation(true);
          
          // Update matches and likes data
          queryClient.invalidateQueries({ queryKey: ['userMatches'] });
          queryClient.invalidateQueries({ queryKey: ['likedByProfiles'] });
        }
      }
    },
    onError: (error) => {
      console.error('Error in interaction:', error);
      toast.error('Failed to interact with profile');
    }
  });
  
  const handleLike = (profileId: string) => {
    console.log('Like button clicked for', profileId);
    interactionMutation.mutate({ profileId, type: 'like' });
  };
  
  const handleDislike = (profileId: string) => {
    console.log('Dislike button clicked for', profileId);
    interactionMutation.mutate({ profileId, type: 'dislike' });
  };
  
  const handleSuperLike = (profileId: string) => {
    console.log('Super like button clicked for', profileId);
    interactionMutation.mutate({ profileId, type: 'superlike' });
    toast.success('Super like sent!');
  };
  
  const handleViewProfile = (profileId: string) => {
    navigate(`/profile/${profileId}`);
  };
  
  const handleCloseMatchAnimation = () => {
    setShowMatchAnimation(false);
    setMatchedProfile(null);
  };
  
  const handleApplyFilters = (preferences: any) => {
    setActiveFilters(preferences);
  };
  
  if (isLoading || interactionsLoading) {
    return (
      <div className="min-h-screen py-24 px-4 md:px-6 flex justify-center items-center">
        <div className="animate-pulse text-center space-y-4">
          <div className="h-8 w-40 bg-gray-300 rounded mx-auto"></div>
          <div className="h-48 w-full max-w-md bg-gray-300 rounded mx-auto"></div>
          <div className="h-48 w-full max-w-md bg-gray-300 rounded mx-auto"></div>
        </div>
      </div>
    );
  }
  
  const displayProfiles = profiles.length > 0 ? profiles : [
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
  ];
  
  return (
    <div className="min-h-screen py-24 px-4 md:px-6">
      <div className="max-w-4xl mx-auto">
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
        
        {displayProfiles.length === 0 ? (
          <div className="p-8 text-center bg-card rounded-xl shadow">
            <div className="text-6xl mb-4">✨</div>
            <h3 className="text-xl font-semibold mb-2">You've seen all profiles</h3>
            <p className="text-sm text-foreground/70 mb-6">
              Come back later for more matches
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayProfiles.map((profile) => (
              <ProfileCard 
                key={profile.id}
                profile={profile}
                onLike={() => handleLike(profile.id)}
                onDislike={() => handleDislike(profile.id)}
                onSuperLike={() => handleSuperLike(profile.id)}
                onViewProfile={() => handleViewProfile(profile.id)}
              />
            ))}
          </div>
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
