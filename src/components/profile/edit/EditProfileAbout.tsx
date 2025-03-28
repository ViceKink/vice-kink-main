
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
    const currentAbout = userData.about || {};
    const updatedAbout = {
      ...currentAbout,
      [key]: value
    };
    
    updateField('about', updatedAbout);
  };
  
  const handleLifestyleChange = (key: string, value: any) => {
    const currentLifestyle = userData.about?.lifestyle || {};
    const updatedLifestyle = {
      ...currentLifestyle,
      [key]: value
    };
    
    const currentAbout = userData.about || {};
    const updatedAbout = {
      ...currentAbout,
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
