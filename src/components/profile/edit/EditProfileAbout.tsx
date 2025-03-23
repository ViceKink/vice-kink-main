
import React from 'react';
import { UserProfile } from '@/context/AuthContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

interface EditProfileAboutProps {
  userData: Partial<UserProfile>;
  updateAboutField: (field: string, value: any) => void;
}

const EditProfileAbout = ({ userData, updateAboutField }: EditProfileAboutProps) => {
  const about = userData.about || {};
  
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">About Me</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="occupation">Occupation</Label>
          <Input
            id="occupation"
            value={about.occupation || ''}
            onChange={(e) => updateAboutField('occupation', e.target.value)}
            placeholder="Your occupation"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="status">Relationship Status</Label>
          <Select
            value={about.status || ''}
            onValueChange={(value) => updateAboutField('status', value)}
          >
            <SelectTrigger id="status">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single">Single</SelectItem>
              <SelectItem value="married">Married</SelectItem>
              <SelectItem value="it's complicated">It's Complicated</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="height">Height</Label>
          <Input
            id="height"
            value={about.height || ''}
            onChange={(e) => updateAboutField('height', e.target.value)}
            placeholder="e.g. 5'10\""
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="zodiac">Zodiac Sign</Label>
          <Select
            value={about.zodiac || ''}
            onValueChange={(value) => updateAboutField('zodiac', value)}
          >
            <SelectTrigger id="zodiac">
              <SelectValue placeholder="Select zodiac sign" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Aries">Aries</SelectItem>
              <SelectItem value="Taurus">Taurus</SelectItem>
              <SelectItem value="Gemini">Gemini</SelectItem>
              <SelectItem value="Cancer">Cancer</SelectItem>
              <SelectItem value="Leo">Leo</SelectItem>
              <SelectItem value="Virgo">Virgo</SelectItem>
              <SelectItem value="Libra">Libra</SelectItem>
              <SelectItem value="Scorpio">Scorpio</SelectItem>
              <SelectItem value="Sagittarius">Sagittarius</SelectItem>
              <SelectItem value="Capricorn">Capricorn</SelectItem>
              <SelectItem value="Aquarius">Aquarius</SelectItem>
              <SelectItem value="Pisces">Pisces</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="religion">Religion</Label>
          <Input
            id="religion"
            value={about.religion || ''}
            onChange={(e) => updateAboutField('religion', e.target.value)}
            placeholder="Your religion"
          />
        </div>
      </div>
    </div>
  );
};

export default EditProfileAbout;
