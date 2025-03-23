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
    // Fetch basic profile info
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (profileError) throw profileError;
    if (!profileData) throw new Error('Profile not found');
    
    // Format the profile from snake_case to camelCase
    const userProfile = formatProfile(profileData);
    
    // Get the user's email from auth
    const { data: userData } = await supabase.auth.getUser();
    if (userData?.user) {
      userProfile.email = userData.user.email || '';
    }
    
    // Fetch photos
    const { data: photosData } = await supabase
      .from('profile_photos')
      .select('*')
      .eq('profile_id', userId)
      .order('order_index', { ascending: true });
      
    if (photosData && photosData.length > 0) {
      userProfile.photos = photosData.map(photo => photo.url);
    }
    
    // Fetch passions
    const { data: passionsData } = await supabase
      .from('profile_passions')
      .select('passion')
      .eq('profile_id', userId);
      
    if (passionsData && passionsData.length > 0) {
      userProfile.passions = passionsData.map(item => item.passion);
    }
    
    // Fetch audio
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
    
    return userProfile;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
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
