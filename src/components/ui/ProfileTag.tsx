
import React from 'react';
import { cn } from '@/lib/utils';

interface ProfileTagProps {
  label: string;
  type?: 'passion' | 'vice' | 'kink' | 'hobby';
  isActive?: boolean;
  className?: string;
}

const ProfileTag = ({ 
  label, 
  type = 'passion', 
  isActive = false,
  className = '' 
}: ProfileTagProps) => {
  // Custom styles based on tag type
  const getTypeStyles = () => {
    switch (type) {
      case 'passion':
        return isActive 
          ? 'bg-vice-purple/90 text-white border-vice-purple hover:bg-vice-purple'
          : 'bg-vice-purple/10 text-foreground/70 border-vice-purple/20 hover:border-vice-purple/40 dark:bg-vice-purple/20 dark:border-vice-purple/30';
      case 'vice':
        // Use the requested pink color (#ff52b1) instead of red
        return isActive 
          ? 'bg-[#ff52b1]/90 text-white border-[#ff52b1] hover:bg-[#ff52b1]'
          : 'bg-[#ff52b1]/10 text-foreground/70 border-[#ff52b1]/20 hover:border-[#ff52b1]/40 dark:bg-[#ff52b1]/20 dark:border-[#ff52b1]/30';
      case 'kink':
        return isActive 
          ? 'bg-amber-500/90 text-white border-amber-500 hover:bg-amber-500'
          : 'bg-amber-500/10 text-foreground/70 border-amber-500/20 hover:border-amber-500/40 dark:bg-amber-500/20 dark:border-amber-500/30';
      case 'hobby':
        return isActive 
          ? 'bg-teal-500/90 text-white border-teal-500 hover:bg-teal-500'
          : 'bg-teal-500/10 text-foreground/70 border-teal-500/20 hover:border-teal-500/40 dark:bg-teal-500/20 dark:border-teal-500/30';
      default:
        return isActive 
          ? 'bg-vice-purple/90 text-white border-vice-purple hover:bg-vice-purple'
          : 'bg-vice-purple/10 text-foreground/70 border-vice-purple/20 hover:border-vice-purple/40 dark:bg-vice-purple/20 dark:border-vice-purple/30';
    }
  };

  return (
    <div 
      className={cn(
        'inline-flex items-center px-3 py-1.5 text-sm rounded-full border transition-colors',
        getTypeStyles(),
        className
      )}
    >
      {label}
    </div>
  );
};

export default ProfileTag;
