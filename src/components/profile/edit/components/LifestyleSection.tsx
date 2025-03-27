
import React from 'react';
import { Label } from '@/components/ui/label';
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
    <div>
      <h3 className="text-lg font-medium mb-4">Lifestyle</h3>
      
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="smoking">Smoking</Label>
          <SelectField
            id="smoking"
            label=""
            value={userData.about?.lifestyle?.smoking ? 'yes' : 'no'}
            options={[
              { value: 'yes', label: 'Yes' },
              { value: 'no', label: 'No' }
            ]}
            onChange={(value) => handleLifestyleChange('smoking', value === 'yes')}
            placeholder="Do you smoke?"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="drinking">Drinking</Label>
          <SelectField
            id="drinking"
            label=""
            value={userData.about?.lifestyle?.drinking || ''}
            options={drinkingOptions}
            onChange={(value) => handleLifestyleChange('drinking', value)}
            placeholder="Drinking habits"
          />
        </div>
      </div>
    </div>
  );
};
