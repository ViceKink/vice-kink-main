
import React from 'react';
import ProfileSection from '@/components/profile/ProfileSection';
import { useIsMobile } from '@/hooks/use-mobile';

interface ProfileFlirtingStyleProps {
  flirtingStyle: string;
  currentRow: number;
}

const ProfileFlirtingStyle = ({ flirtingStyle, currentRow }: ProfileFlirtingStyleProps) => {
  const isMobile = useIsMobile();
  
  return (
    <ProfileSection
      gridSpan={{
        cols: isMobile ? "col-span-6" : "col-span-6",
        rows: "row-span-1",
        colsStart: "col-start-1",
        rowsStart: `row-start-${currentRow.toString()}`
      }}
      className="bg-white dark:bg-card p-4"
    >
      <div className="flex items-center h-full">
        <p className="text-sm italic">
          <span className="font-medium mr-2">My idea of flirting is:</span>
          {flirtingStyle}
        </p>
      </div>
    </ProfileSection>
  );
};

export default ProfileFlirtingStyle;
