
import { useState } from 'react';
import { useAuth } from '@/context/auth';
import { UserProfile } from '@/types/auth';
import { toast } from 'sonner';

export const useProfileEditor = (onComplete: () => void) => {
  const { user, updateProfile, updateUserVices, updateUserKinks } = useAuth();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<Partial<UserProfile>>(user || {});
  
  const updateField = (field: string, value: any) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleUpdate = async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      await updateProfile(profileData);
      
      if (profileData.vices) {
        await updateUserVices(profileData.vices);
      }
      
      if (profileData.kinks) {
        await updateUserKinks(profileData.kinks);
      }
      
      toast.success('Profile updated successfully');
      onComplete();
    } catch (error: any) {
      console.error('Update profile error:', error);
      
      setError(error.message || 'Failed to update profile');
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return {
    user,
    profileData,
    isSubmitting,
    error,
    updateField,
    handleUpdate
  };
};
