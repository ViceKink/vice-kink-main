
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
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (profileData: Partial<UserProfile>) => Promise<void>;
  fetchProfile: (userId?: string) => Promise<UserProfile | null>;
  updateUserVices?: (vices: string[]) => Promise<void>;
  updateUserKinks?: (kinks: string[]) => Promise<void>;
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
        // Important: Still set loading to false even if profile fetch fails
        // This prevents infinite loading
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  }, []);

  // Implement fetchProfile method with error handling and timeouts
  const fetchProfile = async (userId?: string): Promise<UserProfile | null> => {
    try {
      // If no userId is provided, use the current user's id
      const targetId = userId || session?.user?.id;
      
      if (!targetId) {
        console.error('No user ID available to fetch profile');
        return null;
      }
      
      // Add a timeout to prevent hanging requests
      const timeoutPromise = new Promise<null>((_, reject) => {
        setTimeout(() => reject(new Error('Profile fetch timeout')), 8000);
      });
      
      const fetchPromise = fetchUserProfile(targetId);
      
      // Race between timeout and actual fetch
      const userData = await Promise.race([fetchPromise, timeoutPromise]) as UserProfile;
      
      // If this is the current user, update the state
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
    
    // Set up auth state listener
    const setupAuthListener = async () => {
      try {
        // Check for existing session first
        const { data: sessionData } = await supabase.auth.getSession();
        console.log("Initial session check:", sessionData.session ? "Session exists" : "No session");
        setSession(sessionData.session);
        
        // Then set up the auth state change listener
        const { data } = supabase.auth.onAuthStateChange(
          async (_event, newSession) => {
            console.log("Auth state changed:", _event, newSession ? "Session exists" : "No session");
            setSession(newSession);
            
            // Only attempt to fetch user data if we have a session
            if (newSession) {
              await updateUserData(newSession);
            } else {
              setUser(null);
              setLoading(false);
            }
          }
        );
        
        authStateSubscription = data.subscription;
        
        // Update user data with initial session
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

  // Mock implementations for VicesKinksManager 
  const updateUserVices = async (vices: string[]) => {
    console.log("Updating vices:", vices);
    // This would be implemented to save to Supabase
  };
  
  const updateUserKinks = async (kinks: string[]) => {
    console.log("Updating kinks:", kinks);
    // This would be implemented to save to Supabase
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
