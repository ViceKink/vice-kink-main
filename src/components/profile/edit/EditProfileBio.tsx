
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
  // Helper function to get length for character count
  const getCharLength = (value: any): number => {
    if (typeof value === 'string') {
      return value.length;
    }
    return 0;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Bio</h2>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="bio">My Story</Label>
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
          <Label htmlFor="quote">Favorite Quote</Label>
          <Input
            id="quote"
            value={userData.quote || ''}
            onChange={(e) => updateField('quote', e.target.value)}
            placeholder="Share your favorite quote"
            maxLength={150}
          />
          <p className="text-xs text-muted-foreground text-right">
            {getCharLength(userData.quote || '')}/150
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
