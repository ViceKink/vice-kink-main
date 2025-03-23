
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { UserProfile } from '@/types/auth';
import { 
  fetchUserProfile, 
  updateUserVices, 
  updateUserKinks, 
  updateUserProfile 
} from '@/utils/authUtils';

interface AuthContextType {
  user: UserProfile | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (userData: Partial<UserProfile>, password: string) => Promise<void>;
  fetchProfile: (userId?: string) => Promise<UserProfile | null>;
  updateUserVices: (viceIds: string[]) => Promise<void>;
  updateUserKinks: (kinkIds: string[]) => Promise<void>;
  updateProfile: (profileData: Partial<UserProfile>) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Auth Provider: Setting up auth state change listener");
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log("Auth state changed:", event, currentSession?.user?.id);
        setSession(currentSession);
        
        if (currentSession) {
          try {
            const profile = await fetchProfile(currentSession.user.id);
            setUser(profile);
          } catch (error) {
            console.error("Error fetching profile on auth state change:", error);
            setUser(null);
          }
        } else {
          setUser(null);
        }
        
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    console.log("Auth Provider: Checking for existing session");
    supabase.auth.getSession().then(async ({ data: { session: currentSession } }) => {
      console.log("Got session:", currentSession?.user?.id);
      setSession(currentSession);
      
      if (currentSession) {
        try {
          const profile = await fetchProfile(currentSession.user.id);
          setUser(profile);
        } catch (error) {
          console.error("Error fetching profile on init:", error);
          setUser(null);
        }
      }
      
      setIsLoading(false);
    }).catch(error => {
      console.error("Error getting session:", error);
      setIsLoading(false);
    });
    
    return () => {
      console.log("Auth Provider: Cleaning up auth state change listener");
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log("Attempting login for:", email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      console.log("Login successful, user:", data.user?.id);
      toast.success('Successfully logged in!');
    } catch (error: any) {
      console.error("Login error:", error.message);
      toast.error(error.message || 'Failed to login');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      navigate('/auth');
      toast.success('Successfully logged out');
    } catch (error: any) {
      console.error("Logout error:", error.message);
      toast.error(error.message || 'Failed to logout');
    }
  };

  const signup = async (userData: Partial<UserProfile>, password: string) => {
    setIsLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email as string,
        password: password,
        options: {
          data: {
            name: userData.name
          }
        }
      });
      
      if (authError) throw authError;
      
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            name: userData.name as string,
            age: userData.age,
            location: userData.location,
            occupation: userData.about?.occupation,
            relationship_status: userData.about?.status,
            height: userData.about?.height,
            zodiac: userData.about?.zodiac,
            religion: userData.about?.religion,
            bio: userData.bio,
            looking_for: userData.lookingFor,
            flirting_style: userData.flirtingStyle,
          });
          
        if (profileError) throw profileError;
        
        toast.success('Account created successfully! Please check your email to verify your account.');
        navigate('/auth');
      }
    } catch (error: any) {
      console.error("Signup error:", error.message);
      toast.error(error.message || 'Failed to create account');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateUserVices = async (viceIds: string[]) => {
    try {
      if (!session?.user?.id) {
        throw new Error('User not authenticated');
      }
      
      await updateUserVices(session.user.id, viceIds);
      
      if (user) {
        const { data: vicesData } = await supabase
          .from('profile_vices')
          .select('vices(name)')
          .eq('profile_id', session.user.id);
          
        const updatedVices = vicesData?.map(vice => vice.vices.name) || [];
        
        setUser({
          ...user,
          vices: updatedVices
        });
      }
    } catch (error: any) {
      console.error("Update vices error:", error.message);
      throw error;
    }
  };

  const handleUpdateUserKinks = async (kinkIds: string[]) => {
    try {
      if (!session?.user?.id) {
        throw new Error('User not authenticated');
      }
      
      await updateUserKinks(session.user.id, kinkIds);
      
      if (user) {
        const { data: kinksData } = await supabase
          .from('profile_kinks')
          .select('kinks(name)')
          .eq('profile_id', session.user.id);
          
        const updatedKinks = kinksData?.map(kink => kink.kinks.name) || [];
        
        setUser({
          ...user,
          kinks: updatedKinks
        });
      }
    } catch (error: any) {
      console.error("Update kinks error:", error.message);
      throw error;
    }
  };

  const handleUpdateProfile = async (profileData: Partial<UserProfile>) => {
    try {
      if (!session?.user?.id) {
        throw new Error('User not authenticated');
      }
      
      await updateUserProfile(session.user.id, profileData);
      
      const updatedProfile = await fetchProfile();
      if (updatedProfile) {
        setUser(updatedProfile);
      }
      
      return;
    } catch (error: any) {
      console.error("Error updating profile:", error.message);
      throw error;
    }
  };

  const fetchProfile = async (userId?: string): Promise<UserProfile | null> => {
    try {
      console.log("Fetching profile for user:", userId || session?.user?.id);
      if (!userId && !session?.user?.id) {
        console.log("No user ID available, cannot fetch profile");
        return null;
      }
      
      const profileId = userId || session?.user?.id;
      if (!profileId) return null;
      
      return await fetchUserProfile(profileId);
    } catch (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        signup,
        fetchProfile,
        updateUserVices: handleUpdateUserVices,
        updateUserKinks: handleUpdateUserKinks,
        updateProfile: handleUpdateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
