
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createInteraction, getUserInteractions } from '@/utils/matchUtils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Heart, Star, MapPin, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import MatchAnimation from '@/components/match/MatchAnimation';

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
  rating?: number;
  verified: boolean;
}

const Discover = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [matchedProfile, setMatchedProfile] = useState<{id: string; name: string; avatar?: string} | null>(null);
  const [showMatchAnimation, setShowMatchAnimation] = useState(false);
  
  // Fetch user interactions to filter out profiles already interacted with
  const { data: userInteractions = [], isLoading: interactionsLoading } = useQuery({
    queryKey: ['userInteractions'],
    queryFn: async () => {
      if (!user?.id) return [];
      return getUserInteractions(user.id);
    },
    enabled: !!user?.id
  });
  
  // Extract profile IDs the user has already interacted with
  const interactedProfileIds = userInteractions.map(i => i.target_profile_id);
  
  // Fetch profiles that haven't been interacted with yet
  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['discoverProfiles', interactedProfileIds],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const excludedIds = [...interactedProfileIds, user.id];
      
      // Handle empty excludedIds to avoid SQL error
      let query = supabase
        .from('profiles')
        .select(`
          id,
          name,
          age,
          location,
          occupation,
          religion,
          height,
          verified
        `);
        
      if (excludedIds.length > 0) {
        query = query.not('id', 'in', `(${excludedIds.join(',')})`);
      } else {
        query = query.neq('id', user.id); // At least exclude the current user
      }
      
      query = query.limit(10);
      
      const { data, error } = await query;
        
      if (error) {
        console.error('Error fetching profiles:', error);
        return [];
      }
      
      const profilesWithPhotos = await Promise.all(
        data.map(async (profile) => {
          const { data: photos } = await supabase
            .from('profile_photos')
            .select('url')
            .eq('profile_id', profile.id)
            .order('order_index', { ascending: true });
            
          return {
            ...profile,
            distance: `${Math.floor(Math.random() * 10) + 1} kms away`,
            photos: photos?.map(p => p.url) || [],
            rating: Math.floor(Math.random() * 2) + 4
          };
        })
      );
      
      return profilesWithPhotos;
    },
    enabled: !!user?.id
  });
  
  // Handle profile interactions (like, dislike, superlike)
  const interactionMutation = useMutation({
    mutationFn: async ({ 
      profileId, 
      type 
    }: { 
      profileId: string, 
      type: 'like' | 'dislike' | 'superlike' 
    }) => {
      if (!user?.id) throw new Error('User not authenticated');
      const result = await createInteraction(user.id, profileId, type);
      if (!result.success) throw new Error(`Failed to ${type} profile`);
      return { profileId, type, matched: result.matched };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['userInteractions'] });
      queryClient.invalidateQueries({ queryKey: ['discoverProfiles'] });
      
      // If a match occurred, show the match animation
      if (data.matched) {
        // Find the matched profile details
        const matchedProfileData = profiles.find(p => p.id === data.profileId);
        if (matchedProfileData) {
          setMatchedProfile({
            id: matchedProfileData.id,
            name: matchedProfileData.name,
            avatar: matchedProfileData.photos?.[0]
          });
          setShowMatchAnimation(true);
          
          // Also invalidate matches when a new match is created
          queryClient.invalidateQueries({ queryKey: ['userMatches'] });
          queryClient.invalidateQueries({ queryKey: ['likedByProfiles'] });
        }
      }
    }
  });
  
  const handleLike = (profileId: string) => {
    interactionMutation.mutate({ profileId, type: 'like' });
  };
  
  const handleDislike = (profileId: string) => {
    interactionMutation.mutate({ profileId, type: 'dislike' });
  };
  
  const handleSuperLike = (profileId: string) => {
    interactionMutation.mutate({ profileId, type: 'superlike' });
    toast.success('Super like sent!');
  };
  
  const handleViewProfile = (profileId: string) => {
    navigate(`/profile/${profileId}`);
  };
  
  // Handle closing the match animation
  const handleCloseMatchAnimation = () => {
    setShowMatchAnimation(false);
    setMatchedProfile(null);
  };
  
  // Show loading UI
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
  
  // Provide sample profiles if none are available
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
      rating: 5,
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
      rating: 4,
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
      rating: 4,
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
      rating: 5,
      verified: false
    }
  ];
  
  return (
    <div className="min-h-screen py-24 px-4 md:px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center">Discover</h1>
        
        <div className="space-y-4">
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
        
        {displayProfiles.length === 0 && (
          <div className="p-8 text-center bg-card rounded-xl shadow">
            <div className="text-6xl mb-4">✨</div>
            <h3 className="text-xl font-semibold mb-2">You've seen all profiles</h3>
            <p className="text-sm text-foreground/70 mb-6">
              Come back later for more matches
            </p>
          </div>
        )}
        
        <div className="mt-8 text-center">
          <p className="text-sm text-foreground/60">
            You have 20 likes remaining today
          </p>
        </div>
      </div>
      
      {/* Match Animation Dialog */}
      {matchedProfile && (
        <MatchAnimation 
          isOpen={showMatchAnimation}
          onClose={handleCloseMatchAnimation}
          matchedProfile={matchedProfile}
        />
      )}
    </div>
  );
};

