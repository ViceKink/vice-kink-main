
import React from 'react';
import ProfileSection from '@/components/profile/ProfileSection';
import { useIsMobile } from '@/hooks/use-mobile';

interface ProfileFlirtingStyleProps {
  flirtingStyle: string;
  currentRow: number;
}

const ProfileFlirtingStyle = ({ flirtingStyle, currentRow }: ProfileFlirtingStyleProps) => {
  const isMobile = useIsMobile();
  
  // Create a human-readable description of flirting style
  const createFlirtingStyleDescription = (flirtingStyleStr: string): string => {
    try {
      const styleObj = JSON.parse(flirtingStyleStr);
      
      // Find the highest rated styles
      const entries = Object.entries(styleObj) as Array<[string, number]>;
      entries.sort((a, b) => b[1] - a[1]);
      
      const topStyles = entries.slice(0, 2).filter(([_, value]) => value > 60);
      
      if (topStyles.length === 0) {
        return "balanced across all styles";
      } else if (topStyles.length === 1) {
        return `primarily ${topStyles[0][0]}`;
      } else {
        return `a mix of ${topStyles[0][0]} and ${topStyles[1][0]}`;
      }
    } catch (e) {
      // If parsing fails, return the string as is
      return flirtingStyleStr;
    }
  };
  
  const styleDescription = createFlirtingStyleDescription(flirtingStyle);
  
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
          {styleDescription}
        </p>
      </div>
    </ProfileSection>
  );
};

export default ProfileFlirtingStyle;
