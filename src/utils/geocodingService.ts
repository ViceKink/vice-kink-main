
import { supabase } from '@/integrations/supabase/client';

// Interface for geocoded city data
export interface GeocodedCity {
  name: string;
  display_name: string;
  lat: number;
  lon: number;
  country: string;
  formatted_address: string;
}

// Function to search for locations using OpenStreetMap Nominatim API
export async function searchLocations(query: string): Promise<GeocodedCity[]> {
  if (!query || query.length < 2) return [];
  
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5&featureType=city`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch location data');
    }
    
    const data = await response.json();
    
    return data.map((item: any) => ({
      name: item.name || '',
      display_name: item.display_name,
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
      country: item.address?.country || '',
      formatted_address: `${item.address?.city || item.address?.town || item.address?.village || item.name}, ${item.address?.country || ''}`,
    }));
  } catch (error) {
    console.error('Error searching locations:', error);
    return [];
  }
}

// Function to calculate distance between two coordinates
export async function calculateDistance(
  lat1: number, 
  lng1: number, 
  lat2: number, 
  lng2: number
): Promise<number> {
  try {
    // Using the Supabase function we created
    const { data, error } = await supabase.rpc('calculate_distance', {
      lat1,
      lng1,
      lat2,
      lng2
    });
    
    if (error) {
      console.error('Error calculating distance:', error);
      throw error;
    }
    
    return data || 0;
  } catch (error) {
    console.error('Error calculating distance:', error);
    return 0;
  }
}

// Function to update a user's location in the database
export async function updateUserLocation(
  userId: string, 
  location: string, 
  lat: number, 
  lng: number
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        location,
        location_lat: lat,
        location_lng: lng
      })
      .eq('id', userId);
    
    if (error) {
      console.error('Error updating location:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error updating location:', error);
    return false;
  }
}
