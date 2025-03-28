
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';

/**
 * Compresses an image file to reduce its size
 */
export const compressImage = (file: File): Promise<Blob> => {
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

/**
 * Further compress an image to meet size requirements
 */
export const furtherCompressImage = async (blob: Blob): Promise<Blob> => {
  return new Promise<Blob>((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const img = new Image();
    
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target?.result as string;
      
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
          (compressedBlob) => {
            if (!compressedBlob) {
              reject(new Error('Failed to compress image'));
              return;
            }
            resolve(compressedBlob);
          },
          'image/jpeg',
          0.5
        );
      };
      
      img.onerror = () => reject(new Error('Failed to load image for compression'));
    };
    
    reader.onerror = () => reject(new Error('Failed to read file for compression'));
    reader.readAsDataURL(blob);
  });
};

/**
 * Upload a photo to storage and save it to the profile
 */
export const uploadProfilePhoto = async (
  file: File, 
  userId: string, 
  currentPhotosCount: number
): Promise<string> => {
  let fileToUpload: Blob = file;
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  
  if (file.size > MAX_SIZE) {
    fileToUpload = await compressImage(file);
    
    if (fileToUpload.size > MAX_SIZE) {
      fileToUpload = await furtherCompressImage(fileToUpload);
      
      if (fileToUpload.size > MAX_SIZE) {
        throw new Error('Image is too large. Even after compression, it exceeds the 5MB limit.');
      }
    }
  }
  
  const fileExt = file.name.split('.').pop();
  const fileName = `${uuidv4()}.${fileExt}`;
  const filePath = `photos/${fileName}`;
  
  const { data, error: uploadError } = await supabase.storage
    .from('profile-media')
    .upload(filePath, fileToUpload, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type
    });
  
  if (uploadError) throw uploadError;
  
  const { data: publicUrlData } = supabase.storage
    .from('profile-media')
    .getPublicUrl(filePath);
  
  const publicUrl = publicUrlData.publicUrl;
  
  if (userId) {
    const { error: dbError } = await supabase
      .from('profile_photos')
      .insert({
        profile_id: userId,
        url: publicUrl,
        order_index: currentPhotosCount,
        is_primary: currentPhotosCount === 0, // Make it primary if it's the first photo
        created_at: new Date().toISOString()
      });
      
    if (dbError) {
      console.error('Error saving photo to database:', dbError);
      throw dbError;
    }
  }
  
  return publicUrl;
};

/**
 * Update photo order in the database
 */
export const updatePhotoOrders = async (userId: string, photos: string[]) => {
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

/**
 * Delete a photo from storage and database
 */
export const deleteProfilePhoto = async (userId: string, photoUrl: string) => {
  try {
    const { data: photoRecord, error: fetchError } = await supabase
      .from('profile_photos')
      .select('id, is_primary')
      .eq('profile_id', userId)
      .eq('url', photoUrl)
      .single();
      
    if (fetchError && !fetchError.message.includes('No rows found')) {
      console.error('Error finding photo record:', fetchError);
      throw fetchError;
    }
    
    if (photoRecord) {
      const { error: deleteError } = await supabase
        .from('profile_photos')
        .delete()
        .eq('id', photoRecord.id);
        
      if (deleteError) {
        console.error('Error deleting photo from database:', deleteError);
        throw deleteError;
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
    
    return photoRecord?.is_primary || false;
  } catch (err) {
    console.error('Error in deleteProfilePhoto:', err);
    throw err;
  }
};
