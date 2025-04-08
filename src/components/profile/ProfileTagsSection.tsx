
import React from 'react';
import ProfileSection from '@/components/profile/ProfileSection';
import ProfileTag from '@/components/ui/ProfileTag';
import { useIsMobile } from '@/hooks/use-mobile';

interface ProfileTagsSectionProps {
  items: string[];
  type: 'vice' | 'kink';
  title: string;
  currentRow: number;
}

const ProfileTagsSection = ({ items, type, title, currentRow }: ProfileTagsSectionProps) => {
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
      <h3 className="text-base font-semibold mb-2 text-black dark:text-white">{title}</h3>
      <div className="flex flex-wrap gap-2 pb-6">
        {items.map((item, index) => (
          <ProfileTag key={index} label={item} type={type} />
        ))}
      </div>
    </ProfileSection>
  );
};

export default ProfileTagsSection;
