import React, { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { UserProfile } from '@/types/auth';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FileInput } from '@/components/ui/file-input';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { supabase } from '@/integrations/supabase/client';

interface EditProfilePhotosProps {
  userData: Partial<UserProfile>;
  updateField: (field: string, value: any) => void;
}

const EditProfilePhotos = ({ userData, updateField }: EditProfilePhotosProps) => {
  const [isUploading, setIsUploading] = useState(false);
  
  const uploadPhoto = useCallback(async (file: File): Promise<string | null> => {
    try {
      const timestamp = new Date().getTime();
      const filename = `${timestamp}-${file.name}`;
      
      const { data, error } = await supabase.storage
        .from('profile-photos')
        .upload(filename, file, {
          cacheControl: '3600',
          upsert: false
        });
        
      if (error) {
        console.error('Error uploading photo:', error);
        return null;
      }
      
      const publicURL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/profile-photos/${filename}`;
      return publicURL;
    } catch (error) {
      console.error('Error during photo upload:', error);
      return null;
    }
  }, []);
  
  const handleFilesSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }
    
    setIsUploading(true);
    
    const files = Array.from(event.target.files);
    const maxPhotos = 9 - (userData.photos?.length || 0);
    const filesToUpload = files.slice(0, maxPhotos);
    
    try {
      const uploadedUrls = await Promise.all(
        filesToUpload.map((file) => uploadPhoto(file))
      );
      
      const validUrls = uploadedUrls.filter(Boolean) as string[];
      const updatedPhotos = [...(userData.photos || []), ...validUrls];
      
      updateField('photos', updatedPhotos);
      
      // Update avatar with the first photo if no photos existed before
      if (!userData.photos || userData.photos.length === 0) {
        updateField('avatar', validUrls[0]);
        console.log('Set avatar to first uploaded photo:', validUrls[0]);
      }
      
      toast.success(`Uploaded ${validUrls.length} photos`);
    } catch (error) {
      console.error('Error uploading photos:', error);
      toast.error('Failed to upload photos');
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleDeletePhoto = async (photoUrl: string) => {
    try {
      const filename = photoUrl.substring(photoUrl.lastIndexOf('/') + 1);
      
      const { error } = await supabase.storage
        .from('profile-photos')
        .remove([filename]);
        
      if (error) {
        console.error('Error deleting photo:', error);
        toast.error('Failed to delete photo');
        return;
      }
      
      const updatedPhotos = userData.photos ? userData.photos.filter(url => url !== photoUrl) : [];
      updateField('photos', updatedPhotos);
      
      // If deleting the current avatar, reset it to null or a default image
      if (userData.avatar === photoUrl) {
        updateField('avatar', null);
      }
      
      toast.success('Photo deleted successfully');
    } catch (error) {
      console.error('Error during photo deletion:', error);
      toast.error('Failed to delete photo');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Profile Photos</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="photos">Upload Photos</Label>
          <FileInput
            id="photos"
            multiple
            accept="image/*"
            onChange={handleFilesSelected}
            disabled={isUploading || (userData.photos && userData.photos.length >= 9)}
          />
          {isUploading && <p>Uploading...</p>}
          {userData.photos && userData.photos.length >= 9 && <p>Maximum 9 photos allowed.</p>}
        </div>
        
        <div>
          <Label>Current Photos</Label>
          <div className="flex flex-wrap gap-4 mt-2">
            {userData.photos && userData.photos.map((photoUrl, index) => (
              <div key={index} className="relative w-24 h-24 rounded-md overflow-hidden">
                <img
                  src={photoUrl}
                  alt={`Profile photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => handleDeletePhoto(photoUrl)}
                  className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-red-500"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div>
        <Label>Avatar</Label>
        <div className="flex items-center space-x-4 mt-2">
          <Avatar>
            {userData.avatar ? (
              <AvatarImage src={userData.avatar} alt="Avatar" />
            ) : (
              <AvatarFallback>
                {userData.name ? userData.name[0] : 'U'}
              </AvatarFallback>
            )}
          </Avatar>
          <p>
            Your avatar is automatically set to your first uploaded photo.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EditProfilePhotos;
