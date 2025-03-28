import React, { useState } from 'react';
import { UserProfile } from '@/types/auth';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { AlertCircle, Upload, Loader2, XCircle, GripVertical, ArrowUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
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
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { toast } from 'sonner';
import { updateProfileAvatar } from '@/utils/match/profileService';

interface EditProfilePhotosProps {
  userData: Partial<UserProfile>;
  updateField: (field: string, value: any) => void;
}

interface SortablePhotoItemProps {
  id: string;
  url: string;
  index: number;
  isMain: boolean;
  onDelete: (url: string) => void;
  onMakeMain: (url: string) => void;
}

const SortablePhotoItem = ({ id, url, index, isMain, onDelete, onMakeMain }: SortablePhotoItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="relative group border rounded-lg overflow-hidden"
    >
      <div 
        className="absolute top-2 left-2 bg-black/70 text-white p-1.5 rounded-full 
                cursor-grab opacity-0 group-hover:opacity-100 transition-opacity z-10"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={16} />
      </div>
      
      <img 
        src={url} 
        alt={`Profile photo ${index + 1}`} 
        className="w-full h-48 object-cover"
      />
      
      <button
        type="button"
        onClick={() => onDelete(url)}
        className="absolute top-2 right-2 bg-black/70 text-white p-1.5 rounded-full 
                  opacity-0 group-hover:opacity-100 transition-opacity z-10"
        aria-label="Delete photo"
      >
        <XCircle size={18} />
      </button>
      
      {isMain ? (
        <span className="absolute bottom-2 left-2 bg-vice-purple text-white text-xs px-2 py-1 rounded-full">
          Main Photo
        </span>
      ) : (
        <button
          type="button"
          onClick={() => onMakeMain(url)}
          className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full 
                    opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ArrowUp size={12} className="inline mr-1" />
          Make Main
        </button>
      )}
    </div>
  );
};

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

  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          
          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round(height * (MAX_WIDTH / width));
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round(width * (MAX_HEIGHT / height));
              height = MAX_HEIGHT;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }
          
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to compress image'));
                return;
              }
              resolve(blob);
            },
            file.type,
            0.7
          );
        };
        
        img.onerror = () => {
          reject(new Error('Failed to load image'));
        };
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
    });
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const currentPhotos = userData.photos || [];
    if (currentPhotos.length >= MAX_PHOTOS) {
      setError(`You can only upload a maximum of ${MAX_PHOTOS} photos. Please delete some existing photos first.`);
      return;
    }
    
    const file = files[0];
    
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Please upload a JPEG, PNG, or WebP image.');
      return;
    }
    
    setIsUploading(true);
    setError('');
    setUploadProgress(10);
    
    try {
      let fileToUpload: Blob = file;
      
      if (file.size > MAX_SIZE) {
        setUploadProgress(30);
        fileToUpload = await compressImage(file);
        
        if (fileToUpload.size > MAX_SIZE) {
          const canvas = document.createElement('canvas');
          const img = new Image();
          
          await new Promise<void>((resolve, reject) => {
            img.onload = () => {
              const MAX_DIM = 800;
              let width = img.width;
              let height = img.height;
              
              const aspectRatio = width / height;
              
              if (aspectRatio > 1) {
                width = MAX_DIM;
                height = width / aspectRatio;
              } else {
                height = MAX_DIM;
                width = height * aspectRatio;
              }
              
              canvas.width = width;
              canvas.height = height;
              
              const ctx = canvas.getContext('2d');
              if (!ctx) {
                reject(new Error('Failed to get canvas context'));
                return;
              }
              
              ctx.drawImage(img, 0, 0, width, height);
              
              canvas.toBlob(
                (blob) => {
                  if (!blob) {
                    reject(new Error('Failed to compress image'));
                    return;
                  }
                  fileToUpload = blob;
                  resolve();
                },
                'image/jpeg',
                0.5
              );
            };
            
            img.onerror = () => reject(new Error('Failed to load image for compression'));
            
            const reader = new FileReader();
            reader.onload = (e) => { img.src = e.target?.result as string; };
            reader.onerror = () => reject(new Error('Failed to read file for compression'));
            reader.readAsDataURL(fileToUpload);
          });
          
          if (fileToUpload.size > MAX_SIZE) {
            setError('Image is too large. Even after compression, it exceeds the 5MB limit.');
            setIsUploading(false);
            setUploadProgress(0);
            return;
          }
        }
      }
      
      setUploadProgress(50);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `photos/${fileName}`;
      
      setUploadProgress(70);
      const { data, error: uploadError } = await supabase.storage
        .from('profile-media')
        .upload(filePath, fileToUpload, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type
        });
      
      if (uploadError) throw uploadError;
      
      setUploadProgress(90);
      
      const { data: publicUrlData } = supabase.storage
        .from('profile-media')
        .getPublicUrl(filePath);
      
      const publicUrl = publicUrlData.publicUrl;
      
      const updatedPhotos = [...currentPhotos, publicUrl];
      updateField('photos', updatedPhotos);
      
      setUploadProgress(100);
      
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
      
      e.target.value = '';
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
      const updatedPhotos = currentPhotos.filter(url => url !== photoUrl);
      
      const isMainPhoto = currentPhotos.indexOf(photoUrl) === 0;
      
      updateField('photos', updatedPhotos);
      
      if (isMainPhoto && updatedPhotos.length > 0) {
        updateField('avatar', updatedPhotos[0]);
        
        if (userData.id) {
          await updateProfileAvatar(userData.id, updatedPhotos[0]);
        }
      } else if (isMainPhoto && updatedPhotos.length === 0) {
        updateField('avatar', '');
        
        if (userData.id) {
          await supabase
            .from('profiles')
            .update({ avatar: null })
            .eq('id', userData.id);
        }
      }
      
      if (userData.id) {
        const { data: photoRecord, error: fetchError } = await supabase
          .from('profile_photos')
          .select('id')
          .eq('profile_id', userData.id)
          .eq('url', photoUrl)
          .single();
          
        if (fetchError && !fetchError.message.includes('No rows found')) {
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
        
        const urlParts = photoUrl.split('/');
        const fileName = urlParts[urlParts.length - 1];
        const filePath = `photos/${fileName}`;
        
        try {
          const { error: storageError } = await supabase.storage
            .from('profile-media')
            .remove([filePath]);
            
          if (storageError) {
            console.error('Error deleting photo from storage:', storageError);
          }
        } catch (storageErr) {
          console.error('Storage delete error:', storageErr);
        }
        
        if (updatedPhotos.length > 0) {
          await updatePhotoOrders(userData.id, updatedPhotos);
        }
      }
    } catch (err) {
      console.error('Error deleting photo:', err);
      setError('Failed to delete photo. Please try again.');
    }
  };
  
  const updatePhotoOrders = async (userId: string, photos: string[]) => {
    try {
      const { data: photoRecords, error: fetchError } = await supabase
        .from('profile_photos')
        .select('id, url')
        .eq('profile_id', userId);
        
      if (fetchError) {
        console.error('Error fetching photo records:', fetchError);
        return;
      }
      
      for (let i = 0; i < photos.length; i++) {
        const url = photos[i];
        const record = photoRecords?.find(r => r.url === url);
        
        if (record) {
          const { error: updateError } = await supabase
            .from('profile_photos')
            .update({ 
              order_index: i,
              is_primary: i === 0
            })
            .eq('id', record.id);
            
          if (updateError) {
            console.error('Error updating photo order:', updateError);
          }
        }
      }
    } catch (err) {
      console.error('Error updating photo orders:', err);
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
