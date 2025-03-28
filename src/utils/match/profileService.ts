
import { supabase } from "@/integrations/supabase/client";
import { DiscoverProfile } from "./types";

/**
 * Fetch profiles for discover page with proper filtering
 */
export const fetchProfilesToDiscover = async (userId: string, excludeIds: string[] = [], preferences: any = null) => {
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
        avatar,
        bio,
        quote
      `);
      
    // Apply filters from preferences if any
    if (preferences) {
      if (preferences.preferred_gender && preferences.preferred_gender.length > 0) {
        query = query.in('gender', preferences.preferred_gender);
      }
      
      if (preferences.age_range && preferences.age_range.min && preferences.age_range.max) {
        query = query.gte('age', preferences.age_range.min)
                     .lte('age', preferences.age_range.max);
      }
      
      // Apply other filters as needed
    }
      
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
    
    if (!data) return [];
    
    const profilesWithDetails = await Promise.all(
      data.map(async (profile) => {
        // Fetch passions separately
        const { data: passionsData } = await supabase
          .from('profile_passions')
          .select('passion')
          .eq('profile_id', profile.id);
          
        // Fetch vices
        const { data: vicesData } = await supabase
          .from('profile_vices')
          .select('vices(name)')
          .eq('profile_id', profile.id);
          
        // Fetch kinks
        const { data: kinksData } = await supabase
          .from('profile_kinks')
          .select('kinks(name)')
          .eq('profile_id', profile.id);
        
        // Fetch photos
        const { data: photos } = await supabase
          .from('profile_photos')
          .select('url')
          .eq('profile_id', profile.id)
          .order('order_index', { ascending: true });
          
        return {
          ...profile,
          distance: `${Math.floor(Math.random() * 10) + 1} kms away`,
          passions: passionsData?.map(p => p.passion) || [],
          vices: vicesData?.map(v => v.vices.name) || [],
          kinks: kinksData?.map(k => k.kinks.name) || [],
          photos: photos?.map(p => p.url) || []
        };
      })
    );
    
    return profilesWithDetails;
  } catch (error) {
    console.error('Error in fetchProfilesToDiscover:', error);
    return [];
  }
};

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
