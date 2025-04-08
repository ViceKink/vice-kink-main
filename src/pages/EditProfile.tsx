
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfileEditor } from '@/hooks/useProfileEditor';
import ProfileEditHeader from '@/components/profile/edit/ProfileEditHeader';
import SaveProfileButton from '@/components/profile/edit/SaveProfileButton';
import ProfileEditTabs from '@/components/profile/edit/ProfileEditTabs';
import ProfileErrorAlert from '@/components/profile/edit/ProfileErrorAlert';

const EditProfile = () => {
  const navigate = useNavigate();
  const { 
    user, 
    profileData, 
    isSubmitting, 
    error, 
    updateField, 
    handleUpdate 
  } = useProfileEditor(() => navigate('/profile'));
  
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading profile data...</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen pt-20 pb-28 px-4 md:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <ProfileEditHeader onBack={() => navigate('/profile')} />
          <SaveProfileButton 
            isSubmitting={isSubmitting} 
            onClick={handleUpdate} 
          />
        </div>
        
        <h1 className="text-2xl font-bold mb-6">Edit Your Profile</h1>
        
        <ProfileErrorAlert error={error} />
        
        <ProfileEditTabs 
          profileData={profileData}
          updateField={updateField}
        />
        
        <div className="mt-8 flex justify-end">
          <SaveProfileButton 
            isSubmitting={isSubmitting} 
            onClick={handleUpdate} 
          />
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
