// This is a new file created based on your requirements
import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface AboutFormData {
  height?: string;
  zodiac?: string;
  religion?: string;
  languages?: string[];
  sexuality?: string;
  occupation?: string;
  status?: string;
  lifestyle?: {
    smoking?: boolean;
    drinking?: string;
  };
}

interface EditProfileAboutProps {
  userData: any;
  updateField: (field: string, value: any) => void;
}

const MAX_LANGUAGES = 5;

const EditProfileAbout = ({ userData, updateField }: EditProfileAboutProps) => {
  const [about, setAbout] = useState<AboutFormData>({
    height: '',
    zodiac: '',
    religion: '',
    languages: [],
    sexuality: '',
    occupation: '',
    status: '',
    lifestyle: {
      smoking: false,
      drinking: ''
    }
  });

  useEffect(() => {
    if (userData?.about) {
      setAbout(userData.about);
    }
  }, [userData]);

  const updateAbout = (field: string, value: any) => {
    const updatedAbout = { ...about, [field]: value };
    setAbout(updatedAbout);
    updateField('about', updatedAbout);
  };

  const updateLifestyle = (field: string, value: any) => {
    const updatedLifestyle = { ...about.lifestyle, [field]: value };
    const updatedAbout = { ...about, lifestyle: updatedLifestyle };
    setAbout(updatedAbout);
    updateField('about', updatedAbout);
  };

  const handleLanguageChange = (language: string, checked: boolean) => {
    let updatedLanguages = about.languages || [];
    
    if (checked) {
      // Only add if we're under the max limit or if we're unchecking
      if (updatedLanguages.length < MAX_LANGUAGES) {
        updatedLanguages = [...updatedLanguages, language];
      }
    } else {
      updatedLanguages = updatedLanguages.filter(lang => lang !== language);
    }
    
    updateAbout('languages', updatedLanguages);
  };

  const languages = [
    'English', 'Spanish', 'French', 'German', 'Chinese', 
    'Japanese', 'Korean', 'Arabic', 'Russian', 'Portuguese',
    'Italian', 'Hindi'
  ];

  const zodiacSigns = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 
    'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 
    'Capricorn', 'Aquarius', 'Pisces'
  ];

  const religions = [
    'Agnostic', 'Atheist', 'Buddhist', 'Catholic', 'Christian',
    'Hindu', 'Jewish', 'Muslim', 'Spiritual', 'Other', 'Prefer not to say'
  ];

  const sexualities = [
    'Straight', 'Gay', 'Lesbian', 'Bisexual', 'Pansexual',
    'Asexual', 'Demisexual', 'Queer', 'Questioning', 'Other'
  ];

  const statuses = [
    'Single', 'In a relationship', 'Married', 'Divorced', 'Widowed',
    'It\'s complicated', 'Open relationship', 'Polyamorous'
  ];

  const drinkingOptions = [
    'Never', 'Rarely', 'Socially', 'Regularly', 'Prefer not to say'
  ];

  const reachedMaxLanguages = about.languages?.length === MAX_LANGUAGES;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="height">Height</Label>
            <Input
              id="height"
              placeholder="e.g. 5'10"
              value={about.height || ''}
              onChange={(e) => updateAbout('height', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="zodiac">Zodiac Sign</Label>
            <Select
              value={about.zodiac || ''}
              onValueChange={(value) => updateAbout('zodiac', value)}
            >
              <SelectTrigger id="zodiac">
                <SelectValue placeholder="Select your zodiac sign" />
              </SelectTrigger>
              <SelectContent>
                {zodiacSigns.map((sign) => (
                  <SelectItem key={sign} value={sign}>{sign}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="religion">Religion</Label>
            <Select
              value={about.religion || ''}
              onValueChange={(value) => updateAbout('religion', value)}
            >
              <SelectTrigger id="religion">
                <SelectValue placeholder="Select your religion" />
              </SelectTrigger>
              <SelectContent>
                {religions.map((religion) => (
                  <SelectItem key={religion} value={religion}>{religion}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="sexuality">Sexuality</Label>
            <Select
              value={about.sexuality || ''}
              onValueChange={(value) => updateAbout('sexuality', value)}
            >
              <SelectTrigger id="sexuality">
                <SelectValue placeholder="Select your sexuality" />
              </SelectTrigger>
              <SelectContent>
                {sexualities.map((sexuality) => (
                  <SelectItem key={sexuality} value={sexuality}>{sexuality}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="status">Relationship Status</Label>
            <Select
              value={about.status || ''}
              onValueChange={(value) => updateAbout('status', value)}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Select your status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="occupation">Occupation</Label>
            <Input
              id="occupation"
              placeholder="e.g. Software Engineer"
              value={about.occupation || ''}
              onChange={(e) => updateAbout('occupation', e.target.value)}
            />
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Languages</h3>
        <p className="text-sm text-muted-foreground mb-3">
          Select the languages you speak (maximum {MAX_LANGUAGES})
        </p>
        
        {reachedMaxLanguages && (
          <Alert variant="default" className="mb-3">
            <AlertCircle className="h-4 w-4 mr-2" />
            <AlertDescription>
              You've reached the maximum of {MAX_LANGUAGES} languages
            </AlertDescription>
          </Alert>
        )}
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {languages.map((language) => (
            <div className="flex items-center space-x-2" key={language}>
              <Checkbox
                id={`language-${language}`}
                checked={about.languages?.includes(language) || false}
                onCheckedChange={(checked) => 
                  handleLanguageChange(language, checked as boolean)
                }
                disabled={!about.languages?.includes(language) && reachedMaxLanguages}
              />
              <label
                htmlFor={`language-${language}`}
                className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
                  !about.languages?.includes(language) && reachedMaxLanguages ? 'text-muted-foreground' : ''
                }`}
              >
                {language}
              </label>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Lifestyle</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="smoking"
              checked={about.lifestyle?.smoking || false}
              onCheckedChange={(checked) => 
                updateLifestyle('smoking', checked)
              }
            />
            <label
              htmlFor="smoking"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I smoke
            </label>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="drinking">Drinking</Label>
            <Select
              value={about.lifestyle?.drinking || ''}
              onValueChange={(value) => updateLifestyle('drinking', value)}
            >
              <SelectTrigger id="drinking">
                <SelectValue placeholder="Select drinking habits" />
              </SelectTrigger>
              <SelectContent>
                {drinkingOptions.map((option) => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfileAbout;
