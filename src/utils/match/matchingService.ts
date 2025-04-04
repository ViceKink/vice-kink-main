import { supabase } from '@/integrations/supabase/client';
import { DiscoverProfile } from './types';

// Function to get compatible profiles for a user
async function getCompatibleProfiles(
  userId: string, 
  maxDistance: number = 50,
  sortOption: string = 'distance'
): Promise<DiscoverProfile[]> {
  try {
    const { data, error } = await supabase.rpc('get_compatible_profiles', {
      current_user_id: userId,
      max_distance: maxDistance,
      sort_by: sortOption
    });

    if (error) {
      console.error('Error fetching compatible profiles:', error);
      throw new Error(error.message);
    }

    // Transform the data into the expected format
    const profiles = (data || []).map((profile: any) => ({
      id: profile.id,
      name: profile.name,
      avatar: profile.avatar,
      bio: profile.bio,
      age: profile.age,
      photos: profile.photos,
      location: profile.location,
      occupation: profile.occupation,
    }));

    return profiles as DiscoverProfile[];
  } catch (error) {
    console.error('Error in getCompatibleProfiles:', error);
    return [];
  }
}

// Add additional functions for matching functionality here...

export const matchingService = {
  getCompatibleProfiles
};
