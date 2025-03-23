
import React from 'react';
import ProfileSection from '@/components/profile/ProfileSection';
import { useIsMobile } from '@/hooks/use-mobile';

interface ProfileBioProps {
  bio: string;
  hasPhotos: boolean;
  currentRow: number;
}

const ProfileBio = ({ bio, hasPhotos, currentRow }: ProfileBioProps) => {
  const isMobile = useIsMobile();
  
  return (
    <ProfileSection
      gridSpan={{
        cols: isMobile ? "col-span-6" : "col-span-5",
        rows: "row-span-2",
        colsStart: isMobile ? "col-start-1" : (hasPhotos ? "col-start-8" : "col-start-1"),
        rowsStart: isMobile ? `row-start-${currentRow.toString()}` : "row-start-3"
      }}
      className="bg-vice-red p-4 text-white"
    >
      <h3 className="text-lg font-semibold mb-2">My story</h3>
      <p className="text-sm">{bio}</p>
    </ProfileSection>
  );
};

export default ProfileBio;
