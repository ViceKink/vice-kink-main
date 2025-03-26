
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserProfile } from '@/types/auth';

interface EditProfileBasicProps {
  userData: Partial<UserProfile>;
  updateField: (field: string, value: any) => void;
}

const EditProfileBasic = ({ userData, updateField }: EditProfileBasicProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateField(name, value);
  };
  
  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="name" className="text-base">Full Name</Label>
        <Input
          id="name"
          name="name"
          value={userData.name || ''}
          onChange={handleChange}
          className="mt-1"
          placeholder="Your full name"
        />
        <p className="text-sm text-muted-foreground mt-1">
          This is how you'll appear to others
        </p>
      </div>
      
      {/* Username field has been removed as requested */}
      
      <div>
        <Label htmlFor="location" className="text-base">Location</Label>
        <Input
          id="location"
          name="location"
          value={userData.location || ''}
          onChange={handleChange}
          className="mt-1"
          placeholder="City, Country"
        />
      </div>
    </div>
  );
};

export default EditProfileBasic;
