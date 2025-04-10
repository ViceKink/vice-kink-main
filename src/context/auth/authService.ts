
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types/auth';
import { fetchUserProfile, updateUserProfile } from '@/utils/authUtils';

export async function login(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      console.error('Error signing in:', error);
      throw error;
    }
    
    if (!data || !data.session) {
      throw new Error('No session returned from login');
    }
    
    return data;
  } catch (error: any) {
    console.error('Error signing in:', error);
    
    // Make error messages more user-friendly
    if (error.message === 'Invalid login credentials') {
      throw new Error('Invalid email or password. Please check your credentials.');
    }
    
    throw error;
  }
}

export async function signup(email: string, password: string, name: string, username: string) {
  try {
    // First attempt normal signup
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          username,
        },
        emailRedirectTo: window.location.origin,
      },
    });
    
    if (error) {
      // Check specifically for email sending errors
      if (error.message?.includes('sending email') || 
          error.message?.includes('confirmation email') ||
          error.message?.includes('smtp')) {
        console.error('Email sending error:', error);
        throw new Error('Error sending confirmation email. Please try again or contact support.');
      }
      
      // If the signup failed due to a different error, handle it appropriately
      console.error('Error signing up:', error);
      throw error;
    }
    
    if (!data || !data.user) {
      throw new Error('No user data returned from signup');
    }
    
    // Ensure the profile is created
    await createProfileIfNeeded(data.user.id, name, username);
    
    // Check if the user is already confirmed or needs confirmation
    if (data.session) {
      console.log("User has a session after signup - email confirmation might be disabled");
      // User is confirmed and has a session already - most likely email confirmation is disabled
      return data;
    } else {
      console.log("No session after signup - user likely needs to confirm email");
      // No session means the user needs to confirm their email
      return {
        user: data.user,
        session: null,
        emailConfirmationRequired: true
      };
    }
  } catch (error: any) {
    console.error('Error signing up:', error);
    
    // Make error messages more user-friendly
    if (error.message?.includes('already registered')) {
      throw new Error('This email is already registered. Please login instead.');
    }
    
    throw error;
  }
}

// Helper function to ensure a profile exists for the user
async function createProfileIfNeeded(userId?: string, name?: string, username?: string) {
  if (!userId) return;
  
  try {
    // Check if profile already exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();
      
    if (fetchError && !fetchError.message.includes('No rows found')) {
      console.error('Error fetching user profile:', fetchError);
      // Non-critical error, continue
    }
    
    // If profile doesn't exist, create it
    if (!existingProfile) {
      console.log('Creating profile for user:', userId);
      
      const profileData = {
        id: userId,
        name: name || 'New User', // Provide a default name if none is given
        username: username || `user_${Math.random().toString(36).substring(2, 9)}` // Generate a random username if none is provided
      };
      
      const { error: insertError } = await supabase
        .from('profiles')
        .insert(profileData);
        
      if (insertError) {
        console.error('Error creating user profile:', insertError);
        // This is serious as it may affect user experience, but don't block authentication
      }
    }
  } catch (error) {
    console.error('Error in createProfileIfNeeded:', error);
    // Non-critical function, don't throw error
  }
}

export async function logout() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

export async function updateUserProfileData(userId: string, profileData: Partial<UserProfile>) {
  if (!userId) return;

  try {
    console.log('Update profile called with data:', profileData);
    
    // Create a clean profile update object
    const profileUpdateData: Record<string, any> = {};
    
    // Process top-level profile properties
    Object.entries(profileData).forEach(([key, value]) => {
      // Skip fields that are handled separately
      if (key !== 'email' && key !== 'username' && key !== 'about' && key !== 'passions' && 
          key !== 'vices' && key !== 'kinks' && key !== 'photos' && 
          key !== 'audio') {
        profileUpdateData[key] = value;
      }
    });
    
    // Handle the about object separately to avoid nested objects
    if (profileData.about) {
      const { occupation, status, height, religion, sexuality, languages } = profileData.about;
      
      if (occupation !== undefined) profileUpdateData.occupation = occupation;
      if (status !== undefined) profileUpdateData.relationship_status = status;
      if (height !== undefined) profileUpdateData.height = height;
      if (religion !== undefined) profileUpdateData.religion = religion;
      if (sexuality !== undefined) profileUpdateData.sexuality = sexuality;
    }
    
    console.log('Cleaned profile update data:', profileUpdateData);
    
    // Only update if there are properties to update
    if (Object.keys(profileUpdateData).length > 0) {
      await updateUserProfile(userId, profileUpdateData);
    }
    
    // Update languages separately if they exist
    if (profileData.about?.languages) {
      await updateUserProfile(userId, { languages: profileData.about.languages });
    }
    
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
}

export async function updateUserVicesInDb(userId: string, vices: string[]) {
  if (!userId) return;
  
  try {
    const { data: viceData, error: viceError } = await supabase
      .from('vices')
      .select('id, name')
      .in('name', vices);
      
    if (viceError) throw viceError;
    
    const { error: deleteError } = await supabase
      .from('profile_vices')
      .delete()
      .eq('profile_id', userId);
      
    if (deleteError) throw deleteError;
    
    if (viceData && viceData.length > 0) {
      const viceInserts = viceData.map(vice => ({
        profile_id: userId,
        vice_id: vice.id
      }));
      
      const { error: insertError } = await supabase
        .from('profile_vices')
        .insert(viceInserts);
        
      if (insertError) throw insertError;
    }
  } catch (error) {
    console.error('Error updating vices:', error);
    throw error;
  }
}

export async function updateUserKinksInDb(userId: string, kinks: string[]) {
  if (!userId) return;
  
  try {
    const { data: kinkData, error: kinkError } = await supabase
      .from('kinks')
      .select('id, name')
      .in('name', kinks);
      
    if (kinkError) throw kinkError;
    
    const { error: deleteError } = await supabase
      .from('profile_kinks')
      .delete()
      .eq('profile_id', userId);
      
    if (deleteError) throw deleteError;
    
    if (kinkData && kinkData.length > 0) {
      const kinkInserts = kinkData.map(kink => ({
        profile_id: userId,
        kink_id: kink.id
      }));
      
      const { error: insertError } = await supabase
        .from('profile_kinks')
        .insert(kinkInserts);
        
      if (insertError) throw insertError;
    }
  } catch (error) {
    console.error('Error updating kinks:', error);
    throw error;
  }
}
