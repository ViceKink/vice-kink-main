
import React, { useState, useEffect, useRef } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Check, MapPin, Loader2 } from 'lucide-react';
import { searchLocations, GeocodedCity } from '@/utils/geocodingService';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

interface LocationSearchFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string, lat?: number, lng?: number) => void;
  placeholder?: string;
}

export const LocationSearchField: React.FC<LocationSearchFieldProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder,
}) => {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value || '');
  const [suggestions, setSuggestions] = useState<GeocodedCity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  // Update input value when external value changes
  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  // Handle search with debounce
  const handleSearch = (searchQuery: string) => {
    setInputValue(searchQuery);
    
    // Clear previous timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    if (searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    
    // Set new timeout
    searchTimeout.current = setTimeout(async () => {
      try {
        console.log('Searching for locations with query:', searchQuery);
        const results = await searchLocations(searchQuery);
        console.log('Location results received:', results);
        setSuggestions(results);
      } catch (error) {
        console.error('Error searching locations:', error);
      } finally {
        setIsLoading(false);
      }
    }, 300); // 300ms debounce
  };

  // Submit the current input value manually
  const handleManualSubmit = async () => {
    if (inputValue.length < 2) return;
    
    setIsLoading(true);
    try {
      const results = await searchLocations(inputValue);
      if (results && results.length > 0) {
        // Use the first result
        handleSelectLocation(results[0]);
      }
    } catch (error) {
      console.error('Error in manual submit:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectLocation = (city: GeocodedCity) => {
    console.log('Selected location:', city);
    // Use formatted address for display
    setInputValue(city.formatted_address);
    onChange(city.formatted_address, city.lat, city.lon);
    setOpen(false);
  };

  // Handle keydown events for enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleManualSubmit();
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between text-left font-normal h-10"
          >
            <div className="flex items-center gap-2 w-full overflow-hidden">
              <MapPin className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
              <span className="truncate">
                {inputValue || placeholder || "Search for a location..."}
              </span>
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-[var(--radix-popover-trigger-width)] p-0 bg-background" 
          align="start"
          sideOffset={5}
        >
          <div className="flex flex-col">
            <div className="flex items-center border-b p-2">
              <Input 
                placeholder="Search for a city..." 
                value={inputValue}
                onChange={(e) => handleSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              <Button 
                size="sm" 
                variant="ghost"
                disabled={isLoading}
                onClick={handleManualSubmit}
                className="ml-2"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
              </Button>
            </div>
            
            <div className="max-h-[300px] overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center p-4 text-sm">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading locations...
                </div>
              ) : suggestions.length > 0 ? (
                <div>
                  {suggestions.map((city) => (
                    <div 
                      key={`${city.name}-${city.lat}-${city.lon}`}
                      onClick={() => handleSelectLocation(city)}
                      className="flex items-center gap-2 p-3 hover:bg-muted cursor-pointer"
                    >
                      <MapPin className="h-4 w-4" />
                      <div className="truncate">
                        <p className="truncate">{city.formatted_address || city.display_name}</p>
                        {city.country && <p className="text-xs text-muted-foreground">{city.country}</p>}
                      </div>
                      {inputValue === city.formatted_address && (
                        <Check className="h-4 w-4 ml-auto" />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-sm text-center text-muted-foreground">
                  {inputValue.length > 0 ? "No locations found" : "Type to search for locations"}
                </div>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
