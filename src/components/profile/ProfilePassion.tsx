
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface ProfilePassionProps {
  passions: string[];
}

const ProfilePassion = ({ passions }: ProfilePassionProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="w-1/2 bg-vice-dark-purple p-4 rounded-2xl flex flex-col text-white">
      <p className="text-sm mb-4">I am passionate about:</p>
      <div className="flex flex-grow items-center justify-center flex-wrap gap-2">
        {passions.map((passion, index) => (
          <div key={index} className="bg-white text-vice-dark-purple px-3 py-1 rounded-full text-sm inline-block">
            {passion}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfilePassion;
