
import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle } from 'lucide-react';

// Available languages list
const LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese',
  'Korean', 'Arabic', 'Russian', 'Italian', 'Portuguese', 'Hindi'
];

// Sexuality options
const SEXUALITY_OPTIONS = [
  'Straight', 'Gay', 'Lesbian', 'Bisexual', 'Pansexual', 'Asexual', 'Queer', 'Questioning', 'Other'
];

// Religion options
const RELIGION_OPTIONS = [
  'Christianity', 'Islam', 'Hinduism', 'Buddhism', 'Judaism', 
  'Sikhism', 'Atheism', 'Agnosticism', 'Spiritual', 'Other', 'Prefer not to say'
];

// Height options (4' to 8' with 1" increments)
const HEIGHT_OPTIONS = [
  // 4'0" to 4'11"
  "4'0\"", "4'1\"", "4'2\"", "4'3\"", "4'4\"", "4'5\"", "4'6\"", "4'7\"", "4'8\"", "4'9\"", "4'10\"", "4'11\"",
  // 5'0" to 5'11"
  "5'0\"", "5'1\"", "5'2\"", "5'3\"", "5'4\"", "5'5\"", "5'6\"", "5'7\"", "5'8\"", "5'9\"", "5'10\"", "5'11\"",
  // 6'0" to 6'11"
  "6'0\"", "6'1\"", "6'2\"", "6'3\"", "6'4\"", "6'5\"", "6'6\"", "6'7\"", "6'8\"", "6'9\"", "6'10\"", "6'11\"",
  // 7'0" to 7'11"
  "7'0\"", "7'1\"", "7'2\"", "7'3\"", "7'4\"", "7'5\"", "7'6\"", "7'7\"", "7'8\"", "7'9\"", "7'10\"", "7'11\"",
  // 8'0"
  "8'0\""
];

interface EditProfileAboutProps {
  userData: any;
  updateField: (field: string, value: any) => void;
}

const EditProfileAbout = ({ userData, updateField }: EditProfileAboutProps) => {
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(
    userData?.about?.languages || []
  );
  
  const MAX_LANGUAGES = 5;
  
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
      let newLanguages;
      
      if (prev.includes(language)) {
        // Remove language if already selected
        newLanguages = prev.filter(l => l !== language);
      } else {
        // Add language only if under the limit
        if (prev.length >= MAX_LANGUAGES) {
          return prev; // Don't make any changes if at the limit
        }
        newLanguages = [...prev, language];
      }
      
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
            value={userData?.about?.status || undefined}
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
        
        {/* Height - Changed to dropdown */}
        <div className="space-y-2">
          <Label htmlFor="height">Height</Label>
          <Select
            value={userData?.about?.height || undefined}
            onValueChange={(value) => updateField('about', { ...userData.about, height: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select height" />
            </SelectTrigger>
            <SelectContent className="max-h-[200px]">
              {HEIGHT_OPTIONS.map(height => (
                <SelectItem key={height} value={height}>{height}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Religion - Restored as dropdown */}
        <div className="space-y-2">
          <Label htmlFor="religion">Religion</Label>
          <Select
            value={userData?.about?.religion || undefined}
            onValueChange={(value) => updateField('about', { ...userData.about, religion: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select religion" />
            </SelectTrigger>
            <SelectContent>
              {RELIGION_OPTIONS.map(option => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Sexuality */}
        <div className="space-y-2">
          <Label htmlFor="sexuality">Sexuality</Label>
          <Select
            value={userData?.about?.sexuality || undefined}
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
        <div className="flex justify-between items-center">
          <Label>Languages</Label>
          <span className="text-sm font-medium">
            {selectedLanguages.length}/{MAX_LANGUAGES}
          </span>
        </div>
        
        {selectedLanguages.length >= MAX_LANGUAGES && (
          <div className="flex items-center gap-1 text-amber-500 text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>Maximum of {MAX_LANGUAGES} languages reached.</span>
          </div>
        )}
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {LANGUAGES.map(language => (
            <div key={language} className="flex items-center space-x-2">
              <Checkbox 
                id={`lang-${language}`} 
                checked={selectedLanguages.includes(language)}
                onCheckedChange={() => handleLanguageToggle(language)}
                disabled={!selectedLanguages.includes(language) && selectedLanguages.length >= MAX_LANGUAGES}
              />
              <Label 
                htmlFor={`lang-${language}`} 
                className={`cursor-pointer ${!selectedLanguages.includes(language) && selectedLanguages.length >= MAX_LANGUAGES ? 'text-muted-foreground' : ''}`}
              >
                {language}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EditProfileAbout;
