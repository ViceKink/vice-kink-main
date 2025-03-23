
import React from 'react';
import { UserProfile } from '@/context/AuthContext';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

interface EditProfileBioProps {
  userData: Partial<UserProfile>;
  updateField: (field: string, value: any) => void;
}

const EditProfileBio = ({ userData, updateField }: EditProfileBioProps) => {
  // Helper function to handle flirting style updates
  const updateFlirtingStyle = (value: string) => {
    // If the value is empty, set to empty string
    if (!value) {
      updateField('flirtingStyle', '');
      return;
    }
    
    // For regular inputs, just store the string directly
    updateField('flirtingStyle', value);
  };

  // Helper function to get length for character count
  const getCharLength = (value: any): number => {
    if (typeof value === 'string') {
      return value.length;
    }
    return 0;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Bio & Style</h2>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="bio">My Story (Bio)</Label>
          <Textarea
            id="bio"
            value={userData.bio || ''}
            onChange={(e) => updateField('bio', e.target.value)}
            placeholder="Tell your story"
            className="min-h-[120px]"
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground text-right">
            {getCharLength(userData.bio || '')}/500
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="flirtingStyle">My Flirting Style</Label>
          <Textarea
            id="flirtingStyle"
            value={typeof userData.flirtingStyle === 'string' ? userData.flirtingStyle : ''}
            onChange={(e) => updateFlirtingStyle(e.target.value)}
            placeholder="Describe your flirting style"
            className="min-h-[80px]"
            maxLength={200}
          />
          <p className="text-xs text-muted-foreground text-right">
            {getCharLength(typeof userData.flirtingStyle === 'string' ? userData.flirtingStyle : '')}/200
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="lookingFor">Looking For</Label>
          <Input
            id="lookingFor"
            value={userData.lookingFor || ''}
            onChange={(e) => updateField('lookingFor', e.target.value)}
            placeholder="What are you looking for?"
            maxLength={100}
          />
          <p className="text-xs text-muted-foreground text-right">
            {getCharLength(userData.lookingFor || '')}/100
          </p>
        </div>
      </div>
    </div>
  );
};

export default EditProfileBio;
