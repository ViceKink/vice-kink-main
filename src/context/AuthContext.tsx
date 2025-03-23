import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export interface UserProfile {
  id: string;
  name: string;
  age?: number;
  email: string;
  photos?: string[];
  location?: string;
  verified?: boolean;
  quote?: string;
  about?: {
    occupation?: string;
    status?: 'single' | 'married' | 'it\'s complicated';
    height?: string;
    zodiac?: string;
    religion?: string;
    languages?: string[];
    lifestyle?: {
      smoking?: boolean;
      drinking?: string;
      exercise?: string;
      diet?: string;
    };
  };
  vices?: string[];
  kinks?: string[];
  bio?: string;
  lookingFor?: string;
  flirtingStyle?: string | {
    direct: number;
    playful: number;
    intellectual: number;
    physical: number;
    romantic: number;
  };
  audio?: {
    title: string;
    url: string;
  };
  passions?: string[];
  music?: {
    favoriteSong?: string;
    artists?: string[];
  };
}

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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

  const updateUserVices = async (viceIds: string[]) => {
    try {
      if (!session?.user?.id) {
        throw new Error('User not authenticated');
      }
      
      const { error: deleteError } = await supabase
        .from('profile_vices')
        .delete()
        .eq('profile_id', session.user.id);
        
      if (deleteError) throw deleteError;
      
      if (viceIds.length > 0) {
        const viceInserts = viceIds.map(viceId => ({
          profile_id: session.user.id,
          vice_id: viceId
        }));
        
        const { error: insertError } = await supabase
          .from('profile_vices')
          .insert(viceInserts);
          
        if (insertError) throw insertError;
      }
      
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
      
      toast.success('Vices updated successfully');
    } catch (error: any) {
      console.error("Update vices error:", error.message);
      toast.error(error.message || 'Failed to update vices');
      throw error;
    }
  };

  const updateUserKinks = async (kinkIds: string[]) => {
    try {
      if (!session?.user?.id) {
        throw new Error('User not authenticated');
      }
      
      const { error: deleteError } = await supabase
        .from('profile_kinks')
        .delete()
        .eq('profile_id', session.user.id);
        
      if (deleteError) throw deleteError;
      
      if (kinkIds.length > 0) {
        const kinkInserts = kinkIds.map(kinkId => ({
          profile_id: session.user.id,
          kink_id: kinkId
        }));
        
        const { error: insertError } = await supabase
          .from('profile_kinks')
          .insert(kinkInserts);
          
        if (insertError) throw insertError;
      }
      
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
      
      toast.success('Kinks updated successfully');
    } catch (error: any) {
      console.error("Update kinks error:", error.message);
      toast.error(error.message || 'Failed to update kinks');
      throw error;
    }
  };

  const updateProfile = async (profileData: Partial<UserProfile>) => {
    try {
      if (!session?.user?.id) {
        throw new Error('User not authenticated');
      }
      
      console.log("Updating profile with data:", profileData);
      
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: profileData.name,
          age: profileData.age,
          location: profileData.location,
          bio: profileData.bio,
          looking_for: profileData.lookingFor,
          flirting_style: profileData.flirtingStyle,
          occupation: profileData.about?.occupation,
          relationship_status: profileData.about?.status,
          height: profileData.about?.height,
          zodiac: profileData.about?.zodiac,
          religion: profileData.about?.religion,
        })
        .eq('id', session.user.id);
        
      if (profileError) throw profileError;
      
      if (profileData.passions && profileData.passions.length > 0) {
        const { error: deletePassionsError } = await supabase
          .from('profile_passions')
          .delete()
          .eq('profile_id', session.user.id);
          
        if (deletePassionsError) throw deletePassionsError;
        
        const passionInserts = profileData.passions.map(passion => ({
          profile_id: session.user.id,
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
          .eq('profile_id', session.user.id)
          .single();
          
        if (existingAudio) {
          const { error: audioError } = await supabase
            .from('profile_audio')
            .update({
              title: profileData.audio.title,
              url: profileData.audio.url
            })
            .eq('profile_id', session.user.id);
            
          if (audioError) throw audioError;
        } else {
          const { error: audioError } = await supabase
            .from('profile_audio')
            .insert({
              profile_id: session.user.id,
              title: profileData.audio.title,
              url: profileData.audio.url
            });
            
          if (audioError) throw audioError;
        }
      }
      
      const updatedProfile = await fetchProfile();
      if (updatedProfile) {
        setUser(updatedProfile);
      }
      
      toast.success('Profile updated successfully');
      return;
    } catch (error: any) {
      console.error("Error updating profile:", error.message);
      toast.error(error.message || 'Failed to update profile');
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
        
      const userProfile: UserProfile = {
        id: profileData.id,
        name: profileData.name,
        age: profileData.age,
        email: session?.user?.email || 'user@example.com',
        location: profileData.location,
        verified: profileData.verified,
        quote: profileData.quote,
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
        flirtingStyle: profileData.flirting_style,
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
        updateUserVices,
        updateUserKinks,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
