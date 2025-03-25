
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface ProfilePassionProps {
  passion: string;
}

const ProfilePassion = ({ passion }: ProfilePassionProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="w-1/2 bg-vice-dark-purple p-4 rounded-2xl flex flex-col justify-between text-white">
      <p className="text-sm mb-4">I am passionate about:</p>
      <div className="flex flex-wrap gap-2 mt-auto">
        <div className="bg-white text-vice-dark-purple px-3 py-1 rounded-full text-sm inline-block">
          {passion}
        </div>
      </div>
    </div>
  );
};

export default ProfilePassion;
