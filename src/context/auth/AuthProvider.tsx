
import { 
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

export const AuthProvider = ({ children }: { children: ReactNode }) => {
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
      const profileUpdateData: Record<string, any> = {};
      
      // Handle the about object separately
      if (profileData.about) {
        // Spread the about object properties into main level properties
        const { occupation, status, height, zodiac, religion } = profileData.about;
        
        if (occupation !== undefined) profileUpdateData.occupation = occupation;
        if (status !== undefined) profileUpdateData.relationship_status = status;
        if (height !== undefined) profileUpdateData.height = height;
        if (zodiac !== undefined) profileUpdateData.zodiac = zodiac;
        if (religion !== undefined) profileUpdateData.religion = religion;
        
        // Delete the about property since we're handling it separately
        delete profileData.about;
      }
      
      // Process remaining properties
      Object.entries(profileData).forEach(([key, value]) => {
        // Explicitly exclude the email field from updates
        if (key === 'email') {
          return; // Skip email field
        }
        else if (key === 'birthDate') {
          // Ensure we're using the correct field name that matches the database column
          profileUpdateData['birth_date'] = value;
        }
        else if (key === 'flirtingStyle') {
          profileUpdateData['flirting_style'] = typeof value === 'object' 
            ? JSON.stringify(value) 
            : value;
        } 
        else if (key !== 'passions' && key !== 'vices' && key !== 'kinks' && key !== 'photos' && key !== 'audio') {
          // Skip certain fields that are handled separately
          const snakeCaseKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
          profileUpdateData[snakeCaseKey] = value;
        }
      });
      
      // Only update if there are properties to update
      if (Object.keys(profileUpdateData).length > 0) {
        try {
          console.log('Updating profile with data:', profileUpdateData);
          await updateUserProfile(user.id, profileUpdateData);
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
      
      // Update local state
      setUser(prev => prev ? { ...prev, ...profileData } : null);
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
