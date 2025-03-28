
import { supabase } from "@/integrations/supabase/client";
import { DiscoverProfile } from "./types";

/**
 * Fetch profiles for discover page
 */
export const fetchProfilesToDiscover = async (userId: string, excludeIds: string[] = []) => {
  if (!userId) return [];
  
  try {
    const excludedIds = [...excludeIds, userId];
    
    let query = supabase
      .from('profiles')
      .select(`
        id,
        name,
        age,
        location,
        occupation,
        religion,
        height,
        verified,
        avatar
      `);
      
    if (excludedIds.length > 0) {
      query = query.not('id', 'in', `(${excludedIds.join(',')})`);
    } else {
      query = query.neq('id', userId);
    }
    
    query = query.limit(20);
    
    const { data, error } = await query;
      
    if (error) {
      console.error('Error fetching profiles:', error);
      return [];
    }
    
    const profilesWithPhotos = await Promise.all(
      data.map(async (profile) => {
        const { data: photos } = await supabase
          .from('profile_photos')
          .select('url')
          .eq('profile_id', profile.id)
          .order('order_index', { ascending: true });
          
        return {
          ...profile,
          distance: `${Math.floor(Math.random() * 10) + 1} kms away`,
          photos: photos?.map(p => p.url) || []
        };
      })
    );
    
    return profilesWithPhotos;
  } catch (error) {
    console.error('Error fetching profiles to discover:', error);
    return [];
  }
};

/**
 * Convert profile data for discover page
 */
export const convertProfileForDiscover = (profileData: any): DiscoverProfile => {
  if (!profileData) {
    // Return a default profile if data is null
    return {
      id: '',
      name: 'Unknown',
      age: 0,
      location: '',
      occupation: '',
      religion: '',
      height: '',
      verified: false,
      avatar: '',
      photos: [],
      bio: '',
      passions: [],
      vices: [],
      kinks: [],
      about: {}
    };
  }
  
  return {
    id: profileData?.id || '',
    name: profileData?.name || 'Unknown',
    age: profileData?.age || 0,
    location: profileData?.location || '',
    occupation: profileData?.occupation || '',
    religion: profileData?.religion || '',
    height: profileData?.height || '',
    verified: profileData?.verified || false,
    avatar: profileData?.avatar || '',
    photos: profileData?.photos || [],
    bio: profileData?.bio || '',
    passions: profileData?.passions || [],
    vices: profileData?.vices || [],
    kinks: profileData?.kinks || [],
    about: profileData?.about || {}
  };
};
