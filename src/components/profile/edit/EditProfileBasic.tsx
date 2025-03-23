import React, { useState, useEffect } from 'react';
import { UserProfile } from '@/context/AuthContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, CalendarIcon, XCircle } from 'lucide-react';
import { format, differenceInYears, getDate, getMonth } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface EditProfileBasicProps {
  userData: Partial<UserProfile>;
  updateField: (field: string, value: any) => void;
}

// Function to calculate zodiac sign from date of birth
const getZodiacSign = (month: number, day: number): string => {
  const zodiacSigns = [
    { name: 'Capricorn', startMonth: 12, startDay: 22, endMonth: 1, endDay: 19 },
    { name: 'Aquarius', startMonth: 1, startDay: 20, endMonth: 2, endDay: 18 },
    { name: 'Pisces', startMonth: 2, startDay: 19, endMonth: 3, endDay: 20 },
    { name: 'Aries', startMonth: 3, startDay: 21, endMonth: 4, endDay: 19 },
    { name: 'Taurus', startMonth: 4, startDay: 20, endMonth: 5, endDay: 20 },
    { name: 'Gemini', startMonth: 5, startDay: 21, endMonth: 6, endDay: 20 },
    { name: 'Cancer', startMonth: 6, startDay: 21, endMonth: 7, endDay: 22 },
    { name: 'Leo', startMonth: 7, startDay: 23, endMonth: 8, endDay: 22 },
    { name: 'Virgo', startMonth: 8, startDay: 23, endMonth: 9, endDay: 22 },
    { name: 'Libra', startMonth: 9, startDay: 23, endMonth: 10, endDay: 22 },
    { name: 'Scorpio', startMonth: 10, startDay: 23, endMonth: 11, endDay: 21 },
    { name: 'Sagittarius', startMonth: 11, startDay: 22, endMonth: 12, endDay: 21 },
    { name: 'Capricorn', startMonth: 12, startDay: 22, endMonth: 12, endDay: 31 },
  ];

  // JavaScript months are 0-indexed, but our data is 1-indexed
  month = month + 1;
  
  for (const sign of zodiacSigns) {
    if (
      (month === sign.startMonth && day >= sign.startDay) ||
      (month === sign.endMonth && day <= sign.endDay)
    ) {
      return sign.name;
    }
  }
  
  return 'Unknown';
};

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

const EditProfileBasic = ({ userData, updateField }: EditProfileBasicProps) => {
  const [birthDate, setBirthDate] = useState<Date | undefined>(
    userData.birthDate ? new Date(userData.birthDate) : undefined
  );
  const [age, setAge] = useState<number | undefined>(userData.age);
  const [zodiacSign, setZodiacSign] = useState<string | undefined>(userData.about?.zodiac);
  
  // Calculate age and zodiac sign whenever birthDate changes
  useEffect(() => {
    if (birthDate) {
      // Calculate age
      const calculatedAge = differenceInYears(new Date(), birthDate);
      setAge(calculatedAge);
      updateField('age', calculatedAge);
      
      // Update birthDate in userData
      updateField('birthDate', birthDate.toISOString());
      
      // Calculate zodiac sign
      const month = getMonth(birthDate);
      const day = getDate(birthDate);
      const sign = getZodiacSign(month, day);
      setZodiacSign(sign);
      
      // Update zodiac in about object
      const updatedAbout = { ...(userData.about || {}) };
      updatedAbout.zodiac = sign;
      updateField('about', updatedAbout);
    }
  }, [birthDate, updateField]);

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
          <Label htmlFor="birthdate">Date of Birth</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="birthdate"
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !birthDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {birthDate ? format(birthDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={birthDate}
                onSelect={setBirthDate}
                disabled={(date) => {
                  // Disable future dates
                  if (date > new Date()) return true;
                  
                  // Disable dates that would make the user under 18
                  const years = differenceInYears(new Date(), date);
                  return years < 18;
                }}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
                captionLayout="dropdown-buttons"
                fromYear={1940}
                toYear={2006} // Current year minus 18
              />
            </PopoverContent>
          </Popover>
          {age !== undefined && (
            <p className="text-xs text-muted-foreground mt-1">
              Age: {age} years | Zodiac: {zodiacSign}
            </p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="location">Current Location</Label>
          <Input
            id="location"
            value={userData.location || ''}
            onChange={(e) => updateField('location', e.target.value)}
            placeholder="City, Country"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="hometown">Hometown</Label>
          <Input
            id="hometown"
            value={userData.hometown || ''}
            onChange={(e) => updateField('hometown', e.target.value)}
            placeholder="Your hometown"
          />
        </div>
        
        <div className="space-y-2 md:col-span-2">
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
