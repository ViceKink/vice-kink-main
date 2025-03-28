
import React from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

interface DiscoverFiltersProps {
  isOpen: boolean;
  onClose: () => void;
}

const DiscoverFilters: React.FC<DiscoverFiltersProps> = ({ isOpen, onClose }) => {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="overflow-auto">
        <SheetHeader>
          <SheetTitle>Discover Filters</SheetTitle>
          <SheetDescription>
            Adjust your preferences to find your perfect match
          </SheetDescription>
        </SheetHeader>
        
        <div className="py-4 space-y-6">
          <div>
            <h3 className="text-sm font-medium mb-3">Age Range</h3>
            <Slider defaultValue={[18, 40]} min={18} max={80} step={1} />
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>18</span>
              <span>80+</span>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-3">Distance</h3>
            <Slider defaultValue={[50]} min={1} max={100} step={1} />
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>1 km</span>
              <span>100+ km</span>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-3">I'm interested in</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="gender-women" />
                <label htmlFor="gender-women" className="text-sm">Women</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="gender-men" />
                <label htmlFor="gender-men" className="text-sm">Men</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="gender-nonbinary" />
                <label htmlFor="gender-nonbinary" className="text-sm">Non-binary</label>
              </div>
            </div>
          </div>
          
          <Button className="w-full">Apply Filters</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default DiscoverFilters;
