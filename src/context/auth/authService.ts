
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

export async function loginWithGoogle() {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/auth',
      }
    });

    if (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
}

export async function signup(email: string, password: string, name: string, username: string) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          username,
        },
      },
    });
    
    if (error) {
      console.error('Error signing up:', error);
      throw error;
    }
    
    return data;
  } catch (error: any) {
    console.error('Error signing up:', error);
    
    // Make error messages more user-friendly
    if (error.message.includes('already registered')) {
      throw new Error('This email is already registered. Please login instead.');
    }
    
    throw error;
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
