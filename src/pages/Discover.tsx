import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createInteraction, getUserInteractions } from '@/utils/matchUtils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Heart, Star, MapPin, Check, Filter, List } from 'lucide-react';
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
  verified: boolean;
}

const Discover = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [matchedProfile, setMatchedProfile] = useState<{id: string; name: string; avatar?: string} | null>(null);
  const [showMatchAnimation, setShowMatchAnimation] = useState(false);
  
  const { data: userInteractions = [], isLoading: interactionsLoading } = useQuery({
    queryKey: ['userInteractions'],
    queryFn: async () => {
      if (!user?.id) return [];
      return getUserInteractions(user.id);
    },
    enabled: !!user?.id
  });
  
  const interactedProfileIds = userInteractions.map(i => i.target_profile_id);
  
  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['discoverProfiles', interactedProfileIds],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const excludedIds = [...interactedProfileIds, user.id];
      
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
        query = query.neq('id', user.id);
      }
      
      query = query.limit(20);
      
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
            photos: photos?.map(p => p.url) || []
          };
        })
      );
      
      return profilesWithPhotos;
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
      const result = await createInteraction(user.id, profileId, type);
      if (!result.success) throw new Error(`Failed to ${type} profile`);
      return { profileId, type, matched: result.matched };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['userInteractions'] });
      queryClient.invalidateQueries({ queryKey: ['discoverProfiles'] });
      
      if (data.matched) {
        const matchedProfileData = profiles.find(p => p.id === data.profileId);
        if (matchedProfileData) {
          setMatchedProfile({
            id: matchedProfileData.id,
            name: matchedProfileData.name,
            avatar: matchedProfileData.photos?.[0]
          });
          setShowMatchAnimation(true);
          
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
  
  const handleCloseMatchAnimation = () => {
    setShowMatchAnimation(false);
    setMatchedProfile(null);
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
          
          <Button variant="outline" size="sm" className="flex items-center gap-1">
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
    <Card className="overflow-hidden border border-black/10 hover:shadow-md transition-shadow">
      <div className="relative">
        <div 
          className="w-full h-[280px] bg-black cursor-pointer"
          onClick={onViewProfile}
        >
          {profile.photos && profile.photos.length > 0 ? (
            <img 
              src={profile.photos[0]} 
              alt={profile.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
              <span className="text-gray-400">No photo</span>
            </div>
          )}
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
          <div className="flex items-baseline justify-between">
            <h3 className="text-xl font-bold flex items-center">
              {profile.name} {profile.verified && <Check className="h-4 w-4 ml-1 bg-white text-blue-500 rounded-full p-0.5" />}
            </h3>
            <div className="flex items-center space-x-1">
              <span className="text-lg font-medium">{profile.age}</span>
              <span className="opacity-70">•</span>
              <span className="text-sm opacity-70">{profile.distance}</span>
            </div>
          </div>
          
          <div className="flex items-center mt-1 text-sm">
            <MapPin className="h-3 w-3 mr-1 text-red-400" />
            <span>{profile.location}</span>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-2">
            {profile.religion && (
              <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
                {profile.religion}
              </span>
            )}
            {profile.height && (
              <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
                {profile.height}
              </span>
            )}
            {profile.occupation && (
              <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
                {profile.occupation}
              </span>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex justify-between items-center p-3 bg-black text-white border-t border-gray-800">
        <Button 
          size="sm" 
          variant="ghost" 
          onClick={onViewProfile}
          className="text-white flex-1 hover:bg-white/10 mr-10"
        >
          View Profile
        </Button>
        
        <div className="flex gap-2">
          <button 
            onClick={onDislike}
            className="w-8 h-8 rounded-full bg-black shadow flex items-center justify-center border border-red-500 hover:bg-red-500/20 transition-colors"
            aria-label="Dislike"
          >
            <X className="h-4 w-4 text-red-500" />
          </button>
          
          <button 
            onClick={onSuperLike}
            className="w-8 h-8 rounded-full bg-black shadow flex items-center justify-center border border-orange-500 hover:bg-orange-500/20 transition-colors"
            aria-label="Super Like"
          >
            <Star className="h-4 w-4 text-orange-500" />
          </button>
          
          <button 
            onClick={onLike}
            className="w-8 h-8 rounded-full bg-black shadow flex items-center justify-center border border-purple-500 hover:bg-purple-500/20 transition-colors"
            aria-label="Like"
          >
            <Heart className="h-4 w-4 text-purple-500" />
          </button>
        </div>
      </div>
    </Card>
  );
};

export default Discover;
