
import React, { useState } from 'react';
import { UserProfile } from '@/types/auth';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { updateProfileAvatar } from '@/utils/match/profileService';
import SortablePhotoItem from './components/SortablePhotoItem';
import PhotoUploader from './components/PhotoUploader';
import { 
  compressImage, 
  furtherCompressImage, 
  uploadProfilePhoto, 
  updatePhotoOrders, 
  deleteProfilePhoto 
} from '@/utils/profile/photoUtils';

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
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  const handleFileSelect = async (file: File) => {
    const currentPhotos = userData.photos || [];
    if (currentPhotos.length >= MAX_PHOTOS) {
      setError(`You can only upload a maximum of ${MAX_PHOTOS} photos. Please delete some existing photos first.`);
      return;
    }
    
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Please upload a JPEG, PNG, or WebP image.');
      return;
    }
    
    setIsUploading(true);
    setError('');
    setUploadProgress(10);
    
    try {
      setUploadProgress(50);
      
      const publicUrl = await uploadProfilePhoto(
        file, 
        userData.id || '', 
        currentPhotos.length
      );
      
      setUploadProgress(90);
      
      const updatedPhotos = [...currentPhotos, publicUrl];
      updateField('photos', updatedPhotos);
      
      // If this is the first photo, set it as avatar
      if (currentPhotos.length === 0) {
        updateField('avatar', publicUrl);
      }
      
      setUploadProgress(100);
      toast.success('Photo uploaded successfully');
    } catch (err: any) {
      console.error('Error uploading photo:', err);
      setError('Failed to upload photo: ' + (err.message || 'Unknown error'));
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };
  
  const handleDeletePhoto = async (photoUrl: string) => {
    try {
      const currentPhotos = userData.photos || [];
      const photoIndex = currentPhotos.indexOf(photoUrl);
      const updatedPhotos = currentPhotos.filter(url => url !== photoUrl);
      
      updateField('photos', updatedPhotos);
      
      if (userData.id) {
        const wasMainPhoto = await deleteProfilePhoto(userData.id, photoUrl);
        
        // If the deleted photo was the main photo and we have other photos
        if (wasMainPhoto && updatedPhotos.length > 0) {
          updateField('avatar', updatedPhotos[0]);
          
          if (userData.id) {
            await updateProfileAvatar(userData.id, updatedPhotos[0]);
          }
        } else if (wasMainPhoto && updatedPhotos.length === 0) {
          updateField('avatar', '');
        }
        
        if (updatedPhotos.length > 0) {
          await updatePhotoOrders(userData.id, updatedPhotos);
        }
      }
      
      toast.success('Photo deleted successfully');
    } catch (err) {
      console.error('Error deleting photo:', err);
      setError('Failed to delete photo. Please try again.');
    }
  };
  
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) {
      return;
    }
    
    const oldIndex = userData.photos?.findIndex(url => url === active.id) || 0;
    const newIndex = userData.photos?.findIndex(url => url === over.id) || 0;
    
    if (oldIndex === -1 || newIndex === -1) return;
    
    const updatedPhotos = arrayMove(userData.photos || [], oldIndex, newIndex);
    updateField('photos', updatedPhotos);
    
    if (newIndex === 0 && oldIndex !== 0) {
      const newMainPhoto = updatedPhotos[0];
      updateField('avatar', newMainPhoto);
      
      if (userData.id) {
        await updateProfileAvatar(userData.id, newMainPhoto);
        toast.success('Main photo updated');
      }
    } else if (userData.id) {
      await updatePhotoOrders(userData.id, updatedPhotos);
    }
  };
  
  const handleMakeMainPhoto = async (photoUrl: string) => {
    if (!userData.photos || userData.photos.length < 2) return;
    
    const photoIndex = userData.photos.findIndex(url => url === photoUrl);
    if (photoIndex <= 0) return;
    
    const updatedPhotos = [...userData.photos];
    updatedPhotos.splice(photoIndex, 1);
    updatedPhotos.unshift(photoUrl);
    
    updateField('photos', updatedPhotos);
    updateField('avatar', photoUrl);
    
    if (userData.id) {
      const success = await updateProfileAvatar(userData.id, photoUrl);
      
      if (success) {
        toast.success('Main photo updated');
      } else {
        toast.error('Failed to update main photo');
      }
    }
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Profile Photos</h2>
      
      <p className="text-sm text-muted-foreground">
        Upload photos to showcase your personality. You can upload up to {MAX_PHOTOS} photos.
        Large images will be automatically compressed. Drag photos to reorder them.
      </p>
      
      <PhotoUploader
        currentPhotosCount={userData.photos?.length || 0}
        maxPhotos={MAX_PHOTOS}
        onFileSelect={handleFileSelect}
        isUploading={isUploading}
        uploadProgress={uploadProgress}
        error={error}
      />
      
      {userData.photos && userData.photos.length > 0 && (
        <div className="mt-6">
          <h3 className="text-md font-medium mb-3">Your Photos</h3>
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={userData.photos}
              strategy={verticalListSortingStrategy}
            >
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {userData.photos.map((photo, index) => (
                  <SortablePhotoItem
                    key={photo}
                    id={photo}
                    url={photo}
                    index={index}
                    isMain={index === 0}
                    onDelete={handleDeletePhoto}
                    onMakeMain={handleMakeMainPhoto}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  );
};

export default EditProfilePhotos;
