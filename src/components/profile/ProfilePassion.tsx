
import React from 'react';
import ProfileSection from '@/components/profile/ProfileSection';
import { useIsMobile } from '@/hooks/use-mobile';

interface ProfilePassionProps {
  passion: string;
  currentRow: number;
  hasFlirtingStyle: boolean;
}

const ProfilePassion = ({ passion, currentRow, hasFlirtingStyle }: ProfilePassionProps) => {
  const isMobile = useIsMobile();
  
  return (
    <ProfileSection
      gridSpan={{
        cols: isMobile ? "col-span-6" : "col-span-3",
        rows: "row-span-1",
        colsStart: isMobile ? "col-start-1" : "col-start-7",
        rowsStart: isMobile ? `row-start-${currentRow.toString()}` : `row-start-${(hasFlirtingStyle ? currentRow - 1 : currentRow).toString()}`
      }}
      className="bg-vice-dark-purple p-4 text-white"
    >
      <div className="flex flex-col h-full justify-center">
        <p className="text-sm">
          I am passionate about: <span className="font-medium">{passion}</span>
        </p>
      </div>
    </ProfileSection>
  );
};

export default ProfilePassion;
