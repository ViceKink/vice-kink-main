
import React from 'react';
import ProfileSection from '@/components/profile/ProfileSection';
import AudioPlayer from '@/components/ui/AudioPlayer';
import { useIsMobile } from '@/hooks/use-mobile';

interface ProfileAudioProps {
  audio: {
    url: string;
    title: string;
  };
  currentRow: number;
}

const ProfileAudio = ({ audio, currentRow }: ProfileAudioProps) => {
  const isMobile = useIsMobile();
  
  // Safety check for audio data
  if (!audio || !audio.url) {
    console.log("ProfileAudio: Missing audio data", { audio });
    return null;
  }
  
  console.log("ProfileAudio: Rendering audio player", { 
    audioTitle: audio.title, 
    hasAudioUrl: !!audio.url 
  });
  
  return (
    <ProfileSection
      gridSpan={{
        cols: isMobile ? "col-span-6" : "col-span-4",
        rows: "row-span-1",
        colsStart: "col-start-1",
        rowsStart: `row-start-${currentRow.toString()}`
      }}
      className="bg-vice-purple/10 p-0 overflow-hidden"
    >
      <AudioPlayer 
        audioUrl={audio.url}
        title={audio.title}
      />
    </ProfileSection>
  );
};

export default ProfileAudio;
