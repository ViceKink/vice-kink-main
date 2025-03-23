import { FlirtingStyle, UserProfile } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Parses flirting style string to object if possible
 */
export const parseFlirtingStyle = (flirtingStyleInput: string | FlirtingStyle | undefined): string | FlirtingStyle => {
  if (!flirtingStyleInput) return '';
  
  if (typeof flirtingStyleInput === 'string') {
    try {
      // Try to parse it as JSON
      const parsed = JSON.parse(flirtingStyleInput);
      // Check if it matches the expected FlirtingStyle structure
      if (parsed && typeof parsed === 'object' && 'direct' in parsed) {
        return parsed as FlirtingStyle;
      }
      return flirtingStyleInput;
    } catch (e) {
      // If parsing fails, keep it as a string
      console.log("Failed to parse flirting style as JSON:", e);
      return flirtingStyleInput;
    }
  }
  
  return flirtingStyleInput;
};

/**
 * Fetches a user profile from Supabase
 */
export const fetchUserProfile = async (profileId: string): Promise<UserProfile | null> => {
  try {
    console.log("Fetching profile for user:", profileId);
    
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', profileId)
      .single();
      
    if (profileError) {
      console.error("Error fetching profile data:", profileError);
      throw profileError;
    }
    
    if (!profileData) {
      console.log("No profile data found for user:", profileId);
      return null;
    }
    
    const { data: photosData } = await supabase
      .from('profile_photos')
      .select('url')
      .eq('profile_id', profileId)
      .order('order_index', { ascending: true });
      
    const { data: vicesData } = await supabase
      .from('profile_vices')
      .select('vices(name)')
      .eq('profile_id', profileId);
      
    const { data: kinksData } = await supabase
      .from('profile_kinks')
      .select('kinks(name)')
      .eq('profile_id', profileId);
      
    const { data: audioData } = await supabase
      .from('profile_audio')
      .select('*')
      .eq('profile_id', profileId)
      .single();
      
    const { data: passionsData } = await supabase
      .from('profile_passions')
      .select('passion')
      .eq('profile_id', profileId);
    
    // Parse flirting style if it's a JSON string  
    const parsedFlirtingStyle = parseFlirtingStyle(profileData.flirting_style);
    
    const userProfile: UserProfile = {
      id: profileData.id,
      name: profileData.name,
      age: profileData.age,
      email: profileData.email || 'user@example.com',
      location: profileData.location,
      verified: profileData.verified,
      quote: profileData.quote || undefined,
      photos: photosData?.map(photo => photo.url) || [],
      about: {
        occupation: profileData.occupation,
        status: profileData.relationship_status as 'single' | 'married' | 'it\'s complicated',
        height: profileData.height,
        zodiac: profileData.zodiac,
        religion: profileData.religion,
        lifestyle: {
          smoking: false,
          drinking: 'occasionally',
          exercise: 'regularly',
          diet: 'non-vegetarian'
        }
      },
      vices: vicesData?.map(vice => vice.vices.name) || [],
      kinks: kinksData?.map(kink => kink.kinks.name) || [],
      bio: profileData.bio,
      lookingFor: profileData.looking_for,
      flirtingStyle: parsedFlirtingStyle,
      audio: audioData ? {
        title: audioData.title,
        url: audioData.url
      } : undefined,
      passions: passionsData?.map(passion => passion.passion) || []
    };
    
    console.log("Profile fetched successfully:", userProfile.id);
    return userProfile;
  } catch (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
};

/**
 * Updates user vices in Supabase
 */
export const updateUserVices = async (userId: string, viceIds: string[]) => {
  try {
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    const { error: deleteError } = await supabase
      .from('profile_vices')
      .delete()
      .eq('profile_id', userId);
      
    if (deleteError) throw deleteError;
    
    if (viceIds.length > 0) {
      const viceInserts = viceIds.map(viceId => ({
        profile_id: userId,
        vice_id: viceId
      }));
      
      const { error: insertError } = await supabase
        .from('profile_vices')
        .insert(viceInserts);
        
      if (insertError) throw insertError;
    }
    
    toast.success('Vices updated successfully');
    return true;
  } catch (error: any) {
    console.error("Update vices error:", error.message);
    toast.error(error.message || 'Failed to update vices');
    throw error;
  }
};

/**
 * Updates user kinks in Supabase
 */
export const updateUserKinks = async (userId: string, kinkIds: string[]) => {
  try {
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    const { error: deleteError } = await supabase
      .from('profile_kinks')
      .delete()
      .eq('profile_id', userId);
      
    if (deleteError) throw deleteError;
    
    if (kinkIds.length > 0) {
      const kinkInserts = kinkIds.map(kinkId => ({
        profile_id: userId,
        kink_id: kinkId
      }));
      
      const { error: insertError } = await supabase
        .from('profile_kinks')
        .insert(kinkInserts);
        
      if (insertError) throw insertError;
    }
    
    toast.success('Kinks updated successfully');
    return true;
  } catch (error: any) {
    console.error("Update kinks error:", error.message);
    toast.error(error.message || 'Failed to update kinks');
    throw error;
  }
};

/**
 * Updates user profile in Supabase
 */
export const updateUserProfile = async (userId: string, profileData: Partial<UserProfile>) => {
  try {
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    console.log("Updating profile with data:", profileData);
    
    // Convert flirtingStyle to string if it's an object
    let flirtingStyleForDB: string | null = null;
    if (profileData.flirtingStyle) {
      flirtingStyleForDB = typeof profileData.flirtingStyle === 'string' 
        ? profileData.flirtingStyle 
        : JSON.stringify(profileData.flirtingStyle);
    }
    
    // Create a database-compatible update object
    const profileUpdateData: {
      name?: string;
      age?: number;
      location?: string;
      bio?: string;
      looking_for?: string;
      flirting_style?: string | null;
      occupation?: string;
      relationship_status?: string;
      height?: string;
      zodiac?: string;
      religion?: string;
      quote?: string;
    } = {
      name: profileData.name,
      age: profileData.age,
      location: profileData.location,
      bio: profileData.bio,
      looking_for: profileData.lookingFor,
      flirting_style: flirtingStyleForDB,
      occupation: profileData.about?.occupation,
      relationship_status: profileData.about?.status,
      height: profileData.about?.height,
      zodiac: profileData.about?.zodiac,
      religion: profileData.about?.religion,
      quote: profileData.quote
    };
    
    const { error: profileError } = await supabase
      .from('profiles')
      .update(profileUpdateData)
      .eq('id', userId);
      
    if (profileError) throw profileError;
    
    if (profileData.passions && profileData.passions.length > 0) {
      const { error: deletePassionsError } = await supabase
        .from('profile_passions')
        .delete()
        .eq('profile_id', userId);
        
      if (deletePassionsError) throw deletePassionsError;
      
      const passionInserts = profileData.passions.map(passion => ({
        profile_id: userId,
        passion: passion
      }));
      
      const { error: insertPassionsError } = await supabase
        .from('profile_passions')
        .insert(passionInserts);
        
      if (insertPassionsError) throw insertPassionsError;
    }
    
    if (profileData.audio) {
      const { data: existingAudio } = await supabase
        .from('profile_audio')
        .select('id')
        .eq('profile_id', userId)
        .single();
        
      if (existingAudio) {
        const { error: audioError } = await supabase
          .from('profile_audio')
          .update({
            title: profileData.audio.title,
            url: profileData.audio.url
          })
          .eq('profile_id', userId);
          
        if (audioError) throw audioError;
      } else {
        const { error: audioError } = await supabase
          .from('profile_audio')
          .insert({
            profile_id: userId,
            title: profileData.audio.title,
            url: profileData.audio.url
          });
          
        if (audioError) throw audioError;
      }
    }
    
    toast.success('Profile updated successfully');
    return true;
  } catch (error: any) {
    console.error("Error updating profile:", error.message);
    toast.error(error.message || 'Failed to update profile');
    throw error;
  }
};
