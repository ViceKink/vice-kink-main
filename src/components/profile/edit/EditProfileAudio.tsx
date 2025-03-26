
import React, { useState, useRef, useEffect } from 'react';
import { UserProfile } from '@/types/auth';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import AudioPlayer from '@/components/ui/AudioPlayer';
import { AlertCircle, Mic, MicOff, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

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
  
  // Clear error when title changes
  useEffect(() => {
    if (error) {
      setError('');
    }
  }, [audioTitle]);
  
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
    if (!audioBlob) {
      setError('No recording found. Please record audio first.');
      return;
    }
    
    if (!audioTitle.trim()) {
      setError('Please provide a title for your audio recording');
      return;
    }
    
    setIsUploading(true);
    setError('');
    
    console.log("Starting upload process:", { 
      audioTitle,
      blobSize: audioBlob.size,
      blobType: audioBlob.type,
      userId: userData.id
    });
    
    try {
      // Generate a unique file name
      const fileName = `${uuidv4()}.webm`;
      const filePath = `audio/${fileName}`;
      
      console.log("Preparing to upload to Supabase storage:", { filePath });
      
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-media')
        .upload(filePath, audioBlob, {
          contentType: 'audio/webm',
          upsert: true
        });
      
      if (uploadError) {
        console.error("Storage upload error:", uploadError);
        throw new Error(`Storage upload failed: ${uploadError.message}`);
      }
      
      console.log("Storage upload successful:", uploadData);
      
      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('profile-media')
        .getPublicUrl(filePath);
      
      if (!publicUrlData || !publicUrlData.publicUrl) {
        throw new Error('Failed to get public URL for uploaded file');
      }
      
      const publicUrl = publicUrlData.publicUrl;
      console.log("Generated public URL:", publicUrl);
      
      // Get user ID from userData
      const userId = userData.id;
      
      if (!userId) {
        throw new Error('User ID not found');
      }
      
      console.log("Processing database update for user:", userId);
      
      // Check if the user already has an audio entry
      const { data: existingAudio, error: fetchError } = await supabase
        .from('profile_audio')
        .select('*')
        .eq('profile_id', userId)
        .maybeSingle();
      
      if (fetchError) {
        console.error("Error checking existing audio:", fetchError);
        throw new Error(`Database query failed: ${fetchError.message}`);
      }
      
      console.log("Existing audio check result:", existingAudio);
      
      let dbError = null;
      
      // Insert or update in profile_audio table
      if (existingAudio) {
        // Update existing record
        console.log("Updating existing audio record");
        const { error } = await supabase
          .from('profile_audio')
          .update({ 
            title: audioTitle.trim(),
            url: publicUrl
          })
          .eq('profile_id', userId);
          
        dbError = error;
      } else {
        // Insert new record
        console.log("Inserting new audio record");
        const { error } = await supabase
          .from('profile_audio')
          .insert({ 
            profile_id: userId,
            title: audioTitle.trim(),
            url: publicUrl
          });
          
        dbError = error;
      }
      
      if (dbError) {
        console.error("Database operation failed:", dbError);
        throw new Error(`Database operation failed: ${dbError.message}`);
      }
      
      console.log("Database operation successful");
      
      // Update component state with the permanent URL
      setAudioUrl(publicUrl);
      
      // Update parent component
      updateField('audio', {
        title: audioTitle.trim(),
        url: publicUrl
      });
      
      toast.success('Audio successfully uploaded!');
      console.log("Upload process completed successfully");
    } catch (err: any) {
      console.error('Error uploading audio:', err);
      setError('Failed to upload audio: ' + (err.message || 'Unknown error'));
      toast.error('Failed to upload audio: ' + (err.message || 'Unknown error'));
    } finally {
      setIsUploading(false);
    }
  };
  
  // Determine if we have a permanent audio URL (not a blob URL)
  const hasStoredAudio = !!(userData.audio?.url && !userData.audio.url.startsWith('blob:'));
  const hasRecordedAudio = !!audioBlob;
  
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
          
          {hasRecordedAudio && (
            <Button
              type="button"
              variant="outline"
              onClick={uploadRecording}
              disabled={isUploading}
              className="mt-2"
            >
              {isUploading ? 'Uploading...' : 'Upload Recording'}
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
        
        {(hasStoredAudio || audioUrl) && !isRecording && (
          <div className="mt-6">
            <h3 className="text-sm font-medium mb-2">Preview:</h3>
            <div className="bg-vice-purple/10 rounded-lg overflow-hidden">
              <AudioPlayer 
                audioUrl={audioUrl}
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
