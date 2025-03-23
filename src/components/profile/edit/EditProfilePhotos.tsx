
import React, { useState } from 'react';
import { UserProfile } from '@/context/AuthContext';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { AlertCircle, Upload, Trash2, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

interface EditProfilePhotosProps {
  userData: Partial<UserProfile>;
  updateField: (field: string, value: any) => void;
}

const EditProfilePhotos = ({ userData, updateField }: EditProfilePhotosProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const MAX_PHOTOS = 6;
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const currentPhotos = userData.photos || [];
    if (currentPhotos.length >= MAX_PHOTOS) {
      setError(`You can only upload a maximum of ${MAX_PHOTOS} photos. Please delete some existing photos first.`);
      return;
    }
    
    const file = files[0];
    
    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Please upload a JPEG, PNG, or WebP image.');
      return;
    }
    
    // Validate file size
    if (file.size > MAX_SIZE) {
      setError('File size must be less than 5MB.');
      return;
    }
    
    setIsUploading(true);
    setError('');
    
    try {
      // Generate a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `photos/${fileName}`;
      
      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('profile-media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type
        });
      
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('profile-media')
        .getPublicUrl(filePath);
      
      const publicUrl = publicUrlData.publicUrl;
      
      // Update photos array
      const updatedPhotos = [...currentPhotos, publicUrl];
      updateField('photos', updatedPhotos);
      
      // Also save to database
      if (userData.id) {
        const { error: dbError } = await supabase
          .from('profile_photos')
          .insert({
            profile_id: userData.id,
            url: publicUrl,
            order_index: currentPhotos.length,
            created_at: new Date().toISOString()
          });
          
        if (dbError) {
          console.error('Error saving photo to database:', dbError);
        }
      }
      
      // Reset the input
      e.target.value = '';
    } catch (err: any) {
      console.error('Error uploading photo:', err);
      setError('Failed to upload photo: ' + (err.message || 'Unknown error'));
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };
  
  const handleDeletePhoto = async (photoUrl: string, index: number) => {
    try {
      const currentPhotos = userData.photos || [];
      const updatedPhotos = currentPhotos.filter(url => url !== photoUrl);
      
      // Update state
      updateField('photos', updatedPhotos);
      
      // Delete from database if user ID exists
      if (userData.id) {
        // First, get the database record ID using the URL
        const { data: photoRecord, error: fetchError } = await supabase
          .from('profile_photos')
          .select('id')
          .eq('profile_id', userData.id)
          .eq('url', photoUrl)
          .single();
          
        if (fetchError) {
          console.error('Error finding photo record:', fetchError);
        }
        
        if (photoRecord) {
          const { error: deleteError } = await supabase
            .from('profile_photos')
            .delete()
            .eq('id', photoRecord.id);
            
          if (deleteError) {
            console.error('Error deleting photo from database:', deleteError);
          }
        }
        
        // Try to delete the file from storage
        // Extract the file path from the URL
        const urlParts = photoUrl.split('/');
        const fileName = urlParts[urlParts.length - 1];
        const filePath = `photos/${fileName}`;
        
        const { error: storageError } = await supabase.storage
          .from('profile-media')
          .remove([filePath]);
          
        if (storageError) {
          console.error('Error deleting photo from storage:', storageError);
        }
      }
    } catch (err) {
      console.error('Error deleting photo:', err);
      setError('Failed to delete photo. Please try again.');
    }
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Profile Photos</h2>
      
      <p className="text-sm text-muted-foreground">
        Upload photos to showcase your personality. You can upload up to {MAX_PHOTOS} photos.
      </p>
      
      <div className="mt-4">
        <Label htmlFor="photoUpload" className="block mb-2">Add a Photo</Label>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={() => document.getElementById('photoUpload')?.click()}
            disabled={isUploading || (userData.photos?.length || 0) >= MAX_PHOTOS}
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
            disabled={isUploading || (userData.photos?.length || 0) >= MAX_PHOTOS}
          />
          <span className="text-sm text-muted-foreground">
            {(userData.photos?.length || 0)}/{MAX_PHOTOS} photos uploaded
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
      
      {userData.photos && userData.photos.length > 0 && (
        <div className="mt-6">
          <h3 className="text-md font-medium mb-3">Your Photos</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {userData.photos.map((photo, index) => (
              <div key={index} className="relative group">
                <img 
                  src={photo} 
                  alt={`Profile photo ${index + 1}`} 
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => handleDeletePhoto(photo, index)}
                  className="absolute top-2 right-2 bg-black/70 text-white p-1.5 rounded-full 
                            opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Delete photo"
                >
                  <XCircle size={18} />
                </button>
                {index === 0 && (
                  <span className="absolute bottom-2 left-2 bg-vice-purple text-white text-xs px-2 py-1 rounded-full">
                    Main Photo
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EditProfilePhotos;
