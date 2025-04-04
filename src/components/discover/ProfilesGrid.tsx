
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Heart, X, Star } from "lucide-react";
import { useAuth } from '@/context/auth';
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom';
import { createInteraction } from '@/utils/matchUtils';
import { DiscoverProfile } from '@/utils/match/types';

interface ProfilesGridProps {
  profiles: DiscoverProfile[];
}

const ProfilesGrid: React.FC<ProfilesGridProps> = ({ profiles: initialProfiles }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<DiscoverProfile[]>(initialProfiles);

  const handleLike = async (profileId: string) => {
    if (!user?.id) return;
    try {
      const result = await createInteraction(user.id, profileId, 'like');
      if (result.matched) {
        toast.success("It's a match!");
      } else {
        toast.success('You liked this profile!');
      }
      // Remove the profile from the list
      setProfiles(prevProfiles => prevProfiles.filter(profile => profile.id !== profileId));
    } catch (error) {
      console.error('Error liking profile:', error);
      toast.error('Failed to like profile');
    }
  };

  const handleDislike = async (profileId: string) => {
    if (!user?.id) return;
    try {
      await createInteraction(user.id, profileId, 'dislike');
      // Remove the profile from the list after disliking
      setProfiles(prevProfiles => prevProfiles.filter(profile => profile.id !== profileId));
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
      // Remove the profile from the list
      setProfiles(prevProfiles => prevProfiles.filter(profile => profile.id !== profileId));
    } catch (error) {
      console.error('Error super liking profile:', error);
      toast.error('Failed to super like profile');
    }
  };

  const handleViewProfile = (profileId: string) => {
    navigate(`/profile/${profileId}`);
  };

  return (
    <div className="grid gap-4 px-2 pb-4">
      {profiles.map((profile) => (
        <div key={profile.id} className="bg-card border border-border rounded-xl overflow-hidden shadow">
          <div className="relative">
            <div 
              className="w-full h-[320px] bg-background cursor-pointer"
              onClick={() => handleViewProfile(profile.id)}
            >
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
                  {profile.name}{profile.age ? `, ${profile.age}` : ''}
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
          
          <div className="flex justify-between items-center p-3 bg-black text-white">
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => handleViewProfile(profile.id)}
              className="text-white mr-auto hover:bg-white hover:text-black view-profile-btn"
            >
              View Profile
            </Button>
            
            <div className="flex gap-2">
              <button
                onClick={() => handleDislike(profile.id)}
                className="w-10 h-10 rounded-full bg-black shadow flex items-center justify-center border border-red-500 hover:bg-red-500/20 transition-colors"
                aria-label="Dislike"
              >
                <X className="h-5 w-5 text-red-500" />
              </button>
              
              <button 
                onClick={() => handleSuperLike(profile.id)}
                className="w-10 h-10 rounded-full bg-black shadow flex items-center justify-center border border-amber-500 hover:bg-amber-500/20 transition-colors"
                aria-label="Super Like"
              >
                <Star className="h-5 w-5 text-amber-500" />
              </button>
              
              <button
                onClick={() => handleLike(profile.id)}
                className="w-10 h-10 rounded-full bg-black shadow flex items-center justify-center border border-purple-500 hover:bg-purple-500/20 transition-colors"
                aria-label="Like"
              >
                <Heart className="h-5 w-5 text-purple-500" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProfilesGrid;
