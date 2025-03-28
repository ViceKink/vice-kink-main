
import { supabase } from "@/integrations/supabase/client";
import { DiscoverProfile } from "./types";

/**
 * Fetch profiles for discover page
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
        quote,
        about
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
    
    const profilesWithPhotos = await Promise.all(
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
          photos: photos?.map(p => p.url) || [],
          passions: passionsData?.map(p => p.passion) || [],
          vices: vicesData?.map(v => v.vices?.name).filter(Boolean) || [],
          kinks: kinksData?.map(k => k.kinks?.name).filter(Boolean) || []
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
  // Return a default profile if data is null
  if (!profileData) {
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

/**
 * Update the profile avatar when setting a main photo
 */
export const updateProfileAvatar = async (userId: string, avatarUrl: string) => {
  try {
    if (!userId || !avatarUrl) return false;
    
    const { error } = await supabase
      .from('profiles')
      .update({ avatar: avatarUrl })
      .eq('id', userId);
      
    if (error) {
      console.error('Error updating profile avatar:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error updating profile avatar:', error);
    return false;
  }
};
