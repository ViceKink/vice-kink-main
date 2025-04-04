import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/models/profileTypes';

/**
 * Fetch profiles for discover page with proper filtering
 */
export const fetchDiscoverProfiles = async (userId: string, filters: any = {}): Promise<Profile[]> => {
  console.log('Fetching discover profiles with filters:', filters);
  
  try {
    // Build the query with basic filters
    let query = supabase
      .from('profiles')
      .select('*')
      .neq('id', userId);
    
    // Add filter for gender if specified
    if (filters.gender && filters.gender !== 'all') {
      query = query.eq('gender', filters.gender);
    }
    
    // Add filter for age range if specified
    if (filters.ageMin) {
      query = query.gte('age', filters.ageMin);
    }
    if (filters.ageMax) {
      query = query.lte('age', filters.ageMax);
    }
    
    // Order by boosted profiles first, then by created_at
    query = query
      .order('boosted_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false });
    
    // Add pagination
    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching discover profiles:', error);
      return [];
    }
    
    // Exclude profiles the user has already interacted with
    const { data: interactions } = await supabase
      .from('profile_interactions')
      .select('target_profile_id')
      .eq('user_id', userId);
    
    const interactedIds = interactions ? interactions.map(i => i.target_profile_id) : [];
    
    // Transform data to match Profile interface
    const profiles = data
      .filter(profile => !interactedIds.includes(profile.id))
      .map(profile => ({
        id: profile.id,
        name: profile.name,
        age: profile.age,
        location: profile.location || 'Unknown',
        photos: [profile.avatar].filter(Boolean),
        occupation: profile.occupation,
        religion: profile.religion,
        height: profile.height,
        verified: profile.verified || false,
        avatar: profile.avatar
      }));
      
    return profiles;
  } catch (error) {
    console.error('Error in fetchDiscoverProfiles:', error);
    return [];
  }
};

// Adding this alias to fix the import error
export const fetchProfilesToDiscover = fetchDiscoverProfiles;

/**
 * Fetch a single profile by ID
 */
export const fetchProfileById = async (id: string) => {
  if (!id) return null;
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    
    // Fetch additional profile data
    const [photos, passions, vices, kinks] = await Promise.all([
      fetchProfilePhotos(id),
      fetchProfilePassions(id),
      fetchProfileVices(id),
      fetchProfileKinks(id)
    ]);
    
    return {
      ...data,
      photos,
      passions,
      vices,
      kinks
    };
  } catch (error) {
    console.error('Error fetching profile by ID:', error);
    return null;
  }
};

/**
 * Fetch profile photos
 */
export const fetchProfilePhotos = async (profileId: string) => {
  if (!profileId) return [];
  
  try {
    const { data, error } = await supabase
      .from('profile_photos')
      .select('url, is_primary, order_index')
      .eq('profile_id', profileId)
      .order('order_index', { ascending: true });
      
    if (error) throw error;
    
    return data?.map(photo => photo.url) || [];
  } catch (error) {
    console.error('Error fetching profile photos:', error);
    return [];
  }
};

/**
 * Update the profile avatar
 */
export const updateProfileAvatar = async (profileId: string, photoUrl: string) => {
  if (!profileId || !photoUrl) return false;
  
  try {
    // First mark the selected photo as primary and all others as not primary
    const { error: photoUpdateError } = await supabase
      .from('profile_photos')
      .update({ is_primary: false })
      .eq('profile_id', profileId);
      
    if (photoUpdateError) {
      console.error('Error resetting primary photo status:', photoUpdateError);
      return false;
    }
    
    // Set the selected photo as primary
    const { error: setPrimaryError } = await supabase
      .from('profile_photos')
      .update({ is_primary: true })
      .eq('profile_id', profileId)
      .eq('url', photoUrl);
      
    if (setPrimaryError) {
      console.error('Error setting primary photo:', setPrimaryError);
      return false;
    }
    
    // Update the avatar field in the profile
    const { error: profileUpdateError } = await supabase
      .from('profiles')
      .update({ avatar: photoUrl })
      .eq('id', profileId);
      
    if (profileUpdateError) {
      console.error('Error updating profile avatar:', profileUpdateError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in updateProfileAvatar:', error);
    return false;
  }
};

/**
 * Fetch profile passions
 */
export const fetchProfilePassions = async (profileId: string) => {
  if (!profileId) return [];
  
  try {
    const { data, error } = await supabase
      .from('profile_passions')
      .select('passion')
      .eq('profile_id', profileId);
      
    if (error) throw error;
    
    return data?.map(item => item.passion) || [];
  } catch (error) {
    console.error('Error fetching profile passions:', error);
    return [];
  }
};

/**
 * Fetch profile vices
 */
export const fetchProfileVices = async (profileId: string) => {
  if (!profileId) return [];
  
  try {
    const { data, error } = await supabase
      .from('profile_vices')
      .select('vices(name)')
      .eq('profile_id', profileId);
      
    if (error) throw error;
    
    return data?.map(item => item.vices.name) || [];
  } catch (error) {
    console.error('Error fetching profile vices:', error);
    return [];
  }
};

/**
 * Fetch profile kinks
 */
export const fetchProfileKinks = async (profileId: string) => {
  if (!profileId) return [];
  
  try {
    const { data, error } = await supabase
      .from('profile_kinks')
      .select('kinks(name)')
      .eq('profile_id', profileId);
      
    if (error) throw error;
    
    return data?.map(item => item.kinks.name) || [];
  } catch (error) {
    console.error('Error fetching profile kinks:', error);
    return [];
  }
};
