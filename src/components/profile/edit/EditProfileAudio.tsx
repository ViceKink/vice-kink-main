
import React, { useState } from 'react';
import { UserProfile } from '@/context/AuthContext';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import AudioPlayer from '@/components/ui/AudioPlayer';
import { AlertCircle } from 'lucide-react';

interface EditProfileAudioProps {
  userData: Partial<UserProfile>;
  updateField: (field: string, value: any) => void;
}

const EditProfileAudio = ({ userData, updateField }: EditProfileAudioProps) => {
  const [audioTitle, setAudioTitle] = useState(userData.audio?.title || '');
  const [audioUrl, setAudioUrl] = useState(userData.audio?.url || '');
  const [error, setError] = useState('');
  
  const handleUpdateAudio = () => {
    setError('');
    
    if (!audioTitle.trim()) {
      setError('Please enter a title for your audio');
      return;
    }
    
    if (!audioUrl.trim()) {
      setError('Please enter a URL for your audio');
      return;
    }
    
    // Basic URL validation
    try {
      new URL(audioUrl);
    } catch (e) {
      setError('Please enter a valid URL');
      return;
    }
    
    updateField('audio', {
      title: audioTitle.trim(),
      url: audioUrl.trim()
    });
  };
  
  const hasAudio = !!(userData.audio?.url && userData.audio?.title);
  
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Add a voice introduction to your profile. This should be a direct URL to an audio file 
        (MP3, WAV, OGG) that's hosted online.
      </p>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="audioTitle">Audio Title</Label>
          <Input
            id="audioTitle"
            value={audioTitle}
            onChange={(e) => setAudioTitle(e.target.value)}
            placeholder="e.g., My Introduction"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="audioUrl">Audio URL</Label>
          <Input
            id="audioUrl"
            value={audioUrl}
            onChange={(e) => setAudioUrl(e.target.value)}
            placeholder="https://example.com/audio.mp3"
          />
          <p className="text-xs text-muted-foreground">
            Link to an audio file hosted online. MP3, WAV or OGG formats are recommended.
          </p>
        </div>
        
        {error && (
          <div className="flex items-center text-destructive text-sm gap-1">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}
        
        <Button
          onClick={handleUpdateAudio}
          variant="secondary"
        >
          Update Audio
        </Button>
        
        {hasAudio && (
          <div className="mt-6">
            <h3 className="text-sm font-medium mb-2">Preview:</h3>
            <div className="bg-vice-purple/10 rounded-lg overflow-hidden">
              <AudioPlayer 
                audioUrl={userData.audio?.url || ''}
                title={userData.audio?.title || ''}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditProfileAudio;
