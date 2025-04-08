
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
    }, 500); // Increased to 500ms for better UX
  };

  const handleSelectLocation = (city: GeocodedCity) => {
    console.log('Selected location:', city);
    // Use formatted address for display
    setInputValue(city.formatted_address);
    onChange(city.formatted_address, city.lat, city.lon);
    setOpen(false);
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
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              {inputValue || placeholder || "Search for a location..."}
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-background" align="start">
          <Command>
            <CommandInput 
              placeholder="Search for a city..." 
              value={inputValue}
              onValueChange={handleSearch}
              className="h-9"
            />
            <CommandList>
              {isLoading ? (
                <div className="flex items-center justify-center p-4 text-sm">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading locations...
                </div>
              ) : (
                <>
                  <CommandEmpty>No locations found</CommandEmpty>
                  <CommandGroup>
                    {suggestions.map((city) => (
                      <CommandItem 
                        key={`${city.name}-${city.lat}-${city.lon}`}
                        onSelect={() => handleSelectLocation(city)}
                        className="cursor-pointer py-2"
                      >
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <div>
                            <p>{city.formatted_address}</p>
                          </div>
                        </div>
                        {inputValue === city.formatted_address && (
                          <Check className="h-4 w-4 ml-auto" />
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};
