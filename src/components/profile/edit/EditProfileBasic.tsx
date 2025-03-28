
import React, { useState, useEffect } from 'react';
import { UserProfile } from '@/types/auth';
import { DateOfBirthField } from './components/DateOfBirthField';
import { GenderField } from './components/GenderField';
import { LocationField } from './components/LocationField';
import { NameField } from './components/NameField';

// Define the interface for component props
interface EditProfileBasicProps {
  userData: Partial<UserProfile>;
  updateField: (field: string, value: any) => void;
}

const EditProfileBasic = ({ userData, updateField }: EditProfileBasicProps) => {
  const [birthDate, setBirthDate] = useState<Date | undefined>(
    userData.birthDate ? new Date(userData.birthDate) : undefined
  );
  
  const handleBirthDateChange = (date: Date | undefined) => {
    if (date) {
      setBirthDate(date);
      
      // Set date to noon to avoid timezone issues
      const dateForStorage = new Date(date);
      dateForStorage.setHours(12, 0, 0, 0);
      
      // Update birthDate in userData using ISO format for consistency
      updateField('birthDate', dateForStorage.toISOString().split('T')[0]);
      
      console.log("Updated birthDate:", dateForStorage.toISOString().split('T')[0]);
    }
  };
  
  const handleAgeChange = (age: number) => {
    updateField('age', age);
  };
  
  const handleZodiacChange = (zodiac: string) => {
    // Update zodiac in about object
    const currentAbout = userData.about || {};
    currentAbout.zodiac = zodiac;
    updateField('about', currentAbout);
  };
  
  const handleGenderChange = (value: string) => {
    const currentAbout = userData.about || {};
    currentAbout.gender = value;
    updateField('about', currentAbout);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Basic Information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <NameField 
          value={userData.name || ''} 
          onChange={(value) => updateField('name', value)} 
        />
        
        <DateOfBirthField
          birthDate={birthDate}
          onChange={handleBirthDateChange}
          onAgeChange={handleAgeChange}
          onZodiacChange={handleZodiacChange}
        />
        
        <GenderField
          value={userData.about?.gender || ''}
          onChange={handleGenderChange}
        />
        
        <LocationField
          id="location"
          label="Current Location"
          value={userData.location || ''}
          onChange={(value) => updateField('location', value)}
          placeholder="City, Country"
        />
        
        <LocationField
          id="hometown"
          label="Hometown"
          value={userData.hometown || ''}
          onChange={(value) => updateField('hometown', value)}
          placeholder="Your hometown"
        />
      </div>
    </div>
  );
};

export default EditProfileBasic;
