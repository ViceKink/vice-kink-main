
import React from 'react';
import { UserProfile } from '@/types/auth';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { useForm } from 'react-hook-form';

interface EditProfileAboutProps {
  userData: Partial<UserProfile>;
  updateField: (field: string, value: any) => void;
}

// Height options in feet and inches
const generateHeightOptions = () => {
  const options = [];
  
  // Generate heights from 4'0" to 8'0"
  for (let feet = 4; feet <= 8; feet++) {
    for (let inches = 0; inches <= 11; inches++) {
      // For 8', only include 8'0"
      if (feet === 8 && inches > 0) break;
      
      const heightInInches = feet * 12 + inches;
      const heightInCm = Math.round(heightInInches * 2.54);
      
      options.push({
        value: `${feet}'${inches}" (${heightInCm}cm)`,
        label: `${feet}'${inches}" (${heightInCm}cm)`
      });
    }
  }
  
  return options;
};

const heightOptions = generateHeightOptions();

const EditProfileAbout: React.FC<EditProfileAboutProps> = ({ 
  userData, 
  updateField 
}) => {
  const handleChange = (key: string, value: any) => {
    const updatedAbout = {
      ...(userData.about || {}),
      [key]: value
    };
    
    updateField('about', updatedAbout);
  };
  
  const handleLifestyleChange = (key: string, value: any) => {
    const updatedLifestyle = {
      ...(userData.about?.lifestyle || {}),
      [key]: value
    };
    
    const updatedAbout = {
      ...(userData.about || {}),
      lifestyle: updatedLifestyle
    };
    
    updateField('about', updatedAbout);
  };
  
  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div>
        <h3 className="text-lg font-medium mb-4">Basic Information</h3>
        
        {/* Occupation */}
        <div className="grid gap-4 mb-4">
          <div className="space-y-2">
            <Label htmlFor="occupation">Occupation</Label>
            <Input
              id="occupation"
              value={userData.about?.occupation || ''}
              onChange={(e) => handleChange('occupation', e.target.value)}
              placeholder="What do you do?"
            />
          </div>
          
          {/* Gender */}
          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <Select
              value={userData.about?.gender || ''}
              onValueChange={(value) => handleChange('gender', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Non-binary">Non-binary</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Education */}
          <div className="space-y-2">
            <Label htmlFor="education">Education</Label>
            <Select
              value={userData.about?.education || ''}
              onValueChange={(value) => handleChange('education', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your education level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="High School">High School</SelectItem>
                <SelectItem value="Some College">Some College</SelectItem>
                <SelectItem value="Associate's Degree">Associate's Degree</SelectItem>
                <SelectItem value="Bachelor's Degree">Bachelor's Degree</SelectItem>
                <SelectItem value="Master's Degree">Master's Degree</SelectItem>
                <SelectItem value="Doctorate/PhD">Doctorate/PhD</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Ethnicity */}
          <div className="space-y-2">
            <Label htmlFor="ethnicity">Ethnicity</Label>
            <Select
              value={userData.about?.ethnicity || ''}
              onValueChange={(value) => handleChange('ethnicity', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your ethnicity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Asian">Asian</SelectItem>
                <SelectItem value="Black">Black</SelectItem>
                <SelectItem value="Hispanic/Latino">Hispanic/Latino</SelectItem>
                <SelectItem value="Middle Eastern">Middle Eastern</SelectItem>
                <SelectItem value="Native American">Native American</SelectItem>
                <SelectItem value="Pacific Islander">Pacific Islander</SelectItem>
                <SelectItem value="White">White</SelectItem>
                <SelectItem value="Mixed">Mixed</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Height - Changed back to dropdown with feet and inches */}
          <div className="space-y-2">
            <Label htmlFor="height">Height</Label>
            <Select
              value={userData.about?.height || ''}
              onValueChange={(value) => handleChange('height', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your height" />
              </SelectTrigger>
              <SelectContent>
                {heightOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Relationship Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Relationship Status</Label>
            <Select
              value={userData.about?.status || ''}
              onValueChange={(value) => handleChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single</SelectItem>
                <SelectItem value="married">Married</SelectItem>
                <SelectItem value="it's complicated">It's complicated</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Relationship Type */}
          <div className="space-y-2">
            <Label htmlFor="relationshipType">Relationship Type</Label>
            <Select
              value={userData.about?.relationshipType || ''}
              onValueChange={(value) => handleChange('relationshipType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select relationship type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Monogamous">Monogamous</SelectItem>
                <SelectItem value="Non-monogamous">Non-monogamous</SelectItem>
                <SelectItem value="Open to either">Open to either</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Dating Intention */}
          <div className="space-y-2">
            <Label htmlFor="datingIntention">Dating Intention</Label>
            <Select
              value={userData.about?.datingIntention || ''}
              onValueChange={(value) => handleChange('datingIntention', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your dating intention" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Casual dating">Casual dating</SelectItem>
                <SelectItem value="Serious relationship">Serious relationship</SelectItem>
                <SelectItem value="Marriage">Marriage</SelectItem>
                <SelectItem value="Not sure yet">Not sure yet</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Zodiac field has been removed as requested */}
          
          {/* Religion */}
          <div className="space-y-2">
            <Label htmlFor="religion">Religion</Label>
            <Select
              value={userData.about?.religion || ''}
              onValueChange={(value) => handleChange('religion', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select religion" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Agnostic">Agnostic</SelectItem>
                <SelectItem value="Atheist">Atheist</SelectItem>
                <SelectItem value="Buddhist">Buddhist</SelectItem>
                <SelectItem value="Catholic">Catholic</SelectItem>
                <SelectItem value="Christian">Christian</SelectItem>
                <SelectItem value="Hindu">Hindu</SelectItem>
                <SelectItem value="Jewish">Jewish</SelectItem>
                <SelectItem value="Muslim">Muslim</SelectItem>
                <SelectItem value="Spiritual">Spiritual</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Sexuality */}
          <div className="space-y-2">
            <Label htmlFor="sexuality">Sexuality</Label>
            <Select
              value={userData.about?.sexuality || ''}
              onValueChange={(value) => handleChange('sexuality', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select sexuality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Straight">Straight</SelectItem>
                <SelectItem value="Gay">Gay</SelectItem>
                <SelectItem value="Lesbian">Lesbian</SelectItem>
                <SelectItem value="Bisexual">Bisexual</SelectItem>
                <SelectItem value="Pansexual">Pansexual</SelectItem>
                <SelectItem value="Asexual">Asexual</SelectItem>
                <SelectItem value="Queer">Queer</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {/* Lifestyle */}
      <div>
        <h3 className="text-lg font-medium mb-4">Lifestyle</h3>
        
        <div className="grid gap-4">
          {/* Smoking */}
          <div className="space-y-2">
            <Label htmlFor="smoking">Smoking</Label>
            <Select
              value={userData.about?.lifestyle?.smoking ? 'yes' : 'no'}
              onValueChange={(value) => handleLifestyleChange('smoking', value === 'yes')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Do you smoke?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Drinking */}
          <div className="space-y-2">
            <Label htmlFor="drinking">Drinking</Label>
            <Select
              value={userData.about?.lifestyle?.drinking || ''}
              onValueChange={(value) => handleLifestyleChange('drinking', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Drinking habits" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Never">Never</SelectItem>
                <SelectItem value="Socially">Socially</SelectItem>
                <SelectItem value="Regularly">Regularly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfileAbout;
