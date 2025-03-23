
import { 
  createContext, 
  useState, 
  useEffect, 
  ReactNode,
  useCallback
} from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile, FlirtingStyle } from '@/types/auth';
import { fetchUserProfile, updateUserProfile } from '@/utils/authUtils';

type AuthContextType = {
  user: UserProfile | null;
  session: Session | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (profileData: Partial<UserProfile>) => Promise<void>;
  loading: boolean;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Function to update user data from Supabase profile
  const updateUserData = useCallback(async (session: Session | null) => {
    if (session?.user) {
      try {
        const userData = await fetchUserProfile(session.user.id);
        setUser(userData);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        await updateUserData(session);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      updateUserData(session);
    });

    return () => {
      subscription.unsubscribe();
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
      // Create an object that will be compatible with the database schema
      const profileUpdateData: Record<string, any> = {};
      
      // Copy all valid properties from profileData to profileUpdateData
      Object.entries(profileData).forEach(([key, value]) => {
        // Special handling for flirtingStyle to ensure it's always a string in the database
        if (key === 'flirtingStyle') {
          profileUpdateData['flirting_style'] = typeof value === 'object' 
            ? JSON.stringify(value) 
            : value;
        } 
        // Regular properties (convert camelCase to snake_case)
        else {
          const snakeCaseKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
          profileUpdateData[snakeCaseKey] = value;
        }
      });
      
      // Now profileUpdateData should have all keys in snake_case and compatible types
      await updateUserProfile(user.id, profileUpdateData);
      
      // Update the local user state
      setUser(prev => prev ? { ...prev, ...profileData } : null);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const contextValue: AuthContextType = {
    user,
    session,
    isAuthenticated: !!session,
    login,
    signup,
    logout,
    updateProfile,
    loading,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
