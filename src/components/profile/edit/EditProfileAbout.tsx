import React, { useState } from 'react';
import { UserProfile, FlirtingStyle } from '@/types/auth';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface EditProfileAboutProps {
  userData: Partial<UserProfile>;
  updateField: (field: string, value: any) => void;
}

// Relationship status options
const relationshipOptions = [
  { value: 'single', label: 'Single' },
  { value: 'married', label: 'Married' },
  { value: 'it\'s complicated', label: 'It\'s Complicated' },
  { value: 'in a relationship', label: 'In a Relationship' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'widowed', label: 'Widowed' },
];

// Height options (in cm and feet/inches)
const generateHeightOptions = (): { value: string; label: string }[] => {
  const options = [];
  
  // Add heights from 145cm (4'9") to 215cm (7'1")
  for (let cm = 145; cm <= 215; cm++) {
    const feet = Math.floor(cm / 30.48);
    const inches = Math.round((cm / 2.54) % 12);
    options.push({
      value: `${cm}cm`,
      label: `${cm}cm (${feet}'${inches}")`
    });
  }
  
  return options;
};

const heightOptions = generateHeightOptions();

// Religion options
const religionOptions = [
  { value: 'Christianity', label: 'Christianity' },
  { value: 'Islam', label: 'Islam' },
  { value: 'Hinduism', label: 'Hinduism' },
  { value: 'Buddhism', label: 'Buddhism' },
  { value: 'Judaism', label: 'Judaism' },
  { value: 'Sikhism', label: 'Sikhism' },
  { value: 'Atheism', label: 'Atheism' },
  { value: 'Agnosticism', label: 'Agnosticism' },
  { value: 'Spiritual', label: 'Spiritual' },
  { value: 'Other', label: 'Other' },
  { value: 'Prefer not to say', label: 'Prefer not to say' },
];

// Sexuality options
const sexualityOptions = [
  { value: 'Straight', label: 'Straight' },
  { value: 'Gay', label: 'Gay' },
  { value: 'Lesbian', label: 'Lesbian' },
  { value: 'Bisexual', label: 'Bisexual' },
  { value: 'Pansexual', label: 'Pansexual' },
  { value: 'Asexual', label: 'Asexual' },
  { value: 'Demisexual', label: 'Demisexual' },
  { value: 'Queer', label: 'Queer' },
  { value: 'Questioning', label: 'Questioning' },
  { value: 'Other', label: 'Other' },
  { value: 'Prefer not to say', label: 'Prefer not to say' },
];

// Common languages
const commonLanguages = [
  'English', 'Spanish', 'Mandarin', 'Hindi', 'Arabic', 
  'Portuguese', 'Bengali', 'Russian', 'Japanese', 'Punjabi',
  'German', 'French', 'Italian', 'Korean', 'Turkish',
  'Vietnamese', 'Tamil', 'Urdu', 'Polish', 'Malay',
  'Ukrainian', 'Persian', 'Thai', 'Dutch', 'Tagalog'
];

