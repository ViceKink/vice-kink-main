
import React, { useState, useRef, useEffect } from 'react';
import { UserProfile } from '@/types/auth';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import AudioPlayer from '@/components/ui/AudioPlayer';
import { Mic, MicOff, Loader2, Check, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/components/ui/use-toast';

interface EditProfileAudioProps {
  userData: Partial<UserProfile>;
  updateField: (field: string, value: any) => void;
}

const EditProfileAudio = ({ userData, updateField }: EditProfileAudioProps) => {
  // Basic component state
  const [audioTitle, setAudioTitle] = useState(userData.audio?.title || '');
  const [audioUrl, setAudioUrl] = useState(userData.audio?.url || '');
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState('');
  const [recordingSuccess, setRecordingSuccess] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Refs for recording
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Clear error when title changes
  useEffect(() => {
    if (error && audioTitle.trim()) {
      setError('');
    }
  }, [audioTitle, error]);

  // Cleanup function when component unmounts
  useEffect(() => {
    return () => {
      // Stop any ongoing recording
      if (isRecording) {
        stopRecording();
      }
      
      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      // Release any blob URLs
      if (audioUrl && audioUrl.startsWith('blob:')) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [isRecording, audioUrl]);

  // Start recording function
  const startRecording = async () => {
    try {
      setError('');
      setRecordingSuccess(false);
      setUploadSuccess(false);
      
      // Reset audio blob
      setAudioBlob(null);
      
      // Revoke previous blob URL if exists
      if (audioUrl && audioUrl.startsWith('blob:')) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl('');
      }
      
      console.log("Requesting microphone access...");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      // Create and configure media recorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      // Set up data handler
      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      // Set up stop handler
      mediaRecorder.onstop = () => {
        console.log("Recording stopped, processing audio chunks...");
        if (audioChunksRef.current.length > 0) {
          // Create blob from chunks
          const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          
          console.log(`Created audio blob: size=${blob.size}, type=${blob.type}`);
          
          if (blob.size > 0) {
            setAudioBlob(blob);
            
            // Create preview URL
            const url = URL.createObjectURL(blob);
            setAudioUrl(url);
            
            setRecordingSuccess(true);
            console.log("Recording processed successfully!");
          } else {
            setError("Recording failed: no audio data captured");
            toast({
              title: "Recording Failed",
              description: "No audio data was captured. Please try again.",
              variant: "destructive"
            });
          }
        } else {
          setError("Recording failed: no audio data received");
          toast({
            title: "Recording Failed",
            description: "No audio data was received. Please try again.",
            variant: "destructive"
          });
        }
      };
      
      // Start recording
      mediaRecorder.start(100); // Collect data in short intervals for more responsive UI
      setIsRecording(true);
      setRecordingTime(0);
      
      console.log("Recording started successfully!");
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (err) {
      console.error("Error starting recording:", err);
      setError("Could not access microphone. Please ensure it is connected and you have granted permission.");
      toast({
        title: "Microphone Error",
        description: "Could not access your microphone. Please check permissions and try again.",
        variant: "destructive"
      });
    }
  };

  // Stop recording function
  const stopRecording = () => {
    console.log("Stopping recording...");
    
    if (!mediaRecorderRef.current || !isRecording) {
      console.log("No active recording to stop");
      return;
    }
    
    try {
      // Request final data
      if (mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.requestData();
      }
      
      // Stop recording
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop all tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          track.stop();
        });
      }
      
      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      console.log("Recording stopped successfully");
    } catch (err) {
      console.error("Error stopping recording:", err);
      setError("Error stopping recording");
      toast({
        title: "Recording Error",
        description: "There was a problem stopping the recording.",
        variant: "destructive"
      });
    }
  };

  // Format time for display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Upload recording function
  const uploadRecording = async () => {
    // Validation checks
    if (!audioBlob) {
      setError('No recording to upload. Please record audio first.');
      toast({
        title: "Upload Error",
        description: "No recording found. Please record audio first.",
        variant: "destructive"
      });
      return;
    }
    
    if (!audioTitle.trim()) {
      setError('Please provide a title for your audio recording.');
      toast({
        title: "Title Required",
        description: "Please provide a title for your audio recording.",
        variant: "destructive"
      });
      return;
    }
    
    if (!userData.id) {
      setError('User ID not found. Please refresh and try again.');
      toast({
        title: "User Error",
        description: "User ID not found. Please refresh and try again.",
        variant: "destructive"
      });
      return;
    }
    
    // Begin upload process
    setIsUploading(true);
    setError('');
    setUploadSuccess(false);
    
    console.log("Starting upload process...");
    
    try {
      // Generate unique filename
      const fileName = `${uuidv4()}.webm`;
      const filePath = `audio/${fileName}`;
      
      console.log(`Uploading to storage path: ${filePath}`);
      
      // Upload to Supabase Storage with retries
      let uploadSuccess = false;
      let attempts = 0;
      let uploadError;
      
      while (!uploadSuccess && attempts < 3) {
        attempts++;
        try {
          console.log(`Upload attempt ${attempts}...`);
          
          const { data, error } = await supabase.storage
            .from('profile-media')
            .upload(filePath, audioBlob, {
              contentType: 'audio/webm',
              upsert: true,
              cacheControl: '3600'
            });
          
          if (error) {
            console.error(`Upload attempt ${attempts} failed:`, error);
            uploadError = error;
            // Wait before retry
            if (attempts < 3) {
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          } else {
            uploadSuccess = true;
            console.log("Upload successful:", data);
          }
        } catch (err) {
          console.error(`Upload attempt ${attempts} error:`, err);
          uploadError = err;
          // Wait before retry
          if (attempts < 3) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }
      
      if (!uploadSuccess) {
        throw uploadError || new Error("Failed to upload after multiple attempts");
      }
      
      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('profile-media')
        .getPublicUrl(filePath);
      
      if (!publicUrlData?.publicUrl) {
        throw new Error("Failed to get public URL for uploaded file");
      }
      
      const publicUrl = publicUrlData.publicUrl;
      console.log("Generated public URL:", publicUrl);
      
      // Check for existing record
      const { data: existingAudio } = await supabase
        .from('profile_audio')
        .select('*')
        .eq('profile_id', userData.id)
        .maybeSingle();
      
      console.log("Existing audio check:", existingAudio);
      
      let dbResult;
      
      // Update or insert record
      if (existingAudio) {
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
        console.log("Creating new audio record");
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
      
      // Update local state
      setAudioUrl(publicUrl);
      
      // Update parent component
      updateField('audio', {
        title: audioTitle.trim(),
        url: publicUrl
      });
      
      setUploadSuccess(true);
      toast({
        title: "Upload Successful",
        description: "Your audio has been uploaded successfully!",
      });
      
    } catch (err: any) {
      console.error("Upload error:", err);
      const errorMessage = err.message || "Unknown error";
      setError(`Failed to upload: ${errorMessage}`);
      toast({
        title: "Upload Failed",
        description: `Failed to upload: ${errorMessage}`,
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  // Check if we have a stored audio (not a blob URL)
  const hasStoredAudio = !!(userData.audio?.url && !userData.audio.url.startsWith('blob:'));
  const hasRecordedAudio = !!audioBlob;

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Add a voice introduction to your profile by recording directly.
      </p>
      
      <div className="space-y-4">
        {/* Audio Title Input */}
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
        
        {/* Recording Controls */}
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
          
          {/* Upload Button */}
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
          
          {/* Status Messages */}
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
        
        {/* Error Messages */}
        {error && (
          <div className="flex items-center text-destructive text-sm gap-1 mt-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}
        
        {/* Audio Preview */}
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
