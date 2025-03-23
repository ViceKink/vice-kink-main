
import { supabase } from '@/integrations/supabase/client';
import { UserProfile, FlirtingStyle } from '@/types/auth';

// Convert snake_case profile from Supabase to camelCase UserProfile
const formatProfile = (profile: any): UserProfile => {
  let flirtingStyle: string | FlirtingStyle = profile.flirting_style;
  
  // Try to parse flirting_style if it's a JSON string
  if (typeof profile.flirting_style === 'string' && profile.flirting_style) {
    try {
      const parsed = JSON.parse(profile.flirting_style);
      if (typeof parsed === 'object') {
        flirtingStyle = parsed as FlirtingStyle;
      }
    } catch (e) {
      // If parsing fails, keep it as a string
      console.warn('Failed to parse flirting_style as JSON:', e);
    }
  }
  
  const userProfile: UserProfile = {
    id: profile.id,
    name: profile.name,
    email: '', // This will be set later
    age: profile.age || undefined,
    location: profile.location || undefined,
    verified: profile.verified || false,
    quote: profile.quote || undefined,
    bio: profile.bio || undefined,
    lookingFor: profile.looking_for || undefined,
    flirtingStyle: flirtingStyle || undefined,
    about: {
      occupation: profile.occupation || undefined,
      status: profile.relationship_status as any || undefined,
      height: profile.height || undefined,
      zodiac: profile.zodiac || undefined,
      religion: profile.religion || undefined,
    }
  };
  
  return userProfile;
};

// Fetch complete user profile including photos, passions, etc.
export const fetchUserProfile = async (userId: string): Promise<UserProfile> => {
  try {
    console.log('Fetching profile for user ID:', userId);
    
    // Fetch basic profile info with timeout
    const fetchProfilePromise = new Promise<any>(async (resolve, reject) => {
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (profileError) {
          console.error('Supabase profile fetch error:', profileError);
          reject(profileError);
          return;
        }
        
        if (!profileData) {
          console.error('Profile not found for ID:', userId);
          reject(new Error('Profile not found'));
          return;
        }
        
        resolve(profileData);
      } catch (error) {
        console.error('Error in profile fetch promise:', error);
        reject(error);
      }
    });
    
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Profile fetch timeout')), 5000);
    });
    
    // Race between timeout and actual fetch
    const profileData = await Promise.race([fetchProfilePromise, timeoutPromise]);
    
    if (!profileData) {
      throw new Error('Profile not found');
    }
    
    // Format the profile from snake_case to camelCase
    const userProfile = formatProfile(profileData);
    
    // Get the user's email from auth
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        userProfile.email = userData.user.email || '';
      }
    } catch (emailError) {
      console.error('Error fetching user email:', emailError);
      // Continue with profile data even if email fetch fails
    }
    
    // Fetch photos with error handling
    try {
      const { data: photosData } = await supabase
        .from('profile_photos')
        .select('*')
        .eq('profile_id', userId)
        .order('order_index', { ascending: true });
        
      if (photosData && photosData.length > 0) {
        userProfile.photos = photosData.map(photo => photo.url);
      }
    } catch (photosError) {
      console.error('Error fetching profile photos:', photosError);
      // Continue without photos
    }
    
    // Fetch passions with error handling
    try {
      const { data: passionsData } = await supabase
        .from('profile_passions')
        .select('passion')
        .eq('profile_id', userId);
        
      if (passionsData && passionsData.length > 0) {
        userProfile.passions = passionsData.map(item => item.passion);
      }
    } catch (passionsError) {
      console.error('Error fetching profile passions:', passionsError);
      // Continue without passions
    }
    
    // Fetch audio with error handling
    try {
      const { data: audioData } = await supabase
        .from('profile_audio')
        .select('*')
        .eq('profile_id', userId)
        .single();
        
      if (audioData) {
        userProfile.audio = {
          title: audioData.title,
          url: audioData.url
        };
      }
    } catch (audioError) {
      console.error('Error fetching profile audio:', audioError);
      // Continue without audio
    }
    
    // Fetch vices with error handling (was missing)
    try {
      const { data: vicesData } = await supabase
        .from('profile_vices')
        .select('vice_id')
        .eq('profile_id', userId);
      
      if (vicesData && vicesData.length > 0) {
        // Get vice names from vice_id
        const viceIds = vicesData.map(item => item.vice_id);
        const { data: viceNames } = await supabase
          .from('vices')
          .select('name')
          .in('id', viceIds);
          
        if (viceNames && viceNames.length > 0) {
          userProfile.vices = viceNames.map(vice => vice.name);
        }
      }
    } catch (vicesError) {
      console.error('Error fetching profile vices:', vicesError);
      // Continue without vices
    }
    
    // Fetch kinks with error handling (was missing)
    try {
      const { data: kinksData } = await supabase
        .from('profile_kinks')
        .select('kink_id')
        .eq('profile_id', userId);
      
      if (kinksData && kinksData.length > 0) {
        // Get kink names from kink_id
        const kinkIds = kinksData.map(item => item.kink_id);
        const { data: kinkNames } = await supabase
          .from('kinks')
          .select('name')
          .in('id', kinkIds);
          
        if (kinkNames && kinkNames.length > 0) {
          userProfile.kinks = kinkNames.map(kink => kink.name);
        }
      }
    } catch (kinksError) {
      console.error('Error fetching profile kinks:', kinksError);
      // Continue without kinks
    }
    
    console.log('Successfully fetched and built user profile:', userProfile.id, userProfile.name);
    return userProfile;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    // Create a minimal profile with just the ID to prevent crashes
    return {
      id: userId,
      name: 'Unknown User',
      email: '',
      verified: false,
      about: {}
    };
  }
};

// Update user profile
export const updateUserProfile = async (userId: string, profileData: Record<string, any>) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', userId);
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};