const EditProfileAbout = ({ userData, updateField }: EditProfileAboutProps) => {
  // Extract the flirting style fields or initialize with defaults
  const defaultFlirtingStyle: FlirtingStyle = {
    direct: 50,
    playful: 50,
    intellectual: 50,
    physical: 50,
    romantic: 50
  };

  // Parse flirtingStyle if it's a string or use default
  let flirtingStyle: FlirtingStyle = defaultFlirtingStyle;
  
  if (userData.flirtingStyle) {
    if (typeof userData.flirtingStyle === 'string') {
      try {
        flirtingStyle = JSON.parse(userData.flirtingStyle) as FlirtingStyle;
      } catch (error) {
        console.error('Error parsing flirting style:', error);
      }
    } else {
      flirtingStyle = userData.flirtingStyle as FlirtingStyle;
    }
  }
  
  // Handle updating a specific flirting style attribute
  const updateFlirtingStyle = (attribute: keyof FlirtingStyle, value: number) => {
    const updatedStyle = {
      ...flirtingStyle,
      [attribute]: value
    };
    
    // Store flirting style object (will be converted to JSON in AuthProvider)
    updateField('flirtingStyle', updatedStyle);
  };

  // Languages state
  const [languages, setLanguages] = useState<string[]>(userData.about?.languages || []);
  const [newLanguage, setNewLanguage] = useState('');
  
  // Function to handle language addition
  const handleAddLanguage = () => {
    if (newLanguage && !languages.includes(newLanguage)) {
      const updatedLanguages = [...languages, newLanguage];
      setLanguages(updatedLanguages);
      
      // Update languages in about object
      const updatedAbout = { ...(userData.about || {}) };
      updatedAbout.languages = updatedLanguages;
      updateField('about', updatedAbout);
      
      // Clear input
      setNewLanguage('');
    }
  };
  
  // Function to handle language removal
  const handleRemoveLanguage = (language: string) => {
    const updatedLanguages = languages.filter(lang => lang !== language);
    setLanguages(updatedLanguages);
    
    // Update languages in about object
    const updatedAbout = { ...(userData.about || {}) };
    updatedAbout.languages = updatedLanguages;
    updateField('about', updatedAbout);
  };
  
  // Function to handle about field changes
  const handleAboutFieldChange = (field: string, value: any) => {
    const updatedAbout = { ...(userData.about || {}) };
    updatedAbout[field] = value;
    updateField('about', updatedAbout);
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">About Me</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="relationship">Relationship Status</Label>
          <Select
            value={userData.about?.status || ''}
            onValueChange={(value) => handleAboutFieldChange('status', value)}
          >
            <SelectTrigger id="relationship">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {relationshipOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="height">Height</Label>
          <Select
            value={userData.about?.height || ''}
            onValueChange={(value) => handleAboutFieldChange('height', value)}
          >
            <SelectTrigger id="height">
              <SelectValue placeholder="Select height" />
            </SelectTrigger>
            <SelectContent className="max-h-[240px]">
              {heightOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="occupation">Occupation</Label>
          <Input
            id="occupation"
            value={userData.about?.occupation || ''}
            onChange={(e) => handleAboutFieldChange('occupation', e.target.value)}
            placeholder="What do you do for work?"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="religion">Religion</Label>
          <Select
            value={userData.about?.religion || ''}
            onValueChange={(value) => handleAboutFieldChange('religion', value)}
          >
            <SelectTrigger id="religion">
              <SelectValue placeholder="Select religion" />
            </SelectTrigger>
            <SelectContent>
              {religionOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="sexuality">Sexuality</Label>
          <Select
            value={userData.about?.sexuality || ''}
            onValueChange={(value) => handleAboutFieldChange('sexuality', value)}
          >
            <SelectTrigger id="sexuality">
              <SelectValue placeholder="Select sexuality" />
            </SelectTrigger>
            <SelectContent>
              {sexualityOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="languages">Languages</Label>
          <div className="flex gap-2">
            <Select
              value={newLanguage}
              onValueChange={setNewLanguage}
            >
              <SelectTrigger id="languages" className="flex-1">
                <SelectValue placeholder="Select a language" />
              </SelectTrigger>
              <SelectContent>
                {commonLanguages.map(language => (
                  <SelectItem key={language} value={language}>
                    {language}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              type="button" 
              onClick={handleAddLanguage}
              disabled={!newLanguage || languages.includes(newLanguage)}
            >
              Add
            </Button>
          </div>
          
          {languages.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {languages.map((language) => (
                <div 
                  key={language}
                  className="flex items-center gap-1 bg-secondary px-2 py-1 rounded-full text-sm"
                >
                  {language}
                  <button
                    type="button"
                    onClick={() => handleRemoveLanguage(language)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <XCircle size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="space-y-2 mt-8">
        <Label htmlFor="quote">Favorite Quote</Label>
        <Textarea
          id="quote"
          value={userData.quote || ''}
          onChange={(e) => updateField('quote', e.target.value)}
          placeholder="Share a quote that represents you"
          className="min-h-[80px]"
        />
      </div>
      
      <h3 className="text-md font-medium mt-6">Flirting Style</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Adjust the sliders to reflect your flirting style preferences
      </p>
      
      <div className="space-y-6">
        <div className="space-y-3">
          <div className="flex justify-between">
            <Label htmlFor="direct">Direct</Label>
            <span className="text-sm text-muted-foreground">{flirtingStyle.direct}%</span>
          </div>
          <Slider
            id="direct"
            min={0}
            max={100}
            step={1}
            value={[flirtingStyle.direct]}
            onValueChange={(values) => updateFlirtingStyle('direct', values[0])}
          />
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <Label htmlFor="playful">Playful</Label>
            <span className="text-sm text-muted-foreground">{flirtingStyle.playful}%</span>
          </div>
          <Slider
            id="playful"
            min={0}
            max={100}
            step={1}
            value={[flirtingStyle.playful]}
            onValueChange={(values) => updateFlirtingStyle('playful', values[0])}
          />
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <Label htmlFor="intellectual">Intellectual</Label>
            <span className="text-sm text-muted-foreground">{flirtingStyle.intellectual}%</span>
          </div>
          <Slider
            id="intellectual"
            min={0}
            max={100}
            step={1}
            value={[flirtingStyle.intellectual]}
            onValueChange={(values) => updateFlirtingStyle('intellectual', values[0])}
          />
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <Label htmlFor="physical">Physical</Label>
            <span className="text-sm text-muted-foreground">{flirtingStyle.physical}%</span>
          </div>
          <Slider
            id="physical"
            min={0}
            max={100}
            step={1}
            value={[flirtingStyle.physical]}
            onValueChange={(values) => updateFlirtingStyle('physical', values[0])}
          />
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <Label htmlFor="romantic">Romantic</Label>
            <span className="text-sm text-muted-foreground">{flirtingStyle.romantic}%</span>
          </div>
          <Slider
            id="romantic"
            min={0}
            max={100}
            step={1}
            value={[flirtingStyle.romantic]}
            onValueChange={(values) => updateFlirtingStyle('romantic', values[0])}
          />
        </div>
      </div>
    </div>
  );
};

export default EditProfileAbout;
