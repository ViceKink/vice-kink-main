import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  age: number;
  email: string;
  photos: string[];
  location: string;
  verified: boolean;
  about: {
    occupation: string;
    status: 'single' | 'married' | 'it\'s complicated';
    height: string;
    zodiac?: string;
    religion?: string;
    languages?: string[];
    lifestyle: {
      smoking?: boolean;
      drinking?: string;
      exercise?: string;
      diet?: string;
    };
  };
  vices: string[];
  kinks: string[];
  bio: string;
  lookingFor?: string;
  flirtingStyle?: string;
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
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (userData: Partial<User>, password: string) => Promise<void>;
  fetchProfile: (userId?: string) => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const mockUser: User = {
    id: "user-123",
    name: "Niharika Singh",
    age: 27,
    email: "niharika@example.com",
    location: "Mumbai",
    verified: true,
    photos: [
      "/lovable-uploads/d35b405d-2dbf-4fcc-837b-1d48cb945bf4.png",
      "/lovable-uploads/ea8c69d9-6b5b-4bba-aceb-7d05f9a47ee5.png",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=1000&auto=format&fit=crop"
    ],
    about: {
      occupation: "Lawyer",
      status: "single",
      height: "5'4\"",
      zodiac: "Virgo",
      religion: "Hindu",
      languages: ["English", "Hindi", "Marathi"],
      lifestyle: {
        smoking: false,
        drinking: "occasionally",
        exercise: "regularly",
        diet: "non-vegetarian"
      }
    },
    vices: ["Smoking", "Music", "Single Malt", "420", "Hiking"],
    kinks: ["BDSM", "CNC", "Foot Fetish", "Dominatrix"],
    bio: "Mumbai born and bred. I pursued my college education in Kerala. Currently, I split my time between Kerala and Pune for work. Family means the world to me—I have two siblings who are my entire heart. Aai, baba, and friends are integral parts of my life.",
    lookingFor: "someone genuine to connect with",
    flirtingStyle: "To roast you",
    audio: {
      title: "what my most days are like",
      url: "https://example.com/audio.mp3"
    },
    passions: ["my work"],
    music: {
      favoriteSong: "Healing",
      artists: ["Taylor Swift", "The Weeknd"]
    }
  };

  useEffect(() => {
    const checkUser = async () => {
      setIsLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          const { user: authUser } = session;
          setUser(mockUser);
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          setUser(mockUser);
        } else {
          setUser(null);
        }
        setIsLoading(false);
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      setUser(mockUser);
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
      toast.success('Successfully logged out');
    } catch (error: any) {
      console.error("Logout error:", error.message);
      toast.error(error.message || 'Failed to logout');
    }
  };

  const signup = async (userData: Partial<User>, password: string) => {
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
        
        setUser(mockUser);
        toast.success('Account created successfully!');
      }
    } catch (error: any) {
      console.error("Signup error:", error.message);
      toast.error(error.message || 'Failed to create account');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProfile = async (userId?: string): Promise<User | null> => {
    try {
      return mockUser;
    } catch (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        signup,
        fetchProfile,
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
