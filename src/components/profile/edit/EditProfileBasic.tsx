
import React from 'react';
import { UserProfile } from '@/context/AuthContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';

interface EditProfileBasicProps {
  userData: Partial<UserProfile>;
  updateField: (field: string, value: any) => void;
}

const EditProfileBasic = ({ userData, updateField }: EditProfileBasicProps) => {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Basic Information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={userData.name || ''}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="Your name"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="age">Age</Label>
          <Input
            id="age"
            type="number"
            value={userData.age || ''}
            onChange={(e) => updateField('age', Number(e.target.value))}
            placeholder="Your age"
            min={18}
            max={120}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={userData.location || ''}
            onChange={(e) => updateField('location', e.target.value)}
            placeholder="City, Country"
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="email">Email</Label>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">Read only</span>
          </div>
          <div className="relative">
            <Input
              id="email"
              value={userData.email || ''}
              disabled
              className="bg-muted pr-10"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Email cannot be changed and will not be included in profile updates.</p>
        </div>
      </div>
    </div>
  );
};

export default EditProfileBasic;
