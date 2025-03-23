
import React, { useState, useRef } from 'react';
import { UserProfile } from '@/context/AuthContext';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import AudioPlayer from '@/components/ui/AudioPlayer';
import { AlertCircle, Mic, MicOff, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

interface EditProfileAudioProps {
  userData: Partial<UserProfile>;
  updateField: (field: string, value: any) => void;
}

const EditProfileAudio = ({ userData, updateField }: EditProfileAudioProps) => {
  const [audioTitle, setAudioTitle] = useState(userData.audio?.title || '');
  const [audioUrl, setAudioUrl] = useState(userData.audio?.url || '');
  const [error, setError] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const startRecording = async () => {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        
        // Create a local URL for preview
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(audioUrl);
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setError('Could not access your microphone. Please ensure it is connected and you have granted permission.');
    }
  };
  
  const stopRecording = () => {
    if (!mediaRecorderRef.current) return;
    
    mediaRecorderRef.current.stop();
    setIsRecording(false);
    
    // Stop all audio tracks
    if (mediaRecorderRef.current.stream) {
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    
    // Clear the timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  const uploadRecording = async () => {
    if (!audioBlob || !audioTitle.trim()) {
      setError('Please record audio and provide a title before uploading');
      return;
    }
    
    setIsUploading(true);
    setError('');
    
    try {
      const fileName = `${uuidv4()}.webm`;
      const filePath = `audio/${fileName}`;
      
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-media')
        .upload(filePath, audioBlob, {
          contentType: 'audio/webm',
          upsert: true
        });
      
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('profile-media')
        .getPublicUrl(filePath);
      
      const publicUrl = publicUrlData.publicUrl;
      
      // Update component state
      setAudioUrl(publicUrl);
      
      // Update parent component
      updateField('audio', {
        title: audioTitle.trim(),
        url: publicUrl
      });
      
      setIsUploading(false);
    } catch (err: any) {
      console.error('Error uploading audio:', err);
      setError('Failed to upload audio: ' + (err.message || 'Unknown error'));
      setIsUploading(false);
    }
  };
  
  const handleUpdateAudio = () => {
    setError('');
    
    if (!audioTitle.trim()) {
      setError('Please enter a title for your audio');
      return;
    }
    
    if (!audioUrl.trim()) {
      setError('Please record or provide a URL for your audio');
      return;
    }
    
    // If this is a blob URL from recording, upload it first
    if (audioUrl.startsWith('blob:') && audioBlob) {
      uploadRecording();
      return;
    }
    
    // For external URLs, validate and update directly
    try {
      new URL(audioUrl);
      updateField('audio', {
        title: audioTitle.trim(),
        url: audioUrl.trim()
      });
    } catch (e) {
      setError('Please enter a valid URL');
    }
  };
  
  const hasAudio = !!(userData.audio?.url && userData.audio?.title);
  
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Add a voice introduction to your profile. You can record directly or provide a URL to an audio file.
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
        
        <div className="space-y-2 mt-4">
          <Label>Record Audio</Label>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant={isRecording ? "destructive" : "secondary"}
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isUploading}
              className="flex items-center gap-2"
            >
              {isRecording ? (
                <>
                  <MicOff size={16} />
                  Stop Recording
                </>
              ) : (
                <>
                  <Mic size={16} />
                  Start Recording
                </>
              )}
            </Button>
            
            {isRecording && (
              <span className="text-sm font-medium text-red-500">
                Recording... {formatTime(recordingTime)}
              </span>
            )}
          </div>
          
          {audioBlob && (
            <Button
              type="button"
              variant="outline"
              onClick={uploadRecording}
              disabled={isUploading || !audioBlob}
              className="mt-2"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Upload Recording'
              )}
            </Button>
          )}
        </div>
        
        <div className="space-y-2 mt-2">
          <Label htmlFor="audioUrl">Or enter Audio URL</Label>
          <Input
            id="audioUrl"
            value={audioUrl}
            onChange={(e) => setAudioUrl(e.target.value)}
            placeholder="https://example.com/audio.mp3"
            disabled={isRecording || isUploading}
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
          disabled={isRecording || isUploading}
        >
          Update Audio
        </Button>
        
        {(hasAudio || audioUrl) && !isRecording && (
          <div className="mt-6">
            <h3 className="text-sm font-medium mb-2">Preview:</h3>
            <div className="bg-vice-purple/10 rounded-lg overflow-hidden">
              <AudioPlayer 
                audioUrl={audioUrl || (userData.audio?.url || '')}
                title={audioTitle || (userData.audio?.title || 'Voice Intro')}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditProfileAudio;
