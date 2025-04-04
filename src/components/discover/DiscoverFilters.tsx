
import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/context/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Filter } from 'lucide-react';

interface DiscoverFiltersProps {
  distance: number;
  setDistance: (distance: number) => void;
  sortOption: string;
  setSortOption: (option: string) => void;
}

const DiscoverFilters: React.FC<DiscoverFiltersProps> = ({ 
  distance, 
  setDistance, 
  sortOption, 
  setSortOption 
}) => {
  const { user, updateProfile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [preferences, setPreferences] = useState<any>({
    preferred_gender: [],
    age_range: { min: 18, max: 50 },
    max_distance: distance || 50,
    preferred_ethnicity: [],
    preferred_relationship_type: [],
    preferred_education: []
  });
  
  // Load user preferences
  useEffect(() => {
    if (user?.preferences) {
      setPreferences(user.preferences);
      // Update the distance when the user preferences are loaded
      if (user.preferences.max_distance) {
        setDistance(user.preferences.max_distance);
      }
    }
  }, [user?.preferences]);
  
  const handleGenderPreferenceChange = (gender: string, checked: boolean) => {
    const currentGenders = preferences.preferred_gender || [];
    const updatedGenders = checked
      ? [...currentGenders, gender]
      : currentGenders.filter((g: string) => g !== gender);
    
    setPreferences({
      ...preferences,
      preferred_gender: updatedGenders
    });
  };
  
  const handleAgeRangeChange = (values: number[]) => {
    setPreferences({
      ...preferences,
      age_range: { min: values[0], max: values[1] }
    });
  };
  
  const handleMaxDistanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDistance = parseInt(e.target.value);
    setPreferences({
      ...preferences,
      max_distance: newDistance
    });
    setDistance(newDistance);
  };
  
  const handleSortOptionChange = (option: string) => {
    setSortOption(option);
  };
  
  const handleEthnicityPreferenceChange = (ethnicity: string, checked: boolean) => {
    const currentEthnicities = preferences.preferred_ethnicity || [];
    const updatedEthnicities = checked
      ? [...currentEthnicities, ethnicity]
      : currentEthnicities.filter((e: string) => e !== ethnicity);
    
    setPreferences({
      ...preferences,
      preferred_ethnicity: updatedEthnicities
    });
  };
  
  const handleSavePreferences = async () => {
    if (!user?.id) return;
    
    setIsSaving(true);
    
    try {
      const updatedUser = {
        ...user,
        preferences
      };
      
      await updateProfile(updatedUser);
      
      toast.success('Preferences updated successfully');
      setIsOpen(false);
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save preferences');
    } finally {
      setIsSaving(false);
    }
  };

  const openFilters = () => setIsOpen(true);
  const closeFilters = () => setIsOpen(false);
  
  return (
    <>
      <div className="flex items-center justify-between mb-6 px-2">
        <div>
          <h1 className="text-2xl font-bold">Discover</h1>
          <p className="text-muted-foreground">Find your perfect match</p>
        </div>
        <Button onClick={openFilters} variant="outline" size="sm">
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </Button>
      </div>
      
      <div className="flex mb-4 px-2 space-x-2 overflow-x-auto scrollbar-hide">
        <Button 
          variant={sortOption === "distance" ? "default" : "outline"}
          size="sm"
          onClick={() => handleSortOptionChange("distance")}
          className="whitespace-nowrap"
        >
          Nearest first
        </Button>
        <Button 
          variant={sortOption === "newest" ? "default" : "outline"}
          size="sm"
          onClick={() => handleSortOptionChange("newest")}
          className="whitespace-nowrap"
        >
          Newest profiles
        </Button>
        <Button 
          variant={sortOption === "most_active" ? "default" : "outline"}
          size="sm"
          onClick={() => handleSortOptionChange("most_active")}
          className="whitespace-nowrap"
        >
          Most active
        </Button>
      </div>
      
      <Sheet open={isOpen} onOpenChange={closeFilters}>
        <SheetContent className="overflow-auto w-full max-w-md sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Matching Preferences</SheetTitle>
            <SheetDescription>
              Set your preferences for finding matches. These settings help us recommend profiles that match your criteria.
            </SheetDescription>
          </SheetHeader>
          
          <div className="py-4 space-y-6">
            {/* Gender Preferences */}
            <div className="space-y-4">
              <h4 className="font-medium">Looking for</h4>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="gender-men"
                    checked={preferences.preferred_gender?.includes('Male')}
                    onCheckedChange={(checked) => handleGenderPreferenceChange('Male', checked as boolean)}
                  />
                  <label htmlFor="gender-men" className="text-sm">Men</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="gender-women"
                    checked={preferences.preferred_gender?.includes('Female')}
                    onCheckedChange={(checked) => handleGenderPreferenceChange('Female', checked as boolean)}
                  />
                  <label htmlFor="gender-women" className="text-sm">Women</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="gender-nonbinary"
                    checked={preferences.preferred_gender?.includes('Non-binary')}
                    onCheckedChange={(checked) => handleGenderPreferenceChange('Non-binary', checked as boolean)}
                  />
                  <label htmlFor="gender-nonbinary" className="text-sm">Non-binary</label>
                </div>
              </div>
            </div>

            {/* Age Range */}
            <div className="space-y-4">
              <h4 className="font-medium">Age range</h4>
              <Slider 
                defaultValue={[
                  preferences.age_range?.min || 18, 
                  preferences.age_range?.max || 50
                ]}
                min={18} 
                max={99} 
                step={1}
                onValueChange={handleAgeRangeChange}
              />
              <div className="flex justify-between">
                <span className="text-sm">{preferences.age_range?.min || 18}</span>
                <span className="text-sm">{preferences.age_range?.max || 50}</span>
              </div>
            </div>

            {/* Max Distance */}
            <div className="space-y-4">
              <h4 className="font-medium">Maximum distance</h4>
              <div className="flex items-center gap-4">
                <Input
                  type="number"
                  value={preferences.max_distance || 50}
                  onChange={handleMaxDistanceChange}
                  min={1}
                  max={500}
                  className="w-24"
                />
                <span className="text-sm">miles</span>
              </div>
            </div>
            
            {/* Ethnicity Preferences */}
            <div className="space-y-4">
              <h4 className="font-medium">Ethnicity preferences</h4>
              <div className="grid grid-cols-2 gap-4">
                {['Asian', 'Black', 'Hispanic/Latino', 'Middle Eastern', 'Native American', 'Pacific Islander', 'White', 'Mixed', 'Other'].map((ethnicity) => (
                  <div key={ethnicity} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`ethnicity-${ethnicity.toLowerCase().replace(/\s+/g, '-')}`}
                      checked={preferences.preferred_ethnicity?.includes(ethnicity)}
                      onCheckedChange={(checked) => handleEthnicityPreferenceChange(ethnicity, checked as boolean)}
                    />
                    <label htmlFor={`ethnicity-${ethnicity.toLowerCase().replace(/\s+/g, '-')}`} className="text-sm">{ethnicity}</label>
                  </div>
                ))}
              </div>
            </div>
            
            <Button 
              className="w-full mt-6 bg-vice-purple hover:bg-vice-dark-purple" 
              onClick={handleSavePreferences}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Apply Filters'
              )}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default DiscoverFilters;
