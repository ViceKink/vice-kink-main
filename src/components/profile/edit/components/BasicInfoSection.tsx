
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { UserProfile } from '@/types/auth';
import { SelectField } from './SelectField';
import { 
  educationOptions, 
  ethnicityOptions, 
  relationshipOptions, 
  relationshipTypeOptions,
  datingIntentionOptions,
  religionOptions,
  sexualityOptions
} from '../utils/optionsData';
import { heightOptions } from '../utils/heightOptions';

interface BasicInfoSectionProps {
  userData: Partial<UserProfile>;
  handleChange: (key: string, value: any) => void;
}

export const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({ userData, handleChange }) => {
  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Basic Information</h3>
      
      <div className="grid gap-4 mb-4">
        <div className="space-y-2">
          <Label htmlFor="occupation">Occupation</Label>
          <Input
            id="occupation"
            value={userData.about?.occupation || ''}
            onChange={(e) => handleChange('occupation', e.target.value)}
            placeholder="What do you do?"
          />
        </div>
        
        <SelectField
          id="education"
          label="Education"
          value={userData.about?.education || ''}
          options={educationOptions}
          onChange={(value) => handleChange('education', value)}
          placeholder="Select your education level"
        />
        
        <SelectField
          id="ethnicity"
          label="Ethnicity"
          value={userData.about?.ethnicity || ''}
          options={ethnicityOptions}
          onChange={(value) => handleChange('ethnicity', value)}
          placeholder="Select your ethnicity"
        />
        
        <SelectField
          id="height"
          label="Height"
          value={userData.about?.height || ''}
          options={heightOptions}
          onChange={(value) => handleChange('height', value)}
          placeholder="Select your height"
        />
        
        <SelectField
          id="status"
          label="Relationship Status"
          value={userData.about?.status || ''}
          options={relationshipOptions}
          onChange={(value) => handleChange('status', value)}
          placeholder="Select status"
        />
        
        <SelectField
          id="relationshipType"
          label="Relationship Type"
          value={userData.about?.relationshipType || ''}
          options={relationshipTypeOptions}
          onChange={(value) => handleChange('relationshipType', value)}
          placeholder="Select relationship type"
        />
        
        <SelectField
          id="datingIntention"
          label="Dating Intention"
          value={userData.about?.datingIntention || ''}
          options={datingIntentionOptions}
          onChange={(value) => handleChange('datingIntention', value)}
          placeholder="Select your dating intention"
        />
        
        <SelectField
          id="religion"
          label="Religion"
          value={userData.about?.religion || ''}
          options={religionOptions}
          onChange={(value) => handleChange('religion', value)}
          placeholder="Select religion"
        />
        
        <SelectField
          id="sexuality"
          label="Sexuality"
          value={userData.about?.sexuality || ''}
          options={sexualityOptions}
          onChange={(value) => handleChange('sexuality', value)}
          placeholder="Select sexuality"
        />
      </div>
    </div>
  );
};
