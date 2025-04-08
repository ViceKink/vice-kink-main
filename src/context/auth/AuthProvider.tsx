
import React, { ReactNode } from 'react';
import { UserProfile } from '@/types/auth';
import { AuthContext } from './AuthContext';
import { useAuthState } from './useAuthState';
import {
  login,
  signup,
  logout,
  updateUserProfileData,
  updateUserVicesInDb,
  updateUserKinksInDb
} from './authService';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { user, setUser, session, loading } = useAuthState();

  const updateProfile = async (profileData: Partial<UserProfile>) => {
    if (!user?.id) return;
    
    try {
      await updateUserProfileData(user.id, profileData);
      
      // Update local state - make sure to merge objects properly
      setUser(prev => {
        if (!prev) return null;
        
        const updatedUser = { ...prev };
        
        // Update top-level properties
        Object.entries(profileData).forEach(([key, value]) => {
          if (key !== 'about' && key !== 'email' && key !== 'username') {
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
      console.error('Error in updateProfile:', error);
      throw error;
    }
  };

  const updateUserVices = async (vices: string[]) => {
    if (!user?.id) return;
    
    try {
      await updateUserVicesInDb(user.id, vices);
      setUser(prev => prev ? { ...prev, vices } : null);
    } catch (error) {
      console.error('Error in updateUserVices:', error);
      throw error;
    }
  };
  
  const updateUserKinks = async (kinks: string[]) => {
    if (!user?.id) return;
    
    try {
      await updateUserKinksInDb(user.id, kinks);
      setUser(prev => prev ? { ...prev, kinks } : null);
    } catch (error) {
      console.error('Error in updateUserKinks:', error);
      throw error;
    }
  };

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
      
      const fetchPromise = useAuthState().fetchProfile(targetId);
      
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

  const contextValue = {
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
