
import React, { useState, useEffect } from 'react';
import AudioPlayer from '@/components/ui/AudioPlayer';
import { useIsMobile } from '@/hooks/use-mobile';
import { Play } from 'lucide-react';

interface ProfileAudioProps {
  audio: {
    url: string;
    title: string;
  };
}

const ProfileAudio = ({ audio }: ProfileAudioProps) => {
  const isMobile = useIsMobile();
  const [expanded, setExpanded] = useState(false);
  const [audioError, setAudioError] = useState(false);
  
  // Safety check for audio data
  if (!audio || !audio.url) {
    console.log("ProfileAudio: Missing audio data", { audio });
    return null;
  }
  
  console.log("ProfileAudio: Rendering audio player", { 
    audioTitle: audio.title, 
    hasAudioUrl: !!audio.url,
    audioUrl: audio.url,
    expanded
  });

  // Add function to validate the audio URL
  const validateAudioUrl = () => {
    // Only validate real URLs, not blob URLs (which are temporary)
    if (audio.url.startsWith('http')) {
      const audioElement = new Audio();
      audioElement.onerror = () => {
        console.error("Audio URL failed to load:", audio.url);
        setAudioError(true);
      };
      audioElement.onloadedmetadata = () => {
        console.log("Audio URL validated successfully");
        setAudioError(false);
      };
      audioElement.src = audio.url;
    }
  };

  useEffect(() => {
    validateAudioUrl();
  }, [audio.url]);
  
  const handleClick = () => {
    setExpanded(true);
  };
  
  // If there's an error with the audio URL, don't render anything
  if (audioError) {
    console.error("ProfileAudio: Error loading audio URL", { url: audio.url });
    return null;
  }
  
  return (
    <div className="bg-vice-purple/10 p-0 overflow-hidden rounded-2xl">
      {expanded ? (
        <AudioPlayer 
          audioUrl={audio.url}
          title={audio.title}
        />
      ) : (
        <div 
          className="w-full p-4 flex items-center gap-3 cursor-pointer" 
          onClick={handleClick}
        >
          <div className="bg-vice-purple text-white rounded-full p-2 flex-shrink-0">
            <Play className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium">{audio.title || "Voice Note"}</div>
            <div className="text-xs text-foreground/60">Tap to play</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileAudio;
