
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
    console.log('Searching for location:', query);
    
    // Make the API call with proper headers (important for Nominatim)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Dating App Location Search (your-email@example.com)'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch location data: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Location search results:', data);
    
    if (!data || !Array.isArray(data) || data.length === 0) {
      return [];
    }
    
    // Map API results to our GeocodedCity interface
    const results = data.map((item: any) => {
      // Get city name from multiple possible sources
      const city = item.address?.city || 
                  item.address?.town || 
                  item.address?.village || 
                  item.name || '';
      
      // Get country
      const country = item.address?.country || '';
      
      return {
        name: item.name || '',
        display_name: item.display_name || '',
        lat: parseFloat(item.lat) || 0,
        lon: parseFloat(item.lon) || 0,
        country: country,
        formatted_address: city ? `${city}, ${country}` : country,
      };
    });
    
    console.log('Processed location results:', results);
    return results;
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
    // Manual calculation using Haversine formula since the RPC function isn't registered
    const R = 6371; // Radius of Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const distance = R * c;
    
    return distance;
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
