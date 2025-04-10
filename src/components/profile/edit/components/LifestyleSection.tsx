
import React from 'react';
import { UserProfile } from '@/types/auth';
import { SelectField } from './SelectField';
import { drinkingOptions } from '../utils/optionsData';

interface LifestyleSectionProps {
  userData: Partial<UserProfile>;
  handleLifestyleChange: (key: string, value: any) => void;
}

export const LifestyleSection: React.FC<LifestyleSectionProps> = ({ 
  userData, 
  handleLifestyleChange 
}) => {
  return (
    <div className="mt-8">
      <h3 className="text-lg font-medium mb-4">Lifestyle</h3>
      
      <div className="grid gap-4">
        <SelectField
          id="smoking"
          label="Smoking"
          value={userData.about?.lifestyle?.smoking === true ? 'true' : userData.about?.lifestyle?.smoking === false ? 'false' : ''}
          options={[
            { value: 'true', label: 'Smoker' },
            { value: 'false', label: 'Non-smoker' }
          ]}
          onChange={(value) => handleLifestyleChange('smoking', value === 'true')}
          placeholder="Select smoking preference"
        />
        
        <SelectField
          id="drinking"
          label="Drinking"
          value={userData.about?.lifestyle?.drinking || ''}
          options={drinkingOptions}
          onChange={(value) => handleLifestyleChange('drinking', value)}
          placeholder="Select drinking preference"
        />
      </div>
    </div>
  );
};
