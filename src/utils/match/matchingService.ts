
import { supabase } from '@/integrations/supabase/client';
import { DiscoverProfile } from './types';
import { fetchDiscoverProfiles } from './profileService';

// Function to get compatible profiles for a user
export async function getCompatibleProfiles(
  userId: string, 
  maxDistance: number = 50,
  sortOption: string = 'distance'
): Promise<DiscoverProfile[]> {
  try {
    // Use the fetchDiscoverProfiles function
    const profiles = await fetchDiscoverProfiles(userId, {
      maxDistance: maxDistance,
      sortBy: sortOption
    });
    
    // Further filter by distance if needed
    let filteredProfiles = profiles;
    
    if (maxDistance > 0 && sortOption === 'distance') {
      // Filter profiles that exceed the maximum distance
      filteredProfiles = profiles.filter(profile => {
        if (!profile.distance) return true; // Include profiles without distance info
        
        // Extract distance value from string (e.g., "10 km" -> 10)
        const distanceValue = parseInt(profile.distance.split(' ')[0]);
        return isNaN(distanceValue) || distanceValue <= maxDistance;
      });
      
      // Sort by distance
      filteredProfiles.sort((a, b) => {
        if (!a.distance) return 1;
        if (!b.distance) return -1;
        
        const distA = parseInt(a.distance.split(' ')[0]);
        const distB = parseInt(b.distance.split(' ')[0]);
        
        if (isNaN(distA)) return 1;
        if (isNaN(distB)) return -1;
        
        return distA - distB;
      });
    }
    
    return filteredProfiles as DiscoverProfile[];
  } catch (error) {
    console.error('Error in getCompatibleProfiles:', error);
    return [];
  }
}

// Export the matchingService object with all functions
export const matchingService = {
  getCompatibleProfiles
};
