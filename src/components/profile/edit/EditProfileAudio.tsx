
import React, { useState, useRef } from 'react';
import { UserProfile } from '@/types/auth';
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
        
        // Auto upload after recording stops
        uploadRecording(audioBlob, audioTitle);
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
  
  const uploadRecording = async (blob: Blob | null, title: string) => {
    if (!blob || !title.trim()) {
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
        .upload(filePath, blob, {
          contentType: 'audio/webm',
          upsert: true
        });
      
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('profile-media')
        .getPublicUrl(filePath);
      
      const publicUrl = publicUrlData.publicUrl;
      
      // Get user ID from userData
      const userId = userData.id;
      
      if (!userId) {
        throw new Error('User ID not found');
      }
      
      // First check if the user already has an audio entry
      const { data: existingAudio, error: fetchError } = await supabase
        .from('profile_audio')
        .select('*')
        .eq('profile_id', userId)
        .single();
      
      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
        throw fetchError;
      }
      
      // Insert or update in profile_audio table
      if (existingAudio) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('profile_audio')
          .update({ 
            title: title.trim(),
            url: publicUrl
          })
          .eq('profile_id', userId);
          
        if (updateError) throw updateError;
      } else {
        // Insert new record
        const { error: insertError } = await supabase
          .from('profile_audio')
          .insert({ 
            profile_id: userId,
            title: title.trim(),
            url: publicUrl
          });
          
        if (insertError) throw insertError;
      }
      
      // Update component state
      setAudioUrl(publicUrl);
      
      // Update parent component
      updateField('audio', {
        title: title.trim(),
        url: publicUrl
      });
      
      setIsUploading(false);
    } catch (err: any) {
      console.error('Error uploading audio:', err);
      setError('Failed to upload audio: ' + (err.message || 'Unknown error'));
      setIsUploading(false);
    }
  };
  
  const hasAudio = !!(userData.audio?.url && userData.audio?.title);
  
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Add a voice introduction to your profile by recording directly.
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
          
          {audioBlob && !isUploading && audioUrl.startsWith('blob:') && (
            <Button
              type="button"
              variant="outline"
              onClick={() => uploadRecording(audioBlob, audioTitle)}
              disabled={isUploading || !audioBlob}
              className="mt-2"
            >
              Upload Recording
            </Button>
          )}
          
          {isUploading && (
            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Uploading audio...</span>
            </div>
          )}
        </div>
        
        {error && (
          <div className="flex items-center text-destructive text-sm gap-1">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}
        
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
