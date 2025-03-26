
import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { FlirtingStyle } from '@/types/auth';

interface EditProfileFlirtingStyleProps {
  userData: any;
  updateField: (field: string, value: any) => void;
}

const EditProfileFlirtingStyle = ({ userData, updateField }: EditProfileFlirtingStyleProps) => {
  // Parse flirting style from userData or use default values
  const [flirtingStyle, setFlirtingStyle] = useState<FlirtingStyle>(() => {
    if (typeof userData?.flirtingStyle === 'string') {
      try {
        return JSON.parse(userData.flirtingStyle);
      } catch (e) {
        return {
          direct: 50,
          playful: 50,
          intellectual: 50,
          physical: 50,
          romantic: 50
        };
      }
    } else if (userData?.flirtingStyle) {
      return userData.flirtingStyle;
    } else {
      return {
        direct: 50,
        playful: 50,
        intellectual: 50,
        physical: 50,
        romantic: 50
      };
    }
  });

  // Update parent state when sliders change
  useEffect(() => {
    const flirtingStyleString = JSON.stringify(flirtingStyle);
    updateField('flirtingStyle', flirtingStyleString);
  }, [flirtingStyle, updateField]);

  const handleSliderChange = (key: keyof FlirtingStyle, value: number[]) => {
    setFlirtingStyle((prev) => ({
      ...prev,
      [key]: value[0]
    }));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">My Flirting Style</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Adjust the sliders to represent your flirting style. Higher values indicate a stronger preference for that style.
      </p>

      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="direct-slider">Direct</Label>
            <span className="text-sm font-medium">{flirtingStyle.direct}%</span>
          </div>
          <Slider
            id="direct-slider"
            value={[flirtingStyle.direct]}
            min={0}
            max={100}
            step={1}
            onValueChange={(value) => handleSliderChange('direct', value)}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">Straightforward, honest, to the point</p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="playful-slider">Playful</Label>
            <span className="text-sm font-medium">{flirtingStyle.playful}%</span>
          </div>
          <Slider
            id="playful-slider"
            value={[flirtingStyle.playful]}
            min={0}
            max={100}
            step={1}
            onValueChange={(value) => handleSliderChange('playful', value)}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">Teasing, fun-loving, lighthearted</p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="intellectual-slider">Intellectual</Label>
            <span className="text-sm font-medium">{flirtingStyle.intellectual}%</span>
          </div>
          <Slider
            id="intellectual-slider"
            value={[flirtingStyle.intellectual]}
            min={0}
            max={100}
            step={1}
            onValueChange={(value) => handleSliderChange('intellectual', value)}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">Mentally stimulating, thoughtful conversations</p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="physical-slider">Physical</Label>
            <span className="text-sm font-medium">{flirtingStyle.physical}%</span>
          </div>
          <Slider
            id="physical-slider"
            value={[flirtingStyle.physical]}
            min={0}
            max={100}
            step={1}
            onValueChange={(value) => handleSliderChange('physical', value)}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">Touch-oriented, physical proximity, body language</p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="romantic-slider">Romantic</Label>
            <span className="text-sm font-medium">{flirtingStyle.romantic}%</span>
          </div>
          <Slider
            id="romantic-slider"
            value={[flirtingStyle.romantic]}
            min={0}
            max={100}
            step={1}
            onValueChange={(value) => handleSliderChange('romantic', value)}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">Emotional connection, sweet gestures, traditional romance</p>
        </div>
      </div>
    </div>
  );
};

export default EditProfileFlirtingStyle;
