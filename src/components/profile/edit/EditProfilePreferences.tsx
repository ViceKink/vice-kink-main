
import React from 'react';
import { UserProfile, UserPreferences } from '@/types/auth';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface EditProfilePreferencesProps {
  userData: Partial<UserProfile>;
  updateField: (field: string, value: any) => void;
}

const EditProfilePreferences: React.FC<EditProfilePreferencesProps> = ({
  userData,
  updateField,
}) => {
  const preferences = userData.preferences || {} as UserPreferences;
  
  const handlePreferenceChange = (key: string, value: any) => {
    const updatedPreferences = {
      ...preferences,
      [key]: value,
    };
    updateField('preferences', updatedPreferences);
  };

  const handleAgeRangeChange = (values: number[]) => {
    handlePreferenceChange('age_range', { min: values[0], max: values[1] });
  };

  const handleGenderPreferenceChange = (gender: string, checked: boolean) => {
    const currentGenders = preferences.preferred_gender || [];
    const updatedGenders = checked
      ? [...currentGenders, gender]
      : currentGenders.filter(g => g !== gender);
    
    handlePreferenceChange('preferred_gender', updatedGenders);
  };

  const handleEthnicityPreferenceChange = (ethnicity: string, checked: boolean) => {
    const currentEthnicities = preferences.preferred_ethnicity || [];
    const updatedEthnicities = checked
      ? [...currentEthnicities, ethnicity]
      : currentEthnicities.filter(e => e !== ethnicity);
    
    handlePreferenceChange('preferred_ethnicity', updatedEthnicities);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Matching Preferences</h3>
      <p className="text-sm text-muted-foreground">
        Set your preferences for finding matches. These settings help us recommend profiles that match your criteria.
      </p>

      {/* Gender Preferences */}
      <div className="space-y-4">
        <h4 className="font-medium">Looking for</h4>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="gender-men"
              checked={preferences.preferred_gender?.includes('Male')}
              onCheckedChange={(checked) => handleGenderPreferenceChange('Male', checked as boolean)}
            />
            <label htmlFor="gender-men" className="text-sm">Men</label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="gender-women"
              checked={preferences.preferred_gender?.includes('Female')}
              onCheckedChange={(checked) => handleGenderPreferenceChange('Female', checked as boolean)}
            />
            <label htmlFor="gender-women" className="text-sm">Women</label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="gender-nonbinary"
              checked={preferences.preferred_gender?.includes('Non-binary')}
              onCheckedChange={(checked) => handleGenderPreferenceChange('Non-binary', checked as boolean)}
            />
            <label htmlFor="gender-nonbinary" className="text-sm">Non-binary</label>
          </div>
        </div>
      </div>

      {/* Age Range */}
      <div className="space-y-4">
        <h4 className="font-medium">Age range</h4>
        <Slider 
          defaultValue={[
            preferences.age_range?.min || 18, 
            preferences.age_range?.max || 50
          ]}
          min={18} 
          max={99} 
          step={1}
          onValueChange={handleAgeRangeChange}
        />
        <div className="flex justify-between">
          <span className="text-sm">{preferences.age_range?.min || 18}</span>
          <span className="text-sm">{preferences.age_range?.max || 50}</span>
        </div>
      </div>

      {/* Max Distance */}
      <div className="space-y-4">
        <h4 className="font-medium">Maximum distance</h4>
        <div className="flex items-center gap-4">
          <Input
            type="number"
            value={preferences.max_distance || 50}
            onChange={(e) => handlePreferenceChange('max_distance', parseInt(e.target.value))}
            min={1}
            max={500}
            className="w-24"
          />
          <span className="text-sm">miles</span>
        </div>
      </div>
      
      {/* Ethnicity Preferences */}
      <div className="space-y-4">
        <h4 className="font-medium">Ethnicity preferences</h4>
        <div className="grid grid-cols-2 gap-4">
          {['Asian', 'Black', 'Hispanic/Latino', 'Middle Eastern', 'Native American', 'Pacific Islander', 'White', 'Mixed', 'Other'].map((ethnicity) => (
            <div key={ethnicity} className="flex items-center space-x-2">
              <Checkbox 
                id={`ethnicity-${ethnicity.toLowerCase().replace(/\s+/g, '-')}`}
                checked={preferences.preferred_ethnicity?.includes(ethnicity)}
                onCheckedChange={(checked) => handleEthnicityPreferenceChange(ethnicity, checked as boolean)}
              />
              <label htmlFor={`ethnicity-${ethnicity.toLowerCase().replace(/\s+/g, '-')}`} className="text-sm">{ethnicity}</label>
            </div>
          ))}
        </div>
      </div>
      
      {/* Relationship Type */}
      <div className="space-y-4">
        <h4 className="font-medium">Preferred relationship type</h4>
        <Select 
          value={preferences.preferred_relationship_type?.join(',') || ''}
          onValueChange={(value) => handlePreferenceChange('preferred_relationship_type', value.split(','))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select relationship type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Monogamous">Monogamous</SelectItem>
            <SelectItem value="Non-monogamous">Non-monogamous</SelectItem>
            <SelectItem value="Open to either">Open to either</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Education Level */}
      <div className="space-y-4">
        <h4 className="font-medium">Education preference</h4>
        <Select 
          value={preferences.preferred_education?.join(',') || ''}
          onValueChange={(value) => handlePreferenceChange('preferred_education', value.split(','))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select education level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="High School">High School</SelectItem>
            <SelectItem value="Some College">Some College</SelectItem>
            <SelectItem value="Associate's Degree">Associate's Degree</SelectItem>
            <SelectItem value="Bachelor's Degree">Bachelor's Degree</SelectItem>
            <SelectItem value="Master's Degree">Master's Degree</SelectItem>
            <SelectItem value="Doctorate/PhD">Doctorate/PhD</SelectItem>
            <SelectItem value="No preference">No preference</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default EditProfilePreferences;
