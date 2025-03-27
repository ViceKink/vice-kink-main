
import React from 'react';
import { UserProfile } from '@/types/auth';
import { BasicInfoSection } from './components/BasicInfoSection';
import { LifestyleSection } from './components/LifestyleSection';

interface EditProfileAboutProps {
  userData: Partial<UserProfile>;
  updateField: (field: string, value: any) => void;
}

const EditProfileAbout: React.FC<EditProfileAboutProps> = ({ 
  userData, 
  updateField 
}) => {
  const handleChange = (key: string, value: any) => {
    const updatedAbout = {
      ...(userData.about || {}),
      [key]: value
    };
    
    updateField('about', updatedAbout);
  };
  
  const handleLifestyleChange = (key: string, value: any) => {
    const updatedLifestyle = {
      ...(userData.about?.lifestyle || {}),
      [key]: value
    };
    
    const updatedAbout = {
      ...(userData.about || {}),
      lifestyle: updatedLifestyle
    };
    
    updateField('about', updatedAbout);
  };
  
  return (
    <div className="space-y-6">
      <BasicInfoSection userData={userData} handleChange={handleChange} />
      <LifestyleSection userData={userData} handleLifestyleChange={handleLifestyleChange} />
    </div>
  );
};

export default EditProfileAbout;