interface ProfileCardProps {
  profile: Profile;
  onLike: () => void;
  onDislike: () => void;
  onSuperLike: () => void;
  onViewProfile: () => void;
}

const ProfileCard = ({ profile, onLike, onDislike, onSuperLike, onViewProfile }: ProfileCardProps) => {
  return (
    <Card className="overflow-hidden border-black border">
      <div className="flex flex-col sm:flex-row">
        <div className="relative w-full sm:w-1/3">
          <img 
            src={profile.photos[0] || 'https://via.placeholder.com/150'} 
            alt={profile.name}
            className="w-full h-48 sm:h-full object-cover"
          />
        </div>
        
        <CardContent className="p-4 flex-1 bg-black text-white">
          <div className="flex justify-between items-start mb-1">
            <div className="flex items-center gap-1">
              <h3 className="text-xl font-semibold">{profile.name}</h3>
              {profile.verified && (
                <Check className="h-4 w-4 text-vice-purple rounded-full bg-white p-0.5" />
              )}
            </div>
            <div className="flex items-center gap-1">
              <span>{profile.age}</span>
              <span className="text-gray-400">•</span>
              <span className="text-sm">{profile.distance}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1 mb-2">
            <MapPin className="h-3 w-3 text-red-500" />
            <span className="text-sm">{profile.location}</span>
          </div>
          
          <div className="mb-3">
            <span className="text-sm">Rating </span>
            <span className="text-yellow-400">{'★'.repeat(profile.rating || 0)}</span>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-3">
            {profile.height && (
              <span className="px-2 py-1 bg-white/10 rounded-full text-xs">
                {profile.height}
              </span>
            )}
            
            {profile.religion && (
              <span className="px-2 py-1 bg-white/10 rounded-full text-xs">
                {profile.religion}
              </span>
            )}
            
            {profile.occupation && (
              <span className="px-2 py-1 bg-white/10 rounded-full text-xs">
                {profile.occupation}
              </span>
            )}
          </div>
          
          <div className="flex justify-between mt-4">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="rounded-full bg-white/10 hover:bg-white/20 border-none text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewProfile();
                }}
              >
                View Profile
              </Button>
            </div>
            
            <div className="flex gap-3">
              <Button
                size="icon"
                variant="outline"
                className="rounded-full bg-white/5 hover:bg-white/15 border-none w-10 h-10"
                onClick={(e) => {
                  e.stopPropagation();
                  onDislike();
                }}
              >
                <X className="h-5 w-5 text-red-500" />
              </Button>
              
              <Button
                size="icon"
                variant="outline"
                className="rounded-full bg-white/5 hover:bg-white/15 border-none w-10 h-10"
                onClick={(e) => {
                  e.stopPropagation();
                  onSuperLike();
                }}
              >
                <Star className="h-5 w-5 text-orange-500" />
              </Button>
              
              <Button
                size="icon"
                variant="outline"
                className="rounded-full bg-white/5 hover:bg-white/15 border-none w-10 h-10"
                onClick={(e) => {
                  e.stopPropagation();
                  onLike();
                }}
              >
                <Heart className="h-5 w-5 text-purple-500" />
              </Button>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
};

export default Discover;
