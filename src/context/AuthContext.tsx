
import { createContext, useContext, useState, ReactNode } from 'react';

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
  logout: () => void;
  signup: (userData: Partial<User>, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Mock user data for demo purposes
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

  // For demo purposes, let's automatically set the mock user
  useState(() => {
    setUser(mockUser);
  });

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUser(mockUser);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Simulate logout
    setUser(null);
  };

  const signup = async (userData: Partial<User>, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // In a real app, you would send the data to your backend
      setUser(mockUser);
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    } finally {
      setIsLoading(false);
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
