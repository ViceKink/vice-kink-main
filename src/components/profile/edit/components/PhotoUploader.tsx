
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { AlertCircle, Upload, Loader2 } from 'lucide-react';

interface PhotoUploaderProps {
  currentPhotosCount: number;
  maxPhotos: number;
  onFileSelect: (file: File) => Promise<void>;
  isUploading: boolean;
  uploadProgress: number;
  error: string;
}

const PhotoUploader = ({ 
  currentPhotosCount, 
  maxPhotos, 
  onFileSelect, 
  isUploading, 
  uploadProgress, 
  error 
}: PhotoUploaderProps) => {
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    await onFileSelect(files[0]);
    e.target.value = '';
  };
  
  return (
    <div className="mt-4">
      <Label htmlFor="photoUpload" className="block mb-2">Add a Photo</Label>
      <div className="flex items-center gap-3">
        <Button
          variant="secondary"
          onClick={() => document.getElementById('photoUpload')?.click()}
          disabled={isUploading || currentPhotosCount >= maxPhotos}
          className="flex items-center gap-2"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload size={16} />
              Upload Photo
            </>
          )}
        </Button>
        <input
          type="file"
          id="photoUpload"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
          disabled={isUploading || currentPhotosCount >= maxPhotos}
        />
        <span className="text-sm text-muted-foreground">
          {currentPhotosCount}/{maxPhotos} photos uploaded
        </span>
      </div>
      
      {isUploading && (
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-3">
          <div 
            className="bg-vice-purple h-2.5 rounded-full" 
            style={{ width: `${uploadProgress}%` }}
          ></div>
        </div>
      )}
      
      {error && (
        <div className="flex items-center text-destructive text-sm gap-1 mt-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default PhotoUploader;
