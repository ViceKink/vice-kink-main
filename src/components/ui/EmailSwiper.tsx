import { useState, useRef, useEffect } from 'react';
import { Heart, X, Star, Filter, List } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Profile {
  id: string;
  name: string;
  age: number;
  location: string;
  distance: string;
  photos: string[];
  occupation: string;
  religion?: string;
  height: string;
  rating: number;
  verified: boolean;
}

interface EmailSwiperProps {
  profiles: Profile[];
  onLike: (profileId: string) => void;
  onDislike: (profileId: string) => void;
  onSuperLike?: (profileId: string) => void;
  onViewProfile: (profileId: string) => void;
  onOpenFilters?: () => void;
}

const EmailSwiper = ({
  profiles,
  onLike,
  onDislike,
  onSuperLike,
  onViewProfile,
  onOpenFilters
}: EmailSwiperProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'none' | 'left' | 'right' | 'up'>('none');
  const [swipePosition, setSwipePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const startPosition = useRef({ x: 0, y: 0 });

  const currentProfile = profiles[currentIndex];
  const hasProfiles = currentIndex < profiles.length;

  const handleSwipe = (direction: 'left' | 'right' | 'up') => {
    if (!hasProfiles) return;
    
    setSwipeDirection(direction);
    
    setTimeout(() => {
      if (direction === 'right') {
        onLike(currentProfile.id);
      } else if (direction === 'left') {
        onDislike(currentProfile.id);
      } else if (direction === 'up' && onSuperLike) {
        onSuperLike(currentProfile.id);
      }
      
      setSwipeDirection('none');
      setSwipePosition({ x: 0, y: 0 });
      setCurrentIndex(prev => prev + 1);
    }, 300);
  };
  
  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    
    if ('touches' in e) {
      startPosition.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else {
      startPosition.current = { x: e.clientX, y: e.clientY };
    }
  };
  
  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !hasProfiles) return;
    
    let currentX: number, currentY: number;
    
    if ('touches' in e) {
      currentX = e.touches[0].clientX;
      currentY = e.touches[0].clientY;
    } else {
      currentX = e.clientX;
      currentY = e.clientY;
    }
    
    const deltaX = currentX - startPosition.current.x;
    const deltaY = currentY - startPosition.current.y;
    
    setSwipePosition({ x: deltaX, y: deltaY });
  };
  
  const handleMouseUp = () => {
    if (!isDragging || !hasProfiles) return;
    setIsDragging(false);
    
    const { x, y } = swipePosition;
    const swipeThreshold = 100;
    
    if (x > swipeThreshold) {
      handleSwipe('right');
    } else if (x < -swipeThreshold) {
      handleSwipe('left');
    } else if (y < -swipeThreshold) {
      handleSwipe('up');
    } else {
      setSwipePosition({ x: 0, y: 0 });
    }
  };
  
  useEffect(() => {
    const handleTouchEnd = () => {
      handleMouseUp();
    };
    
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, swipePosition]);
  
  const getCardStyle = () => {
    if (swipeDirection !== 'none') {
      const x = swipeDirection === 'left' ? -1000 : swipeDirection === 'right' ? 1000 : 0;
      const y = swipeDirection === 'up' ? -1000 : 0;
      const rotate = swipeDirection === 'left' ? -30 : swipeDirection === 'right' ? 30 : 0;
      
      return {
        transform: `translate3d(${x}px, ${y}px, 0) rotate(${rotate}deg)`,
        transition: 'transform 0.3s ease-out',
      };
    }
    
    if (isDragging) {
      const { x, y } = swipePosition;
      const rotate = x * 0.1;
      
      return {
        transform: `translate3d(${x}px, ${y}px, 0) rotate(${rotate}deg)`,
      };
    }
    
    return {
      transform: 'translate3d(0, 0, 0) rotate(0deg)',
      transition: 'transform 0.3s ease-out',
    };
  };

  return (
    <div className="w-full max-w-md mx-auto h-[580px] relative">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <List className="w-5 h-5 text-foreground/70" />
        </div>
        <div className="flex items-center">
          <button 
            onClick={onOpenFilters}
            className="flex items-center text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
          >
            <Filter className="w-4 h-4 mr-1" />
            Filter
          </button>
        </div>
      </div>
      
      <div className="relative w-full h-[520px]">
        {hasProfiles ? (
          <div
            ref={cardRef}
            style={getCardStyle()}
            className={cn(
              "absolute w-full bg-card rounded-2xl overflow-hidden shadow-lg",
              "transition-all duration-300 ease-out cursor-grab active:cursor-grabbing",
              isDragging && "shadow-xl"
            )}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onTouchStart={handleMouseDown}
            onTouchMove={handleMouseMove}
            onClick={() => onViewProfile(currentProfile.id)}
          >
            <div className="relative">
              <img
                src={currentProfile.photos[0]}
                alt={currentProfile.name}
                className="w-full h-[400px] object-cover"
              />
              
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold flex items-center">
                      {currentProfile.name}
                      {currentProfile.verified && (
                        <span className="ml-1 bg-vice-purple text-white text-xs px-1 rounded-full">✓</span>
                      )}
                    </h2>
                    <p className="text-sm opacity-90">
                      {currentProfile.age} • {currentProfile.distance}
                    </p>
                    <p className="text-sm opacity-90 mt-1">
                      {currentProfile.location}
                    </p>
                  </div>
                  <div className="flex">
                    {'★'.repeat(currentProfile.rating)}
                  </div>
                </div>
              </div>
              
              <div 
                className={cn(
                  "absolute top-4 left-4 bg-vice-red text-white px-4 py-2 rounded-lg font-bold transform rotate-[-20deg] transition-opacity",
                  swipeDirection === 'left' || swipePosition.x < -20 ? 'opacity-100' : 'opacity-0'
                )}
              >
                NOPE
              </div>
              
              <div 
                className={cn(
                  "absolute top-4 right-4 bg-vice-purple text-white px-4 py-2 rounded-lg font-bold transform rotate-[20deg] transition-opacity",
                  swipeDirection === 'right' || swipePosition.x > 20 ? 'opacity-100' : 'opacity-0'
                )}
              >
                LIKE
              </div>
              
              <div 
                className={cn(
                  "absolute top-4 left-1/2 -translate-x-1/2 bg-vice-orange text-white px-4 py-2 rounded-lg font-bold transition-opacity",
                  swipeDirection === 'up' || swipePosition.y < -20 ? 'opacity-100' : 'opacity-0'
                )}
              >
                SUPER LIKE
              </div>
            </div>
            
            <div className="p-4 bg-white dark:bg-card">
              <div className="flex flex-wrap gap-2 mb-3">
                <div className="flex items-center px-2 py-1 bg-secondary rounded-full">
                  <span className="text-xs font-medium">{currentProfile.height}</span>
                </div>
                
                {currentProfile.religion && (
                  <div className="flex items-center px-2 py-1 bg-secondary rounded-full">
                    <span className="text-xs font-medium">{currentProfile.religion}</span>
                  </div>
                )}
                
                <div className="flex items-center px-2 py-1 bg-secondary rounded-full">
                  <span className="text-xs font-medium">{currentProfile.occupation}</span>
                </div>
              </div>
              
              <div className="flex justify-between">
                <p className="text-sm text-foreground/70">
                  Tap to view profile
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-card rounded-2xl p-8 text-center">
            <div className="text-6xl mb-4">✨</div>
            <h3 className="text-xl font-semibold mb-2">You've seen all profiles</h3>
            <p className="text-sm text-foreground/70 mb-6">
              Come back later for more matches or adjust your filters
            </p>
          </div>
        )}
      </div>
      
      {hasProfiles && (
        <div className="absolute bottom-0 left-0 right-0 flex justify-center space-x-5 p-4">
          <button 
            onClick={() => handleSwipe('left')}
            className="w-12 h-12 rounded-full bg-black shadow-md flex items-center justify-center transition-transform hover:scale-105 hover:shadow-lg border border-red-500"
          >
            <X className="w-6 h-6 text-red-500" />
          </button>
          
          <button 
            onClick={() => handleSwipe('up')}
            className="w-10 h-10 rounded-full bg-black shadow-md flex items-center justify-center transition-transform hover:scale-105 hover:shadow-lg border border-orange-500"
          >
            <Star className="w-5 h-5 text-orange-500" />
          </button>
          
          <button 
            onClick={() => handleSwipe('right')}
            className="w-12 h-12 rounded-full bg-black shadow-md flex items-center justify-center transition-transform hover:scale-105 hover:shadow-lg border border-purple-500"
          >
            <Heart className="w-6 h-6 text-purple-500" />
          </button>
        </div>
      )}
    </div>
  );
};

export default EmailSwiper;
