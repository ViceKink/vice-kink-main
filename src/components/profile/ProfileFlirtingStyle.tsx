
import React from 'react';
import ProfileSection from '@/components/profile/ProfileSection';
import { useIsMobile } from '@/hooks/use-mobile';

interface FlirtingStyleObject {
  direct: number;
  playful: number;
  intellectual: number;
  physical: number;
  romantic: number;
}

interface ProfileFlirtingStyleProps {
  flirtingStyle: string | FlirtingStyleObject;
  currentRow?: number; // Make optional
}

const ProfileFlirtingStyle = ({ flirtingStyle, currentRow }: ProfileFlirtingStyleProps) => {
  const isMobile = useIsMobile();
  
  // Convert numeric values to descriptive text
  const getIntensityDescription = (value: number): string => {
    if (value >= 90) return "extremely";
    if (value >= 75) return "very";
    if (value >= 60) return "primarily";
    if (value >= 40) return "moderately";
    if (value >= 20) return "somewhat";
    return "slightly";
  };
  
  // Create a human-readable description of flirting style
  const createFlirtingStyleDescription = (style: string | FlirtingStyleObject): string => {
    try {
      let styleObj: FlirtingStyleObject;
      
      if (typeof style === 'string') {
        if (style.trim() === '') return 'Not specified';
        
        // Try to parse JSON string
        try {
          styleObj = JSON.parse(style);
          // Check if it has the expected structure
          if (!styleObj.direct && !styleObj.playful && !styleObj.intellectual && 
              !styleObj.physical && !styleObj.romantic) {
            return style; // Not a valid flirting style object, just return the string
          }
        } catch (e) {
          // If parsing fails, return the string as is
          return style;
        }
      } else {
        styleObj = style;
      }
      
      // Find the highest rated styles
      const entries = Object.entries(styleObj) as Array<[string, number]>;
      entries.sort((a, b) => b[1] - a[1]);
      
      const topStyles = entries.slice(0, 2).filter(([_, value]) => value > 20);
      
      if (topStyles.length === 0) {
        return "balanced across all styles";
      } else if (topStyles.length === 1) {
        return `${getIntensityDescription(topStyles[0][1])} ${topStyles[0][0]}`;
      } else {
        return `${getIntensityDescription(topStyles[0][1])} ${topStyles[0][0]} with a ${getIntensityDescription(topStyles[1][1])} ${topStyles[1][0]} touch`;
      }
    } catch (e) {
      // If any error occurs, return a default message
      return typeof flirtingStyle === 'string' ? flirtingStyle : "balanced across all styles";
    }
  };
  
  const styleDescription = createFlirtingStyleDescription(flirtingStyle);
  
  // If used within the bento grid directly
  if (currentRow === undefined) {
    return (
      <div className="flex items-center h-full">
        <p className="text-sm break-words whitespace-normal">
          <span className="font-medium mr-2">My idea of flirting is:</span>
          {styleDescription}
        </p>
      </div>
    );
  }
  
  // Original version for use in profile grid layout
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
        <p className="text-sm break-words whitespace-normal">
          <span className="font-medium mr-2">My idea of flirting is:</span>
          {styleDescription}
        </p>
      </div>
    </ProfileSection>
  );
};

export default ProfileFlirtingStyle;
