
import React, { 
  createContext, 
  useState, 
  useEffect, 
  ReactNode,
  useCallback
} from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile, FlirtingStyle } from '@/types/auth';
import { fetchUserProfile, updateUserProfile } from '@/utils/authUtils';

type AuthContextType = {
  user: UserProfile | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (profileData: Partial<UserProfile>) => Promise<void>;
  fetchProfile: (userId?: string) => Promise<UserProfile | null>;
  updateUserVices: (vices: string[]) => Promise<void>;
  updateUserKinks: (kinks: string[]) => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const updateUserData = useCallback(async (session: Session | null) => {
    if (session?.user) {
      try {
        const userData = await fetchUserProfile(session.user.id);
        setUser(userData);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setLoading(false);
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  }, []);

  const fetchProfile = async (userId?: string): Promise<UserProfile | null> => {
    try {
      const targetId = userId || session?.user?.id;
      
      if (!targetId) {
        console.error('No user ID available to fetch profile');
        return null;
      }
      
      const timeoutPromise = new Promise<null>((_, reject) => {
        setTimeout(() => reject(new Error('Profile fetch timeout')), 8000);
      });
      
      const fetchPromise = fetchUserProfile(targetId);
      
      const userData = await Promise.race([fetchPromise, timeoutPromise]) as UserProfile;
      
      if (!userId && session?.user?.id === targetId) {
        setUser(userData);
      }
      
      return userData;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  useEffect(() => {
    console.log("Setting up auth state listener");
    let authStateSubscription: { unsubscribe: () => void } | null = null;
    
    const setupAuthListener = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        console.log("Initial session check:", sessionData.session ? "Session exists" : "No session");
        setSession(sessionData.session);
        
        const { data } = supabase.auth.onAuthStateChange(
          async (_event, newSession) => {
            console.log("Auth state changed:", _event, newSession ? "Session exists" : "No session");
            setSession(newSession);
            
            if (newSession) {
              await updateUserData(newSession);
            } else {
              setUser(null);
              setLoading(false);
            }
          }
        );
        
        authStateSubscription = data.subscription;
        
        if (sessionData.session) {
          await updateUserData(sessionData.session);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Error setting up auth listener:", error);
        setLoading(false);
      }
    };
    
    setupAuthListener();
    
    return () => {
      if (authStateSubscription) {
        authStateSubscription.unsubscribe();
      }
    };
  }, [updateUserData]);

  const login = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const updateProfile = async (profileData: Partial<UserProfile>) => {
    if (!user?.id) return;

    try {
      console.log('Update profile called with data:', profileData);
      
      // Create a clean profile update object
      const profileUpdateData: Record<string, any> = {};
      
      // Process top-level profile properties
      Object.entries(profileData).forEach(([key, value]) => {
        // Skip fields that are handled separately
        if (key !== 'email' && key !== 'about' && key !== 'passions' && 
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
        await updateUserProfile(user.id, profileUpdateData);
      }
      
      // Update languages separately if they exist
      if (profileData.about?.languages) {
        await updateUserProfile(user.id, { languages: profileData.about.languages });
      }
      
      // Update local state - make sure to merge objects properly
      setUser(prev => {
        if (!prev) return null;
        
        const updatedUser = { ...prev };
        
        // Update top-level properties
        Object.entries(profileData).forEach(([key, value]) => {
          if (key !== 'about') {
            (updatedUser as any)[key] = value;
          }
        });
        
        // Update about properties
        if (profileData.about) {
          updatedUser.about = { ...(updatedUser.about || {}), ...profileData.about };
        }
        
        return updatedUser;
      });
      
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const updateUserVices = async (vices: string[]) => {
    if (!user?.id) return;
    
    try {
      const { data: viceData, error: viceError } = await supabase
        .from('vices')
        .select('id, name')
        .in('name', vices);
        
      if (viceError) throw viceError;
      
      const { error: deleteError } = await supabase
        .from('profile_vices')
        .delete()
        .eq('profile_id', user.id);
        
      if (deleteError) throw deleteError;
      
      if (viceData && viceData.length > 0) {
        const viceInserts = viceData.map(vice => ({
          profile_id: user.id,
          vice_id: vice.id
        }));
        
        const { error: insertError } = await supabase
          .from('profile_vices')
          .insert(viceInserts);
          
        if (insertError) throw insertError;
      }
      
      setUser(prev => prev ? { ...prev, vices } : null);
      
    } catch (error) {
      console.error('Error updating vices:', error);
      throw error;
    }
  };
  
  const updateUserKinks = async (kinks: string[]) => {
    if (!user?.id) return;
    
    try {
      const { data: kinkData, error: kinkError } = await supabase
        .from('kinks')
        .select('id, name')
        .in('name', kinks);
        
      if (kinkError) throw kinkError;
      
      const { error: deleteError } = await supabase
        .from('profile_kinks')
        .delete()
        .eq('profile_id', user.id);
        
      if (deleteError) throw deleteError;
      
      if (kinkData && kinkData.length > 0) {
        const kinkInserts = kinkData.map(kink => ({
          profile_id: user.id,
          kink_id: kink.id
        }));
        
        const { error: insertError } = await supabase
          .from('profile_kinks')
          .insert(kinkInserts);
          
        if (insertError) throw insertError;
      }
      
      setUser(prev => prev ? { ...prev, kinks } : null);
      
    } catch (error) {
      console.error('Error updating kinks:', error);
      throw error;
    }
  };

  const contextValue: AuthContextType = {
    user,
    session,
    isAuthenticated: !!session,
    isLoading: loading,
    login,
    signup,
    logout,
    updateProfile,
    fetchProfile,
    updateUserVices,
    updateUserKinks,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
