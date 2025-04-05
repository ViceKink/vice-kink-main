
import React from 'react';
import { Heart, X, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfileInteractionButtonsProps {
  onLike: () => void;
  onDislike: () => void;
  onSuperLike: () => void;
}

const ProfileInteractionButtons = ({ 
  onLike, 
  onDislike, 
  onSuperLike 
}: ProfileInteractionButtonsProps) => {
  return (
    <div className="fixed bottom-24 right-4 flex flex-col gap-3 z-10">
      <button 
        onClick={onDislike}
        className={cn(
          "w-11 h-11 rounded-full bg-black shadow-lg flex items-center justify-center",
          "transform transition-transform hover:scale-105 border-2 border-red-500 animate-fade-in",
          "animate-float"
        )}
        aria-label="Dislike profile"
      >
        <X className="w-5 h-5 text-red-500" />
      </button>
      
      <button 
        onClick={onSuperLike}
        className={cn(
          "w-11 h-11 rounded-full bg-black shadow-lg flex items-center justify-center",
          "transform transition-transform hover:scale-105 border-2 border-orange-500 animate-fade-in delay-75",
          "animate-float delay-75"
        )}
        aria-label="Super like profile"
      >
        <Star className="w-5 h-5 text-orange-500" />
      </button>
      
      <button 
        onClick={onLike}
        className={cn(
          "w-11 h-11 rounded-full bg-black shadow-lg flex items-center justify-center",
          "transform transition-transform hover:scale-105 border-2 border-purple-500 animate-fade-in delay-150",
          "animate-float delay-150"
        )}
        aria-label="Like profile"
      >
        <Heart className="w-5 h-5 text-purple-500" />
      </button>
    </div>
  );
};

export default ProfileInteractionButtons;
