
import React, { useState, useRef, useEffect } from 'react';
import { UserProfile } from '@/types/auth';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import AudioPlayer from '@/components/ui/AudioPlayer';
import { AlertCircle, Mic, MicOff, Loader2, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

interface EditProfileAudioProps {
  userData: Partial<UserProfile>;
  updateField: (field: string, value: any) => void;
}

const EditProfileAudio = ({ userData, updateField }: EditProfileAudioProps) => {
  // State for component
  const [audioTitle, setAudioTitle] = useState(userData.audio?.title || '');
  const [audioUrl, setAudioUrl] = useState(userData.audio?.url || '');
  const [error, setError] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingSuccess, setRecordingSuccess] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  
  // Refs for media handling
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  
  // Clear error when title changes
  useEffect(() => {
    if (error) {
      setError('');
    }
  }, [audioTitle]);
  
  // Cleanup function
  useEffect(() => {
    return () => {
      // Stop recording and clean up media if component unmounts during recording
      if (isRecording && mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        if (audioStreamRef.current) {
          audioStreamRef.current.getTracks().forEach(track => track.stop());
        }
      }
      
      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      // Release any object URLs to prevent memory leaks
      if (audioUrl && audioUrl.startsWith('blob:')) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [isRecording, audioUrl]);
  
  const startRecording = async () => {
    setError('');
    setRecordingSuccess(false);
    setUploadSuccess(false);
    
    try {
      // Reset state before new recording
      setAudioBlob(null);
      
      // If there's an existing blob URL, revoke it to prevent memory leaks
      if (audioUrl && audioUrl.startsWith('blob:')) {
        URL.revokeObjectURL(audioUrl);
      }
      
      // Get audio stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;
      
      // Create media recorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      // Handle data available event
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      // Handle stop event
      mediaRecorder.onstop = () => {
        // Only process if we have audio chunks
        if (audioChunksRef.current.length > 0) {
          // Create blob from chunks
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          console.log("Recording stopped. Audio blob created:", { 
            size: audioBlob.size, 
            type: audioBlob.type,
            chunks: audioChunksRef.current.length
          });
          
          // Check if blob is valid
          if (audioBlob.size > 0) {
            setAudioBlob(audioBlob);
            setRecordingSuccess(true);
            
            // Create a local URL for preview
            const blobUrl = URL.createObjectURL(audioBlob);
            setAudioUrl(blobUrl);
            console.log("Created blob URL for audio preview:", blobUrl);
          } else {
            console.error("Empty audio blob created");
            setError("Recording failed: No audio data captured.");
            toast.error("Recording failed: No audio data captured.");
          }
        } else {
          console.error("No audio chunks recorded");
          setError("Recording failed: No audio data captured.");
          toast.error("Recording failed: No audio data captured.");
        }
      };
      
      // Start recording
      mediaRecorder.start(100); // Collect data every 100ms for more frequent updates
      setIsRecording(true);
      setRecordingTime(0);
      console.log("Recording started");
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setError('Could not access your microphone. Please ensure it is connected and you have granted permission.');
      toast.error('Microphone access error');
    }
  };
  
  const stopRecording = () => {
    if (!mediaRecorderRef.current || !isRecording) {
      console.log("No active recording to stop");
      return;
    }
    
    console.log("Stopping recording...");
    
    try {
      // Request data before stopping (to ensure we get the final chunk)
      if (mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.requestData();
      }
      
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop all audio tracks
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => track.stop());
      }
      
      // Clear the timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      console.log("Recording stopped successfully");
    } catch (err) {
      console.error("Error stopping recording:", err);
      setError("There was an error stopping the recording.");
      toast.error("Error stopping recording");
    }
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  const uploadRecording = async () => {
    // Validate required conditions
    if (!audioBlob) {
      setError('No recording found. Please record audio first.');
      toast.error('No recording found');
      return;
    }
    
    if (!audioTitle.trim()) {
      setError('Please provide a title for your audio recording');
      toast.error('Audio title required');
      return;
    }
    
    if (!userData.id) {
      setError('User ID not found. Please refresh the page and try again.');
      toast.error('User ID not found');
      return;
    }
    
    // Start upload process
    setIsUploading(true);
    setError('');
    setUploadSuccess(false);
    
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
      
      // Upload to Supabase Storage (with timeouts and retries)
      let uploadAttempts = 0;
      let uploadSuccessful = false;
      let uploadData = null;
      
      while (uploadAttempts < 3 && !uploadSuccessful) {
        uploadAttempts++;
        console.log(`Storage upload attempt ${uploadAttempts}...`);
        
        try {
          const { data, error } = await supabase.storage
            .from('profile-media')
            .upload(filePath, audioBlob, {
              contentType: 'audio/webm',
              upsert: true,
              cacheControl: '3600'
            });
          
          if (error) {
            console.error(`Upload attempt ${uploadAttempts} failed:`, error);
            if (uploadAttempts === 3) {
              throw error;
            }
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 1000));
          } else {
            uploadSuccessful = true;
            uploadData = data;
            console.log("Storage upload successful:", data);
          }
        } catch (innerError) {
          console.error(`Upload attempt ${uploadAttempts} exception:`, innerError);
          if (uploadAttempts === 3) {
            throw innerError;
          }
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      if (!uploadSuccessful) {
        throw new Error('Failed to upload after multiple attempts');
      }
      
      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('profile-media')
        .getPublicUrl(filePath);
      
      if (!publicUrlData || !publicUrlData.publicUrl) {
        throw new Error('Failed to get public URL for uploaded file');
      }
      
      const publicUrl = publicUrlData.publicUrl;
      console.log("Generated public URL:", publicUrl);
      
      // Check if the user already has an audio entry
      const { data: existingAudio, error: fetchError } = await supabase
        .from('profile_audio')
        .select('*')
        .eq('profile_id', userData.id)
        .maybeSingle();
      
      if (fetchError) {
        console.error("Error checking existing audio:", fetchError);
        throw fetchError;
      }
      
      console.log("Existing audio check result:", existingAudio);
      
      let dbResult;
      
      // Insert or update in profile_audio table
      if (existingAudio) {
        // Update existing record
        console.log("Updating existing audio record");
        const { data, error } = await supabase
          .from('profile_audio')
          .update({ 
            title: audioTitle.trim(),
            url: publicUrl
          })
          .eq('profile_id', userData.id)
          .select();
          
        if (error) throw error;
        dbResult = data;
      } else {
        // Insert new record
        console.log("Inserting new audio record");
        const { data, error } = await supabase
          .from('profile_audio')
          .insert({ 
            profile_id: userData.id,
            title: audioTitle.trim(),
            url: publicUrl
          })
          .select();
          
        if (error) throw error;
        dbResult = data;
      }
      
      console.log("Database operation successful:", dbResult);
      
      // Update component state with the permanent URL
      setAudioUrl(publicUrl);
      
      // Update parent component
      updateField('audio', {
        title: audioTitle.trim(),
        url: publicUrl
      });
      
      setUploadSuccess(true);
      toast.success('Audio successfully uploaded!');
      console.log("Upload process completed successfully");
    } catch (err: any) {
      console.error('Error uploading audio:', err);
      const errorMessage = err.message || 'Unknown error';
      setError('Failed to upload audio: ' + errorMessage);
      toast.error('Failed to upload audio: ' + errorMessage);
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
            className={error && !audioTitle.trim() ? "border-red-500" : ""}
          />
          {error && !audioTitle.trim() && (
            <p className="text-sm text-red-500">Title is required</p>
          )}
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
            
            {recordingSuccess && !isRecording && (
              <span className="text-sm font-medium text-green-500 flex items-center">
                <Check size={16} className="mr-1" /> Recording ready
              </span>
            )}
          </div>
          
          {hasRecordedAudio && !isRecording && (
            <Button
              type="button"
              variant="default"
              onClick={uploadRecording}
              disabled={isUploading || !audioTitle.trim()}
              className="mt-2 bg-vice-purple hover:bg-vice-dark-purple"
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
          
          {isUploading && (
            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Uploading audio...</span>
            </div>
          )}
          
          {uploadSuccess && (
            <div className="flex items-center gap-2 mt-2 text-sm text-green-500">
              <Check className="w-4 h-4" />
              <span>Audio uploaded successfully!</span>
            </div>
          )}
        </div>
        
        {error && (
          <div className="flex items-center text-destructive text-sm gap-1 mt-2">
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
            
            {audioUrl?.startsWith('blob:') && !hasStoredAudio && (
              <p className="text-xs text-orange-500 mt-2">
                This is a temporary preview. Click "Upload Recording" to save permanently.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EditProfileAudio;
