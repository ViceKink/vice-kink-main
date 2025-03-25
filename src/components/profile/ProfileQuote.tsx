
import React from 'react';
import ProfileSection from '@/components/profile/ProfileSection';
import { useIsMobile } from '@/hooks/use-mobile';

interface ProfileQuoteProps {
  currentRow: number;
  hasFlirtingStyle: boolean;
  hasPassions: boolean;
  quote?: string;
}

const ProfileQuote = ({ currentRow, hasFlirtingStyle, hasPassions, quote }: ProfileQuoteProps) => {
  const isMobile = useIsMobile();
  
  return (
    <ProfileSection
      gridSpan={{
        cols: isMobile ? "col-span-6" : "col-span-3",
        rows: "row-span-1",
        colsStart: isMobile ? "col-start-1" : (hasPassions ? "col-start-10" : "col-start-10"),
        rowsStart: isMobile ? `row-start-${currentRow.toString()}` : (hasFlirtingStyle ? currentRow - 1 : currentRow).toString()
      }}
      className="bg-vice-orange p-4 text-white"
    >
      <div className="flex flex-col h-full justify-center">
        <h3 className="text-sm font-semibold mb-1">Favorite Quote</h3>
        <p className="text-sm italic">
          {quote || "I'm such a Virgo, even my horoscope tells me to stop worrying about being a Virgo"}
        </p>
      </div>
    </ProfileSection>
  );
};

export default ProfileQuote;
