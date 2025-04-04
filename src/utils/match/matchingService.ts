
import { supabase } from '@/integrations/supabase/client';
import { DiscoverProfile } from './types';
import { fetchProfilesToDiscover } from './profileService';

// Function to get compatible profiles for a user
// This now uses fetchProfilesToDiscover instead of a stored procedure
export async function getCompatibleProfiles(
  userId: string, 
  maxDistance: number = 50,
  sortOption: string = 'distance'
): Promise<DiscoverProfile[]> {
  try {
    // Use the existing fetchProfilesToDiscover function instead
    const profiles = await fetchProfilesToDiscover(userId, [], {
      maxDistance: maxDistance,
      sortBy: sortOption
    });
    
    return profiles as DiscoverProfile[];
  } catch (error) {
    console.error('Error in getCompatibleProfiles:', error);
    return [];
  }
}

// Export the matchingService object with all functions
export const matchingService = {
  getCompatibleProfiles
};
