
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface ProfilePassionProps {
  passion: string | string[];
}

const ProfilePassion = ({ passion }: ProfilePassionProps) => {
  const isMobile = useIsMobile();
  
  // Handle both single passion and array of passions
  const passions = Array.isArray(passion) ? passion : [passion];
  
  return (
    <div className="w-1/2 bg-vice-dark-purple p-4 rounded-2xl flex flex-col text-white">
      <p className="text-sm mb-2">I am passionate about:</p>
      <div className="flex flex-grow items-center justify-center">
        <div className="flex flex-wrap gap-2 justify-center">
          {passions.map((item, index) => (
            <div key={index} className="bg-white text-vice-dark-purple px-3 py-1 rounded-full text-sm inline-block">
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfilePassion;
