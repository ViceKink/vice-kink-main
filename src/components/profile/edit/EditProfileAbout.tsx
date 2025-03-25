
import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

// Available languages list
const LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese',
  'Korean', 'Arabic', 'Russian', 'Italian', 'Portuguese', 'Hindi'
];

// Sexuality options
const SEXUALITY_OPTIONS = [
  'Straight', 'Gay', 'Lesbian', 'Bisexual', 'Pansexual', 'Asexual', 'Queer', 'Questioning', 'Other'
];

interface EditProfileAboutProps {
  userData: any;
  updateField: (field: string, value: any) => void;
}

const EditProfileAbout = ({ userData, updateField }: EditProfileAboutProps) => {
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(
    userData?.about?.languages || []
  );
  
  // Debug logging
  console.log('EditProfileAbout - Initial userData:', userData);
  console.log('EditProfileAbout - Initial selectedLanguages:', selectedLanguages);
  
  useEffect(() => {
    // This ensures the component updates when userData changes from parent
    if (userData?.about?.languages) {
      setSelectedLanguages(userData.about.languages);
    }
  }, [userData?.about?.languages]);
  
  const handleLanguageToggle = (language: string) => {
    setSelectedLanguages(prev => {
      const newLanguages = prev.includes(language)
        ? prev.filter(l => l !== language)
        : [...prev, language];
      
      // Debug logging
      console.log('Language toggled:', language);
      console.log('New languages array:', newLanguages);
      
      // Update the userData.about.languages directly
      updateField('about', {
        ...userData.about,
        languages: newLanguages
      });
      
      return newLanguages;
    });
  };
  
  const handleSexualityChange = (value: string) => {
    // Debug logging
    console.log('Sexuality changed to:', value);
    
    updateField('about', {
      ...userData.about,
      sexuality: value
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">About Me</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Occupation */}
        <div className="space-y-2">
          <Label htmlFor="occupation">Occupation</Label>
          <Input
            id="occupation"
            placeholder="What do you do?"
            value={userData?.about?.occupation || ''}
            onChange={(e) => updateField('about', { ...userData.about, occupation: e.target.value })}
          />
        </div>
        
        {/* Relationship Status */}
        <div className="space-y-2">
          <Label htmlFor="relationship">Relationship Status</Label>
          <Select
            value={userData?.about?.status || ''}
            onValueChange={(value) => updateField('about', { ...userData.about, status: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single">Single</SelectItem>
              <SelectItem value="married">Married</SelectItem>
              <SelectItem value="it's complicated">It&apos;s complicated</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Height */}
        <div className="space-y-2">
          <Label htmlFor="height">Height</Label>
          <Input
            id="height"
            placeholder='e.g., 5\'10" or 178cm'
            value={userData?.about?.height || ''}
            onChange={(e) => updateField('about', { ...userData.about, height: e.target.value })}
          />
        </div>
        
        {/* Zodiac */}
        <div className="space-y-2">
          <Label htmlFor="zodiac">Zodiac Sign</Label>
          <Select
            value={userData?.about?.zodiac || ''}
            onValueChange={(value) => updateField('about', { ...userData.about, zodiac: value })}
          >
            <SelectTrigger>
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
        
        {/* Religion */}
        <div className="space-y-2">
          <Label htmlFor="religion">Religion</Label>
          <Input
            id="religion"
            placeholder="Religion"
            value={userData?.about?.religion || ''}
            onChange={(e) => updateField('about', { ...userData.about, religion: e.target.value })}
          />
        </div>
        
        {/* Sexuality */}
        <div className="space-y-2">
          <Label htmlFor="sexuality">Sexuality</Label>
          <Select
            value={userData?.about?.sexuality || ''}
            onValueChange={handleSexualityChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select sexuality" />
            </SelectTrigger>
            <SelectContent>
              {SEXUALITY_OPTIONS.map(option => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Languages Section */}
      <div className="space-y-4 mt-6">
        <Label>Languages</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {LANGUAGES.map(language => (
            <div key={language} className="flex items-center space-x-2">
              <Checkbox 
                id={`lang-${language}`} 
                checked={selectedLanguages.includes(language)}
                onCheckedChange={() => handleLanguageToggle(language)}
              />
              <Label htmlFor={`lang-${language}`} className="cursor-pointer">{language}</Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EditProfileAbout;
