
import React from 'react';
import { Button } from "@/components/ui/button";
import { Heart, X, Star } from "lucide-react";
import { useAuth } from '@/context/auth';
import { toast } from "sonner";
import { createInteraction } from '@/utils/matchUtils';
import { DiscoverProfile } from '@/utils/match/types';

interface ProfilesGridProps {
  profiles: DiscoverProfile[];
}

const ProfilesGrid: React.FC<ProfilesGridProps> = ({ profiles }) => {
  const { user } = useAuth();

  const handleLike = async (profileId: string) => {
    if (!user?.id) return;
    try {
      const result = await createInteraction(user.id, profileId, 'like');
      if (result.matched) {
        toast.success("It's a match!");
      } else {
        toast.success('You liked this profile!');
      }
    } catch (error) {
      console.error('Error liking profile:', error);
      toast.error('Failed to like profile');
    }
  };

  const handleDislike = async (profileId: string) => {
    if (!user?.id) return;
    try {
      await createInteraction(user.id, profileId, 'dislike');
    } catch (error) {
      console.error('Error disliking profile:', error);
      toast.error('Failed to dislike profile');
    }
  };

  const handleSuperLike = async (profileId: string) => {
    if (!user?.id) return;
    try {
      const result = await createInteraction(user.id, profileId, 'superlike');
      if (result.matched) {
        toast.success("It's a super match!");
      } else {
        toast.success('You super liked this profile!');
      }
    } catch (error) {
      console.error('Error super liking profile:', error);
      toast.error('Failed to super like profile');
    }
  };

  return (
    <div className="grid gap-4 px-2 pb-4">
      {profiles.map((profile) => (
        <div key={profile.id} className="bg-card border border-border rounded-xl overflow-hidden shadow">
          <div className="relative">
            <div className="w-full h-[320px] bg-background">
              {profile.photos && profile.photos.length > 0 ? (
                <img 
                  src={profile.photos[0]} 
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <span className="text-muted-foreground">No photo available</span>
                </div>
              )}
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
              <div className="flex items-baseline justify-between">
                <h3 className="text-xl font-bold">
                  {profile.name}, {profile.age}
                </h3>
                {profile.location && (
                  <div className="text-sm opacity-80">{profile.location}</div>
                )}
              </div>
              
              {profile.bio && (
                <p className="mt-2 text-sm line-clamp-2">{profile.bio}</p>
              )}
              
              <div className="flex flex-wrap gap-2 mt-2">
                {profile.occupation && (
                  <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
                    {profile.occupation}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center p-3">
            <button
              onClick={() => handleDislike(profile.id)}
              className="w-12 h-12 rounded-full bg-white shadow border border-red-500 flex items-center justify-center hover:bg-red-50 transition-colors"
              aria-label="Dislike"
            >
              <X className="h-6 w-6 text-red-500" />
            </button>
            
            <button 
              onClick={() => handleSuperLike(profile.id)}
              className="w-10 h-10 rounded-full bg-white shadow border border-amber-500 flex items-center justify-center hover:bg-amber-50 transition-colors"
              aria-label="Super Like"
            >
              <Star className="h-5 w-5 text-amber-500" />
            </button>
            
            <button
              onClick={() => handleLike(profile.id)}
              className="w-12 h-12 rounded-full bg-white shadow border border-purple-500 flex items-center justify-center hover:bg-purple-50 transition-colors"
              aria-label="Like"
            >
              <Heart className="h-6 w-6 text-purple-500" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProfilesGrid;
