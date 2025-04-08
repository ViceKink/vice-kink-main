
import { createContext } from 'react';
import { Session } from '@supabase/supabase-js';
import { UserProfile } from '@/types/auth';

export type AuthContextType = {
  user: UserProfile | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<any>;
  signup: (email: string, password: string, name: string, username: string) => Promise<any>;
  logout: () => Promise<void>;
  updateProfile: (profileData: Partial<UserProfile>) => Promise<void>;
  fetchProfile: (userId?: string) => Promise<UserProfile | null>;
  updateUserVices: (vices: string[]) => Promise<void>;
  updateUserKinks: (kinks: string[]) => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
