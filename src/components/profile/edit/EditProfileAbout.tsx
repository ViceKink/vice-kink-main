
import React from 'react';
import { UserProfile, FlirtingStyle } from '@/types/auth';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';

interface EditProfileAboutProps {
  userData: Partial<UserProfile>;
  updateField: (field: string, value: any) => void;
}

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
  
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">About Me</h2>
      
      <div className="space-y-4">
        <div className="space-y-2">
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
    </div>
  );
};

export default EditProfileAbout;
