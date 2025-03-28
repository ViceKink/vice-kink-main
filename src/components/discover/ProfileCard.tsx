
import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, MapPin, X, Heart, Star } from "lucide-react";

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
          className="text-white flex-1 hover:bg-white hover:text-black mr-10 view-profile-btn"
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

export default ProfileCard;
