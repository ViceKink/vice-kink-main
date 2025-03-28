
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EmailSwiper from '@/components/ui/EmailSwiper';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { checkIfMatched, createMatch } from '@/utils/matchUtils';

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
  
  const { data: userInteractions = [], isLoading: interactionsLoading } = useQuery({
    queryKey: ['userInteractions'],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('profile_interactions')
        .select('target_profile_id, interaction_type')
        .eq('user_id', user.id);
        
      if (error) {
        console.error('Error fetching interactions:', error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!user?.id
  });
  
  const likedProfileIds = userInteractions
    .filter(i => i.interaction_type === 'like')
    .map(i => i.target_profile_id);
    
  const dislikedProfileIds = userInteractions
    .filter(i => i.interaction_type === 'dislike')
    .map(i => i.target_profile_id);
  
  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['discoverProfiles', likedProfileIds, dislikedProfileIds],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const excludedIds = [...likedProfileIds, ...dislikedProfileIds, user.id];
      
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
  
  const interactionMutation = useMutation({
    mutationFn: async ({ profileId, type }: { profileId: string, type: 'like' | 'dislike' | 'superlike' }) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('profile_interactions')
        .insert({
          user_id: user.id,
          target_profile_id: profileId,
          interaction_type: type
        });
        
      if (error) throw error;
      
      // Check if this is a match when the user likes another profile
      if (type === 'like' || type === 'superlike') {
        const isMatched = await checkIfMatched(user.id, profileId);
        
        if (isMatched) {
          await createMatch(user.id, profileId);
          
          // Invalidate matches query to update the UI
          queryClient.invalidateQueries({ queryKey: ['userMatches'] });
        }
      }
      
      return { profileId, type };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userInteractions'] });
      queryClient.invalidateQueries({ queryKey: ['discoverProfiles'] });
    }
  });
  
  const handleLike = (profileId: string) => {
    interactionMutation.mutate({ profileId, type: 'like' });
    toast.success('Profile liked!');
  };
  
  const handleDislike = (profileId: string) => {
    interactionMutation.mutate({ profileId, type: 'dislike' });
  };
  
  const handleSuperLike = (profileId: string) => {
    interactionMutation.mutate({ profileId, type: 'superlike' });
    toast.success('Super like sent!');
  };
  
  const handleViewProfile = (profileId: string) => {
    console.log('Viewing profile:', profileId);
    navigate(`/profile/${profileId}`);
  };
  
  const handleOpenFilters = () => {
    console.log('Opening filters');
    toast.info('Filters coming soon!');
  };
  
  // Show loading UI
  if (isLoading || interactionsLoading) {
    return (
      <div className="min-h-screen py-24 px-4 md:px-6 flex justify-center items-center">
        <div className="animate-pulse text-center">
          <div className="h-8 w-40 bg-gray-300 rounded mb-4 mx-auto"></div>
          <div className="h-[400px] w-full max-w-md bg-gray-300 rounded"></div>
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
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1000&auto=format&fit=crop"
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
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1000&auto=format&fit=crop"
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
        "https://images.unsplash.com/photo-1499996860823-5214fcc65f8f?q=80&w=1000&auto=format&fit=crop"
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
        "https://images.unsplash.com/photo-1557862921-37829c790f19?q=80&w=1000&auto=format&fit=crop"
      ],
      occupation: "Web Developer",
      religion: "Hindu",
      height: "5'8\"",
      rating: 5,
      verified: false
    },
    {
      id: "profile-5",
      name: "Rohit Bansal",
      age: 28,
      location: "Mumbai",
      distance: "2 kms away",
      photos: [
        "https://images.unsplash.com/photo-1499996860823-5214fcc65f8f?q=80&w=1000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1000&auto=format&fit=crop"
      ],
      occupation: "Photographer",
      religion: "Hindu",
      height: "5'9\"",
      rating: 4,
      verified: true
    }
  ];
  
  return (
    <div className="min-h-screen py-24 px-4 md:px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center">Discover</h1>
        
        <EmailSwiper
          profiles={displayProfiles}
          onLike={handleLike}
          onDislike={handleDislike}
          onSuperLike={handleSuperLike}
          onViewProfile={handleViewProfile}
          onOpenFilters={handleOpenFilters}
        />
        
        <div className="mt-8 text-center">
          <p className="text-sm text-foreground/60">
            You have 20 likes remaining today
          </p>
        </div>
      </div>
    </div>
  );
};

export default Discover;
