
import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { differenceInYears, getDate, getMonth } from 'date-fns';
import { CustomDatePicker } from '@/components/ui/custom-date-picker';

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

interface DateOfBirthFieldProps {
  birthDate?: Date | undefined;
  onChange: (date: Date | undefined) => void;
  onAgeChange: (age: number) => void;
  onZodiacChange: (zodiac: string) => void;
}

export const DateOfBirthField: React.FC<DateOfBirthFieldProps> = ({ 
  birthDate, 
  onChange, 
  onAgeChange, 
  onZodiacChange 
}) => {
  const [age, setAge] = useState<number | undefined>(undefined);
  const [zodiacSign, setZodiacSign] = useState<string | undefined>(undefined);
  
  // Calculate age and zodiac sign whenever birthDate changes
  useEffect(() => {
    if (birthDate) {
      // Calculate age
      const calculatedAge = differenceInYears(new Date(), birthDate);
      setAge(calculatedAge);
      onAgeChange(calculatedAge);
      
      // Calculate zodiac sign
      const month = getMonth(birthDate);
      const day = getDate(birthDate);
      const sign = getZodiacSign(month, day);
      setZodiacSign(sign);
      onZodiacChange(sign);
    }
  }, [birthDate, onAgeChange, onZodiacChange]);

  return (
    <div className="space-y-2">
      <Label htmlFor="birthdate">Date of Birth</Label>
      <CustomDatePicker
        value={birthDate}
        onChange={onChange}
        disabled={(date) => {
          // Disable future dates
          if (date > new Date()) return true;
          
          // Disable dates that would make the user under 18
          const years = differenceInYears(new Date(), date);
          return years < 18;
        }}
      />
      {age !== undefined && (
        <div className="text-sm text-foreground mt-3">
          <span className="font-medium">Age:</span> {age} years | <span className="font-medium">Zodiac:</span> {zodiacSign}
        </div>
      )}
    </div>
  );
};
