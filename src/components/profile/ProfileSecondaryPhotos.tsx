
import React from 'react';
import ProfileSection from '@/components/profile/ProfileSection';
import { useIsMobile } from '@/hooks/use-mobile';

interface ProfileSecondaryPhotosProps {
  photos: string[];
  name: string;
  currentRow: number;
  hasVicesOrKinks: boolean; // Prop to check if vices or kinks exist
}

const ProfileSecondaryPhotos = ({ photos, name, currentRow, hasVicesOrKinks }: ProfileSecondaryPhotosProps) => {
  const isMobile = useIsMobile();
  
  return (
    <ProfileSection
      gridSpan={{
        cols: isMobile ? "col-span-6" : hasVicesOrKinks ? "col-span-6" : "col-span-12",
        rows: "row-span-3",
        colsStart: isMobile ? "col-start-1" : hasVicesOrKinks ? "col-start-7" : "col-start-1",
        rowsStart: isMobile ? `row-start-${currentRow.toString()}` : "row-start-5"
      }}
      className="bg-black p-0 overflow-hidden"
    >
      <div className="grid grid-cols-2 grid-rows-2 gap-1 h-full">
        {photos.slice(1, 5).map((photo, index) => (
          <div key={index} className="relative overflow-hidden">
            <img
              src={photo}
              alt={`${name} photo ${index + 2}`}
              className="w-full h-full object-cover"
            />
            {index === 2 && photos.length > 5 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
                <span className="text-lg font-semibold">+{photos.length - 4} photos</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </ProfileSection>
  );
};

export default ProfileSecondaryPhotos;
