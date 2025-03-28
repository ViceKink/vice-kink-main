import { supabase } from '@/integrations/supabase/client';
import { UserProfile, FlirtingStyle, UserPreferences } from '@/types/auth';

// Convert snake_case profile from Supabase to camelCase UserProfile
const formatProfile = (profile: any): UserProfile => {
  let flirtingStyle: string | FlirtingStyle | undefined = profile.flirting_style;
  
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
  
  // Try to parse preferences if it's a JSON string
  let preferences: UserPreferences | undefined;
  if (typeof profile.preferences === 'string' && profile.preferences) {
    try {
      preferences = JSON.parse(profile.preferences) as UserPreferences;
    } catch (e) {
      console.warn('Failed to parse preferences as JSON:', e);
    }
  } else if (typeof profile.preferences === 'object') {
    preferences = profile.preferences as UserPreferences;
  }
  
  const userProfile: UserProfile = {
    id: profile.id,
    name: profile.name,
    email: '', // This will be set later
    username: profile.username,
    age: profile.age || undefined,
    birthDate: profile.birth_date ? profile.birth_date : undefined,
    location: profile.location || undefined,
    hometown: profile.hometown || undefined,
    verified: profile.verified || false,
    quote: profile.quote || undefined,
    bio: profile.bio || undefined,
    looking_for: profile.looking_for || undefined,
    lookingFor: profile.looking_for || undefined,
    flirting_style: profile.flirting_style || undefined,
    flirtingStyle: flirtingStyle || undefined,
    preferences: preferences || undefined,
    about: {
      occupation: profile.occupation || undefined,
      status: profile.relationship_status as any || undefined,
      height: profile.height || undefined,
      zodiac: profile.zodiac || undefined,
      religion: profile.religion || undefined,
      sexuality: profile.sexuality || undefined,
      gender: profile.gender || undefined,
      ethnicity: profile.ethnicity || undefined,
      education: profile.education || undefined,
      relationshipType: profile.relationship_type || undefined,
      relationship_type: profile.relationship_type || undefined,
      datingIntention: profile.dating_intention || undefined,
      languages: [],
      lifestyle: {
        smoking: profile.smoking || undefined,
        drinking: profile.drinking || undefined,
      }
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
    
    // Fetch languages with error handling
    try {
      const { data: languagesData, error: languagesError } = await supabase
        .from('profile_languages')
        .select('language')
        .eq('profile_id', userId);
      
      if (languagesError) {
        console.error('Error fetching languages:', languagesError);
      } else if (languagesData && languagesData.length > 0) {
        userProfile.about = userProfile.about || {};
        userProfile.about.languages = languagesData.map(item => item.language);
        
        // Debug logging for languages
        console.log('Retrieved languages from database:', userProfile.about.languages);
      } else {
        console.log('No languages found for user:', userId);
      }
    } catch (languagesError) {
      console.error('Error fetching profile languages:', languagesError);
      // Continue without languages
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
    
    // Fetch vices with error handling
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
    
    // Fetch kinks with error handling
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
    console.log('Updating profile with data:', profileData);
    
    // Skip username updates
    if (profileData.username) {
      console.warn('Username cannot be updated after account creation');
      delete profileData.username;
    }
    
    // Skip email updates
    if (profileData.email) {
      console.warn('Email cannot be updated in this form');
      delete profileData.email;
    }
    
    // Check if there's a primary photo to update avatar
    if (profileData.photos && profileData.photos.length > 0) {
      console.log('Setting avatar from primary photo:', profileData.photos[0]);
      profileData.avatar = profileData.photos[0];
    }
    
    // Split data into main profile fields and languages
    const { languages, preferences, ...mainProfileData } = profileData;
    const finalData: Record<string, any> = {};
    
    // Convert any camelCase to snake_case for database compatibility
    Object.entries(mainProfileData).forEach(([key, value]) => {
      // Skip certain fields
      if (key === 'email' || key === 'username') {
        return; // Skip email and username fields
      }
      else if (key === 'birthDate') {
        finalData['birth_date'] = value;
      }
      else if (key === 'flirtingStyle') {
        finalData['flirting_style'] = typeof value === 'object' 
          ? JSON.stringify(value) 
          : value;
      }
      // Handle nested about object
      else if (key === 'about' && typeof value === 'object') {
        const aboutObj = value as Record<string, any>;
        
        // Handle special nested properties
        if (aboutObj.lifestyle) {
          if (aboutObj.lifestyle.smoking !== undefined) {
            finalData['smoking'] = aboutObj.lifestyle.smoking;
          }
          if (aboutObj.lifestyle.drinking) {
            finalData['drinking'] = aboutObj.lifestyle.drinking;
          }
          // Add other lifestyle properties as needed
        }
        
        // Extract other about properties (flattened)
        for (const [aboutKey, aboutValue] of Object.entries(aboutObj)) {
          if (aboutKey === 'lifestyle') {
            continue; // Already handled above
          }
          
          // Convert camelCase to snake_case
          const snakeCaseAboutKey = aboutKey.replace(/([A-Z])/g, '_$1').toLowerCase();
          finalData[snakeCaseAboutKey] = aboutValue;
        }
      }
      else {
        const snakeCaseKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        finalData[snakeCaseKey] = value;
      }
    });
    
    // Handle preferences separately
    if (preferences) {
      finalData['preferences'] = JSON.stringify(preferences);
    }
    
    // Debug logging
    console.log('Final profile update data for Supabase:', finalData);
    
    // Only update if there are properties to update
    if (Object.keys(finalData).length > 0) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update(finalData)
          .eq('id', userId);
          
        if (error) {
          console.error('Error updating profile fields:', error);
          throw error;
        }
      } catch (error: any) {
        console.error('Error updating profile fields:', error);
        let errorMessage = 'Failed to update profile';
        
        // Provide more specific error message
        if (error.message) {
          if (error.message.includes("column")) {
            const columnMatch = error.message.match(/'([^']+)'/);
            if (columnMatch && columnMatch[1]) {
              errorMessage = `Failed to update profile: Issue with field "${columnMatch[1]}"`;
            }
          } else {
            errorMessage = `Failed to update profile: ${error.message}`;
          }
        }
        
        throw new Error(errorMessage);
      }
    }
    
    // Update languages separately if they exist
    if (languages) {
      try {
        console.log('Updating languages:', languages);
        
        // First delete existing languages
        const { error: deleteError } = await supabase
          .from('profile_languages')
          .delete()
          .eq('profile_id', userId);
          
        if (deleteError) {
          console.error('Error deleting existing languages:', deleteError);
          throw deleteError;
        }
        
        // Then insert new languages if we have any
        if (languages.length > 0) {
          const languageInserts = languages.map((language: string) => ({
            profile_id: userId,
            language: language
          }));
          
          console.log('Inserting languages:', languageInserts);
          
          const { error: insertError } = await supabase
            .from('profile_languages')
            .insert(languageInserts);
            
          if (insertError) {
            console.error('Error inserting languages:', insertError);
            throw insertError;
          }
        }
      } catch (error: any) {
        console.error('Error updating languages:', error);
        throw new Error(`Failed to update languages: ${error.message}`);
      }
    }
    
    // Update successful
    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};
