
import React from 'react';
import AudioPlayer from '@/components/ui/AudioPlayer';
import { useIsMobile } from '@/hooks/use-mobile';

interface ProfileAudioProps {
  audio: {
    url: string;
    title: string;
  };
}

const ProfileAudio = ({ audio }: ProfileAudioProps) => {
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
    <div className="bg-vice-purple/10 p-0 overflow-hidden rounded-2xl">
      <AudioPlayer 
        audioUrl={audio.url}
        title={audio.title}
      />
    </div>
  );
};

export default ProfileAudio;
